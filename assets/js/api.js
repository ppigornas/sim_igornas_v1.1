import { APP_CONFIG } from "./config.js";

function assertConfigured() {
  if (!APP_CONFIG.API_URL || APP_CONFIG.API_URL.includes("PASTE_GOOGLE_APPS_SCRIPT")) {
    throw new Error("API_URL belum dikonfigurasi. Edit assets/js/config.js.");
  }
}

export async function api(path, data = {}, options = {}) {
  assertConfigured();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeout || APP_CONFIG.REQUEST_TIMEOUT);
  const token = sessionStorage.getItem("org_session_token") || "";

  const payload = {
    path,
    ...data
  };

  if (token) payload.token = token;

  try {
    const response = await fetch(APP_CONFIG.API_URL, {
      method: options.method || "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
      redirect: "follow"
    });

    const text = await response.text();
    let result;
    try {
      result = JSON.parse(text);
    } catch {
      throw new Error("Respons server bukan JSON. Pastikan URL Web App Apps Script benar.");
    }

    if (!result.success) {
      const error = new Error(result.message || "Permintaan gagal.");
      error.code = result.code || "REQUEST_FAILED";
      error.details = result.details || null;

      if (["SESSION_INVALID", "SESSION_EXPIRED", "USER_NOT_FOUND", "ACCOUNT_NOT_ACTIVE"].includes(error.code)) {
        sessionStorage.removeItem("org_session_token");
        sessionStorage.removeItem("org_user");
        window.dispatchEvent(new CustomEvent("auth:expired"));
      }
      throw error;
    }

    return result.data;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Permintaan ke server timeout.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export const publicApi = {
  home: () => api("/public/home", {}),
  profile: () => api("/public/profile", {}),
  news: () => api("/public/news", {}),
  gallery: () => api("/public/gallery", {}),
  galleryPhotos: (galeriId) => api("/public/gallery/photos", { galeriId }),
  agenda: () => api("/public/agenda", {}),
  download: () => api("/public/download", {}),
  statistics: () => api("/public/statistics", {}),
  regions: (type, parentId = "") => api("/public/regions", { type, parentId })
};

export const authApi = {
  login: (username, password) => api("/auth/login", { username, password }),
  register: (data) => api("/auth/register", data),
  logout: () => api("/auth/logout", {}),
  session: () => api("/auth/session", {}),
  changePassword: (oldPassword, newPassword) => api("/auth/change-password", { oldPassword, newPassword })
};

export const appApi = {
  dashboard: () => api("/dashboard"),
  users: (filters = {}) => api("/users", filters),
  createUser: (data) => api("/users/create", data),
  resetPassword: (userId) => api("/users/reset-password", { userId }),
  members: (filters = {}) => api("/members", filters),
  member: (memberId) => api("/members/get", { memberId }),
  updateSelf: (data) => api("/members/update-self", data),
  submitChange: (data) => api("/members/submit-change", data),
  verifyMember: (pengajuanId, approved, note = "") => api("/members/verify", { pengajuanId, approved, note }),
  pengurus: (filters = {}) => api("/pengurus", filters),
  createPengurus: (data) => api("/pengurus/create", data),
  pengajuan: (filters = {}) => api("/pengajuan", filters),
  createPengajuan: (data) => api("/pengajuan/create", data),
  surat: (filters = {}) => api("/surat", filters),
  createSurat: (data) => api("/surat/create", data),
  suratDetail: (suratId) => api("/surat/detail", { suratId }),
  suratTemplates: (tingkat = "") => api("/surat/templates", { tingkat }),
  createSuratTemplate: (data) => api("/surat/templates/create", data),
  generatePdf: (suratId) => api("/surat/generate-pdf", { suratId }),
  websiteManage: (sheetName, action, record) => api("/website/manage", { sheetName, action, record }),
  announcements: () => api("/announcements"),
  logs: (limit = 50) => api("/logs", { limit }),
  reports: () => api("/reports"),
  backup: () => api("/backup"),
  upload: (data) => api("/drive/upload", data),
  driveFile: (fileId) => api("/drive/file", { fileId }),
  positions: (tingkat = "") => api("/positions", { tingkat }),
  createPosition: (data) => api("/positions/create", data),
  settings: () => api("/settings"),
  setSetting: (data) => api("/settings/set", data)
};
