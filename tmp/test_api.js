import fetch from 'node-fetch';

const test = async () => {
  try {
    const res = await fetch('http://localhost:5000/api/products');
    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Products found:", data.length);
  } catch (err) {
    console.error("Fetch failed:", err.message);
  }
};

test();
