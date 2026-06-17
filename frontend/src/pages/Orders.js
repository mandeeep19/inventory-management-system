import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getOrders, createOrder, deleteOrder, getCustomers, getProducts } from "../services/api";
import Alert from "../components/common/Alert";

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [customerId, setCustomerId] = useState("");
  const [orderItems, setOrderItems] = useState([{ product_id: "", quantity: 1 }]);

  const load = () =>
    Promise.all([getOrders(), getCustomers(), getProducts()])
      .then(([o, c, p]) => {
        setOrders(o.data);
        setCustomers(c.data);
        setProducts(p.data);
      })
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setCustomerId("");
    setOrderItems([{ product_id: "", quantity: 1 }]);
    setError("");
    setShowModal(true);
  };

  const addItem = () => setOrderItems([...orderItems, { product_id: "", quantity: 1 }]);
  const removeItem = (idx) => setOrderItems(orderItems.filter((_, i) => i !== idx));

  const updateItem = (idx, field, value) => {
    const updated = [...orderItems];
    updated[idx] = { ...updated[idx], [field]: value };
    setOrderItems(updated);
  };

  const getEstimatedTotal = () => {
    return orderItems.reduce((sum, item) => {
      const product = products.find((p) => p.id === parseInt(item.product_id));
      if (product && item.quantity) {
        return sum + product.price * parseInt(item.quantity);
      }
      return sum;
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const validItems = orderItems.filter((i) => i.product_id && i.quantity > 0);
    if (!validItems.length) {
      setError("Add at least one product with a valid quantity.");
      setSubmitting(false);
      return;
    }

    try {
      await createOrder({
        customer_id: parseInt(customerId),
        items: validItems.map((i) => ({
          product_id: parseInt(i.product_id),
          quantity: parseInt(i.quantity),
        })),
      });
      setSuccess("Order created successfully.");
      setShowModal(false);
      load();
    } catch (err) {
      setError(err.response?.data?.detail || "An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Cancel and delete this order? Stock will be restored.")) return;
    try {
      await deleteOrder(id);
      setSuccess("Order deleted and stock restored.");
      load();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to delete order.");
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Orders</h1>
        <button className="btn-primary" onClick={openCreate}>+ Create Order</button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError("")} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess("")} />}

      <div className="card">
        {loading ? (
          <div className="loading">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="empty-state">No orders yet. Create your first order.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Total</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>{o.customer_name}</td>
                  <td><span className={`badge badge-${o.status}`}>{o.status}</span></td>
                  <td>₹{o.total_amount.toFixed(2)}</td>
                  <td>{new Date(o.created_at).toLocaleDateString()}</td>
                  <td style={{ display: "flex", gap: 8 }}>
                    <button className="btn-secondary btn-sm" onClick={() => navigate(`/orders/${o.id}`)}>View</button>
                    <button className="btn-danger btn-sm" onClick={() => handleDelete(o.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create Order</h2>
            {error && <Alert type="error" message={error} />}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Customer *</label>
                <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} required>
                  <option value="">— Select customer —</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#555", marginBottom: 8 }}>
                  Order Items *
                </label>
                {orderItems.map((item, idx) => (
                  <div className="order-item-row" key={idx}>
                    <select
                      value={item.product_id}
                      onChange={(e) => updateItem(idx, "product_id", e.target.value)}
                      required
                    >
                      <option value="">— Select product —</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (₹{p.price}, stock: {p.quantity})
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                      required
                    />
                    {orderItems.length > 1 && (
                      <button type="button" className="btn-danger btn-sm" onClick={() => removeItem(idx)}>✕</button>
                    )}
                  </div>
                ))}
                <button type="button" className="btn-secondary btn-sm" onClick={addItem} style={{ marginTop: 8 }}>
                  + Add Item
                </button>
              </div>

              <div style={{ padding: "12px 0", borderTop: "1px solid #eee", fontWeight: 600, color: "#1e2a4a" }}>
                Estimated Total: ₹{getEstimatedTotal().toFixed(2)}
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? "Creating..." : "Create Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
