export const branches = [
  { id: 'b1', name: 'Harbor City', location: 'Navi Mumbai, MH' },
  { id: 'b2', name: 'Uptown Nexus', location: 'Bandra, Mumbai' },
  { id: 'b3', name: 'Valley View', location: 'Pune, MH' },
  { id: 'b4', name: 'Skyline Hub', location: 'Bangalore, KA' }
];

export const products = [
  { id: 'p1', name: 'Wireless Headphones', category: 'Electronics', price: 2499 },
  { id: 'p2', name: 'Mechanical Keyboard', category: 'Computing', price: 4500 },
  { id: 'p3', name: 'Smart Watch', category: 'Electronics', price: 3200 },
  { id: 'p4', name: 'USB-C Docking Station', category: 'Computing', price: 1800 },
  { id: 'p5', name: 'Noise Cancelling Earbuds', category: 'Electronics', price: 5600 },
  { id: 'p6', name: 'Ergonomic Mouse', category: 'Computing', price: 1200 }
];

export const initialInventory = [
  { productId: 'p1', branchId: 'b1', quantity: 45, reorderPoint: 15, lastRestock: '2026-03-01' },
  { productId: 'p1', branchId: 'b2', quantity: 12, reorderPoint: 15, lastRestock: '2026-03-05' },
  { productId: 'p2', branchId: 'b1', quantity: 28, reorderPoint: 10, lastRestock: '2026-03-02' },
  { productId: 'p2', branchId: 'b3', quantity: 8, reorderPoint: 10, lastRestock: '2026-03-10' },
  { productId: 'p3', branchId: 'b1', quantity: 60, reorderPoint: 20, lastRestock: '2026-03-01' },
  { productId: 'p3', branchId: 'b4', quantity: 15, reorderPoint: 20, lastRestock: '2026-03-08' },
  { productId: 'p4', branchId: 'b2', quantity: 35, reorderPoint: 12, lastRestock: '2026-03-04' },
  { productId: 'p5', branchId: 'b1', quantity: 5, reorderPoint: 15, lastRestock: '2026-03-01' },
  { productId: 'p6', branchId: 'b3', quantity: 22, reorderPoint: 10, lastRestock: '2026-03-07' }
];

export const initialSales = [
  { productId: 'p1', branchId: 'b1', quantity: 5, revenue: 12495, date: '2026-03-18' },
  { productId: 'p2', branchId: 'b1', quantity: 2, revenue: 9000, date: '2026-03-19' },
  { productId: 'p3', branchId: 'b4', quantity: 10, revenue: 32000, date: '2026-03-20' },
  { productId: 'p5', branchId: 'b1', quantity: 3, revenue: 16800, date: '2026-03-15' },
  { productId: 'p1', branchId: 'b2', quantity: 8, revenue: 19992, date: '2026-03-10' }
];

export const initialUsers = [
  { _id: 'u1', name: 'Chelsea', email: 'chelsea@stocksphere.com', role: 'admin', status: 'active' },
  { _id: 'u2', name: 'Nowshen', email: 'nowshen@stocksphere.com', role: 'manager', branchId: 'b1', status: 'active' },
  { _id: 'u3', name: 'Sravya', email: 'sravya@stocksphere.com', role: 'manager', branchId: 'b2', status: 'active' },
  { _id: 'u4', name: 'Neha', email: 'neha@stocksphere.com', role: 'manager', branchId: 'b3', status: 'active' }
];

