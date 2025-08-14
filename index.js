// index.js (versión segura) — Oculta splash sin depender de nada y luego inicializa todo

// === 1) Ocultar splash de forma garantizada ===
(function setupSplash() {
  function showMain() {
    const splash = document.getElementById("splash");
    const contenido = document.getElementById("contenido-principal");
    if (splash) splash.style.display = "none";
    if (contenido) contenido.style.display = "block";
  }
  // el más rápido
  document.addEventListener("DOMContentLoaded", () => setTimeout(showMain, 300));
  // por si falla DOMContentLoaded en algún navegador
  window.addEventListener("load", () => setTimeout(showMain, 300));
  // fallback duro
  setTimeout(showMain, 4000);
  // toque en logo
  document.addEventListener("click", (e) => {
    const t = e.target;
    if (t && (t.id === "splash" || (t.classList && t.classList.contains("logo")))) showMain();
  });
})();

// === 2) Arrancar el resto cuando el splash ya no estorbe ===
window.addEventListener("load", () => {
  // Utilidades
  const WHATSAPP_BASE = "https://wa.me/5491169754570?text=";
  function nombreDesdeAlt(alt) {
    if (!alt) return "Producto";
    return alt.replace(/\.(jpg|jpeg|png|webp)$/i, "").replace(/[_\.]+/g, " ").replace(/\s+/g, " ").trim().replace(/\b\w/g, c => c.toUpperCase());
  }
  function categoriaDesdeSrc(src) {
    if (typeof src !== "string") return "Producto artesanal";
    if (src.includes("/ami.")) return "Amigurumi artesanal tejido a mano";
    if (src.includes("/res.")) return "Pieza artesanal en resina";
    return "Producto artesanal";
  }
  function descripcionGenerica(nombre, src) {
    const cat = categoriaDesdeSrc(src);
    if (cat.includes("Amigurumi")) return `${nombre} — ${cat}, suave y pensado para regalar o decorar. Consultá tiempos de confección y colores disponibles.`;
    if (cat.toLowerCase().includes("resina")) return `${nombre} — ${cat}, ideal para regalar o ambientar espacios. Consultá variedades y personalizaciones.`;
    return `${nombre} — Producto artesanal hecho con dedicación.`;
  }
  function formatARS(n) {
    try { return new Intl.NumberFormat("es-AR",{style:"currency",currency:"ARS",maximumFractionDigits:0}).format(n); }
    catch { return "$ " + Math.round(n); }
  }
  function normalizeKey(s) {
    if (s == null) return "";
    s = String(s).toLowerCase();
    s = s.replace(/\.(jpg|jpeg|png|webp)$/g, "");
    s = s.replace(/[._\-]+/g, " ");
    s = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    s = s.replace(/[^a-z0-9]+/g, " ").trim();
    return s;
  }

  // Slideshow fondo (no crítico)
  try {
    const imgs = Array.from(document.querySelectorAll(".subgrupo-fila img"));
    const sources = Array.from(new Set(imgs.map(i => i.getAttribute("src")).filter(Boolean)));
    let idx = 0;
    function applyBg(i){ document.body.style.backgroundImage = "url('" + sources[i] + "')"; }
    if (sources.length) {
      applyBg(idx);
      setInterval(() => { idx = (idx + 1) % sources.length; applyBg(idx); }, 6000);
    }
  } catch {}

  // Carrito
  const cartState = { items: [] };
  function productIdFromImg(img){ return img.getAttribute("src") || img.getAttribute("alt") || Math.random().toString(36).slice(2); }
  function renderCart(){
    const box = document.getElementById("cartItems");
    const totalSpan = document.getElementById("cartTotal");
    const header = document.querySelector("#cartBox h3");
    if (!box || !totalSpan || !header) return;
    box.innerHTML = "";
    let totalItems = 0, totalAmount = 0;
    cartState.items.forEach(it => {
      totalItems += it.qty;
      const row = document.createElement("div");
      row.style.display = "flex"; row.style.alignItems = "center"; row.style.justifyContent = "space-between"; row.style.gap = "8px"; row.style.padding = "6px 0";
      const name = document.createElement("div"); name.textContent = `${it.nombre}`;
      const controls = document.createElement("div"); controls.style.display="flex"; controls.style.alignItems="center"; controls.style.gap="6px";
      const minus = document.createElement("button"); minus.textContent="−"; minus.type="button"; minus.onclick=()=>{ it.qty=Math.max(0,it.qty-1); if(!it.qty){cartState.items=cartState.items.filter(x=>x.id!==it.id);} renderCart(); };
      const qty = document.createElement("span"); qty.textContent = it.qty;
      const plus = document.createElement("button"); plus.textContent="+"; plus.type="button"; plus.onclick=()=>{ it.qty+=1; renderCart(); };
      const remove = document.createElement("button"); remove.textContent="✕"; remove.type="button"; remove.title="Quitar"; remove.onclick=()=>{ cartState.items=cartState.items.filter(x=>x.id!==it.id); renderCart(); };
      controls.append(minus, qty, plus, remove);
      row.append(name, controls);
      box.appendChild(row);
      const row2 = document.createElement("div"); row2.style.display="flex"; row2.style.justifyContent="space-between"; row2.style.padding="0 0 8px 0";
      const priceInfo = document.createElement("div"); priceInfo.style.fontSize="0.9em"; priceInfo.style.opacity="0.8";
      if (typeof it.price === "number"){ const line = it.price * it.qty; totalAmount += line; priceInfo.textContent = `${formatARS(it.price)} c/u · ${formatARS(line)} subtotal`; }
      else { priceInfo.textContent = `Precio: consultar`; }
      row2.append(priceInfo, document.createElement("div"));
      box.appendChild(row2);
    });
    totalSpan.textContent = totalAmount > 0 ? formatARS(totalAmount) : String(totalItems);
    header.textContent = `🧺 Carrito (${totalItems})`;
  }
  (function(){
    const btnClear = document.getElementById("clearCart");
    const btnCheckout = document.getElementById("checkout");
    if (btnClear) btnClear.addEventListener("click", ()=>{ cartState.items=[]; renderCart(); });
    if (btnCheckout) btnCheckout.addEventListener("click", ()=>{
      if (!cartState.items.length) return;
      const lines = cartState.items.map(it => `• ${it.nombre} x${it.qty}${typeof it.price==='number' ? ` (${formatARS(it.price)} c/u)` : ""}`).join("%0A");
      window.open("https://wa.me/5491169754570?text=" + `Hola 👋 Quiero finalizar esta compra:%0A${lines}`, "_blank");
    });
  })();
  renderCart();

  // === Precios desde hoja PUBLICADA ===
  const GVIZ_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRHikMDQhLz92_Wz9LUvUor4JeUFcVJ2bmslpRgnlXZNxX-ig7UBKoI4JfMKTqHFfE5Gwv7OSDpsML8/gviz/tq?tqx=out:json";
  const priceIndex = {}; // key -> {nombre, precioNumber}

  function numberFromAny(v){
    if (v == null) return null;
    if (typeof v === "number") return v;
    const s = String(v).replace(/\./g,"").replace(",",".").replace(/[^0-9.]/g,"");
    const n = parseFloat(s); return isFinite(n) ? n : null;
  }

  async function loadPricesFromSheet(){
    try{
      const res = await fetch(GVIZ_URL, { cache: "no-store" });
      const txt = await res.text();
      if (/^\s*</.test(txt)) throw new Error("GViz devolvió HTML");
      const jsonStr = txt.replace(/^[^{]+/, "").replace(/;?$/, "");
      const data = JSON.parse(jsonStr);
      const cols = data.table.cols.map(c => (c.label || "").toString().toLowerCase());

      const priceIdx = cols.findIndex(c => /(precio|price|importe|valor)/i.test(c));
      const codeIdx  = cols.findIndex(c => /(codigo|código|sku|id|producto|nombre)/i.test(c));
      const nameIdx  = cols.findIndex(c => /(producto|nombre|descripcion|descripción|detalle|item)/i.test(c));
      const claveIdx = cols.findIndex(c => /(clave|key|llave)/i.test(c));
      const rutaIdx  = cols.findIndex(c => /(ruta|path|archivo|file|url)/i.test(c));

      (data.table.rows || []).forEach(row => {
        const c = row.c || [];
        const rawCode  = codeIdx  >= 0 && c[codeIdx]  ? (c[codeIdx].v  ?? c[codeIdx].f  ?? "") : "";
        const rawName  = nameIdx  >= 0 && c[nameIdx]  ? (c[nameIdx].v  ?? c[nameIdx].f  ?? "") : "";
        const rawClave = claveIdx >= 0 && c[claveIdx] ? (c[claveIdx].v ?? c[claveIdx].f ?? "") : "";
        const rawRuta  = rutaIdx  >= 0 && c[rutaIdx]  ? (c[rutaIdx].v  ?? c[rutaIdx].f  ?? "") : "";
        const rawPrice = priceIdx >= 0 && c[priceIdx] ? (c[priceIdx].v ?? c[priceIdx].f ?? "") : "";

        const precioNumber = numberFromAny(rawPrice);
        if (precioNumber == null) return;

        const keys = new Set();
        if (rawCode)  keys.add(normalizeKey(rawCode));
        if (rawName)  keys.add(normalizeKey(rawName));
        if (rawClave) keys.add(normalizeKey(rawClave));
        if (rawRuta)  { const file = String(rawRuta).split("/").pop() || rawRuta; keys.add(normalizeKey(rawRuta)); keys.add(normalizeKey(file)); }

        keys.forEach(k => { if (!k) return; priceIndex[k] = { nombre: String(rawName || rawCode || rawClave || "").trim(), precioNumber }; });
      });
    }catch(e){
      console.warn("No se pudieron cargar precios desde Sheets:", e);
    }
  }

  function tryGetPriceForImage(img, altName) {
    const src = img.getAttribute("src") || "";
    const file = src.split("/").pop() || "";
    const base = file.replace(/\.(jpg|jpeg|png|webp)$/i, "");

    const candidatesRaw = [base, altName];
    const candidates = [];
    candidatesRaw.forEach((c) => {
      const n = normalizeKey(c || "");
      if (!n) return;
      candidates.push(n);
      const withoutAmi = n.replace(/^(ami|amigurumi)\s+/i, "").trim();
      const withoutRes = n.replace(/^(res|resina)\s+/i, "").trim();
      if (withoutAmi && withoutAmi !== n) candidates.push(withoutAmi);
      if (withoutRes && withoutRes !== n) candidates.push(withoutRes);
    });
    for (const key of candidates) if (key && priceIndex[key]) return priceIndex[key];
    let best = null, bestLen = 0; const indexKeys = Object.keys(priceIndex);
    for (const key of candidates) for (const k of indexKeys) { if (!k) continue; if (key.includes(k) || k.includes(key)) { const len = Math.max(key.length, k.length); if (len > bestLen) { best = priceIndex[k]; bestLen = len; } } }
    if (best) return best;
    const splitWords = (s) => s.split(/\s+/).filter(Boolean);
    const candWordsList = candidates.map(splitWords).filter(arr => arr.length > 0);
    for (const k of indexKeys) {
      const kw = splitWords(k);
      for (const cw of candWordsList) {
        const inter = new Set(kw.filter(w => cw.includes(w)));
        if (inter.size >= 2) return priceIndex[k];
      }
    }
    return null;
  }

  // Cargar precios y pintar etiquetas debajo de cada imagen
  (async function initPricesBelowImages(){
    await loadPricesFromSheet();
    document.querySelectorAll(".subgrupo-fila img").forEach((img) => {
      if (img.nextElementSibling && img.nextElementSibling.classList && img.nextElementSibling.classList.contains("price-tag")) return;
      const nombre = nombreDesdeAlt(img.getAttribute("alt"));
      const priceData = tryGetPriceForImage(img, nombre);
      const precioTxt = (priceData && typeof priceData.precioNumber === "number") ? formatARS(priceData.precioNumber) : "Consultar";
      const priceTag = document.createElement("div");
      priceTag.className = "price-tag";
      priceTag.textContent = precioTxt;
      priceTag.style.fontWeight = "bold";
      priceTag.style.textAlign = "center";
      priceTag.style.marginTop = "4px";
      priceTag.style.color = "#d63384";
      priceTag.style.textShadow = "0 1px 0 rgba(255,255,255,0.75)";
      img.insertAdjacentElement("afterend", priceTag);
    });
  })();

  // Modal con datos + carrito
  (function setupImageClicksWithModal(){
    const imgs = document.querySelectorAll(".subgrupo-fila img");
    const modal = document.getElementById("modal");
    const imagenAmpliada = document.getElementById("imagen-ampliada");
    const nombreEl = document.getElementById("nombre-amigurumi");
    const descripcionEl = document.getElementById("historia-amigurumi");
    const link = document.getElementById("whatsapp-link");
    const descBox = document.getElementById("descripcion");

    imgs.forEach((img) => {
      img.addEventListener("click", () => {
        const alt = img.getAttribute("alt") || "Producto";
        const nombre = nombreDesdeAlt(alt);
        const descripcion = descripcionGenerica(nombre, img.getAttribute("src"));
        if (imagenAmpliada) imagenAmpliada.src = img.src;
        if (nombreEl) nombreEl.textContent = nombre;
        if (descripcionEl) descripcionEl.textContent = descripcion;

        const priceData = tryGetPriceForImage(img, nombre);
        let precioTxt = "Precio: consultar"; let precioNumber = null;
        if (priceData && typeof priceData.precioNumber === "number") { precioNumber = priceData.precioNumber; precioTxt = "Precio: " + formatARS(precioNumber); }
        let priceBlock = document.getElementById("modal-price");
        if (!priceBlock) { priceBlock = document.createElement("p"); priceBlock.id = "modal-price"; priceBlock.style.marginTop = "8px"; priceBlock.style.fontWeight = "600"; if (descBox) descBox.appendChild(priceBlock); }
        priceBlock.textContent = precioTxt;
        if (descBox) descBox.dataset.priceNumber = (precioNumber != null ? String(precioNumber) : "");

        const mensaje = encodeURIComponent(`Hola 👋 Me interesa el producto: ${nombre}. ¿Me pasás precio, colores y demora?`);
        if (link) link.href = WHATSAPP_BASE + mensaje;
        if (modal) modal.style.display = "flex";
      });
    });

    const closeBtn = document.querySelector(".cerrar");
    if (closeBtn) addEventListener("click", () => { if (modal) modal.style.display = "none"; });
    if (modal) modal.addEventListener("click", (event) => { if (event.target.id === "modal") event.currentTarget.style.display = "none"; });

    // Controles “Agregar al carrito”
    if (descBox) {
      const controls = document.createElement("div");
      controls.id = "modal-controls";
      controls.style.marginTop = "12px";
      controls.style.display = "flex";
      controls.style.alignItems = "center";
      controls.style.gap = "8px";
      controls.style.justifyContent = "center";

      const label = document.createElement("label"); label.textContent = "Cantidad:";
      const qtyInput = document.createElement("input"); qtyInput.type = "number"; qtyInput.min = "1"; qtyInput.value = "1"; qtyInput.id = "modal-qty"; qtyInput.style.width = "72px"; qtyInput.style.padding = "6px";
      const addBtn = document.createElement("button"); addBtn.textContent = "Agregar al carrito"; addBtn.type = "button"; addBtn.id = "modal-add";

      controls.append(label, qtyInput, addBtn);
      descBox.appendChild(controls);

      let lastClickedImg = null;
      document.querySelectorAll(".subgrupo-fila img").forEach((img) => {
        img.addEventListener("click", () => { lastClickedImg = img; qtyInput.value = "1"; });
      });

      addBtn.addEventListener("click", () => {
        if (!lastClickedImg) return;
        const id = productIdFromImg(lastClickedImg);
        const nombre = (document.getElementById("nombre-amigurumi").textContent || "Producto").trim();
        const qty = Math.max(1, parseInt(qtyInput.value || "1", 10));

        let priceNum = null;
        if (descBox && descBox.dataset && descBox.dataset.priceNumber) {
          const p = parseFloat(descBox.dataset.priceNumber);
          if (isFinite(p)) priceNum = p;
        }

        const existing = cartState.items.find((i) => i.id === id);
        if (existing) {
          existing.qty += qty;
          if (typeof existing.price !== "number" && typeof priceNum === "number") existing.price = priceNum;
        } else {
          const item = { id, nombre, qty };
          if (typeof priceNum === "number") item.price = priceNum;
          cartState.items.push(item);
        }
        renderCart();
      });
    }
  })();
});
