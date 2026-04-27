const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const makeAdmin = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('Updating all users to have admin role...');
    const result = await User.updateMany({}, { role: 'admin' });
    
    console.log(`Successfully updated ${result.modifiedCount} user(s) to admin!`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

makeAdmin();
