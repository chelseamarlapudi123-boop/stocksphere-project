import Product from './models/Product.js';
import Inventory from './models/Inventory.js';
import Sale from './models/Sale.js';
import User from './models/User.js';
import Branch from './models/Branch.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding...");

    // Clear existing data for a fresh sync
    console.log("Clearing existing data...");
    await Promise.all([
      Product.deleteMany({}),
      Inventory.deleteMany({}),
      Sale.deleteMany({}),
      User.deleteMany({}),
      Branch.deleteMany({})
    ]);

    // 1. Seed Branches
    console.log("Seeding branches...");
    const branchesData = [
      { id: 'b1', name: 'Harbor City', location: 'Navi Mumbai, MH' },
      { id: 'b2', name: 'Uptown Nexus', location: 'Bandra, Mumbai' },
      { id: 'b3', name: 'Valley View', location: 'Pune, MH' },
      { id: 'b4', name: 'Skyline Hub', location: 'Bangalore, KA' }
    ];
    await Branch.insertMany(branchesData);

    // 2. Seed Products
    console.log("Seeding products...");
    const productsData = [
      { name: 'Wireless Headphones', category: 'Electronics', price: 2499 },
      { name: 'Mechanical Keyboard', category: 'Computing', price: 4500 },
      { name: 'Smart Watch', category: 'Electronics', price: 3200 },
      { name: 'USB-C Docking Station', category: 'Computing', price: 1800 },
      { name: 'Noise Cancelling Earbuds', category: 'Electronics', price: 5600 },
      { name: 'Ergonomic Mouse', category: 'Computing', price: 1200 }
    ];
    const createdProducts = await Product.insertMany(productsData);

    // Create a mapping of Product Name to MongoDB _id
    const prodMap = {};
    createdProducts.forEach(p => prodMap[p.name] = p._id);

    // 3. Seed Inventory
    console.log("Seeding inventory...");
    const inventoryData = [
      { productName: 'Wireless Headphones', branchId: 'b1', quantity: 45, reorderPoint: 15 },
      { productName: 'Wireless Headphones', branchId: 'b2', quantity: 12, reorderPoint: 15 },
      { productName: 'Mechanical Keyboard', branchId: 'b1', quantity: 28, reorderPoint: 10 },
      { productName: 'Mechanical Keyboard', branchId: 'b3', quantity: 8, reorderPoint: 10 },
      { productName: 'Smart Watch', branchId: 'b1', quantity: 60, reorderPoint: 20 },
      { productName: 'Smart Watch', branchId: 'b4', quantity: 15, reorderPoint: 20 },
      { productName: 'USB-C Docking Station', branchId: 'b2', quantity: 35, reorderPoint: 12 },
      { productName: 'Noise Cancelling Earbuds', branchId: 'b1', quantity: 5, reorderPoint: 15 },
      { productName: 'Ergonomic Mouse', branchId: 'b3', quantity: 22, reorderPoint: 10 }
    ];
    
    const finalInventory = inventoryData.map(item => ({
      productId: prodMap[item.productName],
      branchId: item.branchId,
      quantity: item.quantity,
      reorderPoint: item.reorderPoint
    }));
    await Inventory.insertMany(finalInventory);

    // 4. Seed Sales
    console.log("Seeding sales...");
    const salesData = [
      { productName: 'Wireless Headphones', branchId: 'b1', quantity: 5, revenue: 12495, date: '2026-03-18' },
      { productName: 'Mechanical Keyboard', branchId: 'b1', quantity: 2, revenue: 9000, date: '2026-03-19' },
      { productName: 'Smart Watch', branchId: 'b4', quantity: 10, revenue: 32000, date: '2026-03-20' },
      { productName: 'Noise Cancelling Earbuds', branchId: 'b1', quantity: 3, revenue: 16800, date: '2026-03-15' },
      { productName: 'Wireless Headphones', branchId: 'b2', quantity: 8, revenue: 19992, date: '2026-03-10' }
    ];

    const finalSales = salesData.map(sale => ({
      productId: prodMap[sale.productName],
      branchId: sale.branchId,
      quantity: sale.quantity,
      revenue: sale.revenue,
      date: new Date(sale.date)
    }));
    await Sale.insertMany(finalSales);

    // 5. Seed Users
    console.log("Seeding users...");
    const usersData = [
      { name: 'Chelsea', email: 'chelsea@stocksphere.com', role: 'admin', password: 'password123', status: 'active' },
      { name: 'Nowshen', email: 'nowshen@stocksphere.com', role: 'manager', branchId: 'b1', password: 'password123', status: 'active' },
      { name: 'Sravya', email: 'sravya@stocksphere.com', role: 'manager', branchId: 'b2', password: 'password123', status: 'active' },
      { name: 'Neha', email: 'neha@stocksphere.com', role: 'manager', branchId: 'b3', password: 'password123', status: 'active' }
    ];
    // User model has pre-save hook for password hashing
    await User.insertMany(usersData);

    console.log("Final Sync Complete! Database is now aligned with mockData.js");
    await mongoose.disconnect();
  } catch (error) {
    console.error("Sync error:", error);
    process.exit(1);
  }
};

seedData();
