import Inventory from '../models/Inventory.js';

export const getInventory = async (req, res) => {
  try {
    const { productId, branchId } = req.query;
    const query = {};

    if (productId) query.productId = productId;
    if (branchId && branchId !== 'all') query.branchId = branchId;

    const inventory = await Inventory.find(query).sort({ branchId: 1, _id: -1 });
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
      {
        productId,
        branchId,
        quantity: Number(quantity) || 0,
        reorderPoint: Number(reorderPoint) || 10,
        lastRestock: new Date()
      },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(200).json(inventory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateInventoryQuantity = async (req, res) => {
  try {
    const { productId, branchId } = req.params;
    const { quantity } = req.body;

    const updated = await Inventory.findOneAndUpdate(
      { productId, branchId },
      { quantity: Number(quantity) || 0, lastRestock: new Date() },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Inventory record not found' });
    }

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateInventoryItem = async (req, res) => {
  try {
    const { productId, oldBranchId, newBranchId, quantity, reorderPoint } = req.body;

    if (!productId || !oldBranchId || !newBranchId) {
      return res.status(400).json({ message: 'productId, oldBranchId and newBranchId are required' });
    }

    // If branch changed, remove old row and upsert new row so branch-level stats remain correct.
    if (oldBranchId !== newBranchId) {
      await Inventory.deleteOne({ productId, branchId: oldBranchId });
    }

    const updated = await Inventory.findOneAndUpdate(
      { productId, branchId: newBranchId },
      {
        productId,
        branchId: newBranchId,
        quantity: Number(quantity) || 0,
        reorderPoint: Number(reorderPoint) || 10,
        lastRestock: new Date()
      },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

