const STATUS_COLORS = {
  pending: "var(--text-muted)",
  confirmed: "var(--primary-strong)",
  shipped: "var(--warning)",
  delivered: "var(--success)",
  cancelled: "var(--danger)",
};

const DONUT_COLORS = ["#555555", "#8a9a94", "#BECFCB", "#5a6a64", "#d5e2de", "#3a4a44"];

function fmtMoney(value) {
  return value >= 1000 ? `$${(value / 1000).toFixed(1)}k` : `$${value}`;
}

export function RevenueChart({ data }) {
  const W = 560;
  const H = 210;
  const padLeft = 36;
  const padRight = 8;
  const padTop = 18;
  const padBottom = 24;
  const plotW = W - padLeft - padRight;
  const plotH = H - padTop - padBottom;
  const max = Math.max(...data.map((d) => d.total), 1);
  const slot = plotW / data.length;
  const barW = Math.min(26, slot * 0.55);

  return (
    <svg className="chart-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Revenue over the last 14 days">
      {[0, 0.5, 1].map((f) => {
        const y = padTop + plotH - f * plotH;
        return (
          <g key={f}>
            <line x1={padLeft} y1={y} x2={W - padRight} y2={y} style={{ stroke: "var(--border-soft)" }} strokeWidth="1" />
            <text x={padLeft - 6} y={y + 3} textAnchor="end" className="chart-axis-label">
              {f === 0 ? "$0" : fmtMoney(max * f)}
            </text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const barH = (d.total / max) * plotH;
        const x = padLeft + i * slot + (slot - barW) / 2;
        const y = padTop + plotH - barH;
        return (
          <g key={d.date}>
            {d.total > 0 && (
              <text x={x + barW / 2} y={y - 4} textAnchor="middle" className="chart-bar-value">
                ${d.total.toFixed(0)}
              </text>
            )}
            <rect
              x={x}
              y={y}
              width={barW}
              height={Math.max(barH, d.total > 0 ? 2 : 0)}
              rx="2"
              style={{ fill: d.total > 0 ? "var(--text-strong)" : "var(--border-soft)" }}
            >
              <title>{`${d.weekday}: $${d.total.toFixed(2)}`}</title>
            </rect>
            <text
              x={x + barW / 2}
              y={H - 8}
              textAnchor="middle"
              className="chart-axis-label"
            >
              {d.weekday}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function StatusBars({ data }) {
  const W = 560;
  const H = 190;
  const padLeft = 8;
  const padRight = 8;
  const padTop = 26;
  const padBottom = 26;
  const plotW = W - padLeft - padRight;
  const plotH = H - padTop - padBottom;
  const max = Math.max(...data.map((d) => d.count), 1);
  const slot = plotW / data.length;
  const barW = Math.min(56, slot * 0.5);

  return (
    <svg className="chart-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Orders by status">
      {data.map((d, i) => {
        const barH = (d.count / max) * plotH;
        const x = padLeft + i * slot + (slot - barW) / 2;
        const y = padTop + plotH - barH;
        return (
          <g key={d.status}>
            <text x={x + barW / 2} y={y - 5} textAnchor="middle" className="chart-bar-value">
              {d.count}
            </text>
            <rect x={x} y={y} width={barW} height={Math.max(barH, d.count > 0 ? 2 : 0)} rx="2" style={{ fill: STATUS_COLORS[d.status] || "var(--text-faint)" }} />
            <text x={x + barW / 2} y={H - 8} textAnchor="middle" className="chart-axis-label">
              {d.status}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function CategoryDonut({ data }) {
  const size = 190;
  const cx = size / 2;
  const cy = size / 2;
  const r = 64;
  const C = 2 * Math.PI * r;
  const total = data.reduce((sum, d) => sum + d.count, 0);

  const fractions = data.map((d) => (total > 0 ? d.count / total : 0));
  const offsets = fractions.map((_, i) =>
    fractions.slice(0, i).reduce((sum, f) => sum + f, 0)
  );
  const segments = data.map((d, i) => ({
    ...d,
    color: DONUT_COLORS[i % DONUT_COLORS.length],
    dash: `${fractions[i] * C} ${C}`,
    dashoffset: -offsets[i] * C,
    percent: Math.round(fractions[i] * 100),
  }));

  return (
    <div className="donut-layout">
      <svg className="chart-svg donut-svg" viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Products by category">
        <circle cx={cx} cy={cy} r={r} fill="none" style={{ stroke: "var(--surface-muted)" }} strokeWidth="30" />
        {segments.map((seg) => (
          <circle
            key={seg.category}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth="30"
            strokeDasharray={seg.dash}
            strokeDashoffset={seg.dashoffset}
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        ))}
        <text x={cx} y={cy - 4} textAnchor="middle" className="donut-total">
          {total}
        </text>
        <text x={cx} y={cy + 16} textAnchor="middle" className="donut-total-label">
          products
        </text>
      </svg>
      <ul className="donut-legend">
        {segments.map((seg) => (
          <li key={seg.category}>
            <span className="donut-swatch" style={{ background: seg.color }} />
            <span className="donut-legend-name">{seg.category}</span>
            <span className="donut-legend-count">
              {seg.count} · {seg.percent}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TopProductsBars({ data }) {
  const max = Math.max(...data.map((d) => d.quantity), 1);

  if (data.length === 0) {
    return <p className="chart-empty">No sales yet.</p>;
  }

  return (
    <div className="hbar-list">
      {data.map((p, i) => (
        <div className="hbar" key={`${p.name}-${i}`}>
          <div className="hbar-top">
            <span className="hbar-name" title={p.name}>
              {p.name}
            </span>
            <span className="hbar-value">
              {p.quantity} sold · ${p.revenue.toFixed(2)}
            </span>
          </div>
          <div className="hbar-track">
            <div
              className="hbar-fill"
              style={{ width: `${(p.quantity / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
