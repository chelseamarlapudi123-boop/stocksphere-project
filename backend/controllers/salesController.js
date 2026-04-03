import Sale from '../models/Sale.js';
import Product from '../models/Product.js';
import Inventory from '../models/Inventory.js';

export const getSalesHistory = async (req, res) => {
  try {
    const { productId, branchId, startDate, endDate } = req.query;
    const query = {};

    if (productId) query.productId = productId;
    if (branchId && branchId !== 'all') query.branchId = branchId;

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const sales = await Sale.find(query).sort({ date: 1 });
    res.status(200).json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createSale = async (req, res) => {
  try {
    const { productId, branchId, quantity, revenue, date } = req.body;
    const saleQty = Number(quantity);

    if (!productId || !branchId || !Number.isFinite(saleQty) || saleQty <= 0) {
      return res.status(400).json({ message: 'productId, branchId and positive quantity are required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const inventoryRow = await Inventory.findOne({ productId, branchId });
    if (!inventoryRow) {
      return res.status(404).json({ message: 'Inventory row not found for this product/branch' });
    }

    if (inventoryRow.quantity < saleQty) {
      return res.status(400).json({ message: 'Insufficient stock for sale' });
    }

    const computedRevenue = Number.isFinite(Number(revenue))
      ? Number(revenue)
      : Number(product.price) * saleQty;

    const newSale = new Sale({
      productId,
      branchId,
      quantity: saleQty,
      revenue: computedRevenue,
      date: date ? new Date(date) : new Date()
    });

    await newSale.save();

    inventoryRow.quantity -= saleQty;
    await inventoryRow.save();

    res.status(201).json(newSale);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

