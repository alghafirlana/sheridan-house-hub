const paths = {
  arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  compass:
    '<circle cx="12" cy="12" r="9"/><path d="m15.7 8.3-2.2 5.2-5.2 2.2 2.2-5.2 5.2-2.2Z"/>',
  cpu: '<rect x="5" y="5" width="14" height="14" rx="2"/><rect x="9" y="9" width="6" height="6" rx="1"/><path d="M9 1v4m6-4v4M9 19v4m6-4v4M1 9h4m-4 6h4m14-6h4m-4 6h4"/>',
  search: '<circle cx="10.7" cy="10.7" r="6.7"/><path d="m16 16 5 5"/>',
  graduation:
    '<path d="m2 9 10-5 10 5-10 5L2 9Zm4 3v5c4 3 8 3 12 0v-5M22 9v7"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 16l9 5 9-5"/>',
  zap: '<path d="m13 2-9 12h7l-1 8 10-13h-7V2Z"/>',
  trophy:
    '<path d="M8 21h8m-4-4v4M7 4h10v7a5 5 0 0 1-10 0V4ZM7 6H4v3a4 4 0 0 0 4 4m9-7h3v3a4 4 0 0 1-4 4"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
  users:
    '<circle cx="9" cy="8" r="3.5"/><path d="M2 20a7 7 0 0 1 14 0M17 5a3.5 3.5 0 0 1 0 7m1 3a6 6 0 0 1 4 5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  check: '<path d="m5 12 4.5 4.5L19 7"/>',
  close: '<path d="M5 5 19 19M19 5 5 19"/>',
  shield:
    '<path d="m12 2 8 4v6c0 5-3 8.5-8 10-5-1.5-8-5-8-10V6l8-4Z"/><path d="m9 12 2 2 4-4"/>',
  monitor:
    '<rect x="3" y="4" width="18" height="14" rx="2"/><path d="M8 22h8m-4-4v4"/>',
  sparkle:
    '<path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2Z"/>',
  gamepad:
    '<path d="M7 6h10a5 5 0 0 1 4.9 4l.9 6.1a3.2 3.2 0 0 1-5.1 3L15 17H9l-2.7 2.1a3.2 3.2 0 0 1-5.1-3L2.1 10A5 5 0 0 1 7 6Z"/><path d="M6 12h5m-2.5-2.5v5M16 11h.01M19 13h.01"/>',
  refresh:
    '<path d="M20 7v5h-5M4 17v-5h5"/><path d="M5.5 9A8 8 0 0 1 19 7l1 5M4 12l1 5a8 8 0 0 0 13.5-2"/>',
  chevron: '<path d="m9 18 6-6-6-6"/>',
  list: '<path d="M9 6h12M9 12h12M9 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
  lock: '<rect x="4" y="10" width="16" height="12" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5m0-8h.01"/>',
  home: '<path d="m3 10 9-7 9 7v11H3V10Zm6 11v-8h6v8"/>',
};
export function icon(name, size = 20, className = "") {
  return `<svg class="${className}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.sparkle}</svg>`;
}
