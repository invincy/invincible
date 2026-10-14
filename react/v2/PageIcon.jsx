import React from 'react';

// Tiny, consistent line glyphs keep the destinations legible without button rings.
const shapes = {
  ai: <><path d="m12 2 1.9 6.1L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.9L12 2Z"/><path d="m19 17 .6 1.4L21 19l-1.4.6L19 21l-.6-1.4L17 19l1.4-.6L19 17Z"/></>,
  journal: <><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 1 4 17.5v-13Z"/><path d="M4 17.5A2.5 2.5 0 0 1 6.5 15H20M8 7h8M8 10h6"/></>,
  finance: <><path d="M3 19h18M5 16l5-5 4 3 5-8"/><path d="M15 6h4v4"/></>,
  garage: <><path d="M3 10 12 4l9 6v10H3V10Z"/><path d="M7 20v-8h10v8M7 15h10"/></>,
  creator: <><path d="m8 5 11 7-11 7V5Z"/><path d="M4 5v14"/></>,
  workday: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18M8 15h3M8 18h6"/></>,
  lic: <><path d="M12 2 20 5v6c0 5-3 8-8 11-5-3-8-6-8-11V5l8-3Z"/><path d="m9 12 2 2 4-4"/></>,
  reminders: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4"/></>,
  portfolio: <><path d="M3 20h18M6 17v-5M12 17V8M18 17V4"/><path d="M4 7 9 4l4 2 5-4"/></>,
};

export default function PageIcon({page}) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    {shapes[page]}
  </svg>;
}
