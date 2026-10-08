import React, { useRef, useEffect } from "react";

const QWERTY_LAYOUT = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
];

export default function VirtualKeyboard({ value, onChange, onClose }) {
  const keyboardRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (keyboardRef.current && !keyboardRef.current.contains(event.target)) {
        // Delay close slightly so that clicking on input doesn't immediately close it
        // but since we stop propagation on the input, this is just a safety measure.
        onClose();
      }
    }
    // Use timeout to allow the initial click event to finish propagating
    const timeout = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handleKeyClick = (key) => {
    onChange(value + key);
  };

  const handleBackspace = () => {
    onChange(value.slice(0, -1));
  };

  const handleClear = () => {
    onChange("");
  };

  const handleSpace = () => {
    onChange(value + " ");
  };

  return (
    <div
      ref={keyboardRef}
      className="fixed bottom-[-820px] left-1/2 transform -translate-x-1/2 w-full max-w-[900px] bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.3)] border border-gray-300 z-[2000] transition-opacity duration-300"
    >
      <div className="flex flex-col gap-3">
        {QWERTY_LAYOUT.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-2">
            {row.map((key) => (
              <button
                key={key}
                onClick={(e) => {
                  e.preventDefault();
                  handleKeyClick(key);
                }}
                className="h-[60px] min-w-[60px] px-3 bg-white hover:bg-gray-100 active:bg-gray-200 text-gray-800 font-semibold text-2xl rounded-xl shadow-sm border border-gray-300 transition-colors flex-1 max-w-[70px]"
              >
                {key}
              </button>
            ))}
          </div>
        ))}

        {/* Actions Row */}
        <div className="flex justify-center gap-3 mt-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              handleClear();
            }}
            className="h-[60px] px-6 bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-600 font-semibold text-xl rounded-xl shadow-sm border border-red-200 transition-colors"
          >
            Limpar Tudo
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              handleSpace();
            }}
            className="h-[60px] flex-[2] max-w-md bg-white hover:bg-gray-100 active:bg-gray-200 text-gray-800 font-semibold text-xl rounded-xl shadow-sm border border-gray-300 transition-colors"
          >
            Espaço
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              handleBackspace();
            }}
            className="h-[60px] px-6 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-800 font-semibold text-xl rounded-xl shadow-sm border border-gray-300 transition-colors flex items-center justify-center"
            aria-label="Apagar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path>
              <line x1="18" y1="9" x2="12" y2="15"></line>
              <line x1="12" y1="9" x2="18" y2="15"></line>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
