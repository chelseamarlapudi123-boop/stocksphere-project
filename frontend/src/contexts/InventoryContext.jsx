import React, { useState, useEffect, useCallback } from 'react';
import { InventoryContext } from './inventory-context';
import API from '../utils/api';

const normalizeId = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value._id || value.id || String(value);
};

export const InventoryProvider = ({ children }) => {
  const [inventory, setInventory] = useState([]);
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE = `${API}/api`;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [invRes, salesRes, prodRes, branchRes] = await Promise.all([
        fetch(`${API_BASE}/inventory`),
        fetch(`${API_BASE}/sales`),
        fetch(`${API_BASE}/products`),
        fetch(`${API_BASE}/branches`)
      ]);

      if (!invRes.ok || !salesRes.ok || !prodRes.ok || !branchRes.ok) {
        throw new Error('Failed to fetch one or more API endpoints. Check backend logs.');
      }

      const [invData, salesData, prodData, branchData] = await Promise.all([
        invRes.json(),
        salesRes.json(),
        prodRes.json(),
        branchRes.json()
      ]);

      const normalizedInventory = (invData || []).map((item) => ({
        ...item,
        productId: normalizeId(item.productId)
      }));

      const normalizedSales = (salesData || []).map((sale) => ({
        ...sale,
        productId: normalizeId(sale.productId)
      }));

      setInventory(normalizedInventory);
      setSales(normalizedSales);
      setProducts(prodData || []);
      setBranches(branchData || []);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to sync with server.');
      setInventory([]);
      setSales([]);
      setProducts([]);
      setBranches([]);
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateInventory = async (productId, branchId, newQuantity) => {
    const response = await fetch(`${API_BASE}/inventory/${productId}/${branchId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: newQuantity })
    });
    if (!response.ok) throw new Error('Update failed');
    await fetchData();
  };

  const addSale = async (productId, branchId, quantitySold) => {
    const response = await fetch(`${API_BASE}/sales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, branchId, quantity: Number(quantitySold) })
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Sale recording failed');
    }
    await fetchData();
  };

  const addProduct = async (payload) => {
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
    await fetchData();
    return newProduct;
  };

  const deleteProduct = async (productId) => {
    const response = await fetch(`${API_BASE}/products/${productId}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Delete failed');
    await fetchData();
  };

  const updateProduct = async (productId, updates) => {
    const response = await fetch(`${API_BASE}/products/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!response.ok) throw new Error('Update failed');
    await fetchData();
  };

  const updateInventoryItem = async (productId, oldBranchId, newBranchId, quantity, reorderPoint) => {
    const response = await fetch(`${API_BASE}/inventory/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, oldBranchId, newBranchId, quantity, reorderPoint })
    });
    if (!response.ok) throw new Error('Inventory update failed');
    await fetchData();
  };

  const addInventoryItem = async (newItem) => {
    const response = await fetch(`${API_BASE}/inventory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem)
    });
    if (!response.ok) throw new Error('Failed to add inventory item');
    await fetchData();
  };

  const addBranch = async (newBranch) => {
    const response = await fetch(`${API_BASE}/branches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBranch)
    });
    if (!response.ok) throw new Error('Failed to add branch');
    await fetchData();
  };

  const updateBranch = async (branchMongoId, updates) => {
    const response = await fetch(`${API_BASE}/branches/${branchMongoId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      let message = 'Failed to update branch';
      try {
        const parsed = errText ? JSON.parse(errText) : {};
        message = parsed.message || message;
      } catch {
        if (errText) message = errText;
      }
      throw new Error(message);
    }
    await fetchData();
  };

  const deleteBranch = async (branchMongoId) => {
    const response = await fetch(`${API_BASE}/branches/${branchMongoId}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      let message = 'Failed to delete branch';
      try {
        const parsed = errText ? JSON.parse(errText) : {};
        message = parsed.message || message;
      } catch {
        if (errText) message = errText;
      }
      throw new Error(message);
    }
    await fetchData();
  };

  const simulateDay = () => {
    console.log('Simulating day locally...');
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
      updateBranch,
      deleteBranch,
      simulateDay,
      refreshData: fetchData,
      loading,
      error
    }}>
      {children}
    </InventoryContext.Provider>
  );
};


