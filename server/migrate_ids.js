const mongoose = require('mongoose');
const Product = require('./models/Product');
const Counter = require('./models/Counter');
require('dotenv').config();

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const products = await Product.find({ customId: { $exists: false } });
  console.log(`Found ${products.length} products without customId`);

  let counter = await Counter.findOne({ id: 'productId' });
  let currentSeq = counter ? counter.seq : 0;

  for (const product of products) {
    currentSeq++;
    const sequenceNumber = currentSeq + 99;
    product.customId = `product${sequenceNumber}`;
    await product.save();
    console.log(`Updated ${product.name} to ${product.customId}`);
  }

  await Counter.findOneAndUpdate(
    { id: 'productId' },
    { seq: currentSeq },
    { upsert: true }
  );

  console.log('Migration complete');
  process.exit(0);
}

migrate().catch(err => {
  console.error(err);
  process.exit(1);
});
