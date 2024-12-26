import mongoose from "mongoose";

// Defining number of active connections, can also be null or undefined in case of no active connections
type ConnectionObject = {
  isConnected?: number;
};

const connection: ConnectionObject = {};

// Connecting to db
async function dbConnect(): Promise<void> {
  // Check if we have a connection to the database
  if (connection.isConnected) {
    console.log("Already connected to database");
    return;
  }

  try {
    // Connect to our database
    const db = await mongoose.connect(process.env.MONGODB_URI || "", {});

    connection.isConnected = db.connections[0].readyState;

    console.log("Connected to database successfully: ", connection.isConnected);
  } catch (error) {
    // Error connecting to database
    console.error("Error connecting to database: ", error);

    process.exit(1);
  }
}

export default dbConnect;
