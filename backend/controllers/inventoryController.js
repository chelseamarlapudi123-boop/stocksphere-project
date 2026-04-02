import Inventory from '../models/Inventory.js';

export const getInventory = async (req, res) => {
  try {
    const { productId, branchId } = req.query;
    let query = {};
    if (productId) query.productId = productId;
    if (branchId && branchId !== 'all') query.branchId = branchId;

    const inventory = await Inventory.find(query).populate('productId');
    res.status(200).json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const upsertInventory = async (req, res) => {
  try {
    const { productId, branchId, quantity, reorderPoint } = req.body;
    const inventory = await Inventory.findOneAndUpdate(
      { productId, branchId },
      { productId, branchId, quantity, reorderPoint, lastRestock: new Date() },
      { upsert: true, new: true }
    );
    res.status(200).json(inventory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
