import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrder } from "../services/api";

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrder(id)
      .then((r) => setOrder(r.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading">Loading order...</div>;
  if (!order) return <div className="loading">Order not found.</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Order #{order.id}</h1>
        <button className="btn-secondary" onClick={() => navigate("/orders")}>← Back to Orders</button>
      </div>

      <div className="card">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
          <div>
            <p style={{ color: "#718096", fontSize: 13, marginBottom: 4 }}>Customer</p>
            <p style={{ fontWeight: 600 }}>{order.customer_name}</p>
          </div>
          <div>
            <p style={{ color: "#718096", fontSize: 13, marginBottom: 4 }}>Status</p>
            <span className={`badge badge-${order.status}`}>{order.status}</span>
          </div>
          <div>
            <p style={{ color: "#718096", fontSize: 13, marginBottom: 4 }}>Date</p>
            <p style={{ fontWeight: 600 }}>{new Date(order.created_at).toLocaleString()}</p>
          </div>
          <div>
            <p style={{ color: "#718096", fontSize: 13, marginBottom: 4 }}>Total Amount</p>
            <p style={{ fontWeight: 700, fontSize: 20, color: "#1e2a4a" }}>₹{order.total_amount.toFixed(2)}</p>
          </div>
        </div>

        <h3 style={{ marginBottom: 12, color: "#1e2a4a" }}>Order Items</h3>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Unit Price</th>
              <th>Quantity</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.order_items.map((item) => (
              <tr key={item.id}>
                <td>{item.product_name}</td>
                <td>₹{item.unit_price.toFixed(2)}</td>
                <td>{item.quantity}</td>
                <td>₹{(item.unit_price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} style={{ textAlign: "right", fontWeight: 700, paddingTop: 12 }}>Total</td>
              <td style={{ fontWeight: 700, paddingTop: 12 }}>₹{order.total_amount.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
