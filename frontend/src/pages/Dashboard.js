import React, { useEffect, useState } from "react";
import { getDashboardSummary } from "../services/api";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardSummary()
      .then((res) => setSummary(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <p>Total Products</p>
          <h2>{summary?.total_products ?? 0}</h2>
        </div>
        <div className="stat-card green">
          <p>Total Customers</p>
          <h2>{summary?.total_customers ?? 0}</h2>
        </div>
        <div className="stat-card orange">
          <p>Total Orders</p>
          <h2>{summary?.total_orders ?? 0}</h2>
        </div>
        <div className="stat-card red">
          <p>Low Stock Products</p>
          <h2>{summary?.low_stock_products?.length ?? 0}</h2>
        </div>
      </div>

      {summary?.low_stock_products?.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: 16, color: "#c53030" }}>⚠ Low Stock Alert</h3>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {summary.low_stock_products.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.sku}</td>
                  <td>
                    <span className="badge badge-low">{p.quantity} left</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {summary?.low_stock_products?.length === 0 && (
        <div className="card">
          <p style={{ color: "#38a169" }}>✓ All products have sufficient stock.</p>
        </div>
      )}
    </div>
  );
}
