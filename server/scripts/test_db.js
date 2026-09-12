import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI;

if (!uri || uri.includes('<db_password>')) {
  console.error("❌ ERROR: Please replace <db_password> with your actual MongoDB password in the .env file.");
  process.exit(1);
}

// Define a simple test schema and model
const TestSchema = new mongoose.Schema({
  name: String,
  createdAt: { type: Date, default: Date.now }
});

const TestModel = mongoose.model('TestConnection', TestSchema);

async function testConnection() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(uri);
    console.log("✅ Successfully connected to MongoDB!");

    console.log("Attempting to add data...");
    const testDoc = new TestModel({ name: 'Connection Test' });
    await testDoc.save();
    
    console.log("✅ Successfully added test data to the database!");
    console.log("Document saved:", testDoc);

    // Clean up the test document
    await TestModel.deleteOne({ _id: testDoc._id });
    console.log("✅ Cleaned up test data.");

  } catch (error) {
    console.error("❌ Failed to connect or add data to MongoDB.");
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

testConnection();
