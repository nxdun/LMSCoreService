# Build stage
FROM --platform=linux/amd64 maven:3.9.9-eclipse-temurin-17-alpine AS build
WORKDIR /app

# Copy the project files
COPY pom.xml .
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests

# Run stage
FROM --platform=linux/amd64 eclipse-temurin:17-jdk-alpine
WORKDIR /app

# Copy the built JAR from the build stage
COPY --from=build /app/target/lecsrv-0.0.4-SNAPSHOT.jar app.jar

# Expose the port
EXPOSE 1113

# Set entry point
ENTRYPOINT ["java", "-jar", "/app/app.jar"]