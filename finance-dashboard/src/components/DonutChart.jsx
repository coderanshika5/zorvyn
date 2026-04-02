import React, { useState } from "react";
import { CATEGORY_COLORS } from "../data/mockData";
import { formatCurrency } from "../utils/helpers";

const SIZE = 160;
const R = 60;
const STROKE = 18;
const C = SIZE / 2;
const CIRCUMFERENCE = 2 * Math.PI * R;

export default function DonutChart({ data }) {
  const [hovered, setHovered] = useState(null);

  if (!data.length)
    return (
      <div className="empty-state">
        <span className="empty-icon">🥧</span>
        <p className="empty-text">No expenses yet</p>
      </div>
    );

  const total = data.reduce((s, d) => s + d.amount, 0);
  const top5 = data.slice(0, 5);

  let offset = 0;
  const segments = top5.map((d) => {
    const pct = d.amount / total;
    const len = pct * CIRCUMFERENCE;
    const seg = { ...d, dashArray: `${len} ${CIRCUMFERENCE - len}`, dashOffset: -offset, pct };
    offset += len;
    return seg;
  });

  const active = hovered !== null ? segments[hovered] : null;

  return (
    <div className="donut-wrap">
      <div className="donut-svg-wrap">
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          <circle cx={C} cy={C} r={R} fill="none" stroke="var(--bg3)" strokeWidth={STROKE} />
          {segments.map((seg, i) => (
            <circle
              key={seg.category}
              cx={C} cy={C} r={R}
              fill="none"
              stroke={CATEGORY_COLORS[seg.category] || "#888"}
              strokeWidth={hovered === i ? STROKE + 4 : STROKE}
              strokeDasharray={seg.dashArray}
              strokeDashoffset={seg.dashOffset}
              strokeLinecap="round"
              style={{ transition: "stroke-width 0.2s", cursor: "pointer" }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            />
          ))}
        </svg>
        <div className="donut-center">
          {active ? (
            <>
              <span className="donut-total" style={{ fontSize: "0.8rem", color: CATEGORY_COLORS[active.category] }}>
                {(active.pct * 100).toFixed(1)}%
              </span>
              <span className="donut-label" style={{ fontSize: "0.6rem" }}>{active.category}</span>
            </>
          ) : (
            <>
              <span className="donut-total">{formatCurrency(total)}</span>
              <span className="donut-label">total spend</span>
            </>
          )}
        </div>
      </div>

      <div className="donut-legend">
        {top5.map((d, i) => (
          <div
            key={d.category}
            className="donut-legend-item"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{ cursor: "pointer", opacity: hovered !== null && hovered !== i ? 0.5 : 1, transition: "opacity 0.2s" }}
          >
            <div className="donut-legend-left">
              <span className="legend-dot" style={{ background: CATEGORY_COLORS[d.category] || "#888" }} />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.category}</span>
            </div>
            <div className="donut-legend-bar-wrap" style={{ flex: 1, margin: "0 8px" }}>
              <div
                className="donut-legend-bar"
                style={{
                  width: `${(d.amount / top5[0].amount) * 100}%`,
                  background: CATEGORY_COLORS[d.category] || "#888",
                }}
              />
            </div>
            <span className="donut-legend-amt">{formatCurrency(d.amount)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}