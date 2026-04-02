import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { CATEGORIES, CATEGORY_COLORS } from "../data/mockData";
import { filterTransactions, formatCurrency, formatDate, exportToCSV } from "../utils/helpers";
import TxnModal from "./TxnModal";

const CATEGORY_ICONS = {
  "Food & Dining": "🍽️", Transport: "🚗", Shopping: "🛍️", Entertainment: "🎬",
  Health: "💊", Utilities: "⚡", Salary: "💼", Freelance: "💻",
  Investment: "📈", Rent: "🏠", Travel: "✈️", Subscriptions: "📱",
};

const PER_PAGE = 10;

export default function Transactions({ showToast }) {
  const { state, dispatch } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editTxn, setEditTxn] = useState(null);
  const [page, setPage] = useState(1);
  const [confirmDel, setConfirmDel] = useState(null);

  const isAdmin = state.role === "admin";

  const filtered = useMemo(
    () => filterTransactions(state.transactions, state.filters),
    [state.transactions, state.filters]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageData = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const setFilter = (obj) => {
    dispatch({ type: "SET_FILTER", payload: obj });
    setPage(1);
  };

  const handleSort = (col) => {
    if (state.filters.sortBy === col) {
      setFilter({ sortDir: state.filters.sortDir === "asc" ? "desc" : "asc" });
    } else {
      setFilter({ sortBy: col, sortDir: "desc" });
    }
  };

  const handleSave = (txn) => {
    if (editTxn) {
      dispatch({ type: "UPDATE_TRANSACTION", payload: txn });
      showToast("Transaction updated!", "success");
    } else {
      dispatch({ type: "ADD_TRANSACTION", payload: txn });
      showToast("Transaction added!", "success");
    }
    setShowModal(false);
    setEditTxn(null);
  };

  const handleDelete = (id) => {
    dispatch({ type: "DELETE_TRANSACTION", payload: id });
    setConfirmDel(null);
    showToast("Transaction deleted", "info");
  };

  const sortIcon = (col) => {
    if (state.filters.sortBy !== col) return "↕";
    return state.filters.sortDir === "asc" ? "↑" : "↓";
  };

  return (
    <div>
      {!isAdmin && (
        <div className="viewer-notice">
          👁️ You are in <strong style={{ marginLeft: 4 }}>Viewer mode</strong>. Switch to Admin to add or edit transactions.
        </div>
      )}

      <div className="filters-bar">
        <div className="filter-group" style={{ flex: 2 }}>
          <label className="filter-label">Search</label>
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              className="filter-input"
              placeholder="Search transactions..."
              value={state.filters.search}
              onChange={(e) => setFilter({ search: e.target.value })}
            />
          </div>
        </div>
        <div className="filter-group">
          <label className="filter-label">Type</label>
          <select className="filter-select" value={state.filters.type} onChange={(e) => setFilter({ type: e.target.value })}>
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
        <div className="filter-group">
          <label className="filter-label">Category</label>
          <select className="filter-select" value={state.filters.category} onChange={(e) => setFilter({ category: e.target.value })}>
            <option value="all">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label className="filter-label">From</label>
          <input type="date" className="filter-input" value={state.filters.dateFrom} onChange={(e) => setFilter({ dateFrom: e.target.value })} />
        </div>
        <div className="filter-group">
          <label className="filter-label">To</label>
          <input type="date" className="filter-input" value={state.filters.dateTo} onChange={(e) => setFilter({ dateTo: e.target.value })} />
        </div>
        <div className="filter-group" style={{ flexDirection: "row", alignItems: "flex-end", gap: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => { dispatch({ type: "RESET_FILTERS" }); setPage(1); }}>Reset</button>
          <button className="btn btn-ghost btn-sm" onClick={() => exportToCSV(filtered)}>⬇ CSV</button>
          {isAdmin && (
            <button className="btn btn-primary btn-sm" onClick={() => { setEditTxn(null); setShowModal(true); }}>+ Add</button>
          )}
        </div>
      </div>

      <div style={{ fontSize: "0.72rem", color: "var(--text3)", marginBottom: 10 }}>
        Showing {filtered.length} transaction{filtered.length !== 1 ? "s" : ""}
      </div>

      <div className="txn-table-wrap">
        {pageData.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🔍</span>
            <p className="empty-text">No transactions match your filters.</p>
          </div>
        ) : (
          <>
            <table className="txn-table">
              <thead>
                <tr>
                  <th className={state.filters.sortBy === "date" ? "active-sort" : ""} onClick={() => handleSort("date")}>
                    Date <span className="sort-icon">{sortIcon("date")}</span>
                  </th>
                  <th className={state.filters.sortBy === "description" ? "active-sort" : ""} onClick={() => handleSort("description")}>
                    Description <span className="sort-icon">{sortIcon("description")}</span>
                  </th>
                  <th>Category</th>
                  <th>Type</th>
                  <th className={state.filters.sortBy === "amount" ? "active-sort" : ""} onClick={() => handleSort("amount")}>
                    Amount <span className="sort-icon">{sortIcon("amount")}</span>
                  </th>
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {pageData.map((t) => (
                  <tr key={t.id}>
                    <td style={{ color: "var(--text2)", fontFamily: "var(--mono)", fontSize: "0.75rem" }}>{formatDate(t.date)}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span>{CATEGORY_ICONS[t.category] || "💳"}</span>
                        <span style={{ fontWeight: 500 }}>{t.description}</span>
                      </div>
                    </td>
                    <td>
                      <span className="category-chip">
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: CATEGORY_COLORS[t.category] || "#888", display: "inline-block" }} />
                        {t.category}
                      </span>
                    </td>
                    <td>
                      <span className={`type-chip ${t.type}`}>
                        {t.type === "income" ? "↑" : "↓"} {t.type.charAt(0).toUpperCase() + t.type.slice(1)}
                      </span>
                    </td>
                    <td>
                      <span className={`txn-amount ${t.type}`} style={{ fontSize: "0.82rem" }}>
                        {t.type === "income" ? "+" : "-"}{formatCurrency(t.amount)}
                      </span>
                    </td>
                    {isAdmin && (
                      <td>
                        <div style={{ display: "flex", gap: 4 }}>
                          <button className="btn btn-icon btn-sm" onClick={() => { setEditTxn(t); setShowModal(true); }}>✏️</button>
                          <button className="btn btn-danger btn-sm" onClick={() => setConfirmDel(t.id)}>🗑️</button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pagination">
              <span className="page-info">Page {page} of {totalPages} · {filtered.length} results</span>
              <div className="page-btns">
                <button className="page-btn" disabled={page <= 1} onClick={() => setPage(1)}>«</button>
                <button className="page-btn" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>‹</button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                  return (
                    <button key={p} className={`page-btn ${page === p ? "active" : ""}`} onClick={() => setPage(p)}>{p}</button>
                  );
                })}
                <button className="page-btn" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>›</button>
                <button className="page-btn" disabled={page >= totalPages} onClick={() => setPage(totalPages)}>»</button>
              </div>
            </div>
          </>
        )}
      </div>

      {showModal && (
        <TxnModal
          initial={editTxn}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditTxn(null); }}
        />
      )}

      {confirmDel && (
        <div className="modal-overlay" onClick={() => setConfirmDel(null)}>
          <div className="modal" style={{ maxWidth: 360 }}>
            <div className="modal-header">
              <h2 className="modal-title">Delete Transaction?</h2>
              <button className="modal-close" onClick={() => setConfirmDel(null)}>✕</button>
            </div>
            <p style={{ fontSize: "0.82rem", color: "var(--text2)", marginBottom: 20 }}>This action cannot be undone.</p>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setConfirmDel(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(confirmDel)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}