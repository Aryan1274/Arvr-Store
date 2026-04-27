const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

// Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/tags', require('./routes/tagRoutes'));
app.use('/api/collections', require('./routes/collectionRoutes'));
app.use('/api/settings', require('./routes/settingRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/coupons', require('./routes/couponRoutes'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'ARVR Store Backend is running!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
