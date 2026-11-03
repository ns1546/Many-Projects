"use client";

import { useState, useRef, useEffect } from "react";

export function SearchBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 transition"
        title="Search"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-200" onClick={() => setOpen(false)} />
          <div className="fixed top-0 left-0 right-0 z-201 bg-white shadow-2xl p-6 animate-slide-in">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center gap-4 border-b-2 border-gray-900 pb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && query.trim()) {
                      window.location.href = `/shop?q=${encodeURIComponent(query)}`;
                    }
                    if (e.key === "Escape") setOpen(false);
                  }}
                  placeholder="Search products, categories..."
                  className="flex-1 text-xl font-medium outline-none placeholder-gray-300"
                />
                <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-800 font-medium text-sm">ESC</button>
              </div>
              <div className="pt-6 text-sm text-gray-400">
                <p className="font-semibold mb-3">Popular searches</p>
                <div className="flex flex-wrap gap-2">
                  {["Electronics", "Fashion", "Home & Garden", "Sports", "Books"].map((s) => (
                    <button
                      key={s}
                      onClick={() => { window.location.href = `/shop?q=${s}`; }}
                      className="px-4 py-2 bg-gray-100 rounded-full text-gray-700 hover:bg-gray-200 transition text-xs font-bold"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
