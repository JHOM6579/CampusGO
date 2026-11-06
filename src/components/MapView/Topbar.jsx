import React, { useMemo, useState } from "react";
import VirtualKeyboard from "./VirtualKeyboard";
import { mapData, mapData4Andar, mapData7Andar } from "../../utils/mockData";
import "../MapView.css";

const FLOOR_MAPS = [
  { floor: "terreo", label: "Térreo", data: mapData },
  { floor: "4", label: "4º andar", data: mapData4Andar },
  { floor: "7", label: "7º andar", data: mapData7Andar },
];

const NODE_CONTEXT = {
  "terreo:n3": "Bloco A",
  "terreo:n14": "Bloco B",
};

function normalizeText(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR");
}

export default function Topbar({ user, menuOpen, onLogout, onSelectDestination }) {
  const [searchValue, setSearchValue] = useState("");
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(0);

  function handleSearchChange(value) {
    setSearchValue(value);
    setIsSuggestionsOpen(true);
    setActiveSuggestion(0);
  }

  const suggestions = useMemo(() => {
    const query = normalizeText(searchValue.trim());
    if (!query) return [];

    return FLOOR_MAPS.flatMap(({ floor, label, data }) =>
      Object.values(data.nodes)
        .filter((node) => node.name && node.id !== "n0")
        .map((node) => {
          const context = NODE_CONTEXT[`${floor}:${node.id}`];
          const title = `${node.name} · ${label}${context ? ` — ${context}` : ""}`;
          return { ...node, floor, title, searchText: normalizeText(`${node.name} ${label} ${context || ""}`) };
        }),
    )
      .filter((node) => node.searchText.includes(query))
      .slice(0, 8);
  }, [searchValue]);

  function selectSuggestion(suggestion) {
    setSearchValue(suggestion.title);
    setIsSuggestionsOpen(false);
    setIsKeyboardOpen(false);
    onSelectDestination(suggestion);
  }

  function handleSearchKeyDown(event) {
    if (event.key === "Escape") {
      setIsSuggestionsOpen(false);
      return;
    }

    if (!suggestions.length) return;

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setIsSuggestionsOpen(true);
      setActiveSuggestion((current) => (current + (event.key === "ArrowDown" ? 1 : -1) + suggestions.length) % suggestions.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      selectSuggestion(suggestions[activeSuggestion] || suggestions[0]);
    }
  }

  return (
    <header className={`topbar ${menuOpen ? "shifted" : ""}`}>
      <div className="topbar-content">
        <div className="user-info">
          👋 Olá, {user?.name || "Visitante"} {user?.matricula ? `(${user.matricula})` : ""}
        </div>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Pesquise o local que você procura..."
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            onFocus={() => {
              setIsKeyboardOpen(true);
              setIsSuggestionsOpen(Boolean(searchValue.trim()));
            }}
            onClick={() => setIsKeyboardOpen(true)}
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={isSuggestionsOpen && suggestions.length > 0}
            aria-controls="campus-search-suggestions"
          />
          <button
            type="button"
            aria-label="Selecionar primeiro resultado"
            onClick={() => suggestions[0] && selectSuggestion(suggestions[0])}
          >
            🔍
          </button>
          {isSuggestionsOpen && suggestions.length > 0 && (
            <ul id="campus-search-suggestions" className="search-suggestions" role="listbox">
              {suggestions.map((suggestion, index) => (
                <li key={`${suggestion.floor}:${suggestion.id}`} role="presentation">
                  <button
                    type="button"
                    className={index === activeSuggestion ? "active" : ""}
                    role="option"
                    aria-selected={index === activeSuggestion}
                    onMouseEnter={() => setActiveSuggestion(index)}
                    onClick={() => selectSuggestion(suggestion)}
                  >
                    <span>{suggestion.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button className="logout-btn" onClick={onLogout}>
          🚪 Sair
        </button>
      </div>

      {isKeyboardOpen && <VirtualKeyboard value={searchValue} onChange={handleSearchChange} onClose={() => setIsKeyboardOpen(false)} />}
    </header>
  );
}
