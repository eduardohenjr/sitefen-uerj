import {
  Briefcase,
  Building2,
  Cog,
  Cpu,
  Leaf,
  Map,
  Zap,
  Landmark,
  type LucideIcon,
} from 'lucide-react';

export function formatDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

export function formatDateShort(iso: string): { day: string; month: string } {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return { day: '', month: iso };
  return {
    day: date.toLocaleDateString('pt-BR', { day: '2-digit' }),
    month: date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
  };
}

// O campo `icon` dos JSONs de departamentos nem sempre combina com o curso (ex.: DESC usava "Sun").
const departmentIcons: Record<string, LucideIcon> = {
  carto: Map,
  dcct: Building2,
  dein: Briefcase,
  desc: Cpu,
  desma: Leaf,
  detel: Zap,
  ele: Zap,
  estr: Landmark,
  mecan: Cog,
};

export function departmentIcon(id: string): LucideIcon {
  return departmentIcons[id] ?? Building2;
}
