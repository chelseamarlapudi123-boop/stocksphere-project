import Product from '../models/Product.js';
import Inventory from '../models/Inventory.js';
import Sale from '../models/Sale.js';

export const getReports = async (req, res) => {
  try {
    const { branchId } = req.query;
    const query = branchId && branchId !== 'all' ? { branchId } : {};

    const [totalProducts, inventoryItems, recentSales] = await Promise.all([
      Product.countDocuments(),
      Inventory.find(query),
      Sale.find(query).sort({ date: -1 }).limit(10)
    ]);

    const totalStock = inventoryItems.reduce((acc, item) => acc + item.quantity, 0);
    const lowStockItems = inventoryItems.filter(item => item.quantity <= item.reorderPoint).length;

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        totalStock,
        lowStockItems,
        recentSales,
        branchId: branchId || 'All Branches',
      }
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getBranchReport = async (req, res) => {
  try {
    const { branchId } = req.params;
    const inventory = await Inventory.find({ branchId }).populate('productId');
    const sales = await Sale.find({ branchId }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      data: {
        branchId,
        inventory,
        sales,
        summary: {
          totalItems: inventory.length,
          totalQuantity: inventory.reduce((acc, i) => acc + i.quantity, 0),
          totalSales: sales.length
        }
      }
    });
  } catch (error) {
    console.error(`Error fetching branch report for ${req.params.branchId}:`, error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const downloadBranchReport = async (req, res) => {
  try {
    const { branchId } = req.params;
    res.status(200).json({
      success: true,
      message: `Download endpoint for branch ${branchId} ready (mock).`
    });
  } catch (error) {
    console.error(`Error downloading branch report for ${req.params.branchId}:`, error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
