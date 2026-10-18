// src/components/MapView/CampusMapViewer.jsx
// ──────────────────────────────────────────────
// Componente premium que renderiza o mapa SVG vetorial,
// exibe pins coloridos por categoria, destaca o totem ativo
// ("Você está aqui") com animação de pulso, e desenha a rota
// animada quando um destino é selecionado.
// ──────────────────────────────────────────────

import React, { useRef, useEffect, useState, useMemo, useCallback } from "react";
import MapSVG from "../assets/CampusGoMap.svg?react";
import "./CampusMapViewer.css";

// ── Constantes ────────────────────────────────────────────────
const TOTEM_NODE_ID = "n0"; // Nó fixo do quiosque
const SVG_VIEWBOX = "0 0 1289 810"; // Viewbox alinhado à planta-baixa

// ── Categorias de POI ─────────────────────────────────────────
// Mapeia id de nó → { category, icon }
const NODE_CATEGORIES = {
  n0: { category: "totem", icon: "📍", label: "Totem" },
  n1: { category: "entrada", icon: "🚪", label: "Entrada" },
  n2: { category: "elevador", icon: "🛗", label: "Elevadores" },
  n3: { category: "banheiro", icon: "🚻", label: "Banheiros" },
  n4: { category: "auditorio", icon: "🎓", label: "Auditório" },
  n5: { category: "biblioteca", icon: "📚", label: "Biblioteca" },
  x6: { category: "cantina", icon: "🍽️", label: "Cantina" },
  n7: { category: "alimentacao", icon: "🍔", label: "Alimentação" },
  n8: { category: "social", icon: "☕", label: "Espaço Social" },
  n9: { category: "bloco", icon: "🏢", label: "Blocos" },
  n10: { category: "igreja", icon: "⛪", label: "Igreja" },
  n11: { category: "estacionamento", icon: "🅿️", label: "Estacionamento" },
  n12: { category: "area-verde", icon: "🌿", label: "Área verde" },
  n13: { category: "pos", icon: "🎓", label: "Pós-graduação" },
  n14: { category: "banheiro", icon: "🚻", label: "Banheiros" },
  n15: { category: "elevador", icon: "🛗", label: "Elevadores" },
  sA1: { category: "sala", icon: "🏫", label: "Salas" },
  sB1: { category: "sala", icon: "🏫", label: "Salas" },
};

// Cores da legenda (precisa casar com o CSS)
const CATEGORY_COLORS = {
  entrada: "#3b82f6",
  elevador: "#8b5cf6",
  banheiro: "#06b6d4",
  auditorio: "#f59e0b",
  biblioteca: "#10b981",
  cantina: "#ef4444",
  alimentacao: "#f97316",
  social: "#ec4899",
  bloco: "#6366f1",
  igreja: "#a855f7",
  estacionamento: "#64748b",
  "area-verde": "#22c55e",
  pos: "#0f766e",
  sala: "#0ea5e9",
  default: "#94a3b8",
};

function getCategoryInfo(nodeId) {
  return NODE_CATEGORIES[nodeId] || { category: "default", icon: "📌", label: "Outro" };
}

// ══════════════════════════════════════════════════
// SUB-COMPONENTE: PinMarker
// Renderiza um "map pin" estilizado (drop shape) com
// ícone interno e label flutuante.
// ══════════════════════════════════════════════════
function PinMarker({ node, isSelected, onClick }) {
  const { category, icon } = getCategoryInfo(node.id);
  const textRef = useRef(null);
  const [labelWidth, setLabelWidth] = useState(60);

  useEffect(() => {
    if (textRef.current) {
      const bbox = textRef.current.getBBox();
      setLabelWidth(bbox.width + 14);
    }
  }, [node.name]);

  const classNames = ["campus-pin", `campus-pin--${category}`, isSelected ? "campus-pin--selected" : ""].filter(Boolean).join(" ");

  return (
    <g transform={`translate(${node.x}, ${node.y})`}>
      <g
        className={classNames}
        onClick={(e) => {
          e.stopPropagation();
          onClick(node);
        }}
      >
        {/* Sombra elíptica projetada */}
        <ellipse className="campus-pin__shadow" cx={0} cy={4} rx={7} ry={3} />

        {/* Corpo do pin (drop shape) — path centrado no topo */}
        <path
          className="campus-pin__body"
          d="M0,-24 C-6.5,-24 -12,-19 -12,-13 C-12,-5.5 0,2 0,2 C0,2 12,-5.5 12,-13 C12,-19 6.5,-24 0,-24 Z"
        />

        {/* Círculo interno branco */}
        <circle className="campus-pin__icon-bg" cx={0} cy={-14} r={6} />

        {/* Ícone emoji */}
        <text className="campus-pin__icon-text" x={0} y={-13.5}>
          {icon}
        </text>

        {/* Label flutuante abaixo do pin */}
        <rect className="campus-pin__label-bg" x={-labelWidth / 2} y={7} width={labelWidth} height={16} rx={4} ry={4} />
        <text ref={textRef} className="campus-pin__label-text" x={0} y={17}>
          {node.name}
        </text>
      </g>
    </g>
  );
}

// ══════════════════════════════════════════════════
// SUB-COMPONENTE: TotemMarker
// Marca fixa "Você está aqui" com animação de pulso concêntrico
// ══════════════════════════════════════════════════
function TotemMarker({ node }) {
  return (
    <g className="campus-totem" transform={`translate(${node.x}, ${node.y})`}>
      {/* Ondas de pulso concêntrico (3 anéis defasados) */}
      <circle className="campus-totem__pulse-ring" cx={0} cy={0} r={8} />
      <circle className="campus-totem__pulse-ring campus-totem__pulse-ring--delayed" cx={0} cy={0} r={8} />
      <circle className="campus-totem__pulse-ring campus-totem__pulse-ring--delayed2" cx={0} cy={0} r={8} />

      {/* Glow "respiro" */}
      <circle className="campus-totem__glow" cx={0} cy={0} r={16} />

      {/* Círculo central sólido */}
      <circle className="campus-totem__core" cx={0} cy={0} r={8} />

      {/* Ponto interno branco */}
      <circle className="campus-totem__dot" cx={0} cy={0} r={3} />

      {/* Balão "Você está aqui" */}
      {/* Seta do balão apontando para baixo */}
      <polygon className="campus-totem__label-arrow" points="-5,-14 5,-14 0,-10" />
      {/* Fundo do balão */}
      <rect className="campus-totem__label-bg" x={-48} y={-32} width={96} height={20} rx={6} ry={6} />
      {/* Texto do balão */}
      <text className="campus-totem__label-text" x={0} y={-19}>
        📍 Você está aqui
      </text>
    </g>
  );
}

// ══════════════════════════════════════════════════
// SUB-COMPONENTE: RoutePath
// Desenha a rota animada com halo, gradiente e setas
// ══════════════════════════════════════════════════
function RoutePath({ path, nodes }) {
  if (!path || path.length < 2) return null;

  const points = path.map((n) => `${n.x},${n.y}`).join(" ");

  // Marcador de destino (último nó da rota)
  const dest = path[path.length - 1];

  return (
    <g>
      {/* Halo externo (mais largo, transparente) */}
      <polyline className="campus-route__halo" points={points} />

      {/* Linha principal com gradiente */}
      <polyline className="campus-route__line" points={points} />

      {/* Anel tracejado giratório no destino */}
      <g transform={`translate(${dest.x}, ${dest.y})`}>
        <circle className="campus-destination__ring" cx={0} cy={0} r={16} style={{ transformOrigin: "0 0" }} />
      </g>
    </g>
  );
}

// ══════════════════════════════════════════════════
// SUB-COMPONENTE: Legend
// Legenda glassmorphism exibindo as categorias de POI
// ══════════════════════════════════════════════════
function Legend({ nodes }) {
  // Constrói apenas as categorias que estão presentes no mapa
  const categories = useMemo(() => {
    const seen = new Set();
    const result = [];

    Object.values(nodes)
      .filter((n) => !!n.name && n.id !== TOTEM_NODE_ID)
      .forEach((n) => {
        const { category, label } = getCategoryInfo(n.id);
        if (!seen.has(category)) {
          seen.add(category);
          result.push({
            category,
            label,
            color: CATEGORY_COLORS[category] || CATEGORY_COLORS.default,
          });
        }
      });

    return result;
  }, [nodes]);

  return (
    <div className="campus-legend">
      <div className="campus-legend__title">Legenda</div>
      <ul className="campus-legend__list">
        {/* Totem sempre primeiro */}
        <li className="campus-legend__item">
          <span className="campus-legend__dot" style={{ background: "#00b894" }} />
          Você está aqui
        </li>
        {categories.map(({ category, label, color }) => (
          <li key={category} className="campus-legend__item">
            <span className="campus-legend__dot" style={{ background: color }} />
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL: CampusMapViewer
// ══════════════════════════════════════════════════════════════
export default function CampusMapViewer({
  nodes,
  edges,
  path,
  selected,
  onSelectNode,
  offset,
  zoom,
  isPanning,
  handleWheel,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  children,
}) {
  // ── Nós visíveis (com name) separados do totem ──────────────
  const visiblePins = useMemo(() => Object.values(nodes).filter((n) => !!n.name && n.id !== TOTEM_NODE_ID), [nodes]);

  const totemNode = nodes[TOTEM_NODE_ID];

  // ── Estilo compartilhado de transformação ───────────────────
  const transformStyle = useMemo(
    () => ({
      transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
      transformOrigin: "top left",
      transition: isPanning ? "none" : "transform 0.15s ease-out",
    }),
    [offset.x, offset.y, zoom, isPanning],
  );

  return (
    <div
      className="campus-map-viewer"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* ─── Planta baixa SVG ───────────────────────────────── */}
      <MapSVG className="campus-map-viewer__blueprint" style={{ ...transformStyle, width: "100%", height: "auto" }} />

      {/* ─── Overlay SVG (nós + rota) ───────────────────────── */}
      <svg viewBox={SVG_VIEWBOX} className="campus-map-viewer__overlay" style={transformStyle}>
        {/* Definições reutilizáveis: gradientes, filtros, etc. */}
        <defs className="campus-map-viewer__defs">
          {/* Gradiente da rota */}
          <linearGradient id="campusRouteGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00b894" />
            <stop offset="50%" stopColor="#00d2a0" />
            <stop offset="100%" stopColor="#55efc4" />
          </linearGradient>

          {/* Sombra dos pins */}
          <filter id="pinDropShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor="rgba(0,0,0,0.18)" />
          </filter>
        </defs>

        {/* ─── Rota animada (renderizada abaixo dos pins) ───── */}
        <RoutePath path={path} nodes={nodes} />

        {/* ─── Pins dos POIs (categorias) ───────────────────── */}
        {visiblePins.map((node) => (
          <PinMarker key={node.id} node={node} isSelected={selected?.id === node.id} onClick={onSelectNode} />
        ))}

        {/* ─── Totem "Você está aqui" (sempre por cima) ─────── */}
        {totemNode && <TotemMarker node={totemNode} />}
      </svg>

      {/* ─── Legenda glassmorphism ──────────────────────────── */}
      <Legend nodes={nodes} />

      {/* ─── Painéis filhos (InfoPanel, SchedulePanel, etc.) ─ */}
      {children}
    </div>
  );
}
