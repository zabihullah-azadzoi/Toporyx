import {
  Database,
  Server,
  Shield,
  Network,
  MonitorSmartphone,
  Layers,
  Cpu,
  Wifi,
  Globe,
} from 'lucide-react';

export const COLORS = {
  cyan: { name: 'cyan', hex: '#22d3ee', bg: 'rgba(8, 27, 38, 0.6)', text: 'text-cyan-200' },
  indigo: { name: 'indigo', hex: '#818cf8', bg: 'rgba(12, 16, 44, 0.6)', text: 'text-indigo-200' },
  emerald: { name: 'emerald', hex: '#34d399', bg: 'rgba(2, 24, 16, 0.6)', text: 'text-emerald-200' },
  red: { name: 'red', hex: '#ef4444', bg: 'rgba(38, 9, 9, 0.6)', text: 'text-red-200' },
  amber: { name: 'amber', hex: '#fbbf24', bg: 'rgba(38, 24, 4, 0.6)', text: 'text-amber-200' },
  fuchsia: { name: 'fuchsia', hex: '#e879f9', bg: 'rgba(38, 9, 38, 0.6)', text: 'text-fuchsia-200' },
  lime: { name: 'lime', hex: '#a3e635', bg: 'rgba(13, 25, 4, 0.6)', text: 'text-lime-200' },
  orange: { name: 'orange', hex: '#fb923c', bg: 'rgba(38, 18, 4, 0.6)', text: 'text-orange-200' },
  slate: { name: 'slate', hex: '#94a3b8', bg: 'rgba(15, 23, 42, 0.6)', text: 'text-slate-200' },
  white: { name: 'white', hex: '#ffffff', bg: 'rgba(255, 255, 255, 0.1)', text: 'text-white' },
  black: { name: 'black', hex: '#000000', bg: 'rgba(0, 0, 0, 0.8)', text: 'text-slate-300' },
};

export const BG_THEMES = [
  { id: 'cyberpunk', bgClass: 'bg-[#020617]', bgHex: '#020617', gridColor: '#4f46e5', glow1: 'bg-indigo-900/10', glow2: 'bg-red-900/10', light: false },
  { id: 'neon', bgClass: 'bg-[#000000]', bgHex: '#000000', gridColor: '#22d3ee', glow1: 'bg-cyan-900/10', glow2: 'bg-fuchsia-900/10', light: false },
  { id: 'matrix', bgClass: 'bg-[#051005]', bgHex: '#051005', gridColor: '#16a34a', glow1: 'bg-green-900/10', glow2: 'bg-emerald-900/10', light: false },
  { id: 'blueprint', bgClass: 'bg-[#0a192f]', bgHex: '#0a192f', gridColor: '#3b82f6', glow1: 'bg-blue-900/10', glow2: 'bg-sky-900/10', light: false },
  { id: 'pure-black', bgClass: 'bg-black', bgHex: '#000000', gridColor: '#333333', glow1: 'hidden', glow2: 'hidden', light: false },
  { id: 'pure-white', bgClass: 'bg-white', bgHex: '#ffffff', gridColor: '#e2e8f0', glow1: 'hidden', glow2: 'hidden', light: true },
];

export const SYSTEM_ICONS = {
  database: Database,
  server: Server,
  proxy: Shield,
  lb: Network,
  client: MonitorSmartphone,
  queue: Layers,
  cpu: Cpu,
  wifi: Wifi,
  globe: Globe,
};

export const RESIZE_HANDLES = [
  { dir: 'nw', cursor: 'nwse-resize', top: -6, left: -6 },
  { dir: 'n', cursor: 'ns-resize', top: -6, left: 'calc(50% - 6px)' },
  { dir: 'ne', cursor: 'nesw-resize', top: -6, right: -6 },
  { dir: 'e', cursor: 'ew-resize', top: 'calc(50% - 6px)', right: -6 },
  { dir: 'se', cursor: 'nwse-resize', bottom: -6, right: -6 },
  { dir: 's', cursor: 'ns-resize', bottom: -6, left: 'calc(50% - 6px)' },
  { dir: 'sw', cursor: 'nesw-resize', bottom: -6, left: -6 },
  { dir: 'w', cursor: 'ew-resize', top: 'calc(50% - 6px)', left: -6 },
];
