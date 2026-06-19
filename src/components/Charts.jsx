/* ==========================================================================
   GymSync — Canvas Chart Components (React)
   Bar charts, ring charts, line charts, sparklines
   ========================================================================== */
import { useEffect, useRef, useCallback } from 'react';

// Retina-aware canvas setup
function setupCanvas(canvas, width, height) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  return ctx;
}

// Easing
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

// Safe rounded rect (fallback for browsers without roundRect)
function drawRoundRect(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  if (r < 0) r = 0;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

// Draw a bar with rounded top corners only
function drawBar(ctx, x, y, w, h, r) {
  if (h < 1) return; // skip invisible bars
  r = Math.min(r, w / 2, h / 2); // clamp radius to half of smallest dimension
  if (r < 0) r = 0;
  ctx.beginPath();
  ctx.moveTo(x, y + h);               // bottom-left
  ctx.lineTo(x, y + r);               // left edge up
  ctx.arcTo(x, y, x + r, y, r);       // top-left corner
  ctx.lineTo(x + w - r, y);           // top edge
  ctx.arcTo(x + w, y, x + w, y + r, r); // top-right corner
  ctx.lineTo(x + w, y + h);           // right edge down
  ctx.closePath();
}

// Calculate nice axis values
function niceScale(minVal, maxVal, ticks = 5) {
  if (minVal === maxVal) { minVal = 0; maxVal = maxVal || 100; }
  const range = maxVal - minVal;
  const roughStep = range / ticks;
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const residual = roughStep / magnitude;
  let niceStep;
  if (residual <= 1.5) niceStep = 1 * magnitude;
  else if (residual <= 3) niceStep = 2 * magnitude;
  else if (residual <= 7) niceStep = 5 * magnitude;
  else niceStep = 10 * magnitude;

  const niceMin = Math.floor(minVal / niceStep) * niceStep;
  const niceMax = Math.ceil(maxVal / niceStep) * niceStep;
  return { min: niceMin, max: niceMax, step: niceStep };
}

// Format axis labels smartly
function formatAxisLabel(val, maxVal) {
  if (maxVal >= 1000000) return (val / 100000).toFixed(0) + 'L';
  if (maxVal >= 1000) return val.toLocaleString('en-IN');
  if (Number.isInteger(val)) return val.toString();
  return val.toFixed(1);
}

/* ---------- Bar Chart ---------- */
export function BarChart({ data, height = 280, className = '' }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data) return;
    const container = canvas.parentElement;
    if (!container) return;
    const width = container.clientWidth;
    if (width < 50) return;
    const ctx = setupCanvas(canvas, width, height);

    const padding = { top: 32, right: 24, bottom: 44, left: 55 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const allValues = data.datasets.flatMap(d => d.data);
    const dataMin = Math.min(...allValues);
    const dataMax = Math.max(...allValues);

    // Use nice scale — start from 0 always for bar charts
    const scale = niceScale(0, dataMax, 5);
    const maxVal = scale.max;

    const groupCount = data.labels.length;
    const barCount = data.datasets.length;
    const groupWidth = chartW / groupCount;
    const totalBarSpace = groupWidth * 0.7; // 70% for bars, 30% for gaps
    const barWidth = Math.min(28, totalBarSpace / barCount - 2);
    const totalBarsWidth = barCount * barWidth + (barCount - 1) * 2; // 2px gap between bars
    const groupOffset = (groupWidth - totalBarsWidth) / 2; // center bars in group

    if (animRef.current) cancelAnimationFrame(animRef.current);

    let progress = 0;
    const startTime = performance.now();
    const duration = 800;

    function animate(now) {
      progress = Math.min(1, (now - startTime) / duration);
      const ease = easeOutCubic(progress);

      ctx.clearRect(0, 0, width, height);

      // Grid lines + Y-axis labels
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      const tickCount = Math.round((scale.max - scale.min) / scale.step);
      for (let i = 0; i <= tickCount; i++) {
        const val = scale.min + i * scale.step;
        const yPos = padding.top + chartH - (val / maxVal) * chartH;

        // Grid line
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding.left, yPos);
        ctx.lineTo(width - padding.right, yPos);
        ctx.stroke();

        // Label
        ctx.fillStyle = '#64748b';
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.fillText(formatAxisLabel(val, maxVal), padding.left - 8, yPos);
      }

      // Bars
      data.labels.forEach((label, gi) => {
        const groupX = padding.left + gi * groupWidth + groupOffset;

        data.datasets.forEach((ds, di) => {
          const rawVal = ds.data[gi];
          const val = rawVal * ease;
          const barH = Math.max(1, (val / maxVal) * chartH); // minimum 1px height
          const x = groupX + di * (barWidth + 2);
          const y = padding.top + chartH - barH;

          ctx.fillStyle = ds.color;
          ctx.globalAlpha = 0.9;
          drawBar(ctx, x, y, barWidth, barH, Math.min(3, barH / 2));
          ctx.fill();

          // Subtle gradient overlay for depth
          const grad = ctx.createLinearGradient(x, y, x + barWidth, y);
          grad.addColorStop(0, 'rgba(255,255,255,0.08)');
          grad.addColorStop(1, 'rgba(0,0,0,0.08)');
          ctx.fillStyle = grad;
          ctx.fill();

          ctx.globalAlpha = 1;
        });

        // X-axis label — centered under group
        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        const labelX = groupX + totalBarsWidth / 2;
        ctx.fillText(label, labelX, height - padding.bottom + 8);
      });

      // Legend (top-right)
      let legendX = width - padding.right;
      ctx.textBaseline = 'middle';
      ctx.font = '11px Inter, sans-serif';
      data.datasets.slice().reverse().forEach(ds => {
        const textW = ctx.measureText(ds.label).width;
        legendX -= textW + 24;

        // Legend colored dot
        ctx.fillStyle = ds.color;
        ctx.beginPath();
        ctx.arc(legendX + 5, 12, 4, 0, Math.PI * 2);
        ctx.fill();

        // Legend text
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'left';
        ctx.fillText(ds.label, legendX + 14, 13);
      });

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      }
    }
    animRef.current = requestAnimationFrame(animate);
  }, [data, height]);

  useEffect(() => {
    draw();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [draw]);

  useEffect(() => {
    const handleResize = () => draw();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [draw]);

  return <canvas ref={canvasRef} className={className} style={{ width: '100%', height }} />;
}

/* ---------- Ring Chart ---------- */
export function RingChart({ data, size = 220, lineWidth = 28, centerText, centerSubText, className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data) return;
    const ctx = setupCanvas(canvas, size, size);

    const cx = size / 2;
    const cy = size / 2;
    const radius = (size - lineWidth) / 2 - 10;
    const total = data.values.reduce((a, b) => a + b, 0);
    const gap = 0.04; // radians

    let progress = 0;
    const startTime = performance.now();
    const duration = 1000;

    function animate(now) {
      progress = Math.min(1, (now - startTime) / duration);
      const ease = easeOutCubic(progress);
      ctx.clearRect(0, 0, size, size);

      // Background ring
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'butt';
      ctx.stroke();

      // Segments
      let startAngle = -Math.PI / 2;
      data.values.forEach((val, i) => {
        const sweep = (val / total) * Math.PI * 2 * ease - gap;
        if (sweep > 0) {
          ctx.beginPath();
          ctx.arc(cx, cy, radius, startAngle, startAngle + sweep);
          ctx.strokeStyle = data.colors[i];
          ctx.lineWidth = lineWidth;
          ctx.lineCap = 'round';
          ctx.stroke();
        }
        startAngle += (val / total) * Math.PI * 2;
      });

      // Center text
      ctx.textBaseline = 'middle';
      if (centerText) {
        ctx.fillStyle = '#f1f5f9';
        ctx.font = 'bold 28px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(centerText, cx, cy - 4);
      }
      if (centerSubText) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(centerSubText, cx, cy + 18);
      }

      if (progress < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }, [data, size, lineWidth, centerText, centerSubText]);

  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <canvas ref={canvasRef} style={{ width: size, height: size }} />
      {data && (
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {data.labels.map((label, i) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: data.colors[i], display: 'inline-block' }} />
              <span style={{ color: '#94a3b8' }}>{label}</span>
              <span style={{ color: '#f1f5f9', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{data.values[i]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Sparkline ---------- */
export function Sparkline({ data, color = '#3b82f6', width = 100, height = 30 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data || data.length < 2) return;
    const ctx = setupCanvas(canvas, width, height);

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const stepX = width / (data.length - 1);

    // Gradient fill
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, color + '30');
    gradient.addColorStop(1, 'transparent');

    ctx.beginPath();
    data.forEach((val, i) => {
      const x = i * stepX;
      const y = height - ((val - min) / range) * (height * 0.8) - height * 0.1;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Line
    ctx.beginPath();
    data.forEach((val, i) => {
      const x = i * stepX;
      const y = height - ((val - min) / range) * (height * 0.8) - height * 0.1;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.stroke();
  }, [data, color, width, height]);

  return <canvas ref={canvasRef} style={{ width, height, opacity: 0.5 }} />;
}

/* ---------- Line Chart ---------- */
export function LineChart({ data, height = 280, className = '' }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data) return;
    const container = canvas.parentElement;
    if (!container) return;
    const width = container.clientWidth;
    if (width < 50) return;
    const ctx = setupCanvas(canvas, width, height);

    const padding = { top: 32, right: 24, bottom: 44, left: 65 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const allValues = data.datasets.flatMap(d => d.data);
    const dataMin = Math.min(...allValues);
    const dataMax = Math.max(...allValues);
    const scale = niceScale(dataMin * 0.9, dataMax * 1.05, 5);
    const range = scale.max - scale.min || 1;
    const pointCount = data.labels.length;
    const stepX = chartW / (pointCount - 1);

    if (animRef.current) cancelAnimationFrame(animRef.current);

    let progress = 0;
    const startTime = performance.now();
    const duration = 1000;

    function animate(now) {
      progress = Math.min(1, (now - startTime) / duration);
      const ease = easeOutCubic(progress);
      ctx.clearRect(0, 0, width, height);

      // Grid + Y-axis
      const tickCount = Math.round((scale.max - scale.min) / scale.step);
      for (let i = 0; i <= tickCount; i++) {
        const val = scale.min + i * scale.step;
        const yPos = padding.top + chartH - ((val - scale.min) / range) * chartH;

        ctx.strokeStyle = 'rgba(255,255,255,0.04)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding.left, yPos);
        ctx.lineTo(width - padding.right, yPos);
        ctx.stroke();

        ctx.fillStyle = '#64748b';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText('₹' + (val / 100000).toFixed(1) + 'L', padding.left - 8, yPos);
      }

      // X labels
      ctx.textBaseline = 'top';
      data.labels.forEach((label, i) => {
        if (i % 2 === 0 || pointCount <= 7) {
          ctx.fillStyle = '#94a3b8';
          ctx.font = '11px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(label, padding.left + i * stepX, height - padding.bottom + 8);
        }
      });

      // Lines
      data.datasets.forEach(ds => {
        const visiblePoints = Math.floor(pointCount * ease);
        if (visiblePoints < 2) return;

        const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
        gradient.addColorStop(0, ds.color + '20');
        gradient.addColorStop(1, 'transparent');

        ctx.beginPath();
        for (let i = 0; i <= visiblePoints && i < pointCount; i++) {
          const x = padding.left + i * stepX;
          const y = padding.top + chartH - ((ds.data[i] - scale.min) / range) * chartH;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        const lastX = padding.left + Math.min(visiblePoints, pointCount - 1) * stepX;
        ctx.lineTo(lastX, padding.top + chartH);
        ctx.lineTo(padding.left, padding.top + chartH);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Line
        ctx.beginPath();
        for (let i = 0; i <= visiblePoints && i < pointCount; i++) {
          const x = padding.left + i * stepX;
          const y = padding.top + chartH - ((ds.data[i] - scale.min) / range) * chartH;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = ds.color;
        ctx.lineWidth = 2.5;
        ctx.lineJoin = 'round';
        ctx.stroke();

        // Points
        for (let i = 0; i <= visiblePoints && i < pointCount; i++) {
          const x = padding.left + i * stepX;
          const y = padding.top + chartH - ((ds.data[i] - scale.min) / range) * chartH;
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fillStyle = ds.color;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(x, y, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = '#111827';
          ctx.fill();
        }
      });

      // Legend
      let legendX = width - padding.right;
      ctx.font = '11px Inter, sans-serif';
      ctx.textBaseline = 'middle';
      data.datasets.slice().reverse().forEach(ds => {
        const tw = ctx.measureText(ds.label).width;
        legendX -= tw + 24;
        ctx.fillStyle = ds.color;
        ctx.beginPath();
        ctx.arc(legendX + 5, 12, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'left';
        ctx.fillText(ds.label, legendX + 14, 13);
      });

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      }
    }
    animRef.current = requestAnimationFrame(animate);
  }, [data, height]);

  useEffect(() => {
    draw();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [draw]);

  useEffect(() => {
    window.addEventListener('resize', draw);
    return () => window.removeEventListener('resize', draw);
  }, [draw]);

  return <canvas ref={canvasRef} className={className} style={{ width: '100%', height }} />;
}
