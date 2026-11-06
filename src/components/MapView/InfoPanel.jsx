// src/components/MapView/InfoPanel.jsx
import React from "react";
import "../MapView.css"; // aproveita os estilos já existentes

export default function InfoPanel({ selected, path, onCancelRoute }) {
  return (
    <div className="info-panel">
      <h3>Informações</h3>
        {selected ? (
          <>
            <div><b>{selected.name}</b></div>
            <div>{selected.resumo}</div>
            {/* ✅ Só aparece se houver rota traçada */}
            {path && path.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <button
                  className="btn secondary"
                  onClick={onCancelRoute}
                >
                  Cancelar rota
                </button>
              </div>
            )}
          </>
        ) : (
          <div>Clique em um ponto do mapa</div>
        )}
    </div>
  );
}
