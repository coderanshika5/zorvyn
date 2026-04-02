import React, { useState } from "react";
import { formatCurrency } from "../utils/helpers";

export default function BarChart({ data }) {
  const [hovered, setHovered] = useState(null);

  if (!data.length)
    return (
      <div className="empty-state">
        <span className="empty-icon">📊</span>
        <p className="empty-text">No data available</p>
      </div>
    );

  const maxVal = Math.max(...data.map((d) => Math.max(d.income, d.expenses)));

  return (
    <div>
      <div className="bar-chart">
        {data.map((d, i) => (
          <div
            key={d.key}
            className="bar-group"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{ opacity: hovered !== null && hovered !== i ? 0.5 : 1, transition: "opacity 0.2s" }}
          >
            <div className="bar-wrap">
              <div
                className="bar income-bar"
                style={{ height: `${(d.income / maxVal) * 140}px` }}
                title={`Income: ${formatCurrency(d.income)}`}
              />
              <div
                className="bar expense-bar"
                style={{ height: `${(d.expenses / maxVal) * 140}px` }}
                title={`Expenses: ${formatCurrency(d.expenses)}`}
              />
            </div>
            <span className="bar-label">{d.label}</span>
          </div>
        ))}
      </div>
      {hovered !== null && data[hovered] && (
        <div style={{ textAlign: "center", marginTop: 8 }}>
          <span style={{ fontSize: "0.72rem", color: "var(--text2)" }}>
            <strong style={{ color: "var(--green)" }}>{formatCurrency(data[hovered].income)}</strong>
            {" income  "}
            <strong style={{ color: "var(--red)" }}>{formatCurrency(data[hovered].expenses)}</strong>
            {" expenses — "}
            <strong style={{ color: data[hovered].balance >= 0 ? "var(--green)" : "var(--red)" }}>
              {formatCurrency(data[hovered].balance)} net
            </strong>
          </span>
        </div>
      )}
    </div>
  );
}