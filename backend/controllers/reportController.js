import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Inventory from '../models/Inventory.js';
import Sale from '../models/Sale.js';
import Branch from '../models/Branch.js';

const parseDateOrDefault = (raw, fallback) => {
  if (!raw) return fallback;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
};

const parseDateBoundary = (raw, { endOfDay = false, fallback }) => {
  const parsed = parseDateOrDefault(raw, fallback);
  if (endOfDay) {
    parsed.setHours(23, 59, 59, 999);
  } else {
    parsed.setHours(0, 0, 0, 0);
  }
  return parsed;
};

const monthLabel = (date) => date.toLocaleString('default', { month: 'short' });

const buildMonthSeries = (count) => {
  const now = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (count - 1 - i), 1);
    return {
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: monthLabel(d)
    };
  });
};

const getBranchFilter = (branchId) => {
  if (!branchId || branchId === 'all') return {};
  return { branchId };
};

const seedFromString = (input) => {
  let seed = 0;
  const source = String(input || 'forecast-seed');
  for (let i = 0; i < source.length; i += 1) {
    seed = (seed * 31 + source.charCodeAt(i)) >>> 0;
  }
  return seed || 123456789;
};

const seededRandom = (seedValue) => {
  let seed = seedValue >>> 0;
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
};

const buildMockForecastFromStock = ({
  currentStock,
  reorderPoint,
  forecastCount,
  trendDays,
  seedKey
}) => {
  const seed = seedFromString(seedKey);
  const rand = seededRandom(seed);
  const stock = Math.max(0, Number(currentStock) || 0);

  // Keep this aligned with the user-requested mock function behavior.
  const days = Math.max(7, Number(trendDays) || 7);
  const trend = [];
  let base = stock * (0.7 + rand() * 0.3);

  for (let i = 0; i < days; i += 1) {
    base = base + (rand() * 10 - 5); // smooth variation
    trend.push(Math.max(0, Math.round(base)));
  }

  const demandForecast = trend[trend.length - 1] || 0;
  const reorderLevel = Math.max(0, reorderPoint || Math.round(stock * 0.25));

  let risk = 'Low Risk';
  if (demandForecast > stock) risk = 'High Risk';
  else if (Math.abs(demandForecast - stock) < 10) risk = 'Medium Risk';

  const history = trend.map((quantity, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - idx));
    return {
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
      month: `${d.getDate()} ${monthLabel(d)}`,
      totalQuantity: quantity
    };
  });

  let futureBase = demandForecast;
  const forecast = Array.from({ length: forecastCount }, (_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() + idx + 1);
    futureBase = futureBase + (rand() * 10 - 5);
    const projected = Math.max(0, Math.round(futureBase));
    return {
      month: `${d.getDate()} ${monthLabel(d)}`,
      quantity: projected
    };
  });

  return {
    history,
    forecast,
    demandForecast,
    reorderLevel,
    trend,
    risk
  };
};

export const getDashboardStats = async (req, res) => {
  try {
    const { branchId } = req.query;
    const branchFilter = getBranchFilter(branchId);
    const lastSixMonths = buildMonthSeries(6);
    const sixMonthStart = new Date();
    sixMonthStart.setMonth(sixMonthStart.getMonth() - 5);
    sixMonthStart.setDate(1);
    sixMonthStart.setHours(0, 0, 0, 0);

    const [activeProducts, inventoryRows, salesTrendRaw, totalSalesRaw, categoriesRaw, branchRows, branches] = await Promise.all([
      Product.countDocuments({ $or: [{ status: 'active' }, { status: { $exists: false } }] }),
      Inventory.aggregate([
        { $match: branchFilter },
        {
          $lookup: {
            from: 'products',
            localField: 'productId',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            branchId: 1,
            quantity: { $ifNull: ['$quantity', 0] },
            reorderPoint: { $ifNull: ['$reorderPoint', 0] },
            category: '$product.category',
            price: { $ifNull: ['$product.price', 0] }
          }
        }
      ]),
      Sale.aggregate([
        { $match: { ...branchFilter, date: { $gte: sixMonthStart } } },
        {
          $group: {
            _id: {
              year: { $year: '$date' },
              month: { $month: '$date' }
            },
            sales: { $sum: { $ifNull: ['$revenue', 0] } }
          }
        }
      ]),
      Sale.aggregate([
        { $match: branchFilter },
        {
          $group: {
            _id: null,
            totalSales: { $sum: { $ifNull: ['$revenue', 0] } }
          }
        }
      ]),
      Inventory.aggregate([
        { $match: branchFilter },
        {
          $lookup: {
            from: 'products',
            localField: 'productId',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: { $ifNull: ['$product.category', 'Uncategorized'] },
            productCount: { $sum: 1 },
            value: {
              $sum: {
                $multiply: [
                  { $ifNull: ['$quantity', 0] },
                  { $ifNull: ['$product.price', 0] }
                ]
              }
            }
          }
        }
      ]),
      Inventory.aggregate([
        { $match: branchFilter },
        {
          $lookup: {
            from: 'products',
            localField: 'productId',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: '$branchId',
            stockValue: {
              $sum: {
                $multiply: [
                  { $ifNull: ['$quantity', 0] },
                  { $ifNull: ['$product.price', 0] }
                ]
              }
            },
            lowStock: {
              $sum: {
                $cond: [{ $lt: ['$quantity', '$reorderPoint'] }, 1, 0]
              }
            },
            totalProducts: { $sum: 1 }
          }
        }
      ]),
      Branch.find(branchFilter).sort({ name: 1 }).lean()
    ]);

    const totals = inventoryRows.reduce((acc, row) => {
      acc.overallStock += row.quantity || 0;
      acc.inventoryValue += (row.quantity || 0) * (row.price || 0);
      if ((row.quantity || 0) < (row.reorderPoint || 0)) acc.lowStockAlerts += 1;
      return acc;
    }, { overallStock: 0, inventoryValue: 0, lowStockAlerts: 0 });

    const totalSales = totalSalesRaw?.[0]?.totalSales || 0;

    const salesLookup = new Map(
      salesTrendRaw.map((row) => [
        `${row._id.year}-${String(row._id.month).padStart(2, '0')}`,
        Math.round(row.sales || 0)
      ])
    );

    const salesTrend = lastSixMonths.map((m) => ({
      month: m.label,
      key: m.key,
      sales: salesLookup.get(m.key) || 0
    }));

    const totalCategoryValue = categoriesRaw.reduce((sum, c) => sum + (c.value || 0), 0);
    const categoryDistribution = categoriesRaw
      .map((c) => ({
        name: c._id,
        count: c.productCount || 0,
        value: Math.round(c.value || 0),
        percentage: totalCategoryValue > 0 ? Math.round(((c.value || 0) / totalCategoryValue) * 100) : 0
      }))
      .sort((a, b) => b.value - a.value);

    const branchMetricMap = new Map(branchRows.map((row) => [row._id, row]));
    const branchPerformance = branches.map((branch) => {
      const metrics = branchMetricMap.get(branch.id) || { stockValue: 0, lowStock: 0, totalProducts: 0 };
      return {
        id: branch.id,
        name: branch.name,
        location: branch.location,
        stockValue: Math.round(metrics.stockValue || 0),
        lowItems: metrics.lowStock || 0,
        totalItems: metrics.totalProducts || 0,
        health: (metrics.lowStock || 0) > 0 ? 'warning' : 'good'
      };
    });

    res.status(200).json({
      success: true,
      data: {
        kpis: {
          activeProducts,
          overallStock: totals.overallStock,
          inventoryValue: Math.round(totals.inventoryValue),
          totalSales: Math.round(totalSales),
          lowStockAlerts: totals.lowStockAlerts
        },
        salesTrend,
        categoryDistribution,
        branchPerformance
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getForecastReport = async (req, res) => {
  try {
    console.log('Forecast request:', req.query);
    const { productId, productName, branchId = 'all', monthsHistory = 18, monthsForecast = 3, trendDays = 7 } = req.query;

    let resolvedProductId = null;
    if (productId && mongoose.Types.ObjectId.isValid(productId)) {
      resolvedProductId = new mongoose.Types.ObjectId(productId);
    } else if (productName) {
      const exact = await Product.findOne({ name: productName }).lean();
      const fallback = exact || await Product.findOne({ name: { $regex: `^${productName}$`, $options: 'i' } }).lean();
      if (fallback?._id) {
        resolvedProductId = fallback._id;
      }
    }

    if (!resolvedProductId) {
      return res.status(400).json({ success: false, message: 'Valid productId or productName is required', data: [] });
    }

    const historyCount = Math.max(3, Number(monthsHistory) || 18);
    const forecastCount = Math.max(1, Number(monthsForecast) || 3);

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - (historyCount - 1));
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    let resolvedBranchId = branchId;
    if (branchId && branchId !== 'all') {
      const branchById = await Branch.findOne({ id: branchId }).lean();
      if (!branchById) {
        const branchByName = await Branch.findOne({ name: branchId }).lean()
          || await Branch.findOne({ name: { $regex: `^${branchId}$`, $options: 'i' } }).lean();
        resolvedBranchId = branchByName?.id || branchId;
      }
    }

    let salesMatch = {
      productId: resolvedProductId,
      date: { $gte: startDate }
    };

    if (resolvedBranchId && resolvedBranchId !== 'all') salesMatch.branchId = resolvedBranchId;

    let [historyRaw, inventoryRows, productDoc] = await Promise.all([
      Sale.aggregate([
        { $match: salesMatch },
        {
          $group: {
            _id: {
              year: { $year: '$date' },
              month: { $month: '$date' }
            },
            totalQuantity: { $sum: '$quantity' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      Inventory.find({
        productId: resolvedProductId,
        ...(resolvedBranchId !== 'all' ? { branchId: resolvedBranchId } : {})
      }).lean(),
      Product.findById(resolvedProductId).lean()
    ]);

    let fallbackApplied = false;
    if ((resolvedBranchId && resolvedBranchId !== 'all') && historyRaw.length === 0) {
      const [allHistoryRaw, allInventoryRows] = await Promise.all([
        Sale.aggregate([
          { $match: { productId: resolvedProductId, date: { $gte: startDate } } },
          {
            $group: {
              _id: {
                year: { $year: '$date' },
                month: { $month: '$date' }
              },
              totalQuantity: { $sum: '$quantity' }
            }
          },
          { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]),
        Inventory.find({ productId: resolvedProductId }).lean()
      ]);

      if (allHistoryRaw.length > 0) {
        historyRaw = allHistoryRaw;
        inventoryRows = allInventoryRows;
        fallbackApplied = true;
      }
    }

    const monthSeries = buildMonthSeries(historyCount);
    const historyLookup = new Map(
      historyRaw.map((row) => [
        `${row._id.year}-${String(row._id.month).padStart(2, '0')}`,
        row.totalQuantity || 0
      ])
    );

    const realHistory = monthSeries.map((m) => ({
      key: m.key,
      month: m.label,
      totalQuantity: historyLookup.get(m.key) || 0
    }));

    const availablePoints = realHistory.map((h) => h.totalQuantity).filter((v) => v > 0);
    let insufficientData = availablePoints.length === 0;

    const baseWindow = realHistory.slice(-3).map((h) => h.totalQuantity);
    const avg = baseWindow.length > 0 ? baseWindow.reduce((sum, v) => sum + v, 0) / baseWindow.length : 0;
    const realForecast = Array.from({ length: forecastCount }, (_, idx) => {
      const d = new Date();
      d.setMonth(d.getMonth() + idx + 1);
      return {
        month: monthLabel(d),
        quantity: Math.max(0, Math.round(avg))
      };
    });

    const currentStock = inventoryRows.reduce((sum, row) => sum + (row.quantity || 0), 0);
    const reorderPoint = inventoryRows.length > 0
      ? Math.round(inventoryRows.reduce((sum, row) => sum + (row.reorderPoint || 0), 0) / inventoryRows.length)
      : 0;

    const defaultDemandForecast = realForecast[0]?.quantity || 0;
    const defaultRisk = currentStock > defaultDemandForecast * 1.1
      ? 'Low Risk'
      : currentStock >= defaultDemandForecast * 0.9
        ? 'Medium Risk'
        : 'High Risk';

    let history = realHistory;
    let forecast = realForecast;
    let demandForecast = defaultDemandForecast;
    let reorderLevel = reorderPoint;
    let trend = history.slice(-Math.max(7, Number(trendDays) || 7)).map((point) => point.totalQuantity);
    let risk = defaultRisk;

    if (insufficientData) {
      const mock = buildMockForecastFromStock({
        currentStock,
        reorderPoint,
        forecastCount,
        trendDays,
        seedKey: `${resolvedProductId}-${resolvedBranchId}-${currentStock}-${productDoc?.price || 0}`
      });

      history = mock.history;
      forecast = mock.forecast;
      demandForecast = mock.demandForecast;
      reorderLevel = mock.reorderLevel;
      trend = mock.trend;
      risk = mock.risk;
      insufficientData = false;
    }

    const data = {
      productId: String(resolvedProductId),
      branchId: resolvedBranchId,
      currentStock,
      reorderPoint: reorderLevel,
      demandForecast,
      reorderLevel,
      trend,
      risk,
      history,
      forecast,
      insufficientData,
      fallbackApplied
    };

    console.log('Data fetched:', data);

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching forecast report:', error);
    res.status(500).json({ success: false, message: 'Server error', data: [] });
  }
};

export const getReports = async (req, res) => {
  try {
    const { branchId, branch, startDate, endDate } = req.query;
    const resolvedBranch = branchId || branch || 'all';
    const branchFilter = getBranchFilter(resolvedBranch);

    const defaultFrom = new Date('1970-01-01T00:00:00.000Z');
    const defaultTo = new Date();
    const from = parseDateBoundary(startDate, { endOfDay: false, fallback: defaultFrom });
    const to = parseDateBoundary(endDate, { endOfDay: true, fallback: defaultTo });
    const [rangeStart, rangeEnd] = from <= to ? [from, to] : [to, from];

    const salesQuery = {
      ...branchFilter,
      date: { $gte: rangeStart, $lte: rangeEnd }
    };

    console.log('Query:', {
      startDate: rangeStart.toISOString(),
      endDate: rangeEnd.toISOString(),
      branch: resolvedBranch
    });

    const [
      totalProducts,
      inventoryRows,
      salesRows,
      topProducts,
      branches,
      branchInventory,
      branchSales
    ] = await Promise.all([
      Product.countDocuments({ $or: [{ status: 'active' }, { status: { $exists: false } }] }),
      Inventory.aggregate([
        { $match: branchFilter },
        {
          $lookup: {
            from: 'products',
            localField: 'productId',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            branchId: 1,
            quantity: 1,
            reorderPoint: 1,
            productId: 1,
            productName: '$product.name',
            category: '$product.category',
            price: { $ifNull: ['$product.price', 0] }
          }
        }
      ]),
      Sale.find(salesQuery).sort({ date: -1 }).lean(),
      Sale.aggregate([
        { $match: salesQuery },
        {
          $group: {
            _id: '$productId',
            totalSold: { $sum: '$quantity' },
            revenue: { $sum: '$revenue' }
          }
        },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 0,
            productId: '$_id',
            name: '$product.name',
            category: '$product.category',
            totalSold: 1,
            revenue: 1
          }
        }
      ]),
      Branch.find(branchFilter).sort({ name: 1 }).lean(),
      Inventory.aggregate([
        { $match: branchFilter },
        {
          $lookup: {
            from: 'products',
            localField: 'productId',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: '$branchId',
            totalProducts: { $sum: 1 },
            lowStock: { $sum: { $cond: [{ $lt: ['$quantity', '$reorderPoint'] }, 1, 0] } },
            stockValue: {
              $sum: {
                $multiply: [
                  { $ifNull: ['$quantity', 0] },
                  { $ifNull: ['$product.price', 0] }
                ]
              }
            }
          }
        }
      ]),
      Sale.aggregate([
        { $match: salesQuery },
        {
          $group: {
            _id: '$branchId',
            totalTransactions: { $sum: 1 },
            revenue: { $sum: '$revenue' }
          }
        }
      ])
    ]);

    const totalStock = inventoryRows.reduce((sum, row) => sum + (row.quantity || 0), 0);
    const inventoryValue = inventoryRows.reduce((sum, row) => sum + (row.quantity || 0) * (row.price || 0), 0);
    const lowStockItems = inventoryRows.filter((row) => (row.quantity || 0) < (row.reorderPoint || 0)).length;

    console.log('Sales found:', salesRows.length);

    const totalSalesRevenue = salesRows.reduce((sum, row) => sum + (row.revenue || 0), 0);
    const totalTransactions = salesRows.length;

    const inventoryByBranch = new Map(branchInventory.map((row) => [row._id, row]));
    const salesByBranch = new Map(branchSales.map((row) => [row._id, row]));

    const branchPerformance = branches.map((branch) => {
      const inv = inventoryByBranch.get(branch.id) || { totalProducts: 0, lowStock: 0, stockValue: 0 };
      const sales = salesByBranch.get(branch.id) || { totalTransactions: 0, revenue: 0 };
      return {
        id: branch.id,
        name: branch.name,
        totalProducts: inv.totalProducts || 0,
        lowStock: inv.lowStock || 0,
        stockValue: Math.round(inv.stockValue || 0),
        totalSales: sales.totalTransactions || 0,
        revenue: Math.round(sales.revenue || 0)
      };
    });

    res.status(200).json({
      success: true,
      data: {
        filters: {
          branchId: resolvedBranch,
          startDate: rangeStart.toISOString(),
          endDate: rangeEnd.toISOString()
        },
        summary: {
          totalProducts,
          totalStock,
          inventoryValue: Math.round(inventoryValue),
          lowStockItems,
          totalSalesRevenue: Math.round(totalSalesRevenue),
          totalTransactions
        },
        branchPerformance,
        topProducts,
        recentSales: salesRows.slice(0, 10),
        inventoryReport: inventoryRows
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

    const inventoryValue = inventory.reduce(
      (sum, row) => sum + (row.quantity || 0) * (row.productId?.price || 0),
      0
    );

    res.status(200).json({
      success: true,
      data: {
        branchId,
        inventory,
        sales,
        summary: {
          totalItems: inventory.length,
          totalQuantity: inventory.reduce((acc, i) => acc + (i.quantity || 0), 0),
          lowStockItems: inventory.filter((i) => (i.quantity || 0) < (i.reorderPoint || 0)).length,
          inventoryValue: Math.round(inventoryValue),
          totalSales: sales.length,
          revenue: Math.round(sales.reduce((sum, s) => sum + (s.revenue || 0), 0))
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
      message: `Download endpoint for branch ${branchId} ready.`
    });
  } catch (error) {
    console.error(`Error downloading branch report for ${req.params.branchId}:`, error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

