import React, { useState, useEffect } from 'react';
import { initialInventory, initialSales, products as initialProducts, branches as initialBranches } from '../data/mockData';
import { InventoryContext } from './inventory-context';
import API from '../utils/api';

const generateEntityId = (prefix) => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}${crypto.randomUUID()}`;
  }
  return `${prefix}${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

export const InventoryProvider = ({ children }) => {
  const [inventory, setInventory] = useState([]);
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE = `${API}/api`;

  const fetchData = async () => {
    try {
      setLoading(true);
      const [invRes, salesRes, prodRes, branchRes] = await Promise.all([
        fetch(`${API_BASE}/inventory`),
        fetch(`${API_BASE}/sales`),
        fetch(`${API_BASE}/products`),
        fetch(`${API_BASE}/branches`)
      ]);

      const [invData, salesData, prodData, branchData] = await Promise.all([
        invRes.json(),
        salesRes.json(),
        prodRes.json(),
        branchRes.json()
      ]);

      setInventory(invData);
      setSales(salesData);
      setProducts(prodData);
      setBranches(branchData);
      setLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to sync with server. Using local fallback.");
      // Fallback to mock data if API fails
      setInventory(initialInventory);
      setSales(initialSales);
      setProducts(initialProducts);
      setBranches(initialBranches);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateInventory = async (productId, branchId, newQuantity) => {
    try {
      const response = await fetch(`${API_BASE}/inventory/${productId}/${branchId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity })
      });
      if (!response.ok) throw new Error('Update failed');
      await fetchData(); // Refresh all data to ensure consistency
    } catch (err) {
      console.error(err);
      // Local optimistic update if needed or just error toast
      setInventory(prev => prev.map(item => 
        (item.productId?._id || item.productId) === productId && item.branchId === branchId
          ? { ...item, quantity: newQuantity, lastRestock: new Date().toISOString() }
          : item
      ));
    }
  };

  const addSale = async (productId, branchId, quantitySold) => {
    try {
      const response = await fetch(`${API_BASE}/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, branchId, quantity: quantitySold })
      });
      if (!response.ok) throw new Error('Sale recording failed');
      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const addProduct = async (payload) => {
    try {
      const response = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to create product');
      }
      const newProduct = await response.json();
      // NOTE: The backend createProduct controller already handles creating the
      // inventory record when quantity + branchId are in the payload — no
      // duplicate POST /inventory call needed here.
      await fetchData();
      return newProduct;
    } catch (err) {
      console.error(err);
      throw err; // Re-throw so the UI handler can show the error toast
    }
  };

  const deleteProduct = async (productId) => {
    try {
      const response = await fetch(`${API_BASE}/products/${productId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Delete failed');
      await fetchData();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const updateProduct = async (productId, updates) => {
    try {
      const response = await fetch(`${API_BASE}/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error('Update failed');
      await fetchData();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const updateInventoryItem = async (productId, oldBranchId, newBranchId, quantity, reorderPoint) => {
    try {
      await fetch(`${API_BASE}/inventory/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, oldBranchId, newBranchId, quantity, reorderPoint })
      });
      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const addInventoryItem = async (newItem) => {
    try {
      await fetch(`${API_BASE}/inventory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });
      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const addBranch = async (newBranch) => {
    try {
      await fetch(`${API_BASE}/branches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBranch)
      });
      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const simulateDay = () => {
    // Keep simulation local for the demo if preferred, or trigger a backend route if one exists
    console.log("Simulating day locally...");
  };

  return (
    <InventoryContext.Provider value={{
      inventory,
      sales,
      products,
      branches,
      updateInventory,
      addSale,
      addProduct,
      deleteProduct,
      updateProduct,
      updateInventoryItem,
      addInventoryItem,
      addBranch,
      simulateDay,
      loading,
      error
    }}>
      {children}
    </InventoryContext.Provider>
  );
};

