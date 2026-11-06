import React, { useEffect, useState, useRef } from "react";
import { mapData, mapData4Andar, mapData7Andar } from "../utils/mockData";
import { calculateRoute } from "../utils/routing";
// import PresencePopup from "./MapView/PresencePopup";
import InfoPanel from "./MapView/InfoPanel";
import Sidebar from "./MapView/Sidebar";
import Topbar from "./MapView/Topbar";
import CampusMapViewer from "./MapView/CampusMapViewer";
import { descriptionNodes } from "../utils/descriptionNodes";

import "./MapView.css";

export default function MapView({ user, onLogout }) {
  const [selected, setSelected] = useState(null);
  const [path, setPath] = useState([]);
  const [floorTransition, setFloorTransition] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentFloor, setCurrentFloor] = useState("terreo");
  // const [showPresencePopup, setShowPresencePopup] = useState(false);

  const [zoom, setZoom] = useState(0.7);
  const [offset, setOffset] = useState({ x: +300, y: +40 });

  const viewerRef = useRef(null);
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;

  const isPanning = useRef(false);
  const startPan = useRef({ x: 0, y: 0 });

  function clampMapOffset(nextOffset, nextZoom) {
    const viewer = viewerRef.current;
    const viewport = viewer?.querySelector(".campus-map-stage");
    const map = viewer?.querySelector(".campus-map-viewer__blueprint");

    if (!viewport || !map) return nextOffset;

    const viewportWidth = viewport.clientWidth;
    const viewportHeight = viewport.clientHeight;
    const mapBounds = map.getBoundingClientRect();
    const mapWidth = mapBounds.width / zoomRef.current;
    const mapHeight = mapBounds.height / zoomRef.current;
    const edgeGutter = 24;

    const clampAxis = (value, viewportSize, mapSize) => {
      const scaledSize = mapSize * nextZoom;
      if (scaledSize + edgeGutter * 2 <= viewportSize) {
        return (viewportSize - scaledSize) / 2;
      }

      return Math.min(edgeGutter, Math.max(viewportSize - scaledSize - edgeGutter, value));
    };

    return {
      x: clampAxis(nextOffset.x, viewportWidth, mapWidth),
      y: clampAxis(nextOffset.y, viewportHeight, mapHeight),
    };
  }

  useEffect(() => {
    const viewer = viewerRef.current;
    const viewport = viewer?.querySelector(".campus-map-stage");
    if (!viewport) return undefined;

    const constrainMap = () => {
      setOffset((current) => clampMapOffset(current, zoomRef.current));
    };
    const observer = new ResizeObserver(constrainMap);

    observer.observe(viewport);
    constrainMap();

    return () => observer.disconnect();
  }, []);

  const [isAccessibleOnly, setIsAccessibleOnly] = useState(false); // Pode ser ligado a um botão no UI

  function getFloorData(floor) {
    if (floor === "4") return mapData4Andar;
    if (floor === "7") return mapData7Andar;
    return mapData;
  }

  function getFloorLabel(floor) {
    if (floor === "4") return "4º andar";
    if (floor === "7") return "7º andar";
    return "Térreo";
  }

  function requestRoute(destNode, floor = currentFloor) {
    const origin = "n0"; // Ponto de partida fixo "Você está aqui"
    const routeResult = calculateRoute(origin, destNode, isAccessibleOnly, getFloorData(floor));
    setPath(routeResult.path);
  }

  function handleSearchDestination(destination) {
    if (destination.floor !== currentFloor) {
      const currentFloorData = getFloorData(currentFloor);
      const transferNodeId = currentFloor === "terreo" ? "n2" : "n0";
      const transferNode = currentFloorData.nodes[transferNodeId];
      const transferPath = calculateRoute("n0", transferNodeId, isAccessibleOnly, currentFloorData).path;

      setFloorTransition(destination);
      setSelected({
        ...transferNode,
        name: currentFloor === "terreo" ? "Elevadores — Térreo" : `Elevador — ${getFloorLabel(currentFloor)}`,
        resumo: `Ponto de transição para ${getFloorLabel(destination.floor)}. Siga até o elevador e continue para ver a rota do destino.`,
      });
      setPath(transferPath);
      return;
    }

    setFloorTransition(null);
    setSelected({
      ...destination,
      name: destination.title,
      resumo: descriptionNodes[destination.id] || "Local não mapeado",
    });
    requestRoute(destination.id, destination.floor);
  }

  function continueFloorTransition() {
    if (!floorTransition) return;

    const destination = floorTransition;
    setFloorTransition(null);
    setCurrentFloor(destination.floor);
    setSelected({
      ...destination,
      name: destination.title,
      resumo: descriptionNodes[destination.id] || "Local não mapeado",
    });
    requestRoute(destination.id, destination.floor);
  }

  function handleWheel(e) {
    e.preventDefault();
    const delta = -e.deltaY * 0.001;
    const nextZoom = Math.min(Math.max(0.79, zoom + delta), 3);
    setZoom(nextZoom);
    setOffset((current) => clampMapOffset(current, nextZoom));
  }

  function handleMouseDown(e) {
    isPanning.current = true;
    startPan.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  }

  function handleMouseMove(e) {
    if (!isPanning.current) return;
    setOffset(
      clampMapOffset(
        {
          x: e.clientX - startPan.current.x,
          y: e.clientY - startPan.current.y,
        },
        zoomRef.current,
      ),
    );
  }

  function handleMouseUp() {
    isPanning.current = false;
  }

  /*
  useEffect(() => {
    let inactivityTimer;
    let warningTimer;

    const handleActivity = () => {
      clearTimeout(inactivityTimer);
      clearTimeout(warningTimer);
      inactivityTimer = setTimeout(() => {
        setShowPresencePopup(true);
        warningTimer = setTimeout(() => {
          setShowPresencePopup(false);
          onLogout();
        }, 15000);
      }, 30000);
    };

    const events = ["mousemove", "keydown", "click", "wheel"];
    events.forEach((ev) => window.addEventListener(ev, handleActivity));

    handleActivity();

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, handleActivity));
      clearTimeout(inactivityTimer);
      clearTimeout(warningTimer);
    };
  }, [onLogout]);
  */

  return (
    <div className="map-container">
      {/* MENU LATERAL */}
      <Sidebar
        menuOpen={menuOpen}
        toggleMenu={() => setMenuOpen(!menuOpen)}
        currentFloor={currentFloor}
        onSelectFloor={(floor) => {
          setCurrentFloor(floor);
          setFloorTransition(null);
          setSelected(null);
          setPath([]);
        }}
      />

      {/* TOPO */}
      <Topbar user={user} menuOpen={menuOpen} onLogout={onLogout} onSelectDestination={handleSearchDestination} />

      {/* MAPA — CampusMapViewer Premium */}
      <CampusMapViewer
        currentFloor={currentFloor}
        hasFloorTransition={Boolean(floorTransition)}
        onResetFloor={() => setCurrentFloor("terreo")}
        nodes={mapData.nodes}
        edges={mapData.edges}
        path={path}
        selected={selected}
        onSelectNode={(node) => {
          setFloorTransition(null);
          if (selected?.id === node.id) {
            setSelected(null);
            setPath([]);
          } else {
            setSelected({
              ...node,
              resumo: descriptionNodes[node.id] || "Local não mapeado",
            });
            requestRoute(node.id);
          }
        }}
        offset={offset}
        zoom={zoom}
        viewerRef={viewerRef}
        isPanning={isPanning.current}
        handleWheel={handleWheel}
        handleMouseDown={handleMouseDown}
        handleMouseMove={handleMouseMove}
        handleMouseUp={handleMouseUp}
      >
        {/* PAINEL DE INFORMAÇÕES */}
        <InfoPanel
          selected={selected}
          path={path}
          floorTransition={floorTransition}
          onContinueFloorTransition={continueFloorTransition}
          onCancelRoute={() => {
            setFloorTransition(null);
            setSelected(null);
            setPath([]);
          }}
        />
      </CampusMapViewer>

      {/* {showPresencePopup && <PresencePopup onStay={() => setShowPresencePopup(false)} onLogout={onLogout} />} */}
    </div>
  );
}
