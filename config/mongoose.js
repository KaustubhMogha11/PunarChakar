import mongoose from 'mongoose';

const DbConnection = async (username, password) => {
  const URL = `mongodb+srv://${username}:${password}@cluster0.ovbvlrc.mongodb.net/PunarChakra?retryWrites=true&w=majority&appName=Cluster0`;

  try {
    await mongoose.connect(URL);
    console.log('MongoDB Connected Successfully');
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    throw error; 
  }
};

export default DbConnection;
