/**
 * API Gateway
 * 
 * This service routes requests to appropriate microservices and provides centralized
 * authentication, logging, and error handling.
 * 
 * @author nxdun
 * @version 1.0.0
 */

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { createProxyMiddleware } = require("http-proxy-middleware");
require("dotenv").config();

// ==========================================================================
// Configuration & Setup
// ==========================================================================

// Create an instance of Express app
const app = express();
const PORT = process.env.PORT || 5001;

// Environment configuration - can be extended to support multiple environments
const ENVIRONMENT = process.env.NODE_ENV || 'development';
const isProduction = ENVIRONMENT === 'production';

// Configure CORS options
const corsOptions = {
  origin: isProduction ? process.env.ALLOWED_ORIGINS?.split(',') : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
};

// ==========================================================================
// Middleware Setup
// ==========================================================================

// Security and utility middleware
app.use(cors(corsOptions));                 // Enable CORS with configuration
app.use(helmet());                          // Add security headers
app.use(morgan(isProduction ? 'combined' : 'dev')); // Log HTTP requests
app.disable("x-powered-by");                // Hide Express server information

// ==========================================================================
// Service Routes Configuration
// ==========================================================================

/**
 * Service Route Definition
 * @typedef {Object} ServiceRoute
 * @property {string} route - The route path to match
 * @property {string} target - The target microservice URL
 * @property {Object} headers - Headers to add to the request
 * @property {string} [description] - Description of the route purpose
 * @property {string[]} [methods] - Allowed HTTP methods (default: all)
 */

/** @type {ServiceRoute[]} */
const services = [
  {
    route: "/cap",
    target: `${process.env.SERVICE_NAME_STORAGE}/capcheck`,
    headers: { "x-api-key": "apikey" },
    description: "CAPTCHA validation service",
  },
  {
    route: "/create",
    target: `${process.env.SERVICE_NAME_AUTH}/api/v1/users`,
    headers: { "x-api-key": "apikey" },
    description: "User creation endpoint",
  },
  {
    route: "/getenrolledcoursedatabyuid",
    target: `${process.env.SERVICE_NAME_AUTH}/api/v1/users/courses`,
    headers: { "x-api-key": "apikey" },
    description: "Gets enrolled courses for a user ID",
  },
  {
    route: "/login",
    target: `${process.env.SERVICE_NAME_AUTH}/api/v1/auth`,
    headers: { "x-api-key": "apikey" },
    description: "User authentication endpoint",
  },
  {
    route: "/register",
    target: `${process.env.SERVICE_NAME_AUTH}/api/v1/users`,
    headers: { "x-api-key": "apikey" },
    description: "User registration endpoint",
  },
  {
    route: "/hi",
    target: `${process.env.SERVICE_NAME_AUTH}/yo`,
    headers: { "x-api-key": "apikey" },
    description: "Test endpoint",
  },
  {
    route: "/lecget",
    target: `${process.env.SERVICE_NAME_LEC}/api/v1/lecturer/get`,
    headers: { "x-api-key": "apikey" },
    description: "Get single lecturer data - viewable for any user role",
  },
  {
    route: "/checkout",
    target: `${process.env.SERVICE_NAME_PAY}`,
    headers: { "x-api-key": "apikey" },
    description: "Stripe checkout session creation",
  },
  {
    route: "/courses",
    target: `${process.env.SERVICE_NAME_COURSE}/api/v1/courses`,
    headers: { "x-api-key": "apikey" },
    description: "Course management endpoints",
  },
  {
    route: "/notify",
    target: `${process.env.SERVICE_NAME_NOTIFICATION}/notifications`,
    headers: { "x-api-key": "apikey" },
    description: "Notification service endpoints",
  },
  {
    route: "/browse",
    target: `${process.env.SERVICE_NAME_COURSE}/api/v1/courses`,
    headers: { "x-api-key": "apikey" },
    description: "Get all courses with CRUD operations - Frontend displays them filtered by approval state",
  },
  {
    route: "/addcoursecontent",
    target: `${process.env.SERVICE_NAME_COURSE}/api/v1/content`,
    headers: { "x-api-key": "apikey" },
    description: "Course content management",
  },
  {
    route: "/upload",
    target: `${process.env.SERVICE_NAME_STORAGE}/api/upload`,
    headers: { "x-api-key": "apikey" },
    description: "File upload service",
  },
  {
    route: "/getallusers",
    target: `${process.env.SERVICE_NAME_AUTH}/api/v1/users`,
    headers: { "x-api-key": "apikey" },
    description: "Admin endpoint to get all users",
  },
];

// ==========================================================================
// Middleware for Request Processing
// ==========================================================================

/**
 * Middleware to set appropriate headers for each route
 * Extracts the route from the URL and finds the matching service
 * to apply the correct headers
 * 
 * @param {express.Request} req - Express request object
 * @param {express.Response} res - Express response object
 * @param {express.NextFunction} next - Express next function
 */
function setHeaders(req, res, next) {
  try {
    const pathSegments = req.originalUrl.split('/');
    const route = pathSegments[1]; // Get route from URL
    const service = services.find((s) => s.route === `/${route}`);

    if (service && service.headers) {
      // Set headers if defined for the route
      Object.entries(service.headers).forEach(([key, value]) => {
        req.headers[key] = value;
      });
    }

    next();
  } catch (error) {
    console.error('Error in setHeaders middleware:', error);
    next(error); // Pass error to error handler
  }
}

// Apply the setHeaders middleware to all routes
app.use(setHeaders);

// ==========================================================================
// Proxy Setup for Microservices
// ==========================================================================

/**
 * Set up proxy middleware for each defined microservice
 * This forwards requests to the appropriate backend service
 */
function setupProxyRoutes() {
  try {
    services.forEach(({ route, target, description }) => {
      // Proxy options
      const proxyOptions = {
        target,
        changeOrigin: true,
        pathRewrite: (path, req) => {
          const serviceRoute = services.find(s => path.startsWith(s.route));
          if (serviceRoute) {
            const targetPath = serviceRoute.target.split('/').slice(3).join('/');
            return targetPath || '';
          }
          return path;
        },
        // Optional logging for debugging
        logLevel: isProduction ? 'silent' : 'info',
        // Error handling for proxy
        onError: (err, req, res) => {
          console.error(`Proxy error for ${route}:`, err);
          res.status(500).json({
            code: 500,
            status: "Error",
            message: `Service unavailable: ${description || route}`,
            data: null,
          });
        }
      };

      // Apply proxy middleware
      app.use(route, createProxyMiddleware(proxyOptions));
    });
  } catch (err) {
    console.error('Error setting up proxy routes:', err);
    process.exit(1); // Exit if proxy setup fails
  }
}

// Initialize proxy routes
setupProxyRoutes();

// ==========================================================================
// Error Handling
// ==========================================================================

// Handler for route-not-found
app.use((_req, res) => {
  res.status(404).json({
    code: 404,
    status: "Error",
    message: "Route not found. Please check your URL and try again.",
    data: null,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled application error:', err);
  res.status(500).json({
    code: 500,
    status: "Error",
    message: isProduction ? "Internal server error" : err.message,
    stack: isProduction ? null : err.stack,
    data: null,
  });
});

// ==========================================================================
// Server Startup
// ==========================================================================

// Start Express server
app.listen(PORT, () => {
  console.log(`
  =====================================================
  🚀 API Gateway is running
  📡 Port: ${PORT}
  🌎 Environment: ${ENVIRONMENT}
  =====================================================
  `);
  
  if (!isProduction) {
    console.log('  Available routes:');
    services.forEach(s => {
      console.log(`  •\x1b[45m${s.route}\x1b[0m  →  \x1b[36m${s.target}\x1b[0m  (\x1b[32m${s.description || 'No description'}\x1b[0m)`);
    });
    console.log('=====================================================');
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});