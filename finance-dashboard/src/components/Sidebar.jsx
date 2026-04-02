import React from "react";
import { useApp } from "../context/AppContext";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "⊞" },
  { id: "transactions", label: "Transactions", icon: "⇄" },
  { id: "insights", label: "Insights", icon: "◎" },
];

export default function Sidebar({ open, onClose }) {
  const { state, dispatch } = useApp();

  return (
    <>
      <div className={`sidebar-overlay ${open ? "visible" : ""}`} onClick={onClose} />
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">💰</div>
            <span className="logo-text">Fin<span>Track</span></span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <span className="nav-section-label">Navigation</span>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${state.activeTab === item.id ? "active" : ""}`}
              onClick={() => {
                dispatch({ type: "SET_TAB", payload: item.id });
                onClose();
              }}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="role-switcher">
            <span className="role-label">Role</span>
            <select
              className="role-select"
              value={state.role}
              onChange={(e) => dispatch({ type: "SET_ROLE", payload: e.target.value })}
            >
              <option value="viewer">Viewer</option>
              <option value="admin">Admin</option>
            </select>
            <div className={`role-badge ${state.role}`}>
              {state.role === "admin" ? "🛡️ Admin Access" : "👁️ View Only"}
            </div>
          </div>

          <button className="theme-toggle" onClick={() => dispatch({ type: "TOGGLE_DARK" })}>
            <span>{state.darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}</span>
            <div className={`toggle-track ${state.darkMode ? "" : "on"}`}>
              <div className="toggle-thumb" />
            </div>
          </button>
        </div>
      </aside>
    </>
  );
}