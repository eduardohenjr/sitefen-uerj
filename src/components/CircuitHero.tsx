import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import type { Department } from '../types';

interface CircuitHeroProps {
  departments: Department[];
  onOpen: (department: Department) => void;
  onScrollDown: () => void;
  children: ReactNode;
}

interface Point {
  x: number;
  y: number;
}

interface Rect {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

interface Trace {
  pts: Point[];
  segLen: number[];
  segAlpha: number[];
  len: number;
  delay: number;
  chip: number;
  base: number;
  padStart: boolean;
  padEnd: boolean;
}

interface Chip {
  dept: Department;
  x: number;
  y: number;
  side: number;
}

interface Pulse {
  trace: number;
  d: number;
  speed: number;
  hot: boolean;
}

const DIRS = [
  [1, 0],
  [0, 1],
  [-1, 0],
  [0, -1],
] as const;

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Trilhas ficam quase transparentes sobre o texto (efeito marca d'água) e ganham força ao se afastar dele.
function textAlpha(x: number, y: number, text: Rect) {
  const dx = Math.max(text.left - x, 0, x - text.right);
  const dy = Math.max(text.top - y, 0, y - text.bottom);
  const t = Math.min(Math.hypot(dx, dy) / 120, 1);
  return 0.3 + 0.7 * t * t * (3 - 2 * t);
}

function makeTrace(
  sx: number,
  sy: number,
  d0: number,
  g: number,
  w: number,
  h: number,
  rng: () => number,
  text: Rect,
  chip: number,
  base: number
): Trace {
  const pts: Point[] = [{ x: sx, y: sy }];
  let x = sx;
  let y = sy;
  let d = d0;
  const steps = 3 + Math.floor(rng() * 3);
  const out = () => x < -g || x > w + g || y < -g || y > h + g;

  // Trechos retos ligados por curvas de 45 graus, como trilhas de placa de circuito.
  for (let s = 0; s < steps; s++) {
    const run = 2 + Math.floor(rng() * 5);
    x += DIRS[d][0] * run * g;
    y += DIRS[d][1] * run * g;
    pts.push({ x, y });
    if (s === steps - 1 || out()) break;
    const turn = rng() < 0.5 ? (d + 1) % 4 : (d + 3) % 4;
    const m = 1 + Math.floor(rng() * 3);
    x += (DIRS[d][0] + DIRS[turn][0]) * m * g;
    y += (DIRS[d][1] + DIRS[turn][1]) * m * g;
    pts.push({ x, y });
    d = turn;
    if (out()) break;
  }

  const segLen: number[] = [];
  const segAlpha: number[] = [];
  let len = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const l = Math.hypot(pts[i + 1].x - pts[i].x, pts[i + 1].y - pts[i].y);
    segLen.push(l);
    segAlpha.push(textAlpha((pts[i].x + pts[i + 1].x) / 2, (pts[i].y + pts[i + 1].y) / 2, text));
    len += l;
  }
  const last = pts[pts.length - 1];
  const inside = last.x > 0 && last.x < w && last.y > 0 && last.y < h;
  return { pts, segLen, segAlpha, len, delay: rng() * 900, chip, base, padStart: chip < 0, padEnd: inside };
}

function buildBoard(
  w: number,
  h: number,
  g: number,
  text: Rect,
  stage: Rect,
  departments: Department[]
) {
  const rng = mulberry32(20260);
  const side = Math.round(g * 1.2);
  const half = side / 2;
  const chips: Chip[] = [];

  const cols = 3;
  const rows = Math.max(1, Math.ceil(departments.length / cols));
  const cellW = (stage.right - stage.left) / cols;
  const cellH = (stage.bottom - stage.top) / rows;
  departments.forEach((dept, i) => {
    const c = i % cols;
    const r = Math.floor(i / cols);
    const jitterX = (rng() - 0.5) * cellW * 0.25;
    const jitterY = (rng() - 0.5) * cellH * 0.25;
    chips.push({
      dept,
      x: Math.round((stage.left + (c + 0.5) * cellW + jitterX) / g) * g,
      y: Math.round((stage.top + (r + 0.5) * cellH + jitterY) / g) * g,
      side,
    });
  });

  const traces: Trace[] = [];
  chips.forEach((chip, ci) => {
    const order = [0, 1, 2, 3].sort(() => rng() - 0.5).slice(0, 3);
    for (const d of order) {
      const offset = Math.round((rng() - 0.5) * 2) * (half * 0.5);
      const sx = chip.x + DIRS[d][0] * (half + 4) + (DIRS[d][0] === 0 ? offset : 0);
      const sy = chip.y + DIRS[d][1] * (half + 4) + (DIRS[d][1] === 0 ? offset : 0);
      traces.push(makeTrace(sx, sy, d, g, w, h, rng, text, ci, 0.42));
    }
  });

  const gw = Math.ceil(w / g);
  const gh = Math.ceil(h / g);
  const count = Math.floor((gw * gh) / 30);
  for (let i = 0; i < count; i++) {
    const sx = Math.floor(rng() * gw) * g;
    const sy = Math.floor(rng() * gh) * g;
    if (chips.some((c) => Math.abs(c.x - sx) < half + g && Math.abs(c.y - sy) < half + g)) continue;
    traces.push(makeTrace(sx, sy, Math.floor(rng() * 4), g, w, h, rng, text, -1, 0.2));
  }
  return { traces, chips };
}

function pointAt(trace: Trace, d: number) {
  let acc = 0;
  for (let i = 0; i < trace.segLen.length; i++) {
    if (d <= acc + trace.segLen[i]) {
      const t = (d - acc) / trace.segLen[i];
      const a = trace.pts[i];
      const b = trace.pts[i + 1];
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, seg: i };
    }
    acc += trace.segLen[i];
  }
  const last = trace.pts[trace.pts.length - 1];
  return { x: last.x, y: last.y, seg: trace.segLen.length - 1 };
}

// Símbolo de cada curso desenhado dentro do chip (u = meia largura útil em px).
function drawGlyph(ctx: CanvasRenderingContext2D, id: string, x: number, y: number, u: number) {
  ctx.beginPath();
  switch (id) {
    case 'mecan':
      ctx.arc(x, y, u * 0.55, 0, Math.PI * 2);
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        ctx.moveTo(x + Math.cos(a) * u * 0.55, y + Math.sin(a) * u * 0.55);
        ctx.lineTo(x + Math.cos(a) * u * 1.05, y + Math.sin(a) * u * 1.05);
      }
      break;
    case 'ele':
      ctx.moveTo(x + u * 0.25, y - u);
      ctx.lineTo(x - u * 0.5, y + u * 0.1);
      ctx.lineTo(x, y + u * 0.1);
      ctx.lineTo(x - u * 0.25, y + u);
      ctx.lineTo(x + u * 0.5, y - u * 0.1);
      ctx.lineTo(x, y - u * 0.1);
      ctx.closePath();
      break;
    case 'detel':
      for (let k = 0; k <= 12; k++) {
        const px = x - u + (2 * u * k) / 12;
        const py = y - Math.sin((k / 12) * Math.PI * 2) * u * 0.6;
        if (k === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      break;
    case 'desma':
      ctx.ellipse(x, y, u * 0.5, u * 0.95, Math.PI / 4, 0, Math.PI * 2);
      ctx.moveTo(x - u * 0.75, y + u * 0.75);
      ctx.lineTo(x + u * 0.5, y - u * 0.5);
      break;
    case 'carto':
      ctx.arc(x, y - u * 0.25, u * 0.55, 0, Math.PI * 2);
      ctx.moveTo(x - u * 0.45, y + u * 0.1);
      ctx.lineTo(x, y + u);
      ctx.lineTo(x + u * 0.45, y + u * 0.1);
      break;
    case 'dcct':
      ctx.rect(x - u * 0.55, y - u * 0.9, u * 1.1, u * 1.8);
      ctx.moveTo(x - u * 0.55, y - u * 0.3);
      ctx.lineTo(x + u * 0.55, y - u * 0.3);
      ctx.moveTo(x - u * 0.55, y + u * 0.3);
      ctx.lineTo(x + u * 0.55, y + u * 0.3);
      break;
    case 'estr':
      ctx.moveTo(x - u, y + u * 0.8);
      ctx.lineTo(x, y - u * 0.8);
      ctx.lineTo(x + u, y + u * 0.8);
      ctx.closePath();
      ctx.moveTo(x - u * 0.5, y);
      ctx.lineTo(x + u * 0.5, y);
      break;
    case 'desc':
      ctx.rect(x - u * 0.55, y - u * 0.55, u * 1.1, u * 1.1);
      for (const t of [-0.3, 0.3]) {
        ctx.moveTo(x + t * u, y - u * 0.55);
        ctx.lineTo(x + t * u, y - u);
        ctx.moveTo(x + t * u, y + u * 0.55);
        ctx.lineTo(x + t * u, y + u);
      }
      break;
    case 'dein':
      ctx.rect(x - u * 0.9, y + u * 0.2, u * 0.5, u * 0.7);
      ctx.rect(x - u * 0.25, y - u * 0.3, u * 0.5, u * 1.2);
      ctx.rect(x + u * 0.4, y - u * 0.9, u * 0.5, u * 1.8);
      break;
    default:
      ctx.arc(x, y, u * 0.6, 0, Math.PI * 2);
  }
  ctx.stroke();
}

export default function CircuitHero({ departments, onOpen, onScrollDown, children }: CircuitHeroProps) {
  const rootRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeRef = useRef<string | null>(null);
  const dirtyRef = useRef(true);
  const departmentsRef = useRef(departments);
  const relayoutRef = useRef<() => void>(() => {});
  const onOpenRef = useRef(onOpen);
  const startRef = useRef(0);
  const chipsStartRef = useRef(0);
  const activeDept = departments.find((d) => d.id === activeId) ?? null;

  useEffect(() => {
    onOpenRef.current = onOpen;
  }, [onOpen]);

  useEffect(() => {
    departmentsRef.current = departments;
    relayoutRef.current();
  }, [departments]);

  const activate = useCallback((id: string | null) => {
    if (activeRef.current === id) return;
    activeRef.current = id;
    dirtyRef.current = true;
    setActiveId(id);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const textEl = textRef.current;
    const stageEl = stageRef.current;
    const ctx = canvas?.getContext('2d');
    if (!root || !canvas || !textEl || !stageEl || !ctx) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const touchOnly = window.matchMedia('(hover: none)').matches;
    const size = { w: 0, h: 0, g: 34 };
    const parallax = { x: 0, y: 0, tx: 0, ty: 0 };
    const pulses: Pulse[] = [];
    let board: { traces: Trace[]; chips: Chip[] } = { traces: [], chips: [] };
    let hotspots: Chip[] = [];
    let visible = true;
    let frame = 0;
    let last = 0;
    let lastActive: string | null = null;
    let hotTimer = 0;
    const maxIdlePulses = window.matchMedia('(max-width: 640px)').matches ? 7 : 16;

    const layout = () => {
      const rr = root.getBoundingClientRect();
      if (rr.width === 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      size.w = rr.width;
      size.h = rr.height;
      size.g = rr.width < 640 ? 28 : 34;
      canvas.width = Math.round(rr.width * dpr);
      canvas.height = Math.round(rr.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const tr = textEl.getBoundingClientRect();
      const sr = stageEl.getBoundingClientRect();
      const margin = size.g * 1.4;
      const text: Rect = {
        left: tr.left - rr.left - 16,
        right: tr.right - rr.left + 16,
        top: tr.top - rr.top - 16,
        bottom: tr.bottom - rr.top + 16,
      };
      const stage: Rect = {
        left: Math.max(sr.left - rr.left, margin),
        right: Math.min(sr.right - rr.left, rr.width - margin),
        top: sr.top - rr.top + 8,
        bottom: sr.bottom - rr.top - 84,
      };
      board = buildBoard(size.w, size.h, size.g, text, stage, departmentsRef.current);
      pulses.length = 0;
      if (board.chips.length > 0 && !chipsStartRef.current) chipsStartRef.current = performance.now();
      dirtyRef.current = true;
    };
    relayoutRef.current = layout;

    const spawn = (traceIdx: number, hot: boolean) => {
      pulses.push({ trace: traceIdx, d: 0, speed: hot ? 0.2 : 0.11, hot });
    };

    const stepPulses = (dt: number) => {
      const { traces, chips } = board;
      if (activeRef.current !== lastActive) {
        lastActive = activeRef.current;
        hotTimer = 0;
        traces.forEach((t, i) => {
          if (t.chip >= 0 && chips[t.chip].dept.id === lastActive) spawn(i, true);
        });
      }
      if (lastActive) {
        hotTimer += dt;
        if (hotTimer > 500) {
          hotTimer = 0;
          traces.forEach((t, i) => {
            if (t.chip >= 0 && chips[t.chip].dept.id === lastActive) spawn(i, true);
          });
        }
      }
      if (traces.length > 0 && pulses.filter((p) => !p.hot).length < maxIdlePulses && Math.random() < dt * 0.006) {
        spawn(Math.floor(Math.random() * traces.length), false);
      }
      for (let i = pulses.length - 1; i >= 0; i--) {
        pulses[i].d += dt * pulses[i].speed;
        if (pulses[i].d > traces[pulses[i].trace].len + 40) pulses.splice(i, 1);
      }
    };

    const render = (time: number) => {
      if (!startRef.current) startRef.current = time;
      const dt = last ? Math.min(time - last, 64) : 16;
      last = time;

      if (!visible || size.w === 0 || (reduceMotion && !dirtyRef.current)) {
        frame = requestAnimationFrame(render);
        return;
      }
      dirtyRef.current = false;
      if (!reduceMotion) {
        stepPulses(dt);
        parallax.x += (parallax.tx - parallax.x) * 0.06;
        parallax.y += (parallax.ty - parallax.y) * 0.06;
      }

      const { w, h, g } = size;
      const elapsed = time - startRef.current;
      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.translate(parallax.x, parallax.y);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Trilhas
      for (const tr of board.traces) {
        const raw = reduceMotion ? 1 : Math.min(Math.max((elapsed - tr.delay) / 1100, 0), 1);
        if (raw <= 0) continue;
        const prog = 1 - Math.pow(1 - raw, 3);
        let remaining = tr.len * prog;
        ctx.lineWidth = tr.chip >= 0 ? 1.8 : 1.4;
        for (let i = 0; i < tr.segLen.length && remaining > 0; i++) {
          const take = Math.min(tr.segLen[i], remaining);
          const a = tr.pts[i];
          const b = tr.pts[i + 1];
          const t = take / tr.segLen[i];
          ctx.strokeStyle = `rgba(147, 174, 207, ${tr.base * tr.segAlpha[i]})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
          ctx.stroke();
          remaining -= take;
        }
        if (raw >= 1) {
          ctx.strokeStyle = `rgba(147, 174, 207, ${tr.base * 1.4 * tr.segAlpha[0]})`;
          ctx.lineWidth = 1.2;
          const ends: [boolean, Point, number][] = [
            [tr.padStart, tr.pts[0], 0],
            [tr.padEnd, tr.pts[tr.pts.length - 1], tr.segAlpha.length - 1],
          ];
          for (const [on, p, seg] of ends) {
            if (!on) continue;
            ctx.strokeStyle = `rgba(147, 174, 207, ${Math.min(tr.base * 1.6, 0.6) * tr.segAlpha[seg]})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3.2, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
      }

      // Pulsos de sinal
      for (const pulse of pulses) {
        const tr = board.traces[pulse.trace];
        if (!tr) continue;
        const head = pointAt(tr, Math.min(pulse.d, tr.len));
        const fade = tr.segAlpha[head.seg];
        const color = pulse.hot ? '255, 236, 170' : '227, 185, 79';
        let prev = head;
        for (let k = 1; k <= 4; k++) {
          const p = pointAt(tr, Math.max(pulse.d - k * 14, 0));
          ctx.strokeStyle = `rgba(${color}, ${(0.9 - k * 0.2) * fade})`;
          ctx.lineWidth = pulse.hot ? 2.4 : 1.8;
          ctx.beginPath();
          ctx.moveTo(prev.x, prev.y);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
          prev = p;
        }
        const glow = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 8);
        glow.addColorStop(0, `rgba(${color}, ${fade})`);
        glow.addColorStop(1, `rgba(${color}, 0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(head.x, head.y, 8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Chips dos departamentos
      const chipElapsed = reduceMotion ? 9999 : time - chipsStartRef.current;
      hotspots = [];
      board.chips.forEach((chip, i) => {
        const raw = Math.min(Math.max((chipElapsed - 500 - i * 90) / 600, 0), 1);
        if (raw <= 0) return;
        const alpha = 1 - Math.pow(1 - raw, 3);
        const isActive = chip.dept.id === activeRef.current;
        const side = chip.side + (isActive ? 6 : 0);
        const half = side / 2;
        const { x, y } = chip;
        hotspots.push({ ...chip, x: x + parallax.x, y: y + parallax.y });

        const glow = ctx.createRadialGradient(x, y, 0, x, y, side * 1.7);
        glow.addColorStop(0, `rgba(227, 185, 79, ${(isActive ? 0.5 : 0.22) * alpha})`);
        glow.addColorStop(1, 'rgba(227, 185, 79, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, side * 1.7, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = `rgba(239, 212, 136, ${alpha * 0.85})`;
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        for (const k of [-1, 0, 1]) {
          const p = k * half * 0.5;
          ctx.moveTo(x - half - 4, y + p);
          ctx.lineTo(x - half, y + p);
          ctx.moveTo(x + half, y + p);
          ctx.lineTo(x + half + 4, y + p);
          ctx.moveTo(x + p, y - half - 4);
          ctx.lineTo(x + p, y - half);
          ctx.moveTo(x + p, y + half);
          ctx.lineTo(x + p, y + half + 4);
        }
        ctx.stroke();

        ctx.fillStyle = `rgba(8, 20, 42, ${0.96 * alpha})`;
        ctx.strokeStyle = `rgba(239, 212, 136, ${alpha})`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.rect(x - half, y - half, side, side);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = `rgba(255, 236, 170, ${alpha})`;
        ctx.lineWidth = 1.3;
        drawGlyph(ctx, chip.dept.id, x, y, side * 0.27);

        ctx.textAlign = 'center';
        ctx.font = '600 10px "Inter Variable", system-ui, sans-serif';
        ctx.fillStyle = `rgba(255, 255, 255, ${0.75 * alpha})`;
        ctx.fillText(chip.dept.code, x, y + half + 15);

        if (isActive) {
          const beat = 1 + 0.12 * Math.sin(time / 260);
          const ring = (half + 7) * beat;
          ctx.strokeStyle = 'rgba(239, 212, 136, 0.9)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.rect(x - ring, y - ring, ring * 2, ring * 2);
          ctx.stroke();

          // Mira e coordenadas, no estilo de desenho técnico.
          ctx.strokeStyle = 'rgba(239, 212, 136, 0.25)';
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 5]);
          ctx.beginPath();
          ctx.moveTo(-parallax.x, y);
          ctx.lineTo(w - parallax.x, y);
          ctx.moveTo(x, -parallax.y);
          ctx.lineTo(x, h - parallax.y);
          ctx.stroke();
          ctx.setLineDash([]);

          const alignLeft = x < w - 150;
          ctx.font = '500 10px ui-monospace, Consolas, monospace';
          ctx.textAlign = alignLeft ? 'left' : 'right';
          ctx.fillStyle = 'rgba(239, 212, 136, 0.85)';
          ctx.fillText(
            `X ${((x - w / 2) / g).toFixed(1)}  Y ${((h / 2 - y) / g).toFixed(1)}`,
            x + (alignLeft ? half + 10 : -half - 10),
            y - half - 8
          );
        }
      });
      ctx.restore();

      if (activeRef.current || pulses.length > 0 || Math.abs(parallax.tx - parallax.x) > 0.05 || elapsed < 4000) {
        dirtyRef.current = true;
      }
      frame = requestAnimationFrame(render);
    };

    const hitTest = (x: number, y: number) => {
      let best: Chip | null = null;
      let bestDist = Infinity;
      for (const hs of hotspots) {
        const reach = hs.side / 2 + (touchOnly ? 14 : 8);
        const dx = Math.abs(hs.x - x);
        const dy = Math.abs(hs.y - y);
        if (dx < reach && dy < reach && dx + dy < bestDist) {
          best = hs;
          bestDist = dx + dy;
        }
      }
      return best;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const rect = root.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      parallax.tx = -((x / rect.width) * 2 - 1) * 8;
      parallax.ty = -((y / rect.height) * 2 - 1) * 6;
      dirtyRef.current = true;
      const hit = hitTest(x, y);
      root.style.cursor = hit ? 'pointer' : '';
      if (hit) activate(hit.dept.id);
    };

    const onPointerLeave = () => {
      parallax.tx = 0;
      parallax.ty = 0;
      dirtyRef.current = true;
    };

    const onClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('button, a')) return;
      const rect = root.getBoundingClientRect();
      const hit = hitTest(e.clientX - rect.left, e.clientY - rect.top);
      if (!hit) {
        if (touchOnly) activate(null);
        return;
      }
      // No toque, o primeiro gesto mostra o nome e o segundo abre.
      if (!touchOnly || activeRef.current === hit.dept.id) onOpenRef.current(hit.dept);
      else activate(hit.dept.id);
    };

    const resizeObserver = new ResizeObserver(layout);
    resizeObserver.observe(root);
    resizeObserver.observe(textEl);
    resizeObserver.observe(stageEl);
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      dirtyRef.current = true;
    });
    visibilityObserver.observe(root);

    root.addEventListener('pointermove', onPointerMove);
    root.addEventListener('pointerleave', onPointerLeave);
    root.addEventListener('click', onClick);
    layout();
    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      root.removeEventListener('pointermove', onPointerMove);
      root.removeEventListener('pointerleave', onPointerLeave);
      root.removeEventListener('click', onClick);
      relayoutRef.current = () => {};
    };
  }, [activate]);

  return (
    <section ref={rootRef} className="relative overflow-hidden bg-navy-950 text-white">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(50rem 32rem at 78% 45%, rgb(29 58 98 / 0.8), transparent 65%), radial-gradient(36rem 22rem at 5% 100%, rgb(201 154 46 / 0.1), transparent 60%)',
        }}
        aria-hidden="true"
      />
      <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />

      <div className="container-page relative flex min-h-[calc(100svh-5rem)] flex-col justify-center pb-20 pt-10 sm:min-h-[calc(100svh-7rem)]">
        <div className="grid items-center gap-4 lg:grid-cols-12 lg:gap-10">
          <div ref={textRef} className="text-center lg:col-span-5 lg:text-left">
            {children}
          </div>

          <div ref={stageRef} className="relative h-[25rem] lg:col-span-7 lg:h-[30rem]">
            {/* Alternativa por teclado e leitor de tela ao fundo interativo. */}
            <ul className="sr-only">
              {departments.map((dept) => (
                <li key={dept.id}>
                  <button type="button" onClick={() => onOpen(dept)}>Abrir departamento: {dept.name}</button>
                </li>
              ))}
            </ul>

            <div className="absolute inset-x-0 bottom-0 flex min-h-[4.5rem] flex-col items-center text-center" aria-live="polite">
              {activeDept ? (
                <>
                  <p className="font-serif text-xl font-semibold text-white">{activeDept.name}</p>
                  <button
                    type="button"
                    onClick={() => onOpen(activeDept)}
                    className="mt-1.5 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-300 hover:text-gold-400"
                  >
                    Abrir departamento <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </>
              ) : (
                <p className="text-sm text-navy-300">Cada chip dourado é um departamento. Toque para explorar.</p>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onScrollDown}
          aria-label="Rolar para as notícias"
          className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 text-navy-300 transition-colors hover:text-white sm:block"
        >
          <ChevronDown className="h-7 w-7 motion-safe:animate-bounce" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
