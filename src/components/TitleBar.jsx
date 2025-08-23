import React, { useEffect, useState } from "react";

export default function TitleBar({ onOptionClick }) {
  const [isMax, setIsMax] = useState(false);
  useEffect(() => {
    if (window.windowControls?.isMaximized) {
      window.windowControls.isMaximized().then(setIsMax).catch(() => {});
    }
  }, []);

  const handleToggle = async () => {
    try {
      await window.windowControls?.toggleMaximize?.();
      const v = await window.windowControls?.isMaximized?.();
      setIsMax(!!v);
    } catch {}
  };

  return (
    <div
      className="select-none"
      style={{
        WebkitAppRegion: "drag",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 12px",
        height: 40,
        background: "rgba(10, 18, 36, 0.6)",
        backdropFilter: "blur(10px)",
        color: "#fff",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontWeight: 600 }}>Mosaico</span>
        <button
          style={{ WebkitAppRegion: "no-drag", padding: "4px 8px", borderRadius: 6, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff" }}
          onClick={() => onOptionClick?.()}
        >
          Opções
        </button>
      </div>

      <div style={{ display: "flex", gap: 4 }}>
        <button style={btnStyle} onClick={() => window.windowControls?.minimize?.()} title="Minimizar">—</button>
        <button style={btnStyle} onClick={handleToggle} title={isMax ? "Restaurar" : "Maximizar"}>{isMax ? "🗗" : "🗖"}</button>
        <button style={{ ...btnStyle, color: "#fff", background: "rgba(220, 38, 38, 0.6)" }} onClick={() => window.windowControls?.close?.()} title="Fechar">×</button>
      </div>
    </div>
  );
}

const btnStyle = {
  WebkitAppRegion: "no-drag",
  padding: "2px 10px",
  borderRadius: 6,
  background: "rgba(255,255,255,0.12)",
  border: "1px solid rgba(255,255,255,0.2)",
  color: "#e5e7eb",
};
