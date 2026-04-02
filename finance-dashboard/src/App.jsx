import React, { useState, useEffect } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import Transactions from "./components/Transactions";
import Insights from "./components/Insights";
import "./styles.css";

const PAGE_TITLES = {
  dashboard: "Dashboard",
  transactions: "Transactions",
  insights: "Insights",
};

function Toast({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`}>
          {t.type === "success" ? "✅" : t.type === "error" ? "❌" : "ℹ️"}
          {t.message}
        </div>
      ))}
    </div>
  );
}

function AppInner() {
  const { state } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", state.darkMode ? "dark" : "light");
  }, [state.darkMode]);

  const showToast = (message, type = "info") => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  };

  return (
    <div className="app-layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <button className="menu-btn" onClick={() => setSidebarOpen(true)}>☰</button>
            <h1 className="page-title">{PAGE_TITLES[state.activeTab]}</h1>
          </div>
          <div className="topbar-right">
            <span style={{ fontSize: "0.72rem", color: "var(--text3)", fontWeight: 600 }}>
              {new Date().toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>
        </header>
        <main className="page-body">
          {state.activeTab === "dashboard" && <Dashboard />}
          {state.activeTab === "transactions" && <Transactions showToast={showToast} />}
          {state.activeTab === "insights" && <Insights />}
        </main>
      </div>
      <Toast toasts={toasts} />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}