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
    const { name, category, price, unit, quantity, branchId, branch } = req.body;
    
    // Create the product
    const newProduct = new Product({ name, category, price, unit: unit || 'pcs' });
    await newProduct.save();

    // If quantity and branch are provided, create initial inventory
    const targetBranch = branchId || branch;
    if (targetBranch && quantity !== undefined) {
      const newInventory = new Inventory({
        productId: newProduct._id,
        branchId: targetBranch,
        quantity: Number(quantity),
        reorderPoint: Number(req.body.reorderPoint) || 10
      });
      await newInventory.save();
    }

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
    const { name, category, price, unit } = req.body;
    const updated = await Product.findByIdAndUpdate(
      id,
      { name, category, price, unit },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
