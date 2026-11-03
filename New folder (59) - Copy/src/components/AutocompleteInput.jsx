import React, { useState, useRef, useEffect, useMemo } from 'react';

export default function AutocompleteInput({ id, placeholder, value, onChange, options, required, className }) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Filter options based on input
  const filteredOptions = useMemo(() => {
    if (!value) return options.slice(0, 30);
    const lower = value.toLowerCase();
    return options.filter(o => o.toLowerCase().includes(lower)).slice(0, 30);
  }, [value, options]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div style={{ position: 'relative' }} ref={wrapperRef}>
      <input
        id={id}
        type="text"
        className={className || "form-input"}
        placeholder={placeholder}
        value={value}
        onChange={e => {
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        required={required}
        autoComplete="off"
      />
      {isOpen && filteredOptions.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          maxHeight: 250,
          overflowY: 'auto',
          background: 'var(--bg-card)',
          zIndex: 50,
          border: '1px solid var(--border-glass)',
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow-lg)',
          marginTop: 4
        }}>
          {filteredOptions.map((opt, idx) => (
            <div
              key={idx}
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
              style={{
                padding: '10px 14px',
                cursor: 'pointer',
                borderBottom: '1px solid var(--border-light)',
                fontSize: 13,
                transition: 'background 0.2s',
                fontWeight: 500
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
