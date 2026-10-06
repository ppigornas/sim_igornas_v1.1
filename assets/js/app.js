import { APP_CONFIG } from "./config.js";
import { getUser, restoreSession } from "./auth.js";
import { renderPublicHome, renderPublicList, renderLogin, renderRegister, renderDashboardPage, bindAuthExpiry } from "./pages.js";
import { toast } from "./ui.js";

function route() {
  const raw = location.hash.replace(/^#\/?/, "");
  const parts = raw.split("/").filter(Boolean);
  if (!parts.length) return {type:"home"};
  if (parts[0] === "login") return {type:"login"};
  if (parts[0] === "register") return {type:"register"};
  if (parts[0] === "news") return {type:"public", page:"news"};
  if (parts[0] === "agenda") return {type:"public", page:"agenda"};
  if (parts[0] === "gallery") return {type:"public", page:"gallery"};
  if (parts[0] === "download") return {type:"public", page:"download"};
  if (parts[0] === "app") return {type:"app", page:parts[1] || "dashboard"};
  return {type:"home"};
}

async function render() {
  const r = route();
  if (r.type === "app" && !getUser()) {
    location.hash = "#/login";
    return;
  }
  try {
    if (r.type === "home") return renderPublicHome();
    if (r.type === "login") return renderLogin();
    if (r.type === "register") return renderRegister();
    if (r.type === "public") return renderPublicList(r.page);
    if (r.type === "app") return renderDashboardPage(r.page);
  } catch (e) {
    document.querySelector("#app").innerHTML = `<div class="fatal-error"><h1>Terjadi kesalahan</h1><p>${e.message}</p></div>`;
  }
}

async function boot() {
  bindAuthExpiry();
  const user = await restoreSession();
  if (user && ["", "login", "register"].includes(route().type === "home" ? "" : route().type)) {
    // Tetap tampilkan website publik; pengguna bisa masuk dashboard melalui menu.
  }
  window.addEventListener("hashchange", render);
  await render();
}

boot();
