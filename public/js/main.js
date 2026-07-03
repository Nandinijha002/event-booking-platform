/* ==========================================================================
   Shared utilities: navbar, dark-mode toggle (bonus), Indian formatting
   ========================================================================== */

const API_BASE = '/api';

/* ---- Mobile nav toggle ---- */
function initNav() {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (!toggle || !links) return;
  toggle.addEventListener('click', () => links.classList.toggle('open'));
}

/* ---- Dark / light mode toggle (Bonus Feature 1) ---- */
function initThemeToggle() {
  const btn = document.getElementById('themeToggle');
  const root = document.documentElement;
  const saved = localStorage.getItem('ebp-theme') || 'dark';
  root.setAttribute('data-theme', saved);
  updateThemeIcon(btn, saved);

  if (!btn) return;
  btn.addEventListener('click', () => {
    const current = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', current);
    localStorage.setItem('ebp-theme', current);
    updateThemeIcon(btn, current);
  });
}

function updateThemeIcon(btn, theme) {
  if (!btn) return;
  btn.textContent = theme === 'light' ? '🌙' : '☀️';
  btn.setAttribute('aria-label', theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
}

/* ---- Festival light string generator ---- */
function renderLightString(elementId, count = 18) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.innerHTML = Array.from({ length: count }).map(() => '<span></span>').join('');
}

/* ---- Indian currency formatting (₹1,23,456) ---- */
function formatINR(amount) {
  if (amount === 0) return 'Free';
  return '₹' + Number(amount).toLocaleString('en-IN');
}

/* ---- Indian date formatting (DD Mon YYYY) ---- */
function formatDateIndian(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDayName(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { weekday: 'long' });
}

/* ---- 12-hour time formatting ---- */
function formatTime12h(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

/* ---- Category emoji map ---- */
const CATEGORY_ICON = {
  Music: '🎤',
  Technology: '💻',
  Festival: '🪔',
  Business: '📈',
  Comedy: '🎭',
  Workshop: '🎓',
  Sports: '🏏'
};

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initThemeToggle();
  renderLightString('navLights', 24);
});