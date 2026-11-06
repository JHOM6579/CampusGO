// src/components/MapView/Sidebar.jsx
import React, { useEffect, useRef, useState } from "react";
import "../MapView.css";

export default function Sidebar({
  menuOpen,
  toggleMenu,
  currentFloor = "terreo",
  onSelectFloor,
}) {
  const [blocoAOpen, setBlocoAOpen] = useState(false);
  const sidebarRef = useRef(null);
  const menuToggleRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const handleOutsidePointerDown = (event) => {
      const target = event.target;
      if (
        !sidebarRef.current?.contains(target) &&
        !menuToggleRef.current?.contains(target)
      ) {
        toggleMenu();
      }
    };

    document.addEventListener("pointerdown", handleOutsidePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handleOutsidePointerDown);
    };
  }, [menuOpen, toggleMenu]);

  const handleFloorClick = (floor) => {
    if (onSelectFloor) {
      onSelectFloor(floor);
    }
  };

  const handleBlocoAClick = () => {
    setBlocoAOpen((prev) => !prev);
  };

  const handleMapaClick = () => {
    if (onSelectFloor) {
      onSelectFloor("terreo");
    }
  };

  return (
    <>
      {/* BOTÃO HAMBÚRGUER */}
      <div
        ref={menuToggleRef}
        className={`menu-toggle ${menuOpen ? "open" : ""}`}
        onClick={toggleMenu}
      >
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* MENU LATERAL */}
      <aside
        ref={sidebarRef}
        className={`sidebar ${menuOpen ? "visible" : ""}`}
      >
        <img
          src="/Logo-branca-transparente.png"
          alt="CampusGO"
          className="logo"
        />
        <nav>
          <button
            type="button"
            className={currentFloor === "terreo" ? "active" : ""}
            onClick={handleMapaClick}
          >
            <img src="/mapa.png.png" onError={(e) => { e.currentTarget.src = "public/mapa.png.png"; }} alt="Mapa" />
            <span>Térreo</span>
          </button>

          {/* BOTÃO BLOCO A COM DROPDOWN */}
          <div className="sidebar-dropdown-group">
            <button
              type="button"
              className={`sidebar-dropdown-trigger ${blocoAOpen ? "expanded" : ""} ${currentFloor === "4" || currentFloor === "7" ? "active" : ""}`}
              onClick={handleBlocoAClick}
            >
              <div className="sidebar-btn-content">
                <svg
                  className="sidebar-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="4" y="2" width="16" height="20" rx="2" />
                  <line x1="9" y1="6" x2="9" y2="6.01" strokeWidth="2.5" />
                  <line x1="15" y1="6" x2="15" y2="6.01" strokeWidth="2.5" />
                  <line x1="9" y1="10" x2="9" y2="10.01" strokeWidth="2.5" />
                  <line x1="15" y1="10" x2="15" y2="10.01" strokeWidth="2.5" />
                  <line x1="9" y1="14" x2="9" y2="14.01" strokeWidth="2.5" />
                  <line x1="15" y1="14" x2="15" y2="14.01" strokeWidth="2.5" />
                  <path d="M10 22v-4h4v4" />
                </svg>
                <span>Bloco A</span>
              </div>
              <svg
                className={`dropdown-arrow ${blocoAOpen ? "open" : ""}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {/* DROPDOWN OPTIONS: 4 Andar e 7 Andar */}
            <div className={`sidebar-dropdown ${blocoAOpen ? "open" : ""}`}>
              <button
                type="button"
                className={`dropdown-item ${currentFloor === "4" ? "active" : ""}`}
                onClick={() => handleFloorClick("4")}
              >
                <span className="dropdown-item-bullet">•</span>
                <span>4 Andar</span>
              </button>
              <button
                type="button"
                className={`dropdown-item ${currentFloor === "7" ? "active" : ""}`}
                onClick={() => handleFloorClick("7")}
              >
                <span className="dropdown-item-bullet">•</span>
                <span>7 Andar</span>
              </button>
            </div>
          </div>

        </nav>
      </aside>
    </>
  );
}
