export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function formatDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return escapeHtml(value);
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit", month: "short", year: "numeric"
  }).format(d);
}

export function formatNumber(value) {
  return new Intl.NumberFormat("id-ID").format(Number(value || 0));
}

export function toast(message, type = "info") {
  const root = $("#toast-root");
  const el = document.createElement("div");
  el.className = `toast toast-${type}`;
  el.textContent = message;
  root.appendChild(el);
  setTimeout(() => el.remove(), 3600);
}

export function loading(label = "Memuat data...") {
  return `<div class="state loading-state"><span class="spinner"></span><span>${escapeHtml(label)}</span></div>`;
}

export function emptyState(label = "Belum ada data.") {
  return `<div class="state empty-state">${escapeHtml(label)}</div>`;
}

export function errorState(label = "Terjadi kesalahan.") {
  return `<div class="state error-state">${escapeHtml(label)}</div>`;
}

export function modal(title, body, footer = "") {
  return `
    <div class="modal-backdrop" data-modal-close>
      <div class="modal" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}" onclick="event.stopPropagation()">
        <div class="modal-head">
          <h3>${escapeHtml(title)}</h3>
          <button class="icon-btn" data-modal-close aria-label="Tutup">×</button>
        </div>
        <div class="modal-body">${body}</div>
        ${footer ? `<div class="modal-foot">${footer}</div>` : ""}
      </div>
    </div>`;
}

export function table(columns, rows, empty = "Belum ada data.") {
  if (!rows?.length) return emptyState(empty);
  return `
    <div class="table-wrap">
      <table>
        <thead><tr>${columns.map(c => `<th>${escapeHtml(c.label)}</th>`).join("")}</tr></thead>
        <tbody>
          ${rows.map(row => `<tr>${columns.map(c => `<td>${c.render ? c.render(row) : escapeHtml(row[c.key])}</td>`).join("")}</tr>`).join("")}
        </tbody>
      </table>
    </div>`;
}

export function statCard(label, value, icon = "▦", note = "") {
  return `
    <article class="stat-card">
      <div class="stat-icon">${icon}</div>
      <div>
        <div class="stat-label">${escapeHtml(label)}</div>
        <div class="stat-value">${escapeHtml(value)}</div>
        ${note ? `<div class="stat-note">${escapeHtml(note)}</div>` : ""}
      </div>
    </article>`;
}

export function roleLabel(role) {
  const map = {
    ADMIN: "Admin",
    PENGURUS_PUSAT: "Pengurus Pusat",
    PENGURUS_PROVINSI: "Pengurus Provinsi",
    PENGURUS_KOTA_KABUPATEN: "Pengurus Kota/Kabupaten",
    ANGGOTA: "Anggota"
  };
  return map[role] || role || "-";
}

export function statusBadge(status) {
  const s = String(status || "-");
  const cls = s.toLowerCase().replaceAll("_", "-");
  return `<span class="badge badge-${cls}">${escapeHtml(s)}</span>`;
}

export function bindModalClose(root = document) {
  $$("[data-modal-close]", root).forEach(el => {
    el.addEventListener("click", () => el.closest(".modal-backdrop")?.remove());
  });
}
