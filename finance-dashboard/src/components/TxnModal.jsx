import React, { useState, useEffect } from "react";
import { CATEGORIES } from "../data/mockData";
import { generateId } from "../utils/helpers";

const empty = {
  description: "",
  amount: "",
  category: "Food & Dining",
  type: "expense",
  date: new Date().toISOString().slice(0, 10),
};

export default function TxnModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || empty);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initial) setForm(initial);
  }, [initial]);

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.description.trim()) e.description = "Required";
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0)
      e.amount = "Enter a valid amount";
    if (!form.date) e.date = "Required";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave({ ...form, amount: Number(form.amount), id: form.id || generateId() });
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{initial ? "Edit Transaction" : "Add Transaction"}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Description *</label>
            <input
              className="form-input"
              placeholder="e.g. Grocery Store"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
            {errors.description && (
              <span style={{ color: "var(--red)", fontSize: "0.7rem" }}>{errors.description}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Amount (₹) *</label>
              <input
                className="form-input"
                type="number"
                placeholder="0"
                min="0"
                value={form.amount}
                onChange={(e) => set("amount", e.target.value)}
              />
              {errors.amount && (
                <span style={{ color: "var(--red)", fontSize: "0.7rem" }}>{errors.amount}</span>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input
                className="form-input"
                type="date"
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
              />
              {errors.date && (
                <span style={{ color: "var(--red)", fontSize: "0.7rem" }}>{errors.date}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-select" value={form.type} onChange={(e) => set("type", e.target.value)}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={form.category} onChange={(e) => set("category", e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            {initial ? "Save Changes" : "Add Transaction"}
          </button>
        </div>
      </div>
    </div>
  );
}