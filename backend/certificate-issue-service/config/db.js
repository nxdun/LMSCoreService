const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

let gridfsBucket;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    gridfsBucket = new GridFSBucket(conn.connection.db, {
      bucketName: 'certificates',
    });
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

const getGridFSBucket = () => gridfsBucket;

module.exports = { connectDB, getGridFSBucket };
