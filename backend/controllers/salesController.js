import Sale from '../models/Sale.js';

export const getSalesHistory = async (req, res) => {
  try {
    const { productId, branchId } = req.query;
    let query = {};
    if (productId) query.productId = productId;
    if (branchId && branchId !== 'all') query.branchId = branchId;

    const sales = await Sale.find(query).sort({ date: 1 });
    res.status(200).json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createSale = async (req, res) => {
  try {
    const newSale = new Sale(req.body);
    await newSale.save();
    res.status(201).json(newSale);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
