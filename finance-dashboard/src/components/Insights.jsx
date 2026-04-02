import React from "react";
import { useApp } from "../context/AppContext";
import { computeSummary, computeCategoryBreakdown, computeMonthlyTrend, formatCurrency } from "../utils/helpers";
import { CATEGORY_COLORS } from "../data/mockData";

export default function Insights() {
  const { state } = useApp();
  const { income, expenses, balance } = computeSummary(state.transactions);
  const catBreakdown = computeCategoryBreakdown(state.transactions);
  const monthlyTrend = computeMonthlyTrend(state.transactions);

  const savingsRate = income > 0 ? (balance / income) * 100 : 0;
  const top3 = catBreakdown.slice(0, 3);
  const recentMonths = monthlyTrend.slice(-4);
  const maxExpense = Math.max(...recentMonths.map((m) => m.expenses), 1);
  const worstMonth = [...monthlyTrend].sort((a, b) => b.expenses - a.expenses)[0];
  const bestMonth = [...monthlyTrend].sort((a, b) => b.balance - a.balance)[0];
  const avgIncome = monthlyTrend.length > 0 ? income / monthlyTrend.length : 0;
  const avgExpense = monthlyTrend.length > 0 ? expenses / monthlyTrend.length : 0;
  const savingsClass = savingsRate >= 20 ? "good" : savingsRate >= 10 ? "ok" : "bad";
  const topCategory = catBreakdown[0];

  const observations = [];
  if (topCategory) observations.push({ icon: "🔴", text: <> Biggest expense: <span className="streak-highlight">{topCategory.category}</span> at {formatCurrency(topCategory.amount)}.</> });
  if (worstMonth) observations.push({ icon: "📅", text: <>Highest spending month: <span className="streak-highlight">{worstMonth.label}</span> — {formatCurrency(worstMonth.expenses)}.</> });
  if (bestMonth) observations.push({ icon: "🌟", text: <>Best savings month: <span className="streak-highlight">{bestMonth.label}</span> with net {formatCurrency(bestMonth.balance)}.</> });
  if (savingsRate > 0) observations.push({ icon: savingsRate >= 20 ? "✅" : "⚠️", text: <>Saving <span className="streak-highlight">{savingsRate.toFixed(1)}%</span> of income. {savingsRate >= 20 ? "Great work!" : savingsRate >= 10 ? "Aim for 20%+." : "Try to cut expenses."}</> });
  if (avgExpense > 0) observations.push({ icon: "📊", text: <>Avg monthly expense: <span className="streak-highlight">{formatCurrency(avgExpense)}</span> vs income: <span className="streak-highlight">{formatCurrency(avgIncome)}</span>.</> });

  return (
    <div>
      <div className="insights-grid">
        {/* Savings Rate */}
        <div className="insight-card">
          <h3>💰 Savings Rate</h3>
          <div className="savings-rate-display">
            <div className={`big-number ${savingsClass}`}>{savingsRate.toFixed(1)}%</div>
            <div className="savings-msg">
              {savingsRate >= 20 ? "🎉 Excellent savings!" : savingsRate >= 10 ? "📈 Good, room to improve" : savingsRate > 0 ? "⚠️ Low savings rate" : "❌ Spending exceeds income"}
            </div>
            <div style={{ marginTop: 16, display: "flex", justifyContent: "center", gap: 24 }}>
              {[{ label: "Income", val: income, color: "var(--green)" }, { label: "Expenses", val: expenses, color: "var(--red)" }, { label: "Net", val: balance, color: balance >= 0 ? "var(--green)" : "var(--red)" }].map(({ label, val, color }) => (
                <div key={label} style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "var(--mono)", fontWeight: 700, color, fontSize: "1rem" }}>{formatCurrency(val)}</div>
                  <div style={{ fontSize: "0.65rem", color: "var(--text3)", marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Categories */}
        <div className="insight-card">
          <h3>🏆 Top Spending Categories</h3>
          {top3.length === 0 ? (
            <div className="empty-state" style={{ padding: "24px 0" }}><span className="empty-icon">📊</span><p className="empty-text">No expense data</p></div>
          ) : (
            <div className="spending-rank">
              {top3.map((d, i) => (
                <div key={d.category} className="rank-item">
                  <div className={`rank-num ${i === 0 ? "top" : ""}`}>{i + 1}</div>
                  <div className="rank-info">
                    <div className="rank-name">{d.category}</div>
                    <div className="rank-bar-wrap">
                      <div className="rank-bar" style={{ width: `${(d.amount / top3[0].amount) * 100}%`, background: CATEGORY_COLORS[d.category] || "var(--accent)" }} />
                    </div>
                  </div>
                  <div className="rank-amount">{formatCurrency(d.amount)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Monthly Comparison */}
        <div className="insight-card">
          <h3>📅 Monthly Expense Comparison</h3>
          {recentMonths.length === 0 ? (
            <div className="empty-state" style={{ padding: "24px 0" }}><span className="empty-icon">📅</span><p className="empty-text">No monthly data</p></div>
          ) : (
            <div className="monthly-comparison">
              {recentMonths.map((m) => (
                <div key={m.key} className="month-row">
                  <div className="month-row-header">
                    <span className="month-name">{m.label}</span>
                    <span className="month-amount">{formatCurrency(m.expenses)}</span>
                  </div>
                  <div className="progress-bar-wrap">
                    <div className="progress-bar" style={{ width: `${(m.expenses / maxExpense) * 100}%`, background: "linear-gradient(90deg, var(--red), #ff8fa3)" }} />
                  </div>
                  <div style={{ fontSize: "0.65rem", color: m.balance >= 0 ? "var(--green)" : "var(--red)" }}>
                    Net: {m.balance >= 0 ? "+" : ""}{formatCurrency(m.balance)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Key Observations */}
        <div className="insight-card">
          <h3>💡 Key Observations</h3>
          {observations.length === 0 ? (
            <div className="empty-state" style={{ padding: "24px 0" }}><span className="empty-icon">🔍</span><p className="empty-text">Add more transactions to see insights</p></div>
          ) : (
            <div className="streak-list">
              {observations.map((obs, i) => (
                <div key={i} className="streak-item">
                  <span className="streak-icon">{obs.icon}</span>
                  <span className="streak-text">{obs.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Full Breakdown */}
      {catBreakdown.length > 0 && (
        <div className="insight-card">
          <h3>📊 Full Category Breakdown</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12, marginTop: 8 }}>
            {catBreakdown.map((d) => (
              <div key={d.category} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "var(--bg3)", borderRadius: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: CATEGORY_COLORS[d.category] || "#888", flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "0.78rem", fontWeight: 500, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.category}</div>
                  <div style={{ height: 4, background: "var(--bg4)", borderRadius: 99, marginTop: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(d.amount / catBreakdown[0].amount) * 100}%`, background: CATEGORY_COLORS[d.category] || "#888", borderRadius: 99 }} />
                  </div>
                </div>
                <div style={{ fontFamily: "var(--mono)", fontSize: "0.72rem", color: "var(--text2)", flexShrink: 0 }}>{formatCurrency(d.amount)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}