import Product from '../models/Product.js';
import Inventory from '../models/Inventory.js';

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ name: 1 });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, category, price, unit, quantity, branchId, branch, status } = req.body;
    
    const newProduct = new Product({
      name,
      category,
      price: Number(price),
      unit: unit || 'pcs',
      status: status || 'active'
    });
    await newProduct.save();

    // ALWAYs create initial inventory record to stay synced
    const targetBranch = branchId || branch || 'b1';
    const newInventory = new Inventory({
      productId: newProduct._id,
      branchId: targetBranch,
      quantity: Number(quantity) || 0,
      reorderPoint: Number(req.body.reorderPoint) || 10
    });
    await newInventory.save();

    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    // Cascade: remove all inventory records for this product
    await Inventory.deleteMany({ productId: id });
    res.status(200).json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, unit, status } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (category !== undefined) updates.category = category;
    if (price !== undefined) updates.price = Number(price);
    if (unit !== undefined) updates.unit = unit;
    if (status !== undefined) updates.status = status;

    const updated = await Product.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
