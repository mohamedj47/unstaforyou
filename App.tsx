import React, { useState } from 'react';

const PAGES = [];

export default function App() {
  const [currentUrl, setCurrentUrl] = useState(PAGES[0]?.url || '/pages/index.html');

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-slate-100">
      <header className="h-12 px-4 border-b border-slate-800 flex items-center justify-between gap-4 shrink-0">
        <span className="font-semibold text-sm truncate">Instagram</span>
        <nav className="flex items-center gap-2 overflow-x-auto">
          {PAGES.map((p) => (
            <button
              key={p.url}
              onClick={() => setCurrentUrl(p.url)}
              className={`px-2.5 py-1 text-xs rounded whitespace-nowrap ${currentUrl === p.url ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
            >
              {p.path}
            </button>
          ))}
        </nav>
      </header>
      <iframe src={currentUrl} title="Reconstructed Site" className="flex-1 w-full border-0 bg-white" />
    </div>
  );
}
