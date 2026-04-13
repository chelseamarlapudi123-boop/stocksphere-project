import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, TrendingUp, Users, AlertTriangle, BarChart3,
  Plus, Minus, Download, RefreshCw, LogOut, Building2, FileText,
  Search, Edit2, Trash2, Key, Power, MoreVertical, ChevronLeft, ChevronRight, CheckCircle, XCircle,
  Activity, Pause, Play
} from 'lucide-react';
import { toast } from 'sonner';
import { ComposedChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

import { AuthProvider } from './contexts/AuthContext';
import { InventoryProvider } from './contexts/InventoryContext';
import { useAuth } from './contexts/useAuth';
import { useInventory } from './contexts/useInventory';

import { exportToCSV, downloadPortfolioCSV } from './utils/export';
import API from './utils/api';
import { formatCurrency } from './utils/formatters';
import {
  GLOBAL_LIVE_CONFIG,
  BRANCH_LIVE_CONFIG,
  createInitialLiveState,
  simulateNextLiveState,
} from './utils/liveSimulation';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';

// API_BASE removed for mock-only mode

// Helper: format numbers using the Indian lakh-crore system
// e.g. 458000 -> "4,58,000" | 92000 -> "92,000"
const toIndianFormat = (num) => {
  const n = Math.floor(num);
  const s = String(n);
  if (s.length <= 3) return s;
  const lastThree = s.slice(-3);
  const rest = s.slice(0, s.length - 3);
  const formatted = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return `${formatted},${lastThree}`;
};

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const { refreshData } = useInventory();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const normalizedRole = String(currentUser?.role || '').toUpperCase();
  const isBranchManager = normalizedRole === 'MANAGER' || normalizedRole === 'BRANCH_MANAGER';
  const branchParts = [currentUser?.branch?.name, currentUser?.branch?.location].filter(Boolean);
  const branchLabel = isBranchManager
    ? (branchParts.length > 0
      ? branchParts.join(', ')
      : 'Branch not assigned')
    : '';

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
    } catch (err) {
      console.error(err);
    }
    setIsRefreshing(false);
    toast.success("Data refreshed successfully", {
      description: "Latest dashboard metrics have been synced",
    });
  };

  return (
    <nav className="h-16 border-b border-white/10 bg-[#0B0F14]/95 backdrop-blur-2xl flex items-center px-8 fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center justify-between w-full max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-cyan-400 via-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-semibold tracking-[-1px] text-2xl">STOCKSPHERE</div>
              <div className="text-[10px] -mt-1 text-cyan-400/70">MULTI-BRANCH INVENTORY PLATFORM</div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md mx-8 relative">
          <div className="relative group">
            <input
              type="text"
              placeholder="Search products, branches..."
              className="w-full bg-zinc-900 border border-white/10 pl-11 py-3 rounded-3xl text-sm placeholder:text-zinc-500 focus:outline-none focus:border-cyan-400/60"
            />
            <BarChart3 className="absolute left-4 top-4 text-zinc-500 w-4 h-4" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-3xl border border-white/10 hover:bg-white/5 text-xs font-medium transition-all active:scale-[0.985] min-w-[120px] disabled:opacity-50"
          >
            {isRefreshing ? (
               <motion.div
                 animate={{ rotate: 360 }}
                 transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                 className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full"
               />
            ) : (
               <RefreshCw className="w-3.5 h-3.5" />
            )}
            {isRefreshing ? 'REFRESHING' : 'REFRESH'}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-white/5 relative"
            >
              <div className="relative">
                <AlertTriangle className="w-4 h-4 text-zinc-300" />
                <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-rose-500 flex items-center justify-center">
                  <div className="text-[8px] text-white font-mono">3</div>
                </div>
              </div>
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-80 glass rounded-3xl p-4 shadow-2xl z-50 text-sm"
                >
                  <div className="font-medium mb-3 px-1">Notifications</div>
                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-2xl bg-white/5">Low stock alert: Wireless Headphones @ Harbor</div>
                    <div className="p-3 rounded-2xl bg-white/5">Uptown branch forecast revision required</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User */}
          <div className="flex items-center gap-3 pl-4 border-l border-white/10">
            <div className="text-right pr-3">
              <div className="font-medium text-sm leading-none">
                {isBranchManager ? `${currentUser?.name} (Manager)` : currentUser?.name}
              </div>
              {isBranchManager ? (
                <div className="text-[11px] text-zinc-400 mt-1 flex items-center justify-end gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{branchLabel}</span>
                </div>
              ) : (
                <div className="text-[10px] text-cyan-400 mt-px">{currentUser?.role}</div>
              )}
            </div>

            <div
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-9 h-9 rounded-2xl bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center text-lg cursor-pointer border border-white/20 hover:border-white/50"
            >
              <Users className="w-5 h-5 text-zinc-300" />
            </div>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-6 top-[72px] w-60 glass rounded-3xl p-2 shadow-xl z-50"
                >
                  <button
                    onClick={() => window.location.reload()}
                    className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-white/10 text-sm"
                  >
                    Refresh Data
                  </button>
                  <div className="my-1 border-t border-white/10" />
                  <button
                    onClick={() => {
                      logout();
                      navigate('/login', { replace: true });
                    }}
                    className="w-full text-left flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-white/5 rounded-2xl text-sm"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </nav>
  );
};

const Sidebar = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const liveDashboardPath = isAdmin ? '/live-dashboard' : '/branch/live-dashboard';

  const menuItems = [
    { icon: BarChart3, label: "Dashboard", to: "/dashboard", match: ['/dashboard'] },
    { icon: Package, label: "Inventory", to: "/dashboard/inventory", match: ['/dashboard/inventory'] },
    { icon: TrendingUp, label: "Forecasting", to: "/dashboard/forecasting", match: ['/dashboard/forecasting'] },
    { icon: Download, label: "Reports", to: "/dashboard/reports", match: ['/dashboard/reports'] },
    { icon: Activity, label: "Live Dashboard", to: liveDashboardPath, match: ['/live-dashboard', '/branch/live-dashboard'] },
  ];

  if (isAdmin) {
    menuItems.push(
      { icon: Users, label: "Branches", to: "/dashboard/branches", match: ['/dashboard/branches'] },
      { icon: Users, label: "Users", to: "/dashboard/users", match: ['/dashboard/users'] }
    );
  }

  return (
    <div className="w-72 h-[calc(100vh-4rem)] border-r border-white/10 bg-zinc-950/90 pt-8 px-5 fixed left-0 top-16 overflow-y-auto">
      <div className="px-3 mb-8">
        <div className="uppercase text-xs tracking-[2px] text-zinc-500 mb-3 px-3">MAIN</div>
      </div>

      <div className="space-y-1 px-3">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = item.match.includes(currentPath);
          return (
            <button
              key={index}
              onClick={() => navigate(item.to)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all text-left ${isActive
                ? 'bg-white text-black shadow-lg'
                : 'hover:bg-white/5 text-zinc-400 hover:text-white'}`}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="px-6 mt-auto absolute bottom-8 text-xs text-zinc-500">
        Powered by real-time analytics
      </div>
    </div>
  );
};

const LiveDashboardPage = ({ mode = 'global' }) => {
  const isBranchMode = mode === 'branch';
  const liveConfig = isBranchMode ? BRANCH_LIVE_CONFIG : GLOBAL_LIVE_CONFIG;
  const [liveState, setLiveState] = useState(() => createInitialLiveState(liveConfig));
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    setLiveState(createInitialLiveState(liveConfig));
    setIsPaused(false);
  }, [liveConfig]);

  useEffect(() => {
    if (isPaused) {
      return undefined;
    }

    const timer = setInterval(() => {
      setLiveState((prev) => simulateNextLiveState(prev, liveConfig));
    }, 3000);

    return () => clearInterval(timer);
  }, [isPaused, liveConfig]);

  const inventoryTrendLabel = liveState.inventoryDelta >= 0
    ? `+${toIndianFormat(Math.abs(liveState.inventoryDelta))}`
    : `${toIndianFormat(liveState.inventoryDelta)}`;

  return (
    <div className="p-8 pt-20 max-w-screen-2xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-5xl tracking-tighter">
            {isBranchMode ? 'Branch Live Dashboard' : 'Live Dashboard'}
          </h1>
          <p className="text-sm text-zinc-400 mt-2">
            Simulated state-based updates with realistic inventory and sales flow.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="glass rounded-2xl px-4 py-3 flex items-center gap-3">
            <motion.span
              animate={isPaused ? { scale: 1 } : { scale: [1, 1.12, 1] }}
              transition={{ duration: 1.5, repeat: isPaused ? 0 : Infinity }}
              className={`w-2.5 h-2.5 rounded-full ${isPaused ? 'bg-amber-400' : 'bg-emerald-400'}`}
            />
            <div>
              <div className={`text-sm font-medium ${isPaused ? 'text-amber-400' : 'text-emerald-400'}`}>
                {isPaused ? 'Live Mode Paused' : 'Live Mode Active'}
              </div>
              <div className="text-xs text-zinc-400">
                {isPaused ? `Last update at ${new Date(liveState.lastUpdatedAt).toLocaleTimeString()}` : 'Updating every 3 seconds'}
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsPaused((prev) => !prev)}
            className="px-4 py-3 rounded-2xl border border-white/10 hover:bg-white/5 text-sm font-medium flex items-center gap-2"
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            {isPaused ? 'Resume' : 'Pause'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard
          title="TOTAL SALES"
          value={toIndianFormat(liveState.sales)}
          change={toIndianFormat(liveState.salesDelta)}
          icon={<TrendingUp className="w-6 h-6 text-emerald-400" />}
          accent="emerald"
        />
        <KPICard
          title="REVENUE"
          value={formatCurrency(liveState.revenue)}
          change={formatCurrency(liveState.revenueDelta)}
          icon={<BarChart3 className="w-6 h-6 text-indigo-400" />}
          accent="indigo"
        />
        <KPICard
          title="ORDERS"
          value={toIndianFormat(liveState.orders)}
          change={toIndianFormat(liveState.orderDelta)}
          icon={<FileText className="w-6 h-6 text-amber-400" />}
          accent="amber"
        />
        <KPICard
          title="INVENTORY"
          value={toIndianFormat(liveState.inventory)}
          change={inventoryTrendLabel}
          icon={<Package className="w-6 h-6 text-rose-400" />}
          accent="rose"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="glass rounded-3xl p-8">
          <div className="mb-5">
            <div className="font-semibold text-xl">Sales and Orders Timeline</div>
            <div className="text-sm text-zinc-400">Continuous incremental points over the last 12 ticks</div>
          </div>
          <ResponsiveContainer width="100%" height={290}>
            <ComposedChart data={liveState.series}>
              <CartesianGrid strokeDasharray="2 2" stroke="#27272a" />
              <XAxis dataKey="time" stroke="#52525b" />
              <YAxis yAxisId="sales" stroke="#52525b" />
              <YAxis yAxisId="orders" orientation="right" stroke="#52525b" />
              <Tooltip contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '8px' }} />
              <Line yAxisId="sales" type="monotone" dataKey="sales" stroke="#4f46e5" strokeWidth={2.5} dot={false} />
              <Area yAxisId="orders" type="monotone" dataKey="orders" stroke="#f59e0b" fill="#f59e0b33" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="glass rounded-3xl p-8">
          <div className="mb-5">
            <div className="font-semibold text-xl">Revenue and Inventory Flow</div>
            <div className="text-sm text-zinc-400">Sales steadily increase while inventory drops and restocks naturally</div>
          </div>
          <ResponsiveContainer width="100%" height={290}>
            <ComposedChart data={liveState.series}>
              <CartesianGrid strokeDasharray="2 2" stroke="#27272a" />
              <XAxis dataKey="time" stroke="#52525b" />
              <YAxis yAxisId="revenue" stroke="#52525b" />
              <YAxis yAxisId="inventory" orientation="right" stroke="#52525b" />
              <Tooltip contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '8px' }} />
              <Line yAxisId="revenue" type="monotone" dataKey="revenue" stroke="#14b8a6" strokeWidth={2.5} dot={false} />
              <Area yAxisId="inventory" type="monotone" dataKey="inventory" stroke="#e11d48" fill="#e11d4826" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const KPICard = ({
  title, value, change, icon, accent = "indigo"
}) => {
  const bgColor = accent === 'rose' ? 'bg-rose-500/10' : accent === 'emerald' ? 'bg-emerald-500/10' : accent === 'amber' ? 'bg-amber-500/10' : 'bg-indigo-500/10';
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="glass rounded-3xl p-6 flex flex-col"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${bgColor}`}>
          {icon}
        </div>
        {change && (
          <div className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center gap-1">
            ↑{change}
          </div>
        )}
      </div>
      <div className="text-4xl font-semibold tracking-tighter mt-auto">{value}</div>
      <div className="text-sm text-zinc-400 mt-1">{title}</div>
    </motion.div>
  );
};

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { inventory, products, branches, sales } = useInventory();
  const navigate = useNavigate();
  const [dashboardStats, setDashboardStats] = useState(null);
  const isManager = currentUser?.role === 'manager';
  const dashboardBranchId = isManager ? currentUser?.branchId : 'all';

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const params = new URLSearchParams();
        if (dashboardBranchId && dashboardBranchId !== 'all') {
          params.set('branchId', dashboardBranchId);
        }
        const query = params.toString();
        const response = await fetch(`${API}/api/reports/dashboard${query ? `?${query}` : ''}`);
        if (!response.ok) throw new Error('Failed to fetch dashboard stats');
        const payload = await response.json();
        setDashboardStats(payload?.data || null);
      } catch (error) {
        console.error('Dashboard stats error:', error);
        setDashboardStats(null);
      }
    };

    fetchDashboardStats();
  }, [dashboardBranchId, inventory.length, products.length, branches.length, sales.length]);

  const totalValue = inventory.reduce((sum, item) => {
    const product = products.find(p => (p._id || p.id) === (item.productId?._id || item.productId));
    return sum + (product?.price || 0) * (item.quantity || 0);
  }, 0);

  const totalStock = inventory.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalSalesRevenue = sales?.reduce((sum, sale) => sum + (sale.revenue || 0), 0) || 0;
  const lowStockCount = inventory.filter(item => (item.quantity || 0) < (item.reorderPoint || 0)).length;

  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return d.toLocaleString('default', { month: 'short' });
  }).reverse();

  const salesTrend = last6Months.map(month => {
    const monthlySales = (sales || [])
      .filter(s => {
        if (!s.date) return false;
        try {
          const saleDate = new Date(s.date);
          return saleDate.toLocaleString('default', { month: 'short' }) === month;
        } catch {
          return false;
        }
      })
      .reduce((sum, s) => sum + (s.revenue || 0), 0);
    return { month, sales: Math.round(monthlySales) };
  });

  const branchStatus = branches.map(branch => {
    const branchInv = inventory.filter(i => i.branchId === branch.id);
    const lowInBranch = branchInv.filter(i => (i.quantity || 0) < (i.reorderPoint || 0)).length;
    const stockValue = branchInv.reduce((sum, item) => {
      const prod = products.find(p => (p._id || p.id) === (item.productId?._id || item.productId));
      return sum + (prod?.price || 0) * (item.quantity || 0);
    }, 0);

    return {
      ...branch,
      stockValue: Math.round(stockValue),
      lowItems: lowInBranch,
      totalItems: branchInv.length,
      health: lowInBranch > 0 ? 'warning' : 'good'
    };
  });

  const categories = Array.from(new Set(products.map(p => p.category)));
  const categoryData = categories.map((cat, idx) => {
    const catProducts = products.filter(p => p.category === cat);
    const catValue = inventory
      .filter(item => catProducts.some(p => (p._id || p.id) === (item.productId?._id || item.productId)))
      .reduce((sum, item) => {
        const prod = catProducts.find(p => (p._id || p.id) === (item.productId?._id || item.productId));
        return sum + (prod?.price || 0) * (item.quantity || 0);
      }, 0);

    const colors = ['#6366f1', '#22c55e', '#eab308', '#a855f7', '#f43f5e', '#06b6d4'];
    return {
      name: cat,
      value: Math.round(catValue),
      fill: colors[idx % colors.length]
    };
  }).filter(c => c.value > 0);

  const totalCatValue = categoryData.reduce((sum, c) => sum + c.value, 0);
  const categoryPercentageData = categoryData.map(c => ({
    ...c,
    percentage: totalCatValue > 0 ? Math.round((c.value / totalCatValue) * 100) : 0
  }));

  const kpis = dashboardStats?.kpis || {
    activeProducts: products.length,
    overallStock: totalStock,
    inventoryValue: Math.round(totalValue),
    totalSales: Math.round(totalSalesRevenue),
    lowStockAlerts: lowStockCount
  };

  const dashboardSalesTrend = dashboardStats?.salesTrend || salesTrend;
  const dashboardCategoryData = (dashboardStats?.categoryDistribution || categoryPercentageData).map((cat, idx) => ({
    ...cat,
    fill: cat.fill || ['#6366f1', '#22c55e', '#eab308', '#a855f7', '#f43f5e', '#06b6d4'][idx % 6]
  }));
  const dashboardBranchStatus = dashboardStats?.branchPerformance || branchStatus;

  return (
    <div className="p-8 pt-20 max-w-screen-2xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        <KPICard
          title="ACTIVE PRODUCTS"
          value={kpis.activeProducts}
          icon={<BarChart3 className="w-6 h-6 text-amber-400" />}
          accent="amber"
        />
        <KPICard
          title="OVERALL STOCK"
          value={kpis.overallStock.toLocaleString()}
          icon={<Package className="w-6 h-6 text-indigo-400" />}
          accent="indigo"
        />
        <KPICard
          title="INVENTORY VALUE"
          value={formatCurrency(Math.floor(kpis.inventoryValue))}
          icon={<Package className="w-6 h-6 text-emerald-400" />}
          accent="emerald"
        />
        <KPICard
          title="TOTAL SALES"
          value={formatCurrency(Math.floor(kpis.totalSales))}
          icon={<TrendingUp className="w-6 h-6 text-emerald-400" />}
          accent="emerald"
        />
        <KPICard
          title="LOW STOCK ALERTS"
          value={kpis.lowStockAlerts}
          icon={<AlertTriangle className="w-6 h-6 text-rose-400" />}
          accent="rose"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 glass rounded-3xl p-8">
          <div className="flex justify-between mb-6">
            <div>
              <div className="font-semibold text-xl">Company Sales Trend</div>
              <div className="text-sm text-zinc-400">Monthly revenue • Last 6 months</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={dashboardSalesTrend}>
              <CartesianGrid strokeDasharray="2 2" stroke="#27272a" />
              <XAxis dataKey="month" stroke="#52525b" />
              <YAxis stroke="#52525b" />
              <Tooltip contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '8px' }} />
              <Line type="natural" dataKey="sales" stroke="#6366f1" strokeWidth={3} dot={{ r: 5, fill: '#6366f1' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-4 glass rounded-3xl p-8 flex flex-col">
          <div className="font-semibold text-xl mb-6">Category Distribution</div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={dashboardCategoryData}
                  cx="50%"
                  cy="48%"
                  innerRadius={78}
                  outerRadius={110}
                  dataKey="value"
                >
                  {dashboardCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {dashboardCategoryData.map((cat, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: cat.fill }}></div>
                <span className="truncate max-w-[80px]">{cat.name}</span>
                <span className="ml-auto text-zinc-400">{cat.percentage || 0}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-12 mt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {dashboardBranchStatus.map((branch, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.01 }}
                onClick={() => navigate('/dashboard/branches', { state: { openBranchId: branch.id } })}
                className="glass rounded-3xl p-7 flex flex-col cursor-pointer hover:border-white/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-xl tracking-tight">{branch.name}</div>
                    <div className="text-sm text-zinc-400">{branch.location}</div>
                  </div>
                  <div className={`px-4 py-1 text-xs rounded-full font-medium ${branch.health === 'good' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                    {String(branch.health || 'good').toUpperCase()}
                  </div>
                </div>

                <div className="mt-auto pt-8 flex justify-between gap-8">
                  <div className="min-w-0">
                    <div className="text-xs text-zinc-400">STOCK VALUE</div>
                    <div className="font-mono text-3xl font-medium mt-0.5 truncate">{formatCurrency(branch.stockValue || 0)}</div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-xs text-zinc-400">LOW STOCK</div>
                    <div className="font-mono text-3xl font-medium mt-0.5 text-rose-400">{branch.lowItems || 0}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const InventoryPage = () => {
  const { currentUser } = useAuth();
  const { 
    inventory, products, branches, 
    updateInventory, addSale, addProduct, 
    addInventoryItem, updateProduct, deleteProduct, 
    updateInventoryItem 
  } = useInventory();
  
  const [searchTerm, setSearchTerm] = useState('');
  
  // Set default filter to the manager's assigned branch if they aren't an admin
  const isManager = currentUser?.role === 'manager';
  const initialBranchFilter = isManager && currentUser?.branchId ? currentUser.branchId : 'all';
  
  const [selectedBranchFilter, setSelectedBranchFilter] = useState(initialBranchFilter);
  const [sortField, setSortField] = useState('quantity');
  const [modalItem, setModalItem] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState(0);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProductForm, setNewProductForm] = useState({
    name: '',
    category: '',
    branchId: isManager && currentUser?.branchId ? currentUser.branchId : (branches[0]?.id ?? ''),
    quantity: '',
    reorderPoint: '',
    price: '',
  });

  const [editForm, setEditForm] = useState({
    name: '',
    category: '',
    branchId: '',
    quantity: 0,
    reorderPoint: 0,
    price: 0,
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const calculateInventoryValue = (quantity, pricePerUnit) => {
    const normalizedQuantity = Number.isFinite(quantity) ? quantity : 0;
    const normalizedPrice = Number.isFinite(pricePerUnit) ? pricePerUnit : 0;
    return normalizedQuantity * normalizedPrice;
  };

  const filteredInventory = inventory
    .filter(item => {
      // First enforce user branch restrictions
      if (isManager && item.branchId !== currentUser.branchId) return false;

      const product = products.find(p => (p._id || p.id) === item.productId);
      const branch = branches.find(b => b.id === item.branchId);
      const matchesSearch = product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch?.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBranch = selectedBranchFilter === 'all' || item.branchId === selectedBranchFilter;
      
      return matchesSearch && matchesBranch;
    })
    .sort((a, b) => {
      const prodA = products.find(p => (p._id || p.id) === (a.productId?._id || a.productId));
      const prodB = products.find(p => (p._id || p.id) === (b.productId?._id || b.productId));

      if (!prodA || !prodB) return 0;

      if (sortField === 'name') return prodA.name.localeCompare(prodB.name);
      if (sortField === 'quantity') return b.quantity - a.quantity;
      const valA = calculateInventoryValue(a.quantity, prodA.price);
      const valB = calculateInventoryValue(b.quantity, prodB.price);
      return valB - valA;
    });

  const inventorySummary = filteredInventory.reduce((acc, item) => {
    const product = products.find(p => (p._id || p.id) === (item.productId?._id || item.productId));
    acc.totalUnits += item.quantity || 0;
    acc.totalValue += (item.quantity || 0) * (product?.price || 0);
    if ((item.quantity || 0) < (item.reorderPoint || 0)) acc.lowStock += 1;
    return acc;
  }, { totalUnits: 0, totalValue: 0, lowStock: 0 });

  const handleAdjustStock = () => {
    if (!modalItem) return;
    
    const quantity = editForm.quantity + adjustAmount;
    
    // Update Product Details
    updateProduct(modalItem.productId?._id || modalItem.productId, {
      name: editForm.name.trim(),
      category: editForm.category.trim(),
      price: Number(Number(editForm.price).toFixed(2)),
    });

    // Update Inventory record (potentially move branch)
    updateInventoryItem(
      modalItem.productId?._id || modalItem.productId,
      modalItem.branchId,
      editForm.branchId,
      quantity,
      Math.floor(editForm.reorderPoint)
    );

    // If stock was reduced via adjustment, record a sale
    if (adjustAmount < 0) {
      addSale(modalItem.productId?._id || modalItem.productId, editForm.branchId, Math.abs(adjustAmount));
    }

    toast.success(`Updated ${editForm.name}`);
    setModalItem(null);
    setAdjustAmount(0);
  };

  const handleDeleteProduct = () => {
    if (!modalItem) return;
    const productName = editForm.name;
    
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    deleteProduct(modalItem.productId?._id || modalItem.productId);
    toast.success(`${productName} deleted.`);
    setModalItem(null);
    setShowDeleteConfirm(false);
  };

  const getStatusColor = (qty, reorder) => {
    if (qty < reorder * 0.6) return 'text-red-400';
    if (qty < reorder) return 'text-amber-400';
    return 'text-emerald-400';
  };

  const resetAddProductForm = () => {
    setNewProductForm({
      name: '',
      category: '',
      branchId: isManager && currentUser?.branchId ? currentUser.branchId : (branches[0]?.id ?? ''),
      quantity: '',
      reorderPoint: '',
      price: '',
    });
  };

  const handleCreateProduct = async () => {
    const normalizedName = newProductForm.name.trim();
    const normalizedCategory = newProductForm.category.trim();
    const quantity = Math.floor(Number(newProductForm.quantity));
    const reorderPoint = Math.floor(Number(newProductForm.reorderPoint));
    const price = Number(Number(newProductForm.price).toFixed(2));

    if (!normalizedName || !normalizedCategory || !newProductForm.branchId) {
      toast.error('Please fill all required product fields.');
      return;
    }

    if (!Number.isFinite(quantity) || quantity < 0 || !Number.isFinite(reorderPoint) || reorderPoint < 0 || !Number.isFinite(price) || price <= 0) {
      toast.error('Quantity, reorder level, and price must be valid numbers.');
      return;
    }

    try {
      const createdProduct = await addProduct({
        name: normalizedName,
        category: normalizedCategory,
        price,
        unit: 'pcs',
        quantity,
        branchId: newProductForm.branchId,
        branch: newProductForm.branchId, // Duplicate for compatibility
        reorderPoint
      });

      if (!createdProduct) throw new Error("Failed to create product");

      toast.success(`${normalizedName} added to inventory.`);
      setShowAddProductModal(false);
      resetAddProductForm();
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error("Failed to add product. Please try again.");
    }
  };

  return (
    <div className="p-8 pt-20 max-w-screen-2xl mx-auto">
      <div className="flex items-end justify-between mb-10">
        <div>
          <h1 className="text-5xl tracking-tight font-semibold">Inventory</h1>
          <p className="text-zinc-400">Manage stock across {branches.length} branches • Real-time</p>
        </div>

        <div className="flex gap-4">
          <div className="relative w-80">
            <input
              type="text"
              placeholder="Search products or branches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 pl-12 py-4 rounded-2xl text-sm focus:outline-none focus:border-indigo-500"
            />
            <Package className="absolute left-5 top-4.5 w-5 h-5 text-zinc-500" />
          </div>
          <select
            value={selectedBranchFilter}
            onChange={e => setSelectedBranchFilter(e.target.value)}
            disabled={isManager}
            className={`bg-zinc-900 border border-white/10 px-5 rounded-2xl text-sm ${isManager ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {(!isManager) && <option value="all">All Branches</option>}
            {branches
              .filter(b => !isManager || b.id === currentUser?.branchId)
              .map(b => <option key={b.id} value={b.id}>{b.name}</option>)
            }
          </select>
          <button
            type="button"
            onClick={() => setShowAddProductModal(true)}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="glass rounded-2xl p-5">
          <div className="text-xs text-zinc-500 uppercase tracking-widest">Visible Products</div>
          <div className="text-3xl font-light mt-2">{filteredInventory.length}</div>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="text-xs text-zinc-500 uppercase tracking-widest">Total Units</div>
          <div className="text-3xl font-light mt-2">{inventorySummary.totalUnits.toLocaleString('en-IN')}</div>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="text-xs text-zinc-500 uppercase tracking-widest">Inventory Value</div>
          <div className="text-3xl font-light mt-2">{formatCurrency(Math.round(inventorySummary.totalValue))}</div>
        </div>
      </div>

      <div className="glass rounded-3xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/10 px-8 py-5 bg-black/40">
          <div className="font-mono uppercase text-xs tracking-[1px]">PRODUCT INVENTORY</div>
          <div className="flex items-center gap-4 text-sm">
            <button onClick={() => setSortField('quantity')} className={`px-5 py-1 rounded-full transition ${sortField === 'quantity' ? 'bg-white text-black' : 'hover:bg-white/10'}`}>QTY</button>
            <button onClick={() => setSortField('value')} className={`px-5 py-1 rounded-full transition ${sortField === 'value' ? 'bg-white text-black' : 'hover:bg-white/10'}`}>VALUE</button>
          </div>
        </div>

        <div className="divide-y divide-white/10">
          {filteredInventory.length > 0 ? (
            filteredInventory.map((item) => {
              const product = products.find(p => (p._id || p.id) === (item.productId?._id || item.productId));
              if (!product) return null; // Skip rendering if product not found (yet)

              const branch = branches.find(b => b.id === item.branchId);
              if (!branch) return null;

              const value = calculateInventoryValue(item.quantity, product.price);

              return (
                <div key={`${(item.productId?._id || item.productId)}-${item.branchId}`} className="px-8 py-6 flex items-center justify-between group hover:bg-white/5 transition">
                  <div className="flex items-center gap-6">
                    <div>
                      <div className="font-medium text-lg">{product.name}</div>
                      <div className="text-sm text-zinc-500 flex items-center gap-2">
                        {branch.name} • {product.category}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-12">
                    <div>
                      <div className="text-xs text-zinc-400">STOCK</div>
                      <div className={`font-mono text-4xl font-medium tabular-nums ${getStatusColor(item.quantity, item.reorderPoint)}`}>
                        {item.quantity}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-zinc-400">REORDER</div>
                      <div className="font-mono text-xl text-white/60">{item.reorderPoint}</div>
                    </div>

                    <div className="text-right w-28">
                      <div className="text-xs text-zinc-400">VALUE</div>
                      <div className="font-mono text-xl">{formatCurrency(Math.round(value))}</div>
                    </div>

                    <button
                      onClick={() => {
                        const product = products.find(p => (p._id || p.id) === item.productId);
                        setModalItem(item);
                        setEditForm({
                          name: product.name,
                          category: product.category,
                          branchId: item.branchId,
                          quantity: item.quantity,
                          reorderPoint: item.reorderPoint,
                          price: product.price,
                        });
                        setShowDeleteConfirm(false);
                        setAdjustAmount(0);
                      }}
                      className="opacity-40 group-hover:opacity-100 px-6 py-3 border border-white/20 rounded-2xl hover:bg-white/5 flex items-center gap-2 text-sm transition"
                    >
                      ADJUST
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-20 text-center text-zinc-400">No products available for this branch.</div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {modalItem && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.88 }}
              className="glass w-full max-w-xl rounded-3xl p-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="text-xl font-semibold">Manage Product</div>
                <button 
                  onClick={handleDeleteProduct}
                  className={`text-xs transition-colors uppercase tracking-widest font-mono px-3 py-1.5 rounded-xl border ${
                    showDeleteConfirm 
                      ? 'bg-rose-500 text-white border-rose-500' 
                      : 'text-rose-400 border-rose-500/20 hover:bg-rose-500/10'
                  }`}
                >
                  {showDeleteConfirm ? 'Confirm Delete?' : 'Delete Product'}
                </button>
              </div>
              
              {showDeleteConfirm && (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 mb-6 text-sm text-rose-200">
                  Warning: This will remove this product from all branches permanently.
                  <button 
                    onClick={() => setShowDeleteConfirm(false)}
                    className="ml-3 underline opacity-60 hover:opacity-100"
                  >
                    Cancel
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="md:col-span-2">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 block">Product Name</label>
                  <input
                    value={editForm.name}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-zinc-900 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 block">Category</label>
                  <input
                    value={editForm.category}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full bg-zinc-900 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 block">Branch</label>
                  <select
                    value={editForm.branchId}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, branchId: e.target.value }))}
                    disabled={isManager}
                    className={`w-full bg-zinc-900 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 ${isManager ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {branches
                      .filter(b => !isManager || b.id === currentUser?.branchId)
                      .map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 block">Price Per Unit</label>
                  <input
                    type="number"
                    value={editForm.price}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, price: Number(e.target.value) }))}
                    className="w-full bg-zinc-900 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 block">Reorder Level</label>
                  <input
                    type="number"
                    value={editForm.reorderPoint}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, reorderPoint: Number(e.target.value) }))}
                    className="w-full bg-zinc-900 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="bg-white/5 rounded-3xl p-6 mb-8 border border-white/5">
                <div className="flex justify-center items-center gap-8 mb-4">
                  <button
                    onClick={() => setAdjustAmount(Math.max(-editForm.quantity, adjustAmount - 5))}
                    className="w-14 h-14 flex items-center justify-center rounded-full border border-white/20 hover:bg-white/10 transition-colors"
                  >
                    <Minus className="w-5 h-5" />
                  </button>

                  <div className="text-center w-32">
                    <div className="text-5xl tabular-nums font-light tracking-[-2px]">{editForm.quantity + adjustAmount}</div>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Final Quantity</div>
                  </div>

                  <button
                    onClick={() => setAdjustAmount(adjustAmount + 5)}
                    className="w-14 h-14 flex items-center justify-center rounded-full border border-white/20 hover:bg-white/10 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex justify-between items-center text-xs px-4 text-zinc-500 font-mono">
                  <span>CURRENT: {editForm.quantity}</span>
                  <span>ADJUSTMENT: {adjustAmount > 0 ? `+${adjustAmount}` : adjustAmount}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-8 px-2">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Estimated Inventory Value</div>
                  <div className="text-2xl font-semibold font-mono">
                    {formatCurrency(Math.round((editForm.quantity + adjustAmount) * editForm.price))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setModalItem(null)}
                  className="flex-1 py-4 border border-white/10 rounded-2xl hover:bg-white/5 transition-colors"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleAdjustStock}
                  className="flex-1 py-4 bg-white text-black rounded-2xl font-semibold hover:bg-zinc-200 transition-colors"
                >
                  SAVE CHANGES
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddProductModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[120] p-4">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              className="glass w-full max-w-xl rounded-3xl p-8"
            >
              <h3 className="text-2xl font-semibold mb-6">Add Product</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 block">Product Name</label>
                  <input
                    value={newProductForm.name}
                    onChange={(e) => setNewProductForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-zinc-900 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. Wireless Scanner"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 block">Category</label>
                  <input
                    value={newProductForm.category}
                    onChange={(e) => setNewProductForm((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full bg-zinc-900 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. Electronics"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 block">Branch</label>
                  <select
                    value={newProductForm.branchId}
                    onChange={(e) => setNewProductForm((prev) => ({ ...prev, branchId: e.target.value }))}
                    className="w-full bg-zinc-900 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
                  >
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 block">Stock Quantity</label>
                  <input
                    type="number"
                    min={0}
                    value={newProductForm.quantity}
                    onChange={(e) => setNewProductForm((prev) => ({ ...prev, quantity: e.target.value }))}
                    className="w-full bg-zinc-900 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 block">Reorder Level</label>
                  <input
                    type="number"
                    min={0}
                    value={newProductForm.reorderPoint}
                    onChange={(e) => setNewProductForm((prev) => ({ ...prev, reorderPoint: e.target.value }))}
                    className="w-full bg-zinc-900 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="0"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 block">Price Per Unit</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={newProductForm.price}
                    onChange={(e) => setNewProductForm((prev) => ({ ...prev, price: e.target.value }))}
                    className="w-full bg-zinc-900 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddProductModal(false);
                    resetAddProductForm();
                  }}
                  className="flex-1 py-3 border border-white/20 rounded-2xl hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateProduct}
                  className="flex-1 py-3 bg-white text-black rounded-2xl font-medium"
                >
                  Add Product
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ForecastingPage = () => {
  const { currentUser } = useAuth();
  const { branches, products, sales } = useInventory();
  const isManager = currentUser?.role === 'manager';

  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState(isManager ? (currentUser?.branchId || '') : 'all');
  const [forecastData, setForecastData] = useState({
    history: [],
    forecast: [],
    currentStock: 0,
    reorderPoint: 0,
    demandForecast: 0,
    reorderLevel: 0,
    trend: [],
    risk: 'Low Risk',
    insufficientData: true
  });
  const [isLoadingForecast, setIsLoadingForecast] = useState(false);

  useEffect(() => {
    if (!selectedProductId && products.length > 0) {
      const soldProductId = (sales || []).find((s) => s?.productId)?.productId;
      const firstAvailable = products[0]._id || products[0].id;
      setSelectedProductId(soldProductId || firstAvailable);
    }
  }, [products, sales, selectedProductId]);

  useEffect(() => {
    const fetchForecast = async () => {
      if (!selectedProductId) return;
      setIsLoadingForecast(true);
      try {
        const params = new URLSearchParams({
          productId: selectedProductId,
          branchId: selectedBranchId || 'all'
        });
        const response = await fetch(`${API}/api/reports/forecast?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch forecast data');
        const payload = await response.json();
        console.log('API response:', payload);
        setForecastData(payload?.data ?? {
          history: [],
          forecast: [],
          currentStock: 0,
          reorderPoint: 0,
          demandForecast: 0,
          reorderLevel: 0,
          trend: [],
          risk: 'Low Risk',
          insufficientData: true
        });
      } catch (error) {
        console.error(error);
        setForecastData({
          history: [],
          forecast: [],
          currentStock: 0,
          reorderPoint: 0,
          demandForecast: 0,
          reorderLevel: 0,
          trend: [],
          risk: 'Low Risk',
          insufficientData: true
        });
      } finally {
        setIsLoadingForecast(false);
      }
    };

    fetchForecast();
  }, [selectedProductId, selectedBranchId]);

  const selectedProduct = products.find(p => (p._id || p.id) === selectedProductId);
  const historySeries = (forecastData.history || []).map((item) => ({
    month: item.month,
    actual: item.totalQuantity,
    predicted: item.totalQuantity,
    inventory: forecastData.currentStock,
    range: [Math.max(0, Math.round(item.totalQuantity * 0.85)), Math.round(item.totalQuantity * 1.15)]
  }));

  const futureSeries = (forecastData.forecast || []).map((item) => ({
    month: item.month,
    predicted: item.quantity,
    inventory: forecastData.currentStock,
    range: [Math.max(0, Math.round(item.quantity * 0.85)), Math.round(item.quantity * 1.15)]
  }));

  const chartData = [...historySeries, ...futureSeries];
  const nextPeriodDemand = forecastData.demandForecast || forecastData.forecast?.[0]?.quantity || 0;
  const recommendedReorder = Math.max(0, Number(forecastData.reorderLevel ?? forecastData.reorderPoint ?? 0));

  const stockoutWarning = forecastData.risk || 'Low Risk';
  let stockInsight = 'Stable inventory';
  if (stockoutWarning === 'High Risk') {
    stockInsight = 'Stock running low. Reorder recommended.';
  } else if (stockoutWarning === 'Medium Risk' || stockoutWarning === 'Moderate Risk') {
    stockInsight = 'Stock is trending low.';
  }

  return (
    <div className="p-8 pt-20 max-w-screen-2xl mx-auto">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10">
          <div className="uppercase text-xs tracking-[3px] text-zinc-500 mb-1">PREDICTIVE ANALYTICS</div>
          <h1 className="text-6xl font-semibold tracking-tighter flex items-center gap-4">
            Demand Forecasting
            <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-sm font-mono tracking-widest uppercase">LIVE DATA</div>
          </h1>
          <p className="text-2xl text-zinc-400 mt-3 max-w-md italic opacity-80">
            Forecasting from actual sales history in MongoDB
          </p>
        </div>

        <div className="flex gap-4 mb-8">
          <div className="flex-1">
            <label className="text-xs uppercase text-zinc-500 mb-3 block font-mono tracking-wider ml-2">PRODUCT</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full bg-black px-7 py-5 rounded-[2rem] border border-white/10 text-xl font-light focus:outline-none focus:border-indigo-500/50 transition-all hover:bg-zinc-900/50"
              disabled={products.length === 0}
            >
              {products.length > 0 ? (
                products.map(p => (
                  <option key={p._id || p.id} value={p._id || p.id}>{p.name}</option>
                ))
              ) : (
                <option value="">No products available</option>
              )}
            </select>
          </div>
          <div className="flex-1">
            <label className="text-xs uppercase text-zinc-500 mb-3 block font-mono tracking-wider ml-2">BRANCH</label>
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              disabled={isManager}
              className="w-full bg-black px-7 py-5 rounded-[2rem] border border-white/10 text-xl font-light focus:outline-none focus:border-indigo-500/50 transition-all hover:bg-zinc-900/50 disabled:opacity-50"
            >
              {!isManager && <option value="all">All Branches</option>}
              {branches
                .filter(b => !isManager || b.id === currentUser?.branchId)
                .map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
            </select>
          </div>
        </div>

        <div className="glass rounded-[3rem] p-12 mb-10 relative overflow-hidden border border-white/5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[120px] -mr-48 -mt-48 rounded-full pointer-events-none" />
          <div className="flex justify-between items-start mb-10 relative z-10">
            <div>
              <div className="font-mono text-sm tracking-[4px] text-indigo-400 mb-4 uppercase">Current Stock</div>
              <div className="text-8xl font-light tabular-nums tracking-tighter text-white">{forecastData.currentStock || 0}</div>
              <div className={`text-sm mt-4 font-medium px-4 py-2 rounded-full inline-block ${stockoutWarning === 'High Risk' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : stockoutWarning === 'Moderate Risk' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                {stockInsight}
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs uppercase text-zinc-500 font-mono tracking-widest mb-2">REORDER THRESHOLD</div>
              <div className="text-5xl text-rose-400/90 font-light tabular-nums tracking-tighter">{forecastData.reorderPoint || 0}</div>
              <div className="text-[10px] text-zinc-600 mt-3 uppercase tracking-[2px] font-mono">Auto-Trigger System</div>
            </div>
          </div>

          {isLoadingForecast ? (
            <div className="h-[340px] flex items-center justify-center text-zinc-400">Loading forecast...</div>
          ) : (forecastData.insufficientData || chartData.length === 0) ? (
            <div className="h-[340px] flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
              <div className="text-zinc-400 mb-2 font-medium">No data</div>
              <div className="text-zinc-600 text-xs">No sales history found for this product/branch yet.</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={340}>
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="2 3" stroke="#27272a" />
                <XAxis dataKey="month" stroke="#52525b" />
                <YAxis stroke="#52525b" />
                <Tooltip contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '8px' }} />
                <Area type="natural" dataKey="range" stroke="none" fill="#6366f1" fillOpacity={0.15} name="Confidence Interval" />
                <Line type="stepAfter" dataKey="inventory" stroke="#10b981" strokeWidth={2} strokeDasharray="4 4" dot={false} name="Current Inventory" />
                <Line type="natural" dataKey="actual" stroke="#a1a1aa" strokeWidth={2.5} dot={{ r: 4, fill: '#a1a1aa' }} name="Actual Demand" />
                <Line type="natural" dataKey="predicted" stroke="#6366f1" strokeWidth={4} strokeDasharray="5 5" dot={{ r: 4, fill: '#6366f1', strokeWidth: 3, stroke: '#18181b' }} name="Forecasted Demand" />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass rounded-[2.5rem] py-10 px-8 border border-white/5">
            <div className="text-[10px] tracking-[3px] opacity-60 font-mono text-indigo-400 mb-2 uppercase">Demand Projection</div>
            <div className="text-7xl font-extralight tracking-tighter mt-4 text-white">{nextPeriodDemand}</div>
            <div className="text-[10px] text-zinc-500 mt-4 uppercase tracking-[3px] font-mono">Expected Units [N+1]</div>
          </div>

          <div className="glass rounded-[2.5rem] py-10 px-8 border border-white/5">
            <div className="text-[10px] tracking-[3px] opacity-60 font-mono text-emerald-400 mb-2 uppercase">Inventory Recovery</div>
            <div className="text-7xl font-extralight tracking-tighter mt-4 text-white">{recommendedReorder}</div>
            <div className="text-[10px] text-zinc-500 mt-4 uppercase tracking-[3px] font-mono">Recommended Units</div>
          </div>

          <div className="glass rounded-[2.5rem] py-10 px-8 border border-white/5">
            <div className="text-[10px] tracking-[3px] opacity-60 font-mono text-rose-400 mb-2 uppercase">Risk Status</div>
            <div className="text-5xl font-light tracking-tight mt-6 text-white">{stockoutWarning}</div>
            <div className="text-[10px] text-zinc-500 mt-6 uppercase tracking-[3px] font-mono">Current Signal</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReportsPage = () => {
  const { currentUser } = useAuth();
  const { branches } = useInventory();

  const isManager = currentUser?.role === 'manager';
  const [reportType, setReportType] = useState('inventory');
  const [selectedBranch, setSelectedBranch] = useState(isManager ? currentUser.branchId : 'all');
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [reportPayload, setReportPayload] = useState(null);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [selectedReportBranch, setSelectedReportBranch] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoadingReports(true);
      try {
        console.log('Reports filters:', { startDate, endDate, branchId: selectedBranch || 'all' });
        const params = new URLSearchParams({
          branchId: selectedBranch || 'all',
          startDate,
          endDate
        });

        const response = await fetch(`${API}/api/reports?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch reports');
        const payload = await response.json();
        setReportPayload(payload?.data || null);
      } catch (error) {
        console.error(error);
        setReportPayload(null);
      } finally {
        setIsLoadingReports(false);
      }
    };

    fetchReports();
  }, [selectedBranch, startDate, endDate]);

  const summary = reportPayload?.summary || {
    totalStock: 0,
    inventoryValue: 0,
    totalSalesRevenue: 0,
    totalTransactions: 0,
    lowStockItems: 0,
    totalProducts: 0
  };

  const branchPerformanceData = reportPayload?.branchPerformance || [];
  const visibleBranches = branches.filter((b) => !isManager || b.id === currentUser?.branchId);
  const branchPerformanceById = new Map(
    branchPerformanceData.map((b) => [String(b.id || b.branchId || ''), b])
  );
  const detailedBranchCards = visibleBranches.map((branch) => {
    const perf = branchPerformanceById.get(String(branch.id)) || {};
    const branchRows = (reportPayload?.inventoryReport || []).filter(
      (row) => String(row.branchId) === String(branch.id)
    );
    const derivedProducts = branchRows.length;
    const derivedLowStock = branchRows.filter((row) => (row.quantity || 0) < (row.reorderPoint || 0)).length;
    const derivedStockValue = branchRows.reduce(
      (sum, row) => sum + ((row.quantity || 0) * (row.price || 0)),
      0
    );
    const branchSalesRows = (reportPayload?.recentSales || []).filter(
      (sale) => String(sale.branchId) === String(branch.id)
    );
    const derivedTransactions = branchSalesRows.length;
    const derivedRevenue = branchSalesRows.reduce((sum, sale) => sum + (sale.revenue || 0), 0);

    return {
      id: branch.id,
      name: perf.name || branch.name,
      location: branch.location || 'N/A',
      manager: branch.managerName || branch.manager || 'Unassigned',
      totalProducts: perf.totalProducts || derivedProducts,
      lowStock: perf.lowStock || derivedLowStock,
      stockValue: perf.stockValue || Math.round(derivedStockValue),
      totalSales: perf.totalSales || derivedTransactions,
      revenue: perf.revenue || Math.round(derivedRevenue)
    };
  });
  const reportData = (reportPayload?.inventoryReport || []).map((row) => ({
    Branch: row.branchId,
    Product: row.productName || 'Unknown',
    Category: row.category || '',
    'Current Stock': row.quantity || 0,
    'Reorder Point': row.reorderPoint || 0,
    'Stock Value': Math.round((row.quantity || 0) * (row.price || 0)),
    Status: (row.quantity || 0) < (row.reorderPoint || 0) ? 'Low' : 'Healthy'
  }));

  const branchNameMap = new Map(branches.map((b) => [b.id, b.name]));

  const handleExport = () => {
    const prefix = selectedBranch && selectedBranch !== 'all'
      ? `-${(branchNameMap.get(selectedBranch) || selectedBranch).toLowerCase().replace(/\s+/g, '-')}`
      : '-all-branches';

    if (reportType === 'inventory') {
      exportToCSV(reportData, `inventory-report${prefix}-${new Date().toISOString().slice(0, 10)}.csv`);
      toast.success('Inventory report exported');
      return;
    }

    const salesByBranch = branchPerformanceData.map((b) => ({
      Branch: b.name,
      'Total Products': b.totalProducts,
      'Low Stock Items': b.lowStock,
      'Total Transactions': b.totalSales,
      'Total Revenue': Number((b.revenue || 0).toFixed(2))
    }));

    exportToCSV(salesByBranch, `sales-summary${prefix}-${new Date().toISOString().slice(0, 10)}.csv`);
    toast.success('Sales summary exported');
  };

  const handleDownloadBranchReport = (branchData) => {
    const branchRows = (reportPayload?.inventoryReport || []).filter((row) => row.branchId === branchData.id);
    const branchMeta = branches.find((b) => b.id === branchData.id);
    const branchDetails = {
      name: branchData.name,
      manager: branchMeta?.managerName || branchMeta?.manager || 'Unassigned',
      totalProducts: branchData.totalProducts || 0,
      lowStock: branchData.lowStock || 0,
      totalValue: branchData.stockValue || 0,
      totalSales: branchData.totalSales || 0,
      revenue: branchData.revenue || 0,
      products: branchRows.map((r) => ({
        name: r.productName || 'Unknown',
        category: r.category || 'General',
        quantity: r.quantity || 0,
        reorderPoint: r.reorderPoint || 0
      }))
    };

    downloadPortfolioCSV(branchDetails, `stocksphere-branch-report-${branchData.name.toLowerCase().replace(/\s+/g, '-')}.csv`);
    toast.success('Branch report downloaded successfully.');
  };

  const getBranchInventoryRows = (branchId) => (
    reportPayload?.inventoryReport || []
  ).filter((row) => String(row.branchId) === String(branchId));
  const getBranchSalesRows = (branchId) => (
    reportPayload?.recentSales || []
  ).filter((sale) => String(sale.branchId) === String(branchId));

  return (
    <div className="p-8 pt-20 max-w-screen-2xl mx-auto relative">
      <div className="max-w-5xl">
        <div className="flex justify-between items-end mb-3">
          <div>
            <h1 className="text-6xl font-semibold tracking-tighter">Reports & Analytics</h1>
            <p className="max-w-md text-xl text-zinc-400 mt-2">Live, date-filtered inventory and sales reporting from MongoDB</p>
          </div>
          <div className="w-64">
            <label className="text-xs uppercase text-zinc-400 mb-2 block">Select Branch</label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              disabled={isManager}
              className="w-full bg-zinc-900 border border-white/10 px-4 py-3 rounded-2xl text-sm focus:outline-none focus:border-indigo-500 disabled:opacity-50"
            >
              {!isManager && <option value="all">All Branches</option>}
              {branches
                .filter(b => !isManager || b.id === currentUser.branchId)
                .map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 mb-6">
          <div>
            <label className="text-xs uppercase text-zinc-400 mb-2 block">Start Date</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-zinc-900 border border-white/10 px-4 py-3 rounded-2xl text-sm" />
          </div>
          <div>
            <label className="text-xs uppercase text-zinc-400 mb-2 block">End Date</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full bg-zinc-900 border border-white/10 px-4 py-3 rounded-2xl text-sm" />
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          <button
            onClick={() => setReportType('inventory')}
            className={`flex-1 p-8 rounded-3xl text-left transition-all ${reportType === 'inventory' ? 'bg-white text-black' : 'glass border border-white/5 hover:bg-white/5'}`}
          >
            <div className="text-xs tracking-[2px] opacity-60 font-medium">FULL INVENTORY</div>
            <div className="text-4xl font-light mt-4">Stock Snapshot</div>
            <div className="mt-6 flex items-baseline gap-4">
              <div className="text-5xl tracking-tighter tabular-nums">{formatCurrency(Math.round(summary.inventoryValue || 0))}</div>
              <div className="text-sm opacity-60 uppercase tracking-widest">{summary.totalStock || 0} Units</div>
            </div>
          </button>

          <button
            onClick={() => setReportType('sales')}
            className={`flex-1 p-8 rounded-3xl text-left transition-all ${reportType === 'sales' ? 'bg-white text-black' : 'glass border border-white/5 hover:bg-white/5'}`}
          >
            <div className="text-xs tracking-[2px] opacity-60 font-medium">PERFORMANCE</div>
            <div className="text-4xl font-light mt-4">Revenue Summary</div>
            <div className="mt-6 flex items-baseline gap-4">
              <div className="text-5xl tracking-tighter tabular-nums">{formatCurrency(Math.round(summary.totalSalesRevenue || 0))}</div>
              <div className="text-sm opacity-60 uppercase tracking-widest">{summary.totalTransactions || 0} Sales</div>
            </div>
          </button>
        </div>

        <button
          onClick={handleExport}
          className="mt-8 flex items-center justify-center gap-3 w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-lg font-medium transition"
        >
          <Download className="w-5 h-5" /> DOWNLOAD OVERVIEW REPORT
        </button>

        {isLoadingReports ? (
          <div className="mt-10 text-zinc-400">Loading reports...</div>
        ) : (
          <div className="mt-16">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2"><FileText className="w-5 h-5 text-indigo-400"/> Detailed Branch Reports</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {detailedBranchCards.map((branch) => (
                <motion.div
                  key={branch.id}
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedReportBranch(branch)}
                  className="glass rounded-3xl p-6 cursor-pointer border border-white/5 hover:border-indigo-500/30 group transition-all"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                      <Building2 className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div className={`px-2.5 py-1 text-[10px] uppercase font-bold rounded-lg ${branch.lowStock > 0 ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                      {branch.lowStock > 0 ? `${branch.lowStock} WARNINGS` : 'HEALTHY'}
                    </div>
                  </div>

                  <div className="text-xl font-light mb-1">{branch.name}</div>
                  <div className="text-xs text-zinc-500 uppercase tracking-widest mb-6">{branch.totalProducts} Active Products</div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div className="text-xs text-zinc-400 uppercase">Sales</div>
                      <div className="font-mono">{branch.totalSales}</div>
                    </div>
                    <div className="h-px w-full bg-white/5" />
                    <div className="flex justify-between items-end">
                      <div className="text-xs text-zinc-400 uppercase">Revenue</div>
                      <div className="font-mono text-emerald-400">{formatCurrency(branch.revenue || 0)}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            {detailedBranchCards.length === 0 && (
              <div className="mt-6 text-zinc-500 text-sm">No branches found for the selected filters.</div>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedReportBranch && (
          (() => {
            const inventoryRows = getBranchInventoryRows(selectedReportBranch.id);
            const salesRows = getBranchSalesRows(selectedReportBranch.id);
            const derivedKpis = {
              totalProducts: inventoryRows.length,
              lowStock: inventoryRows.filter((row) => (row.quantity || 0) < (row.reorderPoint || 0)).length,
              stockValue: Math.round(
                inventoryRows.reduce((sum, row) => sum + ((row.quantity || 0) * (row.price || 0)), 0)
              ),
              totalSales: salesRows.length,
              revenue: Math.round(salesRows.reduce((sum, row) => sum + (row.revenue || 0), 0))
            };
            const resolvedKpis = {
              totalProducts: selectedReportBranch.totalProducts || derivedKpis.totalProducts,
              lowStock: selectedReportBranch.lowStock || derivedKpis.lowStock,
              stockValue: selectedReportBranch.stockValue || derivedKpis.stockValue,
              totalSales: selectedReportBranch.totalSales || derivedKpis.totalSales,
              revenue: selectedReportBranch.revenue || derivedKpis.revenue
            };

            return (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[200] p-4 md:p-8 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0B0F14] border border-white/10 w-full max-w-3xl rounded-[2rem] overflow-hidden"
            >
              <div className="p-8 border-b border-white/5">
                <div className="text-3xl tracking-tight">{selectedReportBranch.name}</div>
                <div className="text-sm text-zinc-400 mt-2">Date range: {startDate} to {endDate}</div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
                    <div className="text-zinc-400">Manager</div>
                    <div className="mt-1">{selectedReportBranch.manager}</div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
                    <div className="text-zinc-400">Location</div>
                    <div className="mt-1">{selectedReportBranch.location}</div>
                  </div>
                </div>
              </div>
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                    <div className="text-[10px] uppercase text-zinc-500">Products</div>
                    <div className="mt-1 text-lg">{resolvedKpis.totalProducts}</div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                    <div className="text-[10px] uppercase text-zinc-500">Low Stock</div>
                    <div className="mt-1 text-lg">{resolvedKpis.lowStock}</div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                    <div className="text-[10px] uppercase text-zinc-500">Stock Value</div>
                    <div className="mt-1 text-lg">{formatCurrency(resolvedKpis.stockValue || 0)}</div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                    <div className="text-[10px] uppercase text-zinc-500">Transactions</div>
                    <div className="mt-1 text-lg">{resolvedKpis.totalSales}</div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                    <div className="text-[10px] uppercase text-zinc-500">Revenue</div>
                    <div className="mt-1 text-lg">{formatCurrency(resolvedKpis.revenue || 0)}</div>
                  </div>
                </div>

                <div>
                  <div className="text-sm uppercase tracking-wider text-zinc-400 mb-3">Product-level Breakdown</div>
                  <div className="max-h-64 overflow-auto rounded-xl border border-white/10">
                    <table className="w-full text-sm">
                      <thead className="bg-white/[0.03] sticky top-0">
                        <tr className="text-zinc-400">
                          <th className="text-left px-4 py-3 font-medium">Product</th>
                          <th className="text-left px-4 py-3 font-medium">Category</th>
                          <th className="text-right px-4 py-3 font-medium">Qty</th>
                          <th className="text-right px-4 py-3 font-medium">Reorder</th>
                          <th className="text-right px-4 py-3 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getBranchInventoryRows(selectedReportBranch.id).length === 0 ? (
                          <tr>
                            <td className="px-4 py-5 text-zinc-500" colSpan={5}>No product rows available for this period.</td>
                          </tr>
                        ) : (
                          getBranchInventoryRows(selectedReportBranch.id).map((row, idx) => {
                            const isLow = (row.quantity || 0) < (row.reorderPoint || 0);
                            return (
                              <tr key={`${row.productId || row.productName || 'product'}-${idx}`} className="border-t border-white/5">
                                <td className="px-4 py-3">{row.productName || 'Unknown'}</td>
                                <td className="px-4 py-3 text-zinc-400">{row.category || 'General'}</td>
                                <td className="px-4 py-3 text-right">{row.quantity || 0}</td>
                                <td className="px-4 py-3 text-right">{row.reorderPoint || 0}</td>
                                <td className={`px-4 py-3 text-right ${isLow ? 'text-amber-400' : 'text-emerald-400'}`}>
                                  {isLow ? 'Low' : 'Healthy'}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-white/10 bg-white/[0.02] flex justify-end gap-4">
                <button onClick={() => setSelectedReportBranch(null)} className="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors text-sm font-medium">Close</button>
                <button onClick={() => handleDownloadBranchReport(selectedReportBranch)} className="px-6 py-3 bg-white text-black hover:bg-zinc-200 rounded-xl flex items-center gap-2 text-sm font-medium transition-all">
                  <Download className="w-4 h-4" /> Download Branch Report
                </button>
              </div>
            </motion.div>
          </div>
            );
          })()
        )}
      </AnimatePresence>
    </div>
  );
};

const AdminBranches = () => {
  const { branches, inventory, products, addBranch, updateBranch, deleteBranch } = useInventory();
  const location = useLocation();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchLoc, setNewBranchLoc] = useState('');
  const [newBranchManager, setNewBranchManager] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [branchFilter, setBranchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (location.state?.openBranchId && branches.length > 0) {
      const target = branches.find(b => b.id === location.state.openBranchId);
      if (target) setSelectedBranch(target);
    }
  }, [location.state, branches]);

  useEffect(() => {
    if (!selectedBranch) return;
    const latest = branches.find((b) => b.id === selectedBranch.id);
    if (latest) setSelectedBranch(latest);
  }, [branches, selectedBranch]);

  const handleAddBranch = async () => {
    if (!newBranchName || !newBranchLoc) return;
    try {
      await addBranch({
        name: newBranchName,
        location: newBranchLoc,
        manager: newBranchManager || "Unassigned",
      });
      setShowAddModal(false);
      setNewBranchName('');
      setNewBranchLoc('');
      setNewBranchManager('');
      toast.success("New branch added successfully");
    } catch (error) {
      toast.error(error.message || 'Failed to create branch');
    }
  };

  const handleEdit = (branch) => {
    setEditData({
      _id: branch._id,
      id: branch.id,
      name: branch.name || '',
      location: branch.location || '',
      manager: branch.manager || ''
    });
    setShowEditModal(true);
    setActiveMenu(null);
  };

  const handleSaveEdit = async () => {
    if (!editData?.name || !editData?.location) {
      toast.error('Branch name and location are required');
      return;
    }
    try {
      const branchMongoId = editData._id || branches.find((b) => b.id === editData.id)?._id;
      if (!branchMongoId) {
        toast.error('Unable to resolve branch ID for update');
        return;
      }

      await updateBranch(branchMongoId, {
        name: editData.name,
        location: editData.location,
        manager: editData.manager || 'Unassigned'
      });
      setShowEditModal(false);
      setEditData(null);
      toast.success('Branch updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to update branch');
    }
  };

  const handleDelete = async (branch) => {
    const hasActiveInventory = inventory.some((item) => item.branchId === branch.id);
    if (hasActiveInventory) {
      toast.error('Cannot delete branch with active inventory');
      setActiveMenu(null);
      return;
    }

    const confirmed = window.confirm('Are you sure you want to delete this branch?');
    if (!confirmed) {
      setActiveMenu(null);
      return;
    }

    try {
      const branchMongoId = branch._id || branches.find((b) => b.id === branch.id)?._id;
      if (!branchMongoId) {
        toast.error('Unable to resolve branch ID for delete');
        return;
      }

      await deleteBranch(branchMongoId);
      if (selectedBranch?.id === branch.id) setSelectedBranch(null);
      setActiveMenu(null);
      toast.success('Branch deleted');
    } catch (error) {
      toast.error(error.message || 'Failed to delete branch');
    }
  };

  const getBranchMetrics = (branchId) => {
    const branchInv = inventory.filter(i => i.branchId === branchId);
    const lowStock = branchInv.filter(i => (i.quantity || 0) < (i.reorderPoint || 0)).length;
    const totalValue = branchInv.reduce((sum, item) => {
      const prod = products.find(p => (p._id || p.id) === (item.productId?._id || item.productId));
      return sum + (prod?.price || 0) * item.quantity;
    }, 0);

    const health = lowStock > 0 ? 'warning' : 'good';

    return {
      totalProducts: branchInv.length,
      lowStock,
      totalValue: Math.round(totalValue),
      health
    };
  };

  const filteredBranches = branches.filter(b =>
    b.name.toLowerCase().includes(branchFilter.toLowerCase()) ||
    b.location.toLowerCase().includes(branchFilter.toLowerCase())
  );

  const selectedMetrics = selectedBranch ? getBranchMetrics(selectedBranch.id) : null;
  const selectedInventory = selectedBranch ? inventory.filter(i => i.branchId === selectedBranch.id) : [];

  const filteredInventory = selectedInventory
    .filter(item => {
      const prod = products.find(p => (p._id || p.id) === item.productId);
      if (!prod) return false;
      const status = item.quantity < item.reorderPoint * 0.4 ? 'critical' : item.quantity < item.reorderPoint ? 'low' : 'healthy';
      return (
        (!statusFilter || statusFilter === 'all' || status === statusFilter) &&
        prod.name.toLowerCase().includes(branchFilter.toLowerCase())
      );
    })
    .sort((a, b) => b.quantity - a.quantity);

  return (
    <div className="p-8 pt-20 max-w-screen-2xl mx-auto relative" onClick={() => setActiveMenu(null)}>
      <div className="flex items-center justify-between mb-9">
        <div>
          <div className="flex items-center gap-4">
            <div className="text-6xl tracking-tighter">Branch Network</div>
            <div className="px-3 py-1 text-xs font-mono tracking-widest bg-cyan-500/10 text-cyan-400 rounded">LIVE</div>
          </div>
          <p className="text-xl text-zinc-400 mt-1">4 operational hubs • Real-time health monitoring</p>
        </div>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Filter branches..."
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="bg-zinc-900 border border-white/10 px-5 py-3 rounded-2xl w-80 focus:outline-none focus:border-cyan-500 placeholder:text-zinc-500"
          />
          <button
            onClick={() => setShowAddModal(true)}
            className="px-8 py-3.5 bg-white hover:bg-white/90 text-black rounded-2xl flex items-center gap-2 text-sm font-medium transition"
          >
            <Plus className="w-4 h-4" /> NEW BRANCH
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredBranches.map((branch, index) => {
          const metrics = getBranchMetrics(branch.id);
          const hasActiveInventory = inventory.some((item) => item.branchId === branch.id);
          const menuId = branch._id || branch.id;
          return (
            <motion.div
              key={branch._id || branch.id || index}
              whileHover={{ scale: 1.015 }}
              onClick={() => setSelectedBranch(branch)}
              className="glass rounded-3xl p-8 card-hover cursor-pointer border border-white/10 hover:border-cyan-400/30 group relative"
            >
              <div className="absolute top-4 right-4 z-20" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setActiveMenu((prev) => (prev === menuId ? null : menuId))}
                  className="w-9 h-9 rounded-xl border border-white/10 bg-zinc-950/80 hover:bg-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition"
                  aria-label="Branch actions"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {activeMenu === menuId && (
                  <div className="absolute top-11 right-0 w-40 rounded-xl border border-white/10 bg-[#111827] shadow-2xl overflow-hidden">
                    <button
                      onClick={() => handleEdit(branch)}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-white/10 transition"
                    >
                      Edit Branch
                    </button>
                    <button
                      onClick={() => handleDelete(branch)}
                      disabled={hasActiveInventory}
                      className={`w-full text-left px-4 py-2.5 text-sm transition ${hasActiveInventory ? 'text-zinc-600 cursor-not-allowed' : 'text-rose-400 hover:bg-rose-500/10'}`}
                    >
                      Delete Branch
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-start">
                <div>
                  <div className="uppercase tracking-[2px] text-xs text-cyan-400 mb-1">{branch.location}</div>
                  <div className="text-4xl font-light tracking-tighter group-hover:text-cyan-300 transition">{branch.name}</div>
                </div>
                <div className={`px-4 py-1 text-xs rounded-full font-medium flex items-center gap-1.5 ${metrics.health === 'good' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                  {metrics.health === 'good' ? 'GOOD' : 'WARNING'}
                </div>
              </div>

              <div className="mt-8 flex gap-8">
                <div>
                  <div className="text-xs text-zinc-400">MANAGER</div>
                  <div className="font-medium mt-1.5">{branch.managerName || branch.manager || "Unassigned"}</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-400">PRODUCTS</div>
                  <div className="font-mono text-4xl tracking-tighter font-light mt-1">{metrics.totalProducts}</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-400">LOW STOCK</div>
                  <div className="font-mono text-4xl tracking-tighter font-light mt-1 text-amber-400">{metrics.lowStock}</div>
                </div>
              </div>

                <div className="mt-8 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className={`h-full ${metrics.health === 'good' ? 'bg-emerald-400 w-[95%]' : 'bg-amber-500 w-[55%]'}`} />
                </div>
            </motion.div>
          );
        })}
      </div>

      {/* BRANCH DETAIL FULL-SCREEN MODAL */}
      <AnimatePresence>
        {selectedBranch && selectedMetrics && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-start justify-center bg-black/75 backdrop-blur-sm overflow-y-auto py-10 px-4"
            onClick={(e) => { if (e.target === e.currentTarget) setSelectedBranch(null); }}
          >
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="w-full max-w-5xl bg-[#0B0F14] border border-white/10 rounded-3xl shadow-2xl"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between px-12 pt-10 pb-8 border-b border-white/10">
                <div>
                  <div className="text-xs text-cyan-400 tracking-widest mb-2">BRANCH DETAIL</div>
                  <div className="text-5xl tracking-tight font-light">{selectedBranch.name}</div>
                  <div className="text-zinc-400 mt-2 uppercase tracking-[2px] text-xs">{selectedBranch.location}</div>
                </div>
                <button
                  onClick={() => setSelectedBranch(null)}
                  className="text-zinc-500 hover:text-white text-2xl leading-none mt-1 transition-colors"
                >
                  ×
                </button>
              </div>

              <div className="px-12 py-10 space-y-10">
                {/* INFO GRID */}
                <div className="glass p-8 rounded-3xl">
                  <div className="grid grid-cols-4 gap-8 text-sm">
                    <div><span className="text-zinc-400 text-xs uppercase tracking-widest block mb-2">Location</span>{selectedBranch.location}</div>
                    <div><span className="text-zinc-400 text-xs uppercase tracking-widest block mb-2">Manager</span>{selectedBranch.managerName || selectedBranch.manager || "Unassigned"}</div>
                    <div><span className="text-zinc-400 text-xs uppercase tracking-widest block mb-2">Contact</span>(212) 555-0198</div>
                    <div><span className="text-zinc-400 text-xs uppercase tracking-widest block mb-2">Last Audit</span>{new Date().toLocaleDateString()}</div>
                  </div>
                </div>

                {/* KPI STRIP */}
                <div className="grid grid-cols-3 gap-5">
                  {[
                    { label: "TOTAL PRODUCTS", val: selectedMetrics.totalProducts, unit: "" },
                    { label: "LOW STOCK", val: selectedMetrics.lowStock, unit: "ITEMS" },
                    { label: "STOCK VALUE", val: formatCurrency(selectedMetrics.totalValue), unit: "" }
                  ].map((kpi, idx) => (
                    <div key={idx} className="glass p-8 rounded-3xl text-center">
                      <div className="text-xs tracking-widest text-zinc-400 mb-2">{kpi.label}</div>
                      <div className="text-5xl font-light tracking-tighter text-white mt-2">{kpi.val}</div>
                      {kpi.unit && <div className="text-xs text-zinc-500 mt-2">{kpi.unit}</div>}
                    </div>
                  ))}
                </div>

                {/* INVENTORY TABLE */}
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="text-xl font-medium">Current Inventory</div>
                    <select
                      value={statusFilter}
                      onChange={e => setStatusFilter(e.target.value)}
                      className="bg-zinc-900 text-sm border border-white/10 px-5 py-3 rounded-2xl"
                    >
                      <option value="all">All Status</option>
                      <option value="healthy">Healthy</option>
                      <option value="low">Low</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div className="glass rounded-3xl overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10 text-xs uppercase tracking-widest text-zinc-400">
                          <th className="px-7 py-5 text-left">PRODUCT</th>
                          <th className="px-7 py-5 text-left">CATEGORY</th>
                          <th className="px-7 py-5 text-right">QTY</th>
                          <th className="px-7 py-5">STATUS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10 text-sm">
                        {filteredInventory.length > 0 ? filteredInventory.map((item, idx) => {
                          const prod = products.find(p => (p._id || p.id) === item.productId);
                          const status = item.quantity < item.reorderPoint * 0.4 ? 'critical' : item.quantity < item.reorderPoint ? 'low' : 'healthy';
                          return (
                            <tr key={idx} className="table-row">
                              <td className="px-7 py-6 font-medium">{prod.name}</td>
                              <td className="px-7 py-6 text-zinc-400">{prod.category}</td>
                              <td className="px-7 py-6 text-right font-mono tabular-nums">{item.quantity}</td>
                              <td className="px-7 py-6">
                                <div className={`inline-block w-2 h-2 rounded-full status-${status}`} />
                                <span className="ml-3 text-xs uppercase tracking-widest">{status}</span>
                              </td>
                            </tr>
                          );
                        }) : <tr><td colSpan={4} className="px-7 py-16 text-center text-zinc-500">No matching inventory.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="flex gap-4 pb-2">
                  <button className="flex-1 py-4 rounded-2xl border border-white/20 flex items-center justify-center gap-2 hover:bg-white/5 transition" onClick={() => toast("Stock transfer initiated")}>
                    <RefreshCw className="w-4 h-4" /> TRANSFER STOCK
                  </button>
                  <button className="flex-1 py-4 bg-white text-black rounded-2xl flex items-center justify-center gap-2 hover:bg-zinc-100 transition" onClick={() => toast.success("Restock request sent to central warehouse")}>
                    <Plus className="w-4 h-4" /> ADD STOCK
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ADD BRANCH MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80">
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="glass max-w-md w-full p-10 rounded-3xl">
              <h3 className="text-2xl mb-8">Register New Branch</h3>
              <input
                value={newBranchName}
                onChange={(e) => setNewBranchName(e.target.value)}
                placeholder="Branch Name"
                className="block w-full mb-4 bg-transparent border-b border-white/30 py-4 text-xl placeholder:text-zinc-500 focus:outline-none"
              />
              <input
                value={newBranchLoc}
                onChange={(e) => setNewBranchLoc(e.target.value)}
                placeholder="City, State"
                className="block w-full mb-4 bg-transparent border-b border-white/30 py-4 text-xl placeholder:text-zinc-500 focus:outline-none"
              />
              <input
                value={newBranchManager}
                onChange={(e) => setNewBranchManager(e.target.value)}
                placeholder="Branch Manager Name"
                className="block w-full mb-8 bg-transparent border-b border-white/30 py-4 text-xl placeholder:text-zinc-500 focus:outline-none"
              />
              <div className="flex gap-3">
                <button onClick={() => setShowAddModal(false)} className="flex-1 py-4 border border-white/20 rounded-2xl">CANCEL</button>
                <button onClick={handleAddBranch} className="flex-1 py-4 bg-white text-black rounded-2xl">CREATE BRANCH</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT BRANCH MODAL */}
      <AnimatePresence>
        {showEditModal && editData && (
          <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/80">
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="glass max-w-md w-full p-10 rounded-3xl">
              <h3 className="text-2xl mb-8">Edit Branch</h3>
              <input
                value={editData.name}
                onChange={(e) => setEditData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Branch Name"
                className="block w-full mb-4 bg-transparent border-b border-white/30 py-4 text-xl placeholder:text-zinc-500 focus:outline-none"
              />
              <input
                value={editData.location}
                onChange={(e) => setEditData((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="City, State"
                className="block w-full mb-4 bg-transparent border-b border-white/30 py-4 text-xl placeholder:text-zinc-500 focus:outline-none"
              />
              <input
                value={editData.manager}
                onChange={(e) => setEditData((prev) => ({ ...prev, manager: e.target.value }))}
                placeholder="Branch Manager Name (optional)"
                className="block w-full mb-8 bg-transparent border-b border-white/30 py-4 text-xl placeholder:text-zinc-500 focus:outline-none"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditData(null);
                  }}
                  className="flex-1 py-4 border border-white/20 rounded-2xl"
                >
                  CANCEL
                </button>
                <button onClick={handleSaveEdit} className="flex-1 py-4 bg-white text-black rounded-2xl">
                  SAVE CHANGES
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AdminUsers = () => {
  const { currentUser, authToken } = useAuth();
  const { branches } = useInventory();

  const [usersData, setUsersData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const usersPerPage = 5;

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'manager', branchId: '' });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [optionsMenuId, setOptionsMenuId] = useState(null);

  const API_BASE = 'http://localhost:5000/api';

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE}/users`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsersData(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load users from server');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authToken) fetchUsers();
  }, [authToken]);

  const getRoleLabel = (role) => {
    return role === 'admin' ? 'Platform Admin' : 'Branch Manager';
  };

  const filteredUsers = (usersData || []).filter(u => {
    const matchesSearch = u?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const currentUsers = filteredUsers.slice((page - 1) * usersPerPage, page * usersPerPage);

  const resetForm = () => {
    setForm({ name: '', email: '', password: '', role: 'manager', branchId: '' });
    setIsEditing(false);
    setSelectedUser(null);
  };

  const handleSaveUser = async () => {
    if (!form.name || !form.email || (!isEditing && !form.password)) {
      toast.error('Please fill all required fields');
      return;
    }
    if (form.role === 'manager' && !form.branchId) {
      toast.error('Branch is required for Branch Manager');
      return;
    }

    try {
      if (isEditing) {
        const response = await fetch(`${API_BASE}/users/${selectedUser._id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}` 
          },
          body: JSON.stringify(form)
        });
        if (!response.ok) throw new Error('Update failed');
        toast.success('User updated!');
      } else {
        const response = await fetch(`${API_BASE}/users`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}` 
          },
          body: JSON.stringify(form)
        });
        if (!response.ok) throw new Error('Registration failed');
        toast.success('User added!');
      }
      setShowModal(false);
      resetForm();
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  };

  const handleDelete = async () => {
    if (selectedUser._id === currentUser?._id) {
      toast.error('Cannot delete your own account');
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/users/${selectedUser._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (!response.ok) throw new Error('Delete failed');
      toast.success('User deleted');
      setShowDeleteModal(false);
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  };

  const toggleStatus = async (user) => {
    if (user.role === 'admin' && user._id === currentUser?._id) {
       toast.error('Cannot disable yourself.');
       return;
    }
    try {
      const response = await fetch(`${API_BASE}/users/${user._id}/status`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (!response.ok) throw new Error('Status toggle failed');
      toast.success(`User set to ${user.status === 'active' ? 'Inactive' : 'Active'}`);
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  };
  
  const resetPasswordMock = () => {
     toast.success('Password reset link sent to user (mock)');
     setOptionsMenuId(null);
  }

  return (
    <div className="p-8 pt-20 max-w-screen-2xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-6xl tracking-tighter">Team Directory</h1>
        <button 
          onClick={() => { resetForm(); setShowModal(true); }}
          className="px-6 py-3 bg-white text-black hover:bg-zinc-200 rounded-2xl flex items-center gap-2 text-sm font-medium transition"
        >
          <Plus className="w-4 h-4" /> Add User
        </button>
      </div>
      
      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <div className="relative w-80">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-white/10 pl-11 py-3 rounded-2xl text-sm focus:outline-none focus:border-indigo-500"
          />
          <Search className="absolute left-4 top-3.5 text-zinc-500 w-4 h-4" />
        </div>
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="bg-zinc-900 border border-white/10 px-5 rounded-2xl text-sm focus:outline-none"
        >
          <option value="all">All Roles</option>
          <option value="admin">Platform Admin</option>
          <option value="manager">Branch Manager</option>
        </select>
      </div>

      <div className="glass rounded-3xl divide-y divide-white/10">
        {isLoading ? (
           <div className="px-8 py-12 text-sm text-zinc-400">Loading users...</div>
        ) : currentUsers.length === 0 ? (
          <div className="px-8 py-12 text-sm text-zinc-400">No users found.</div>
        ) : (
          currentUsers.map((user) => {
            const branch = branches.find(b => b.id === user.branchId);
            return (
          <div key={user._id} className="flex px-8 py-6 items-center justify-between group hover:bg-white/5 transition relative">
            <div className="flex gap-6 items-center w-1/3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-2xl relative">
                 <Users className="w-5 h-5 text-zinc-300" />
                 <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 border-2 border-[#121415] rounded-full ${user.status === 'inactive' ? 'bg-zinc-500' : 'bg-emerald-500'}`} />
              </div>
              <div>
                <div className="font-medium">{user.name}</div>
                <div className="text-xs text-zinc-400">{user.email}</div>
                {user.role === 'manager' && (
                  <div className="text-[10px] text-indigo-400 mt-1 uppercase">Branch: {branch ? branch.name : 'Unassigned'}</div>
                )}
              </div>
            </div>
            
            <div className="w-1/3 text-center">
              <div className="text-xs uppercase tracking-widest px-4 py-1.5 inline-block bg-white/10 rounded-full">{getRoleLabel(user.role)}</div>
            </div>

            <div className="w-1/3 flex justify-end">
              <button 
                onClick={() => setOptionsMenuId(optionsMenuId === user._id ? null : user._id)}
                className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 transition"
              >
                 <MoreVertical className="w-5 h-5 text-zinc-400" />
              </button>

              {/* Options Dropdown */}
              <AnimatePresence>
                {optionsMenuId === user._id && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-12 top-14 w-48 glass rounded-2xl p-2 shadow-xl z-50 text-sm border border-white/10"
                  >
                     <button onClick={() => { 
                         if(user._id === currentUser?.id) { toast.error("Cannot edit your own role here."); return; }
                         setForm({ name: user.name, email: user.email, role: user.role, branchId: user.branchId || '' });
                         setIsEditing(true); setSelectedUser(user); setShowModal(true); setOptionsMenuId(null);
                     }} className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10">
                        <Edit2 className="w-4 h-4" /> Edit User
                     </button>
                     <button onClick={() => { toggleStatus(user); setOptionsMenuId(null); }} className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10">
                        <Power className="w-4 h-4" /> {user.status === 'active' ? 'Disable' : 'Enable'}
                     </button>
                     <button onClick={resetPasswordMock} className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 text-amber-400">
                        <Key className="w-4 h-4" /> Reset Password
                     </button>
                     <div className="my-1 border-t border-white/10" />
                     <button onClick={() => { 
                        if(user._id === currentUser?._id) { toast.error("Cannot delete your own account"); return; }
                        setSelectedUser(user); setShowDeleteModal(true); setOptionsMenuId(null); 
                     }} className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-rose-500/20 text-rose-400">
                        <Trash2 className="w-4 h-4" /> Delete
                     </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
            );
          })
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-10 h-10 flex items-center justify-center border border-white/20 rounded-xl disabled:opacity-30">
             <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="text-sm font-mono opacity-80">Page {page} of {totalPages}</div>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="w-10 h-10 flex items-center justify-center border border-white/20 rounded-xl disabled:opacity-30">
             <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[120] p-4 text-white">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="glass w-full max-w-md rounded-3xl p-8 border border-white/10">
               <h3 className="text-2xl font-semibold mb-6">{isEditing ? 'Edit User' : 'Add New User'}</h3>
               <div className="space-y-4">
                 <div>
                   <label className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 block">Name</label>
                   <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-zinc-900 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none" />
                 </div>
                 <div>
                   <label className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 block">Email</label>
                   <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full bg-zinc-900 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none" />
                 </div>
                 {!isEditing && (
                 <div>
                   <label className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 block">Temporary Password</label>
                   <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full bg-zinc-900 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none" />
                 </div>
                 )}
                 <div>
                   <label className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 block">Role</label>
                   <select disabled={isEditing && selectedUser?.role === 'admin'} value={form.role} onChange={e => setForm({...form, role: e.target.value, branchId: e.target.value === 'admin' ? '' : form.branchId})} className="w-full bg-zinc-900 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none">
                     <option value="manager">Branch Manager</option>
                     <option value="admin">Platform Admin</option>
                   </select>
                 </div>
                 {form.role === 'manager' && (
                 <div>
                   <label className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2 block">Assigned Branch</label>
                   <select value={form.branchId} onChange={e => setForm({...form, branchId: e.target.value})} className="w-full bg-zinc-900 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none">
                     <option value="">Select a branch...</option>
                     {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                   </select>
                 </div>
                 )}
               </div>
               <div className="flex gap-3 mt-8">
                 <button onClick={() => setShowModal(false)} className="flex-1 py-3 border border-white/20 rounded-2xl hover:bg-white/5 transition">Cancel</button>
                 <button onClick={handleSaveUser} className="flex-1 py-3 bg-white text-black hover:bg-zinc-200 rounded-2xl transition font-medium">Save</button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRM MODAL */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[120] p-4 text-white">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass w-full max-w-sm rounded-3xl p-8 border border-white/10 text-center">
               <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8" />
               </div>
               <h3 className="text-2xl font-medium mb-2">Delete User?</h3>
               <p className="text-sm text-zinc-400 mb-8">This action cannot be undone. Are you sure you want to remove <span className="text-white font-medium">{selectedUser?.name}</span>?</p>
               <div className="flex gap-3">
                 <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 border border-white/20 rounded-2xl hover:bg-white/5 transition">Cancel</button>
                 <button onClick={handleDelete} className="flex-1 py-3 bg-rose-500 hover:bg-rose-400 text-white rounded-2xl transition font-medium">Delete</button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();

  if (currentUser == null) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const DashboardShell = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname.replace('/dashboard', '').replace(/^\//, '') || 'dashboard';

  const renderPage = () => {
    switch (currentPath) {
      case 'dashboard': return <Dashboard />;
      case 'inventory': return <InventoryPage />;
      case 'forecasting': return <ForecastingPage />;
      case 'reports': return <ReportsPage />;
      case 'branches': return currentUser?.role === 'admin' ? <AdminBranches /> : <Navigate to="/dashboard" replace />;
      case 'users': return currentUser?.role === 'admin' ? <AdminUsers /> : <Navigate to="/dashboard" replace />;
      default: return <Navigate to="/dashboard" replace />;
    }
  };

  return (
    <div className="bg-zinc-950 text-white min-h-screen">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-72 min-h-screen">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

const LiveDashboardShell = ({ mode = 'global' }) => (
  <div className="bg-zinc-950 text-white min-h-screen">
    <Navbar />
    <div className="flex">
      <Sidebar />
      <main className="flex-1 ml-72 min-h-screen">
        <LiveDashboardPage mode={mode} />
      </main>
    </div>
  </div>
);

const PlatformLiveRoute = () => {
  const { currentUser } = useAuth();
  if (currentUser?.role === 'manager') {
    return <Navigate to="/branch/live-dashboard" replace />;
  }
  return <LiveDashboardShell mode="global" />;
};

const BranchLiveRoute = () => {
  const { currentUser } = useAuth();
  if (currentUser?.role !== 'manager') {
    return <Navigate to="/live-dashboard" replace />;
  }
  return <LiveDashboardShell mode="branch" />;
};

const AppContent = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/dashboard/*"
        element={(
          <ProtectedRoute>
            <DashboardShell />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/live-dashboard"
        element={(
          <ProtectedRoute>
            <PlatformLiveRoute />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/branch/live-dashboard"
        element={(
          <ProtectedRoute>
            <BranchLiveRoute />
          </ProtectedRoute>
        )}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <InventoryProvider>
          <AppContent />
        </InventoryProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;






