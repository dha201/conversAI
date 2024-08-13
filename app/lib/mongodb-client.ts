import { MongoClient, ServerApiVersion } from 'mongodb';
import { env } from './config';

const uri = env.MONGODB_URI;
if (!uri) {
    throw new Error('MONGODB_URI is not defined in the environment variables');
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let isConnected = false;

export async function connectToDatabase() {
  if (!isConnected) {
    try {
      await client.connect();
      isConnected = true;
    } catch (err) {
      console.error('Failed to connect to the database', err);
      throw err;
    }
  }
  return client.db("chatbot");
}
