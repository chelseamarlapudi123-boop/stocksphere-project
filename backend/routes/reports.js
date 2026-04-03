import express from 'express';
import {
  getReports,
  getDashboardStats,
  getForecastReport,
  getBranchReport,
  downloadBranchReport
} from '../controllers/reportController.js';

const router = express.Router();

// GET /api/reports - Get branch-based or global reports
router.get('/', getReports);
router.get('/dashboard', getDashboardStats);
router.get('/forecast', getForecastReport);

// GET /api/reports/branch/:branchId - Get detailed report for a specific branch
router.get('/branch/:branchId', getBranchReport);

// GET /api/reports/branch/:branchId/download - Download PDF/CSV representation for a branch
router.get('/branch/:branchId/download', downloadBranchReport);

export default router;
