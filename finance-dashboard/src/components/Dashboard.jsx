import React from "react";
import { useApp } from "../context/AppContext";
import {
  computeSummary, computeCategoryBreakdown,
  computeMonthlyTrend, formatCurrency, formatDate,
} from "../utils/helpers";
import BarChart from "./BarChart";
import DonutChart from "./DonutChart";

const CATEGORY_ICONS = {
  "Food & Dining": "🍽️", Transport: "🚗", Shopping: "🛍️", Entertainment: "🎬",
  Health: "💊", Utilities: "⚡", Salary: "💼", Freelance: "💻",
  Investment: "📈", Rent: "🏠", Travel: "✈️", Subscriptions: "📱",
};

export default function Dashboard() {
  const { state, dispatch } = useApp();
  const { income, expenses, balance } = computeSummary(state.transactions);
  const catBreakdown = computeCategoryBreakdown(state.transactions);
  const monthlyTrend = computeMonthlyTrend(state.transactions);
  const recent = [...state.transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 8);

  return (
    <div>
      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="summary-card balance" style={{ animationDelay: "0ms" }}>
          <div className="card-icon">💰</div>
          <div className="card-label">Total Balance</div>
          <div className="card-value">{formatCurrency(balance)}</div>
          <div className="card-sub">{state.transactions.length} transactions total</div>
        </div>
        <div className="summary-card income" style={{ animationDelay: "60ms" }}>
          <div className="card-icon">📈</div>
          <div className="card-label">Total Income</div>
          <div className="card-value">{formatCurrency(income)}</div>
          <div className="card-sub">
            {state.transactions.filter((t) => t.type === "income").length} income sources
          </div>
        </div>
        <div className="summary-card expense" style={{ animationDelay: "120ms" }}>
          <div className="card-icon">📉</div>
          <div className="card-label">Total Expenses</div>
          <div className="card-value">{formatCurrency(expenses)}</div>
          <div className="card-sub">
            {balance > 0 ? `${((balance / income) * 100).toFixed(1)}% saved` : "Over budget"}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="chart-grid">
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">Monthly Overview</div>
              <div className="chart-sub">Income vs Expenses</div>
            </div>
            <div className="chart-legend">
              <div className="legend-item">
                <div className="legend-dot" style={{ background: "var(--green)" }} />
                Income
              </div>
              <div className="legend-item">
                <div className="legend-dot" style={{ background: "var(--red)" }} />
                Expenses
              </div>
            </div>
          </div>
          <BarChart data={monthlyTrend} />
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">Spending Breakdown</div>
              <div className="chart-sub">By category</div>
            </div>
          </div>
          <DonutChart data={catBreakdown} />
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="recent-card">
        <div className="section-header">
          <span className="section-title">Recent Transactions</span>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => dispatch({ type: "SET_TAB", payload: "transactions" })}
          >
            View All →
          </button>
        </div>
        <div className="txn-list">
          {recent.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📭</span>
              <p className="empty-text">No transactions yet.</p>
            </div>
          ) : (
            recent.map((t) => (
              <div key={t.id} className="txn-item">
                <div
                  className="txn-icon"
                  style={{ background: t.type === "income" ? "var(--green-bg)" : "var(--bg3)" }}
                >
                  {CATEGORY_ICONS[t.category] || "💳"}
                </div>
                <div className="txn-info">
                  <div className="txn-desc">{t.description}</div>
                  <div className="txn-meta">{t.category} · {formatDate(t.date)}</div>
                </div>
                <div className={`txn-amount ${t.type}`}>
                  {t.type === "income" ? "+" : "-"}{formatCurrency(t.amount)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}