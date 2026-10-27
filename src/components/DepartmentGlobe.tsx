import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import type { Department } from '../types';

interface DepartmentGlobeProps {
  departments: Department[];
  onOpen: (department: Department) => void;
}

interface GlobeNode {
  x: number;
  y: number;
  z: number;
  dept?: Department;
}

interface Hotspot {
  dept: Department;
  x: number;
  y: number;
  z: number;
}

interface Pulse {
  from: number;
  to: number;
  t: number;
  hops: number;
  speed: number;
  hot: boolean;
}

// Pontos distribuídos uniformemente na esfera (espiral de Fibonacci); os departamentos ocupam pontos espaçados.
function buildGlobe(count: number, departments: Department[]) {
  const golden = Math.PI * (3 - Math.sqrt(5));
  const nodes: GlobeNode[] = [];
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const radius = Math.sqrt(1 - y * y);
    const theta = golden * i;
    nodes.push({ x: Math.cos(theta) * radius, y, z: Math.sin(theta) * radius });
  }
  const deptIndex: Record<string, number> = {};
  departments.forEach((dept, k) => {
    const idx = Math.floor(((k + 0.5) * count) / departments.length);
    nodes[idx].dept = dept;
    deptIndex[dept.id] = idx;
  });

  const maxDist = 2.6 / Math.sqrt(count);
  const pairs: [number, number][] = [];
  const neighbors: number[][] = nodes.map(() => []);
  for (let i = 0; i < count; i++) {
    for (let j = i + 1; j < count; j++) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const dz = nodes[i].z - nodes[j].z;
      if (dx * dx + dy * dy + dz * dz < maxDist * maxDist) {
        pairs.push([i, j]);
        neighbors[i].push(j);
        neighbors[j].push(i);
      }
    }
  }
  return { nodes, pairs, neighbors, deptIndex };
}

// Símbolo de cada curso desenhado dentro do "chip" (u = meia largura útil em px).
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

const BASE_PITCH = 0.3;

export default function DepartmentGlobe({ departments, onOpen }: DepartmentGlobeProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeRef = useRef<string | null>(null);
  const dirtyRef = useRef(true);
  const hotspotsRef = useRef<Hotspot[]>([]);
  const [pointCount] = useState(() => (window.matchMedia('(max-width: 640px)').matches ? 90 : 150));

  const globe = useMemo(() => buildGlobe(pointCount, departments), [pointCount, departments]);
  const globeRef = useRef(globe);
  const activeDept = departments.find((d) => d.id === activeId) ?? null;
  const onOpenRef = useRef(onOpen);

  useEffect(() => {
    onOpenRef.current = onOpen;
  }, [onOpen]);

  const activate = useCallback((id: string | null) => {
    if (activeRef.current === id) return;
    activeRef.current = id;
    dirtyRef.current = true;
    setActiveId(id);
  }, []);

  useEffect(() => {
    globeRef.current = globe;
    dirtyRef.current = true;
  }, [globe]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!wrap || !canvas || !ctx) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const maxIdlePulses = pointCount <= 90 ? 5 : 10;
    const size = { w: 0, h: 0 };
    const view = { yaw: 0.6, pitch: BASE_PITCH };
    const drag = { active: false, moved: 0, x: 0, y: 0 };
    const pulses: Pulse[] = [];
    let visible = true;
    let frame = 0;
    let last = 0;
    let start = 0;
    let lastActive: string | null = null;
    let hotTimer = 0;

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      size.w = rect.width;
      size.h = rect.height;
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dirtyRef.current = true;
    };

    const spawn = (from: number, hops: number, hot: boolean) => {
      const options = globeRef.current.neighbors[from];
      if (!options || options.length === 0) return;
      pulses.push({
        from,
        to: options[Math.floor(Math.random() * options.length)],
        t: 0,
        hops,
        speed: hot ? 0.0024 : 0.0015,
        hot,
      });
    };

    // Avança os pulsos: ao chegar num nó, seguem para um vizinho (exceto o que acabaram de deixar).
    const stepPulses = (dt: number) => {
      const { neighbors, deptIndex } = globeRef.current;

      if (activeRef.current !== lastActive) {
        lastActive = activeRef.current;
        hotTimer = 0;
        const idx = lastActive ? deptIndex[lastActive] : undefined;
        if (idx !== undefined) for (let i = 0; i < 4; i++) spawn(idx, 4, true);
      }
      const hotIdx = lastActive ? deptIndex[lastActive] : undefined;
      if (hotIdx !== undefined) {
        hotTimer += dt;
        if (hotTimer > 450) {
          hotTimer = 0;
          spawn(hotIdx, 4, true);
          spawn(hotIdx, 4, true);
        }
      }

      const idleCount = pulses.filter((p) => !p.hot).length;
      if (idleCount < maxIdlePulses && Math.random() < dt * 0.006) {
        spawn(Math.floor(Math.random() * neighbors.length), 3 + Math.floor(Math.random() * 4), false);
      }

      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.t += dt * p.speed;
        if (p.t < 1) continue;
        if (p.hops <= 0) {
          pulses.splice(i, 1);
          continue;
        }
        const options = neighbors[p.to].filter((n) => n !== p.from);
        if (options.length === 0) {
          pulses.splice(i, 1);
          continue;
        }
        p.from = p.to;
        p.to = options[Math.floor(Math.random() * options.length)];
        p.t = 0;
        p.hops -= 1;
      }
    };

    const render = (time: number) => {
      if (!start) start = time;
      const dt = last ? Math.min(time - last, 64) : 16;
      last = time;

      const animating = !reduceMotion && !drag.active;
      if (animating) {
        view.yaw += dt * 0.00009;
        view.pitch += (BASE_PITCH - view.pitch) * 0.02;
      }
      const intro = reduceMotion ? 1 : Math.min(1, (time - start) / 1800);
      const ease = 1 - Math.pow(1 - intro, 3);

      if (!visible || (reduceMotion && !dirtyRef.current) || size.w === 0) {
        frame = requestAnimationFrame(render);
        return;
      }
      dirtyRef.current = false;
      if (!reduceMotion) stepPulses(dt);

      const { nodes, pairs } = globeRef.current;
      const { w, h } = size;
      const cx = w / 2;
      const cy = h / 2;
      const scale = Math.min(w, h) * 0.4 * (0.82 + 0.18 * ease);
      const cosY = Math.cos(view.yaw);
      const sinY = Math.sin(view.yaw);
      const cosP = Math.cos(view.pitch);
      const sinP = Math.sin(view.pitch);

      ctx.clearRect(0, 0, w, h);

      // Grade de projeto técnico, desvanecendo para as bordas.
      const gridFade = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w, h) * 0.5);
      gridFade.addColorStop(0, `rgba(147, 174, 207, ${0.16 * ease})`);
      gridFade.addColorStop(1, 'rgba(147, 174, 207, 0)');
      ctx.strokeStyle = gridFade;
      ctx.lineWidth = 1;
      const step = Math.max(24, Math.round(Math.min(w, h) / 14));
      ctx.beginPath();
      for (let gx = cx % step; gx < w; gx += step) {
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, h);
      }
      for (let gy = cy % step; gy < h; gy += step) {
        ctx.moveTo(0, gy);
        ctx.lineTo(w, gy);
      }
      ctx.stroke();

      // Anel graduado, como transferidor, girando em sentido oposto ao globo.
      const ringR = scale * 1.16;
      ctx.strokeStyle = `rgba(147, 174, 207, ${0.28 * ease})`;
      ctx.beginPath();
      ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      for (let i = 0; i < 72; i++) {
        const a = (i * Math.PI) / 36 - view.yaw * 0.5;
        const len = i % 6 === 0 ? 8 : 4;
        ctx.moveTo(cx + Math.cos(a) * ringR, cy + Math.sin(a) * ringR);
        ctx.lineTo(cx + Math.cos(a) * (ringR + len), cy + Math.sin(a) * (ringR + len));
      }
      ctx.stroke();

      const halo = ctx.createRadialGradient(cx, cy, scale * 0.2, cx, cy, scale * 1.35);
      halo.addColorStop(0, `rgba(58, 97, 148, ${0.38 * ease})`);
      halo.addColorStop(1, 'rgba(58, 97, 148, 0)');
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, w, h);

      const projected = nodes.map((n) => {
        const x1 = n.x * cosY + n.z * sinY;
        const z1 = -n.x * sinY + n.z * cosY;
        const y2 = n.y * cosP - z1 * sinP;
        const z2 = n.y * sinP + z1 * cosP;
        const persp = 3 / (3 - z2);
        return { sx: cx + x1 * scale * persp, sy: cy + y2 * scale * persp, depth: (z2 + 1) / 2, z: z2 };
      });

      // Trilhas
      ctx.lineWidth = 1;
      for (const [i, j] of pairs) {
        const depth = (projected[i].depth + projected[j].depth) / 2;
        ctx.strokeStyle = `rgba(147, 174, 207, ${(0.05 + 0.3 * depth * depth) * ease})`;
        ctx.beginPath();
        ctx.moveTo(projected[i].sx, projected[i].sy);
        ctx.lineTo(projected[j].sx, projected[j].sy);
        ctx.stroke();
      }

      // Vias (pontos de solda) e coleta dos departamentos
      const hotspots: Hotspot[] = [];
      ctx.lineWidth = 1;
      nodes.forEach((n, i) => {
        const p = projected[i];
        if (n.dept) {
          hotspots.push({ dept: n.dept, x: p.sx, y: p.sy, z: p.z });
          return;
        }
        const alpha = (0.2 + 0.6 * p.depth) * ease;
        const r = 1.6 + 1.4 * p.depth;
        ctx.strokeStyle = `rgba(195, 211, 232, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = `rgba(195, 211, 232, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, 0.7, 0, Math.PI * 2);
        ctx.fill();
      });

      // Pulsos de sinal percorrendo as trilhas
      for (const pulse of pulses) {
        const a = projected[pulse.from];
        const b = projected[pulse.to];
        const depth = (a.depth + b.depth) / 2;
        const alpha = (0.35 + 0.65 * depth) * ease;
        const tail = Math.max(0, pulse.t - 0.35);
        const px = a.sx + (b.sx - a.sx) * pulse.t;
        const py = a.sy + (b.sy - a.sy) * pulse.t;
        const tx = a.sx + (b.sx - a.sx) * tail;
        const ty = a.sy + (b.sy - a.sy) * tail;
        const color = pulse.hot ? '255, 236, 170' : '227, 185, 79';

        ctx.strokeStyle = `rgba(${color}, ${alpha * 0.8})`;
        ctx.lineWidth = pulse.hot ? 2 : 1.5;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(px, py);
        ctx.stroke();

        const glow = ctx.createRadialGradient(px, py, 0, px, py, 7);
        glow.addColorStop(0, `rgba(${color}, ${alpha})`);
        glow.addColorStop(1, `rgba(${color}, 0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(px, py, 7, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.lineWidth = 1;

      // Departamentos como chips, por último para ficarem sobre as trilhas.
      hotspots.sort((a, b) => a.z - b.z);
      ctx.textAlign = 'center';
      ctx.font = '600 11px "Inter Variable", system-ui, sans-serif';
      for (const hs of hotspots) {
        const depth = (hs.z + 1) / 2;
        const isActive = hs.dept.id === activeRef.current;
        const alpha = (0.4 + 0.6 * depth) * ease;
        const side = 15 + 7 * depth + (isActive ? 4 : 0);
        const half = side / 2;

        const glow = ctx.createRadialGradient(hs.x, hs.y, 0, hs.x, hs.y, side * 1.6);
        glow.addColorStop(0, `rgba(227, 185, 79, ${(isActive ? 0.5 : 0.28) * alpha})`);
        glow.addColorStop(1, 'rgba(227, 185, 79, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(hs.x, hs.y, side * 1.6, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = `rgba(239, 212, 136, ${alpha * 0.85})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        for (const k of [-1, 0, 1]) {
          const py = hs.y + k * half * 0.55;
          ctx.moveTo(hs.x - half - 3, py);
          ctx.lineTo(hs.x - half, py);
          ctx.moveTo(hs.x + half, py);
          ctx.lineTo(hs.x + half + 3, py);
        }
        ctx.stroke();

        ctx.fillStyle = `rgba(13, 31, 56, ${0.94 * alpha})`;
        ctx.strokeStyle = `rgba(239, 212, 136, ${alpha})`;
        ctx.beginPath();
        ctx.rect(hs.x - half, hs.y - half, side, side);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = `rgba(255, 236, 170, ${alpha})`;
        drawGlyph(ctx, hs.dept.id, hs.x, hs.y, side * 0.27);

        if (isActive) {
          const pulse = 1 + 0.12 * Math.sin(time / 260);
          const ring = (half + 6) * pulse;
          ctx.strokeStyle = 'rgba(239, 212, 136, 0.9)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.rect(hs.x - ring, hs.y - ring, ring * 2, ring * 2);
          ctx.stroke();

          // Mira e coordenadas, no estilo de desenho técnico.
          ctx.strokeStyle = 'rgba(239, 212, 136, 0.3)';
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 4]);
          ctx.beginPath();
          ctx.moveTo(0, hs.y);
          ctx.lineTo(w, hs.y);
          ctx.moveTo(hs.x, 0);
          ctx.lineTo(hs.x, h);
          ctx.stroke();
          ctx.setLineDash([]);

          const right = hs.x < cx;
          ctx.font = '500 10px ui-monospace, Consolas, monospace';
          ctx.textAlign = right ? 'left' : 'right';
          ctx.fillStyle = 'rgba(239, 212, 136, 0.85)';
          ctx.fillText(
            `X ${(((hs.x - cx) / scale) * 50).toFixed(1)}  Y ${(((cy - hs.y) / scale) * 50).toFixed(1)}`,
            hs.x + (right ? half + 10 : -half - 10),
            hs.y + half + 16
          );
          ctx.textAlign = 'center';
          ctx.font = '600 11px "Inter Variable", system-ui, sans-serif';
        }

        if (hs.z > 0.05) {
          ctx.fillStyle = `rgba(255, 255, 255, ${0.9 * alpha})`;
          ctx.fillText(hs.dept.code, hs.x, hs.y - half - 7);
        }
      }
      ctx.lineWidth = 1;
      hotspotsRef.current = hotspots;
      if (activeRef.current || pulses.length > 0) dirtyRef.current = true;

      frame = requestAnimationFrame(render);
    };

    const hitTest = (clientX: number, clientY: number, touch: boolean) => {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const reach = touch ? 30 : 22;
      let best: Hotspot | null = null;
      let bestDist = reach;
      for (const hs of hotspotsRef.current) {
        if (hs.z < -0.15) continue;
        const dist = Math.hypot(hs.x - x, hs.y - y);
        if (dist < bestDist) {
          best = hs;
          bestDist = dist;
        }
      }
      return best;
    };

    const onPointerDown = (e: PointerEvent) => {
      drag.active = true;
      drag.moved = 0;
      drag.x = e.clientX;
      drag.y = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (drag.active) {
        const dx = e.clientX - drag.x;
        const dy = e.clientY - drag.y;
        drag.x = e.clientX;
        drag.y = e.clientY;
        drag.moved += Math.abs(dx) + Math.abs(dy);
        view.yaw += dx * 0.006;
        view.pitch = Math.max(-0.9, Math.min(0.9, view.pitch + dy * 0.006));
        dirtyRef.current = true;
        return;
      }
      if (e.pointerType === 'mouse') {
        const hit = hitTest(e.clientX, e.clientY, false);
        canvas.style.cursor = hit ? 'pointer' : 'grab';
        if (hit) activate(hit.dept.id);
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      const wasDrag = drag.moved > 6;
      drag.active = false;
      dirtyRef.current = true;
      if (wasDrag) return;
      const touch = e.pointerType !== 'mouse';
      const hit = hitTest(e.clientX, e.clientY, touch);
      if (!hit) {
        if (touch) activate(null);
        return;
      }
      // No toque, o primeiro gesto mostra o nome e o segundo abre.
      if (!touch || activeRef.current === hit.dept.id) onOpenRef.current(hit.dept);
      else activate(hit.dept.id);
    };

    const onPointerCancel = () => {
      drag.active = false;
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(wrap);
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      dirtyRef.current = true;
    });
    visibilityObserver.observe(wrap);

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerCancel);
    resize();
    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerCancel);
    };
  }, [activate, pointCount]);

  return (
    <div>
      <div ref={wrapRef} className="relative mx-auto aspect-square w-full max-w-[min(34rem,86vw)]">
        <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full cursor-grab" style={{ touchAction: 'pan-y' }} />
      </div>

      {/* Alternativa por teclado e leitor de tela ao globo interativo. */}
      <ul className="sr-only">
        {departments.map((dept) => (
          <li key={dept.id}>
            <button type="button" onClick={() => onOpen(dept)}>Abrir departamento: {dept.name}</button>
          </li>
        ))}
      </ul>

      <div className="mx-auto mt-2 flex min-h-[4.5rem] max-w-md flex-col items-center text-center" aria-live="polite">
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
  );
}
