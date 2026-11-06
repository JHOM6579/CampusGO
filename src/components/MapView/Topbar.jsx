import React, { useState, useRef } from "react";
import VirtualKeyboard from "./VirtualKeyboard";
import "../MapView.css";

export default function Topbar({ user, menuOpen, onLogout }) {
  const [searchValue, setSearchValue] = useState("");
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  return (
    <header className={`topbar ${menuOpen ? "shifted" : ""}`}>
      <div className="topbar-content">
        <div className="user-info">
          👋 Olá, {user?.name || "Visitante"}{" "}
          {user?.matricula ? `(${user.matricula})` : ""}
        </div>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Pesquise o local que você procura..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={() => setIsKeyboardOpen(true)}
            onClick={() => setIsKeyboardOpen(true)}
          />
          <button>🔍</button>
        </div>
        <button className="logout-btn" onClick={onLogout}>
          🚪 Sair
        </button>
      </div>

      {isKeyboardOpen && (
        <VirtualKeyboard
          value={searchValue}
          onChange={setSearchValue}
          onClose={() => setIsKeyboardOpen(false)}
        />
      )}
    </header>
  );
}
