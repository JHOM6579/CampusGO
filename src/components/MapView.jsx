import React, { useEffect, useState, useRef } from "react";
import { mapData, aulas } from "../utils/mockData";
import { calculateRoute } from "../utils/routing";
import PresencePopup from "./MapView/PresencePopup";
import InfoPanel from "./MapView/InfoPanel";
import SchedulePanel from "./MapView/SchedulePanel";
import Sidebar from "./MapView/Sidebar";
import Topbar from "./MapView/Topbar";
import CampusMapViewer from "./MapView/CampusMapViewer";
import { descriptionNodes } from "../utils/descriptionNodes";

import "./MapView.css";

export default function MapView({ user, mode, onLogout }) {
  const [selected, setSelected] = useState(null);
  const [path, setPath] = useState([]);
  const [studentSchedule, setStudentSchedule] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showPresencePopup, setShowPresencePopup] = useState(false);

  const [zoom, setZoom] = useState(0.5);
  const [offset, setOffset] = useState({ x: 0, y: -450 });

  const isPanning = useRef(false);
  const startPan = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (mode === "student" && user?.matricula) {
      const aulasDoAluno = aulas.filter((aula) =>
        aula.matriculas?.includes(user.matricula)
      );
      setStudentSchedule(aulasDoAluno);
    }
  }, [mode, user]);

  const [isAccessibleOnly, setIsAccessibleOnly] = useState(false); // Pode ser ligado a um botão no UI

  function requestRoute(destNode) {
    const origin = "n0"; // Ponto de partida fixo "Você está aqui"
    const routeResult = calculateRoute(origin, destNode, isAccessibleOnly, mapData);
    setPath(routeResult.path);
  }

  function handleWheel(e) {
    e.preventDefault();
    const delta = -e.deltaY * 0.001;
    setZoom((z) => Math.min(Math.max(0.35, z + delta), 3));
  }

  function handleMouseDown(e) {
    isPanning.current = true;
    startPan.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  }

  function handleMouseMove(e) {
    if (!isPanning.current) return;
    setOffset({
      x: e.clientX - startPan.current.x,
      y: e.clientY - startPan.current.y,
    });
  }

  function handleMouseUp() {
    isPanning.current = false;
  }

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



  return (
    <div className="map-container">
      {/* MENU LATERAL */}
      <Sidebar
        menuOpen={menuOpen}
        toggleMenu={() => setMenuOpen(!menuOpen)}
      />

      {/* TOPO */}
      <Topbar user={user} menuOpen={menuOpen} onLogout={onLogout} />

      {/* MAPA — CampusMapViewer Premium */}
      <CampusMapViewer
        nodes={mapData.nodes}
        edges={mapData.edges}
        path={path}
        selected={selected}
        onSelectNode={(node) => {
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
        isPanning={isPanning.current}
        handleWheel={handleWheel}
        handleMouseDown={handleMouseDown}
        handleMouseMove={handleMouseMove}
        handleMouseUp={handleMouseUp}
      >
        {/* PAINEL DE INFORMAÇÕES */}
        <InfoPanel selected={selected} onRequestRoute={requestRoute} path={path} onCancelRoute={() => setPath([])} />

        {/* CRONOGRAMA */}
        {mode === "student" &&
          studentSchedule && studentSchedule.length > 0 && (
            <SchedulePanel
              schedule={studentSchedule}
              onSelectSala={(id, name) => {
                setSelected({
                  id,
                  name,
                  resumo: descriptionNodes[id] || "Local não mapeado",
                });
                requestRoute(id);
              }}
            />
          )}
      </CampusMapViewer>

      {/* POPUP DE PRESENÇA */}
      {showPresencePopup && (
        <PresencePopup
          onStay={() => setShowPresencePopup(false)}
          onLogout={onLogout}
        />
      )}
    </div>
  );
}
