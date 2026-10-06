import { publicApi, appApi, authApi } from "./api.js";
import { getUser, login, logout, clearAuth } from "./auth.js";
import { $, $$, escapeHtml, formatDate, formatNumber, loading, emptyState, errorState, modal, table, statCard, roleLabel, statusBadge, toast, bindModalClose } from "./ui.js";

function role() {
  return getUser()?.role || "";
}

function roleCan(...roles) {
  return roles.includes(role());
}

function shell(title, subtitle, content) {
  return `
    <div class="dashboard-shell">
      <aside class="sidebar">
        <div class="brand-mini">
          <div class="brand-mark">◎</div>
          <div><strong>SIO</strong><small>Organisasi V1.1</small></div>
        </div>
        <nav class="side-nav" id="side-nav">
          ${menuForRole()}
        </nav>
        <button class="side-logout" id="btn-side-logout">↪ Keluar</button>
      </aside>
      <main class="dashboard-main">
        <header class="topbar">
          <div>
            <div class="eyebrow">Sistem Informasi Organisasi</div>
            <h1>${escapeHtml(title)}</h1>
            <p>${escapeHtml(subtitle || "")}</p>
          </div>
          <div class="user-chip">
            <div class="avatar">${escapeHtml((getUser()?.NAMA_LENGKAP || getUser()?.USERNAME || "A").slice(0,1).toUpperCase())}</div>
            <div><strong>${escapeHtml(getUser()?.NAMA_LENGKAP || getUser()?.USERNAME || "Pengguna")}</strong><small>${escapeHtml(roleLabel(role()))}</small></div>
          </div>
        </header>
        <section class="page-content">${content}</section>
      </main>
    </div>`;
}

function menuForRole() {
  const items = [
    ["dashboard", "⌂", "Dashboard", true],
  ];
  if (roleCan("ADMIN", "PENGURUS_PUSAT", "PENGURUS_PROVINSI", "PENGURUS_KOTA_KABUPATEN", "ANGGOTA")) {
    items.push(["members", "♙", "Anggota", true]);
  }
  if (roleCan("ADMIN", "PENGURUS_PUSAT", "PENGURUS_PROVINSI", "PENGURUS_KOTA_KABUPATEN")) {
    items.push(["pengurus", "♟", "Pengurus", true]);
    items.push(["pengajuan", "✉", "Pengajuan", true]);
    items.push(["surat", "▤", "Administrasi Surat", true]);
  }
  if (roleCan("ADMIN", "PENGURUS_PUSAT")) items.push(["users", "♙", "Manajemen Akun", true]);
  if (roleCan("ADMIN", "PENGURUS_PUSAT", "PENGURUS_PROVINSI", "PENGURUS_KOTA_KABUPATEN")) items.push(["website", "◈", "Publikasi", true]);
  if (roleCan("ADMIN", "PENGURUS_PUSAT", "PENGURUS_PROVINSI", "PENGURUS_KOTA_KABUPATEN")) items.push(["reports", "▥", "Laporan", true]);
  if (roleCan("ADMIN")) {
    items.push(["logs", "≡", "Audit Log", true]);
    items.push(["settings", "⚙", "Pengaturan", true]);
    items.push(["backup", "◫", "Backup", true]);
  }
  items.push(["profile", "●", "Profil Saya", true]);
  return items.map(([id, icon, label]) => `<a class="nav-item" href="#/app/${id}" data-nav="${id}"><span>${icon}</span>${label}</a>`).join("");
}

export async function renderPublicHome() {
  const root = $("#app");
  root.innerHTML = `
    <div class="public-page">
      <header class="public-nav">
        <a href="#/" class="public-brand"><span class="brand-mark">◎</span><span><strong>Sistem Informasi Organisasi</strong><small>Manajemen Pengurus & Anggota</small></span></a>
        <div class="public-links">
          <a href="#/news">Berita</a><a href="#/agenda">Agenda</a><a href="#/gallery">Galeri</a><a href="#/download">Unduhan</a>
          <a class="btn btn-primary btn-sm" href="#/login">Login</a>
        </div>
      </header>
      <div id="public-home-content">${loading("Memuat website...")}</div>
      <footer class="public-footer">Sistem Informasi Organisasi V1.1 · Backend Google Apps Script · Database Google Spreadsheet</footer>
    </div>`;
  try {
    const data = await publicApi.home();
    root.querySelector("#public-home-content").innerHTML = `
      <section class="hero">
        <div class="hero-copy">
          <span class="eyebrow">SISTEM INFORMASI ORGANISASI V1.1</span>
          <h1>Manajemen organisasi yang <em>terstruktur</em>, aman, dan terukur.</h1>
          <p>${escapeHtml(data.organisasi?.[0]?.DESKRIPSI || data.organisasi?.[0]?.TENTANG || "Platform terintegrasi untuk pengurus pusat, provinsi, kota/kabupaten, dan anggota.")}</p>
          <div class="hero-actions"><a class="btn btn-primary" href="#/register">Daftar Anggota</a><a class="btn btn-light" href="#/login">Masuk Dashboard</a></div>
        </div>
        <div class="hero-panel">
          <div class="hero-panel-top"><span>Status Sistem</span><span class="online-dot">● Online</span></div>
          <div class="hero-stat"><strong>${formatNumber(data.statistik?.totalAnggota)}</strong><span>Anggota aktif</span></div>
          <div class="hero-grid">
            <div><strong>${formatNumber(data.statistik?.totalPengurus)}</strong><span>Pengurus</span></div>
            <div><strong>${formatNumber(data.statistik?.totalProvinsi)}</strong><span>Provinsi</span></div>
            <div><strong>${formatNumber(data.statistik?.totalKabKota)}</strong><span>Kota/Kab</span></div>
          </div>
        </div>
      </section>
      <section class="public-section">
        <div class="section-heading"><div><span class="eyebrow">PUBLIKASI</span><h2>Informasi terbaru</h2></div><a href="#/news">Lihat semua →</a></div>
        <div class="card-grid">${(data.berita || []).slice(0,6).map(newsCard).join("") || emptyState("Belum ada berita.")}</div>
      </section>
      <section class="public-section">
        <div class="section-heading"><div><span class="eyebrow">AGENDA</span><h2>Kegiatan organisasi</h2></div><a href="#/agenda">Lihat semua →</a></div>
        <div class="agenda-grid">${(data.agenda || []).slice(0,6).map(agendaCard).join("") || emptyState("Belum ada agenda.")}</div>
      </section>`;
  } catch (e) {
    root.querySelector("#public-home-content").innerHTML = errorState(e.message);
  }
}

function newsCard(item) {
  return `<article class="content-card">
    <div class="card-cover">${item.FOTO_URL || item.IMAGE_URL ? `<img src="${escapeHtml(item.FOTO_URL || item.IMAGE_URL)}" alt="">` : `<span>NEWS</span>`}</div>
    <div class="card-body"><span class="card-meta">${formatDate(item.TANGGAL_PUBLIKASI || item.CREATED_AT)}</span><h3>${escapeHtml(item.JUDUL || item.TITLE || "Berita")}</h3><p>${escapeHtml(item.RINGKASAN || item.DESKRIPSI || item.ISI || "").slice(0,140)}</p></div>
  </article>`;
}

function agendaCard(item) {
  return `<article class="agenda-card"><div class="agenda-date"><strong>${new Date(item.TANGGAL || item.TANGGAL_AGENDA || Date.now()).getDate()}</strong><span>${new Date(item.TANGGAL || item.TANGGAL_AGENDA || Date.now()).toLocaleString("id-ID",{month:"short"})}</span></div><div><span class="card-meta">${escapeHtml(item.LOKASI || "Lokasi belum ditentukan")}</span><h3>${escapeHtml(item.NAMA_AGENDA || item.JUDUL || "Agenda")}</h3><p>${escapeHtml(item.DESKRIPSI || "").slice(0,120)}</p></div></article>`;
}

export async function renderPublicList(type) {
  const root = $("#app");
  const titleMap = { news: "Berita Organisasi", agenda: "Agenda Organisasi", gallery: "Galeri", download: "Unduhan" };
  root.innerHTML = `
    <div class="public-page">
      <header class="public-nav"><a href="#/" class="public-brand"><span class="brand-mark">◎</span><span><strong>Sistem Informasi Organisasi</strong><small>Manajemen Pengurus & Anggota</small></span></a><div class="public-links"><a href="#/">Beranda</a><a href="#/login">Login</a></div></header>
      <main class="public-section list-page"><div class="section-heading"><div><span class="eyebrow">PUBLIK</span><h1>${titleMap[type]}</h1></div></div><div id="public-list">${loading()}</div></main>
    </div>`;
  try {
    let rows = [];
    if (type === "news") rows = await publicApi.news();
    if (type === "agenda") rows = await publicApi.agenda();
    if (type === "gallery") rows = await publicApi.gallery();
    if (type === "download") rows = await publicApi.download();
    const list = $("#public-list");
    if (!rows?.length) { list.innerHTML = emptyState("Belum ada data."); return; }
    if (type === "news") list.innerHTML = `<div class="card-grid">${rows.map(newsCard).join("")}</div>`;
    else if (type === "agenda") list.innerHTML = `<div class="agenda-grid">${rows.map(agendaCard).join("")}</div>`;
    else if (type === "gallery") list.innerHTML = `<div class="card-grid">${rows.map(item => `<article class="content-card"><div class="card-cover">${item.COVER_FILE_ID ? "GALERI" : "FOTO"}</div><div class="card-body"><h3>${escapeHtml(item.JUDUL || item.NAMA_GALERI || "Galeri")}</h3><p>${escapeHtml(item.DESKRIPSI || "")}</p></div></article>`).join("")}</div>`;
    else list.innerHTML = `<div class="download-list">${rows.map(item => `<a class="download-item" href="${escapeHtml(item.URL || item.FILE_URL || "#")}" target="_blank" rel="noopener"><span>▤</span><div><strong>${escapeHtml(item.JUDUL || item.NAMA_FILE || "Dokumen")}</strong><small>${escapeHtml(item.DESKRIPSI || "")}</small></div><b>↗</b></a>`).join("")}</div>`;
  } catch (e) {
    $("#public-list").innerHTML = errorState(e.message);
  }
}

export function renderLogin() {
  $("#app").innerHTML = `
    <div class="auth-page">
      <div class="auth-side"><a href="#/" class="public-brand"><span class="brand-mark">◎</span><span><strong>Sistem Informasi Organisasi</strong><small>Manajemen Pengurus & Anggota</small></span></a><div><span class="eyebrow">V1.1</span><h1>Kelola organisasi dari satu tempat.</h1><p>Role dan wilayah menjadi dua lapisan utama untuk menjaga akses data tetap aman.</p></div></div>
      <div class="auth-panel"><div class="auth-box"><a class="back-link" href="#/">← Kembali ke website</a><span class="eyebrow">AKSES SISTEM</span><h2>Login</h2><p class="muted">Silakan masuk dengan akun Anda.</p>
        <form id="login-form">
          <label>Email / Username<input name="username" autocomplete="username" required placeholder="Masukkan email atau username"></label>
          <label>Password<div class="password-field"><input name="password" type="password" autocomplete="current-password" required placeholder="Masukkan password"><button type="button" data-toggle-password>◉</button></div></label>
          <label class="check"><input type="checkbox" name="remember"> Ingat saya</label>
          <button class="btn btn-primary btn-block" type="submit">Masuk</button>
        </form>
        <div class="auth-footer">Belum punya akun? <a href="#/register">Daftar di sini</a></div>
        <div id="login-message"></div>
      </div></div>
    </div>`;
  bindPasswordToggle();
  $("#login-form").addEventListener("submit", handleLogin);
}

function bindPasswordToggle() {
  $$("[data-toggle-password]").forEach(btn => btn.addEventListener("click", () => {
    const input = btn.parentElement.querySelector("input");
    input.type = input.type === "password" ? "text" : "password";
  }));
}

async function handleLogin(e) {
  e.preventDefault();

  const form = e.currentTarget;
  const button = form.querySelector("button[type=submit]");

  button.disabled = true;
  button.textContent = "Memeriksa...";

  try {
    const data = await login(
      form.username.value.trim(),
      form.password.value
    );

    // Refresh session agar role dari backend tersedia
    // sebelum navigasi dashboard dibuat.
    const session = await authApi.session();

    sessionStorage.setItem(
      "org_user",
      JSON.stringify({
        ...session.user,
        role: session.role
      })
    );

    toast("Login berhasil.", "success");

    if (data.forceChangePassword) {
      location.hash = "#/app/profile?forcePassword=1";
    } else {
      location.hash = "#/app/dashboard";
    }

  } catch (err) {
    $("#login-message").innerHTML =
      `<div class="form-error">${escapeHtml(err.message)}</div>`;

  } finally {
    button.disabled = false;
    button.textContent = "Masuk";
  }
}
export async function renderRegister() {
  const root = $("#app");
  root.innerHTML = `
    <div class="auth-page auth-register">
      <div class="auth-side"><a href="#/" class="public-brand"><span class="brand-mark">◎</span><span><strong>Sistem Informasi Organisasi</strong><small>Pendaftaran Anggota</small></span></a><div><span class="eyebrow">REGISTRASI MANDIRI</span><h1>Bergabung dengan organisasi.</h1><p>Setelah mendaftar, akun akan berstatus pending dan diverifikasi oleh Pengurus Kota/Kabupaten sesuai wilayah.</p></div></div>
      <div class="auth-panel"><div class="auth-box wide"><a class="back-link" href="#/">← Kembali</a><span class="eyebrow">FORM ANGGOTA</span><h2>Daftar Anggota</h2><p class="muted">Lengkapi data akun dan wilayah Anda.</p>
      <form id="register-form" class="form-grid">
        <label>Nama Lengkap<input name="NAMA_LENGKAP" required></label>
        <label>Username<input name="username" required autocomplete="username"></label>
        <label>Email<input name="email" type="email" required></label>
        <label>Password<input name="password" type="password" minlength="8" required autocomplete="new-password"></label>
        <label>No. HP<input name="NO_HP"></label>
        <label>NIK<input name="NIK"></label>
        <label>Tempat Lahir<input name="TEMPAT_LAHIR"></label>
        <label>Tanggal Lahir<input name="TANGGAL_LAHIR" type="date"></label>
        <label>Jenis Kelamin<select name="JENIS_KELAMIN"><option value="">Pilih</option><option value="L">Laki-laki</option><option value="P">Perempuan</option></select></label>
        <label>Provinsi<select name="PROVINSI_ID" id="reg-province" required><option value="">Memuat...</option></select></label>
        <label>Kota/Kabupaten<select name="KABKOTA_ID" id="reg-city" required disabled><option value="">Pilih provinsi dulu</option></select></label>
        <label>Kecamatan<select name="KECAMATAN_ID" id="reg-district" disabled><option value="">Pilih kota/kab dulu</option></select></label>
        <label class="span-2">Alamat<textarea name="ALAMAT" rows="3"></textarea></label>
        <div class="span-2"><button class="btn btn-primary btn-block" type="submit">Kirim Pendaftaran</button></div>
      </form><div id="register-message"></div>
      </div></div>
    </div>`;
  await loadRegions("#reg-province", "PROVINSI", "");
  $("#reg-province").addEventListener("change", async e => {
    const city = $("#reg-city"), district = $("#reg-district");
    city.disabled = true; district.disabled = true; city.innerHTML = `<option>Memuat...</option>`;
    try { await loadRegions("#reg-city", "KABKOTA", e.target.value); city.disabled = false; } catch (err) { toast(err.message, "error"); }
  });
  $("#reg-city").addEventListener("change", async e => {
    const district = $("#reg-district");
    district.disabled = true; district.innerHTML = `<option>Memuat...</option>`;
    try { await loadRegions("#reg-district", "KECAMATAN", e.target.value); district.disabled = false; } catch (err) { toast(err.message, "error"); }
  });
  $("#register-form").addEventListener("submit", handleRegister);
}

async function loadRegions(selector, type, parentId) {
  const rows = await publicApi.regions(type, parentId);
  const select = $(selector);
  select.innerHTML = `<option value="">Pilih ${type === "PROVINSI" ? "provinsi" : type === "KABKOTA" ? "kota/kabupaten" : "kecamatan"}</option>` +
    (rows || []).map(r => {
      const id = r.PROVINSI_ID || r.KABKOTA_ID || r.KECAMATAN_ID || r.ID;
      const name = r.NAMA_PROVINSI || r.NAMA_KABKOTA || r.NAMA_KECAMATAN || r.NAMA || r.NAME;
      return `<option value="${escapeHtml(id)}">${escapeHtml(name)}</option>`;
    }).join("");
}

async function handleRegister(e) {
  e.preventDefault();
  const form = e.currentTarget;
  const data = Object.fromEntries(new FormData(form).entries());
  const button = form.querySelector("button[type=submit]");
  button.disabled = true; button.textContent = "Mengirim...";
  try {
    await authApi.register(data);
    $("#register-message").innerHTML = `<div class="form-success">Pendaftaran berhasil. Akun Anda menunggu verifikasi Pengurus Kota/Kabupaten.</div>`;
    form.reset();
  } catch (err) {
    $("#register-message").innerHTML = `<div class="form-error">${escapeHtml(err.message)}</div>`;
  } finally {
    button.disabled = false; button.textContent = "Kirim Pendaftaran";
  }
}

export async function renderDashboardPage(page = "dashboard") {
  const titles = {
    dashboard: ["Dashboard", "Ringkasan aktivitas dan data sesuai kewenangan Anda."],
    members: ["Anggota", "Data anggota sesuai scope wilayah Anda."],
    pengurus: ["Pengurus", "Manajemen struktur pengurus organisasi."],
    pengajuan: ["Pengajuan", "Verifikasi dan pengelolaan pengajuan."],
    surat: ["Administrasi Surat", "Pembuatan dan pengelolaan surat organisasi."],
    users: ["Manajemen Akun", "Akun pengguna dan reset password berjenjang."],
    website: ["Publikasi", "Kelola konten website organisasi."],
    reports: ["Laporan", "Ringkasan data organisasi."],
    logs: ["Audit Log", "Jejak aktivitas penting sistem."],
    settings: ["Pengaturan", "Konfigurasi sistem dan organisasi."],
    backup: ["Backup", "Cadangan database Spreadsheet."],
    profile: ["Profil Saya", "Akun dan perubahan password."]
  };
  const [title, subtitle] = titles[page] || titles.dashboard;
  $("#app").innerHTML = shell(title, subtitle, loading());
  bindShell();
  try {
    const content = await pageRenderer[page]();
    $(".page-content").innerHTML = content;
    bindPageEvents(page);
  } catch (e) {
    $(".page-content").innerHTML = errorState(e.message);
  }
}

function bindShell() {
  $("#btn-side-logout")?.addEventListener("click", async () => {
    await logout();
    toast("Anda telah keluar.", "success");
    location.hash = "#/login";
  });
  $$(".nav-item").forEach(a => a.classList.toggle("active", a.dataset.nav === currentPage()));
}

function currentPage() {
  return location.hash.split("/")[2]?.split("?")[0] || "dashboard";
}

const pageRenderer = {
  dashboard: async () => {
    const d = await appApi.dashboard();
    const s = d.stats || {};
    const cards = [
      statCard("Total Anggota", formatNumber(s.totalAnggota), "♙"),
      statCard("Total Pengurus", formatNumber(s.totalPengurus), "♟"),
      ...(s.totalProvinsi !== undefined ? [statCard("Total Provinsi", formatNumber(s.totalProvinsi), "⌂")] : []),
      ...(s.totalKabKota !== undefined ? [statCard("Total Kota/Kab", formatNumber(s.totalKabKota), "▦")] : []),
      ...(s.totalUsers !== undefined ? [statCard("Total User", formatNumber(s.totalUsers), "●")] : [])
    ];
    return `<div class="stats-grid">${cards.join("")}</div>
      <div class="two-col">
        <article class="panel"><div class="panel-head"><div><span class="eyebrow">SCOPE</span><h2>Akses Anda</h2></div></div>
          <div class="scope-box"><div><span>Role</span><strong>${escapeHtml(roleLabel(d.role))}</strong></div><div><span>Provinsi</span><strong>${escapeHtml(d.scope?.provinsiId || "Semua")}</strong></div><div><span>Kota/Kab</span><strong>${escapeHtml(d.scope?.kabkotaId || "Semua")}</strong></div></div>
        </article>
        <article class="panel"><div class="panel-head"><div><span class="eyebrow">KEAMANAN</span><h2>Prinsip akses</h2></div></div>
          <ul class="check-list"><li>Authentication session aktif</li><li>Role diverifikasi backend</li><li>Scope wilayah diverifikasi backend</li><li>Permission diverifikasi backend</li></ul>
        </article>
      </div>
      ${d.recentLogs?.length ? `<article class="panel"><div class="panel-head"><h2>Aktivitas terbaru</h2><a href="#/app/logs">Lihat semua</a></div>${renderLogs(d.recentLogs)}</article>` : ""}`;
  },
  members: async () => {
    const rows = await appApi.members({});
    const columns = [
      {label:"ID", key:"MEMBER_ID"},
      {label:"Nama", key:"NAMA_LENGKAP"},
      {label:"Email", key:"EMAIL"},
      {label:"No. HP", key:"NO_HP"},
      {label:"Status", render:r=>statusBadge(r.STATUS_ANGGOTA)},
      {label:"Wilayah", render:r=>escapeHtml(`${r.PROVINSI_ID || "-"} / ${r.KABKOTA_ID || "-"}`)}
    ];
    return `<div class="toolbar"><div class="search-box"><input id="member-search" placeholder="Cari nama, email, ID..."></div>${roleCan("ANGGOTA") ? "" : `<button class="btn btn-primary" id="btn-refresh">↻ Refresh</button>`}</div>
      <div class="panel" id="member-table">${table(columns, rows, "Belum ada anggota.")}</div>`;
  },
  pengurus: async () => {
    const rows = await appApi.pengurus({});
    const columns = [
      {label:"ID", key:"PENGURUS_ID"}, {label:"Member", key:"MEMBER_ID"}, {label:"Tingkat", key:"TINGKAT"},
      {label:"Jabatan", key:"JABATAN_ID"}, {label:"Provinsi", key:"PROVINSI_ID"}, {label:"Kota/Kab", key:"KABKOTA_ID"},
      {label:"Status", render:r=>statusBadge(r.STATUS)}
    ];
    return `<div class="toolbar"><span class="muted">${formatNumber(rows.length)} data dalam scope Anda</span></div><div class="panel">${table(columns, rows)}</div>`;
  },
  pengajuan: async () => {
    const rows = await appApi.pengajuan({});
    const columns = [
      {label:"ID", key:"PENGAJUAN_ID"}, {label:"Jenis", key:"JENIS_PENGAJUAN"}, {label:"Member", key:"MEMBER_ID"},
      {label:"Wilayah", render:r=>escapeHtml(`${r.PROVINSI_ID || "-"} / ${r.KABKOTA_ID || "-"}`)},
      {label:"Status", render:r=>statusBadge(r.STATUS)}, {label:"Diajukan", render:r=>formatDate(r.DIAJUKAN_AT)},
      {label:"Aksi", render:r=>roleCan("PENGURUS_KOTA_KABUPATEN","ADMIN") && r.STATUS === "PENDING" ? `<button class="btn btn-xs btn-primary" data-verify="${escapeHtml(r.PENGAJUAN_ID)}">Verifikasi</button>` : "-"}
    ];
    return `<div class="panel">${table(columns, rows, "Belum ada pengajuan.")}</div>`;
  },
  surat: async () => {
    const rows = await appApi.surat({});
    const columns = [
      {label:"Nomor", key:"NOMOR_SURAT"}, {label:"Jenis", key:"JENIS_SURAT"}, {label:"Tanggal", render:r=>formatDate(r.TANGGAL_SURAT)},
      {label:"Perihal", key:"PERIHAL"}, {label:"Tingkat", key:"TINGKAT"}, {label:"Status", render:r=>statusBadge(r.STATUS)},
      {label:"Aksi", render:r=>`<button class="btn btn-xs btn-light" data-pdf="${escapeHtml(r.SURAT_ID)}">Generate PDF</button>`}
    ];
    return `<div class="toolbar"><button class="btn btn-primary" id="btn-create-letter">+ Buat Surat</button></div><div class="panel">${table(columns, rows, "Belum ada surat.")}</div>`;
  },
  users: async () => {
    const rows = await appApi.users({});
    const columns = [
      {label:"Username", key:"USERNAME"}, {label:"Email", key:"EMAIL"}, {label:"Role", render:r=>roleLabel(r.ROLE_CODE || r.role)},
      {label:"Provinsi", key:"PROVINSI_ID"}, {label:"Kota/Kab", key:"KABKOTA_ID"}, {label:"Status", render:r=>statusBadge(r.STATUS)},
      {label:"Aksi", render:r=>`<button class="btn btn-xs btn-light" data-reset="${escapeHtml(r.USER_ID)}">Reset Password</button>`}
    ];
    return `<div class="toolbar"><button class="btn btn-primary" id="btn-create-user">+ Buat Akun</button></div><div class="panel">${table(columns, rows, "Belum ada akun.")}</div>`;
  },
  website: async () => {
    const rows = await appApi.websiteManage ? [] : [];
    return `<div class="feature-grid">
      ${["BERITA","AGENDA","GALERI","UNDUHAN","PENGUMUMAN","MEDIA_SOSIAL"].map(x=>`<article class="feature-card"><span>◈</span><h3>${x}</h3><p>Gunakan modul backend <code>/website/manage</code> untuk membuat atau memperbarui konten.</p><button class="btn btn-light" data-content-module="${x}">Kelola</button></article>`).join("")}
    </div>`;
  },
  reports: async () => {
    const d = await appApi.reports();
    return `<div class="stats-grid">${statCard("Anggota", formatNumber(d.anggota?.length), "♙")}${statCard("Pengurus", formatNumber(d.pengurus?.length), "♟")}${statCard("Dibuat", formatDate(d.generatedAt), "◷")}</div>
      <div class="two-col"><div class="panel"><div class="panel-head"><h2>Ringkasan anggota</h2></div>${table([{label:"ID",key:"MEMBER_ID"},{label:"Nama",key:"NAMA_LENGKAP"},{label:"Status",render:r=>statusBadge(r.STATUS_ANGGOTA)}], d.anggota || [])}</div>
      <div class="panel"><div class="panel-head"><h2>Ringkasan pengurus</h2></div>${table([{label:"ID",key:"PENGURUS_ID"},{label:"Tingkat",key:"TINGKAT"},{label:"Status",render:r=>statusBadge(r.STATUS)}], d.pengurus || [])}</div></div>`;
  },
  logs: async () => {
    const rows = await appApi.logs(100);
    return `<div class="panel">${renderLogs(rows)}</div>`;
  },
  settings: async () => {
    const rows = await appApi.settings();
    return `<div class="panel">${table([{label:"Key",key:"KEY"},{label:"Value",key:"VALUE"},{label:"Group",key:"GROUP_SETTING"},{label:"Public",render:r=>r.IS_PUBLIC?"Ya":"Tidak"},{label:"Updated",render:r=>formatDate(r.UPDATED_AT)}], rows, "Belum ada pengaturan.")}</div>`;
  },
  backup: async () => `<div class="panel backup-panel"><div class="backup-icon">◫</div><h2>Backup database</h2><p>Backup XLSX akan dibuat di folder BACKUP pada Google Drive. Hanya Admin yang dapat menjalankan operasi ini.</p><button class="btn btn-primary" id="btn-backup">Buat Backup Sekarang</button><div id="backup-result"></div></div>`,
  profile: async () => {
    const u = getUser();
    return `<div class="two-col"><div class="panel profile-card"><div class="profile-avatar">${escapeHtml((u?.NAMA_LENGKAP || u?.USERNAME || "A").slice(0,1).toUpperCase())}</div><h2>${escapeHtml(u?.NAMA_LENGKAP || u?.USERNAME || "-")}</h2><p class="muted">${escapeHtml(roleLabel(role()))}</p><dl><dt>User ID</dt><dd>${escapeHtml(u?.USER_ID)}</dd><dt>Email</dt><dd>${escapeHtml(u?.EMAIL)}</dd><dt>Provinsi</dt><dd>${escapeHtml(u?.PROVINSI_ID || "Semua")}</dd><dt>Kota/Kab</dt><dd>${escapeHtml(u?.KABKOTA_ID || "Semua")}</dd></dl></div>
      <div class="panel"><div class="panel-head"><h2>Ubah Password</h2></div><form id="change-password-form"><label>Password lama<input name="oldPassword" type="password" required></label><label>Password baru<input name="newPassword" type="password" minlength="8" required></label><button class="btn btn-primary" type="submit">Simpan Password</button><div id="password-result"></div></form></div></div>`;
  }
};

function renderLogs(rows) {
  return table([
    {label:"Waktu", render:r=>formatDate(r.CREATED_AT || r.TIME)},
    {label:"User", key:"USER_ID"},
    {label:"Aksi", key:"ACTION"},
    {label:"Entity", render:r=>escapeHtml(`${r.ENTITY_TYPE || "-"} / ${r.ENTITY_ID || "-"}`)},
    {label:"Keterangan", key:"DESCRIPTION"}
  ], rows || [], "Belum ada aktivitas.");
}

function bindPageEvents(page) {
  $("#btn-refresh")?.addEventListener("click", () => renderDashboardPage(page));
  $("#btn-backup")?.addEventListener("click", async e => {
    e.currentTarget.disabled = true; e.currentTarget.textContent = "Membuat backup...";
    try {
      const r = await appApi.backup();
      $("#backup-result").innerHTML = `<div class="form-success">Backup berhasil: <a href="${escapeHtml(r.url)}" target="_blank" rel="noopener">${escapeHtml(r.fileName)}</a></div>`;
    } catch (err) { $("#backup-result").innerHTML = `<div class="form-error">${escapeHtml(err.message)}</div>`; }
    finally { e.currentTarget.disabled = false; e.currentTarget.textContent = "Buat Backup Sekarang"; }
  });
  $("#change-password-form")?.addEventListener("submit", async e => {
    e.preventDefault();
    const f = e.currentTarget;
    try {
      await authApi.changePassword(f.oldPassword.value, f.newPassword.value);
      $("#password-result").innerHTML = `<div class="form-success">Password berhasil diubah.</div>`;
      f.reset();
    } catch (err) { $("#password-result").innerHTML = `<div class="form-error">${escapeHtml(err.message)}</div>`; }
  });
  $$("[data-reset]").forEach(btn => btn.addEventListener("click", async () => {
    if (!confirm("Reset password akun ini? Password sementara hanya ditampilkan sekali.")) return;
    try {
      const r = await appApi.resetPassword(btn.dataset.reset);
      document.body.insertAdjacentHTML("beforeend", modal("Password sementara", `<div class="temporary-password"><strong>${escapeHtml(r.temporaryPassword)}</strong></div><p class="muted">Sampaikan password sementara melalui kanal yang aman. Sistem mewajibkan pengguna mengganti password saat login berikutnya.</p>`, `<button class="btn btn-primary" data-modal-close>Tutup</button>`));
      bindModalClose();
    } catch (err) { toast(err.message, "error"); }
  }));
  $$("[data-verify]").forEach(btn => btn.addEventListener("click", () => showVerifyModal(btn.dataset.verify)));
  $$("[data-pdf]").forEach(btn => btn.addEventListener("click", async () => {
    btn.disabled = true;
    try {
      const r = await appApi.generatePdf(btn.dataset.pdf);
      if (r?.url) window.open(r.url, "_blank", "noopener");
      else toast("PDF berhasil dibuat.", "success");
    } catch (err) { toast(err.message, "error"); }
    finally { btn.disabled = false; }
  }));
  $("#btn-create-letter")?.addEventListener("click", showLetterModal);
  $("#btn-create-user")?.addEventListener("click", showUserModal);
}

function showVerifyModal(id) {
  document.body.insertAdjacentHTML("beforeend", modal("Verifikasi Anggota", `<label>Catatan verifikasi<textarea id="verify-note" rows="4"></textarea></label>`, `<button class="btn btn-light" data-modal-close>Tutup</button><button class="btn btn-danger" id="reject-member">Tolak</button><button class="btn btn-primary" id="approve-member">Setujui</button>`));
  bindModalClose();
  $("#approve-member").onclick = async () => { await doVerify(id, true); };
  $("#reject-member").onclick = async () => { await doVerify(id, false); };
}

async function doVerify(id, approved) {
  try {
    await appApi.verifyMember(id, approved, $("#verify-note")?.value || "");
    document.querySelector(".modal-backdrop")?.remove();
    toast(approved ? "Anggota disetujui." : "Pengajuan ditolak.", "success");
    renderDashboardPage("pengajuan");
  } catch (err) { toast(err.message, "error"); }
}

function showLetterModal() {
  document.body.insertAdjacentHTML("beforeend", modal("Buat Surat", `<form id="letter-form" class="form-grid"><label>Jenis Surat<select name="JENIS_SURAT" required><option>UNDANGAN</option><option>PEMBERITAHUAN</option><option>MANDAT</option><option>KEPUTUSAN</option><option>TUGAS</option><option>REKOMENDASI</option><option>PERMOHONAN</option><option>PERNYATAAN</option></select></label><label>Tingkat<select name="TINGKAT" required><option>PUSAT</option><option>PROVINSI</option><option>KOTA_KAB</option></select></label><label class="span-2">Perihal<input name="PERIHAL" required></label><label>Penerima<input name="PENERIMA"></label><label>Tanggal<input name="TANGGAL_SURAT" type="date"></label><div class="span-2" id="letter-result"></div></form>`, `<button class="btn btn-light" data-modal-close>Batal</button><button class="btn btn-primary" id="save-letter">Simpan</button>`));
  bindModalClose();
  $("#save-letter").onclick = async () => {
    const f = $("#letter-form");
    try {
      const r = await appApi.createSurat(Object.fromEntries(new FormData(f).entries()));
      document.querySelector(".modal-backdrop")?.remove();
      toast(`Surat ${r.NOMOR_SURAT} berhasil dibuat.`, "success");
      renderDashboardPage("surat");
    } catch (err) { $("#letter-result").innerHTML = `<div class="form-error">${escapeHtml(err.message)}</div>`; }
  };
}

function showUserModal() {
  document.body.insertAdjacentHTML("beforeend", modal("Buat Akun", `<form id="user-form" class="form-grid"><label>Username<input name="USERNAME" required></label><label>Email<input name="EMAIL" type="email" required></label><label>Role<select name="ROLE_CODE"><option>PENGURUS_PUSAT</option><option>PENGURUS_PROVINSI</option><option>PENGURUS_KOTA_KABUPATEN</option><option>ANGGOTA</option></select></label><label>Ref ID<input name="REF_ID"></label><label>Provinsi ID<input name="PROVINSI_ID"></label><label>Kota/Kab ID<input name="KABKOTA_ID"></label><div class="span-2"><small class="muted">Password awal akan dibuat backend sebagai password sementara.</small></div><div class="span-2" id="user-result"></div></form>`, `<button class="btn btn-light" data-modal-close>Batal</button><button class="btn btn-primary" id="save-user">Buat Akun</button>`));
  bindModalClose();
  $("#save-user").onclick = async () => {
    const f = $("#user-form");
    try {
      const r = await appApi.createUser(Object.fromEntries(new FormData(f).entries()));
      document.querySelector(".modal-backdrop")?.remove();
      toast(`Akun dibuat${r.temporaryPassword ? ` — password sementara: ${r.temporaryPassword}` : ""}`, "success");
      renderDashboardPage("users");
    } catch (err) { $("#user-result").innerHTML = `<div class="form-error">${escapeHtml(err.message)}</div>`; }
  };
}

export function bindAuthExpiry() {
  window.addEventListener("auth:expired", () => {
    clearAuth();
    toast("Sesi berakhir. Silakan login kembali.", "error");
    location.hash = "#/login";
  });
}
