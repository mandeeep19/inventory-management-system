import React, { useEffect, useState } from "react";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../services/api";
import Alert from "../components/common/Alert";

const emptyForm = { name: "", sku: "", price: "", quantity: "", description: "" };

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = () =>
    getProducts()
      .then((r) => setProducts(r.data))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditProduct(null);
    setForm(emptyForm);
    setError("");
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditProduct(p);
    setForm({ name: p.name, sku: p.sku, price: p.price, quantity: p.quantity, description: p.description || "" });
    setError("");
    setShowModal(true);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const payload = {
      name: form.name,
      sku: form.sku,
      price: parseFloat(form.price),
      quantity: parseInt(form.quantity, 10),
      description: form.description || null,
    };
    try {
      if (editProduct) {
        await updateProduct(editProduct.id, payload);
        setSuccess("Product updated successfully.");
      } else {
        await createProduct(payload);
        setSuccess("Product created successfully.");
      }
      setShowModal(false);
      load();
    } catch (err) {
      setError(err.response?.data?.detail || "An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await deleteProduct(id);
      setSuccess("Product deleted.");
      load();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to delete product.");
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Products</h1>
        <button className="btn-primary" onClick={openCreate}>+ Add Product</button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError("")} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess("")} />}

      <div className="card">
        {loading ? (
          <div className="loading">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="empty-state">No products yet. Add your first product.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.name}</td>
                  <td><code>{p.sku}</code></td>
                  <td>₹{p.price.toFixed(2)}</td>
                  <td>
                    <span className={p.quantity <= 5 ? "badge badge-low" : ""}>{p.quantity}</span>
                  </td>
                  <td>{p.description || "—"}</td>
                  <td style={{ display: "flex", gap: 8 }}>
                    <button className="btn-secondary btn-sm" onClick={() => openEdit(p)}>Edit</button>
                    <button className="btn-danger btn-sm" onClick={() => handleDelete(p.id)}>Delete</button>
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
            <h2>{editProduct ? "Edit Product" : "Add Product"}</h2>
            {error && <Alert type="error" message={error} />}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name *</label>
                <input name="name" value={form.name} onChange={handleChange} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>SKU *</label>
                  <input name="sku" value={form.sku} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input name="price" type="number" min="0.01" step="0.01" value={form.price} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-group">
                <label>Quantity *</label>
                <input name="quantity" type="number" min="0" value={form.quantity} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" rows="3" value={form.description} onChange={handleChange} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? "Saving..." : editProduct ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
