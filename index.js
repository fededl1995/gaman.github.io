// script.js - Controla el splash screen y los modales de productos
window.addEventListener("load", function () {
  setTimeout(function () {
    document.getElementById("splash").style.display = "none";
    document.getElementById("contenido-principal").style.display = "block";
  }, 2500); // 2.5 segundos
});

/**
 * === REGLAS IMPORTANTES ===
 * - No agregamos ni quitamos productos.
 * - Tomamos exactamente las imágenes que ya existen en el HTML (.subgrupo-fila img)
 * - Usamos su atributo ALT como nombre del producto.
 * - Armamos una descripción genérica según la categoría (amigurumis / resina).
 * - Linkeamos WhatsApp a 5491169754570 con el nombre del producto.
 */

const WHATSAPP_BASE = "https://wa.me/5491169754570?text=";

// Normaliza el nombre a partir del alt (sin tocar la cantidad/orden de productos)
function nombreDesdeAlt(alt) {
  if (!alt) return "Producto";
  // Pone mayúscula inicial en cada palabra, y reemplaza guiones/puntos por espacios
  return alt
    .replace(/\.(jpg|jpeg|png|webp)$/i, "")
    .replace(/[_\.]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, c => c.toUpperCase());
}

// Detecta categoría por la ruta del src
function categoriaDesdeSrc(src) {
  if (typeof src !== "string") return "Producto artesanal";
  if (src.includes("/ami.")) return "Amigurumi artesanal tejido a mano";
  if (src.includes("/res.")) return "Pieza artesanal en resina";
  return "Producto artesanal";
}

function descripcionGenerica(nombre, src) {
  const cat = categoriaDesdeSrc(src);
  if (cat.includes("Amigurumi")) {
    return `${nombre} — ${cat}, suave y pensado para regalar o decorar. Consultá tiempos de confección y colores disponibles.`;
  }
  if (cat.includes("resina") || cat.includes("Resina")) {
    return `${nombre} — ${cat}, ideal para regalar o ambientar espacios. Consultá variedades y personalizaciones.`;
  }
  return `${nombre} — Producto artesanal hecho con dedicación.`;
}

// Click en cualquier imagen existente (sin agregar ni quitar)
document.querySelectorAll(".subgrupo-fila img").forEach((img) => {
  img.addEventListener("click", () => {
    const modal = document.getElementById("modal");
    const imagenAmpliada = document.getElementById("imagen-ampliada");
    const nombreEl = document.getElementById("nombre-amigurumi");
    const descripcionEl = document.getElementById("historia-amigurumi");
    const link = document.getElementById("whatsapp-link");

    const alt = img.getAttribute("alt") || "Producto";
    const nombre = nombreDesdeAlt(alt);
    const descripcion = descripcionGenerica(nombre, img.getAttribute("src"));

    imagenAmpliada.src = img.src;
    nombreEl.textContent = nombre;
    descripcionEl.textContent = descripcion;

    
    // Precio desde Sheets (si existe)
    const priceData = tryGetPriceForImage(img, nombre);
    let precioTxt = "";
    let precioNumber = null;
    if (priceData && typeof priceData.precioNumber === "number") {
      precioNumber = priceData.precioNumber;
      precioTxt = "Precio: " + formatARS(precioNumber);
    } else {
      precioTxt = "Precio: consultar";
    }
    // Inserta/actualiza bloque de precio
    let priceBlock = document.getElementById("modal-price");
    if (!priceBlock) {
      priceBlock = document.createElement("p");
      priceBlock.id = "modal-price";
      priceBlock.style.marginTop = "8px";
      priceBlock.style.fontWeight = "600";
      document.getElementById("descripcion").appendChild(priceBlock);
    }
    priceBlock.textContent = precioTxt;
    // Guarda en dataset del modal para usar al agregar al carrito
    document.getElementById("descripcion").dataset.priceNumber = (precioNumber != null ? String(precioNumber) : "");
const mensaje = encodeURIComponent(`Hola 👋 Me interesa el producto: ${nombre}. ¿Me pasás precio, colores y demora?`);
    link.href = WHATSAPP_BASE + mensaje;

    modal.style.display = "flex";
  });
});

// Cierre del modal
document.querySelector(".cerrar").addEventListener("click", () => {
  document.getElementById("modal").style.display = "none";
});

// Cerrar si se hace clic fuera del contenido del modal
document.getElementById("modal").addEventListener("click", (event) => {
  if (event.target.id === "modal") {
    event.currentTarget.style.display = "none";
  }
});

/* === Background slideshow armado desde las imágenes ya existentes === */
(function setupBackgroundFromMedia(){
  const imgs = Array.from(document.querySelectorAll(".subgrupo-fila img"));
  const sources = Array.from(new Set(imgs.map(img => img.getAttribute("src")).filter(Boolean)));
  if (sources.length === 0) return;

  const preloaded = [];
  sources.forEach(src => {
    const im = new Image();
    im.src = src;
    preloaded.push(im);
  });

  let idx = 0;
  function applyBg(i){
    document.body.style.backgroundImage = "url('" + sources[i] + "')";
  }
  applyBg(idx);

  setInterval(() => {
    idx = (idx + 1) % sources.length;
    applyBg(idx);
  }, 6000);
})();

// =========================
// Carrito (sin cambiar productos)
// =========================
const cartState = {
  items: [] // {id, nombre, qty}
};

function productIdFromImg(img) {
  // Use src as unique id to avoid duplicados (no agregamos ni sacamos productos)
  return img.getAttribute("src") || img.getAttribute("alt") || Math.random().toString(36).slice(2);
}

function renderCart() {
  const box = document.getElementById("cartItems");
  const totalSpan = document.getElementById("cartTotal");
  const header = document.querySelector("#cartBox h3");
  if (!box) return;

  box.innerHTML = "";
  let totalItems = 0;

  
  let totalAmount = 0;
cartState.items.forEach(it => {
    totalItems += it.qty;
    const row = document.createElement("div");
    row.className = "cart-row";
    row.style.display = "flex";
    row.style.alignItems = "center";
    row.style.justifyContent = "space-between";
    row.style.gap = "8px";
    row.style.padding = "6px 0";

    const name = document.createElement("div");
    name.textContent = `${it.nombre}`;

    
    const priceInfo = document.createElement("div");
    priceInfo.style.fontSize = "0.9em";
    priceInfo.style.opacity = "0.8";
    if (typeof it.price === "number") {
      const line = it.price * it.qty;
      totalAmount += line;
      priceInfo.textContent = `${formatARS(it.price)} c/u · ${formatARS(line)} subtotal`;
    } else {
      priceInfo.textContent = `Precio: consultar`;
    }
const controls = document.createElement("div");
    controls.style.display = "flex";
    controls.style.alignItems = "center";
    controls.style.gap = "6px";

    const minus = document.createElement("button");
    minus.textContent = "−";
    minus.type = "button";
    minus.onclick = () => {
      it.qty = Math.max(0, it.qty - 1);
      if (it.qty === 0) {
        cartState.items = cartState.items.filter(x => x.id !== it.id);
      }
      renderCart();
    };

    const qty = document.createElement("span");
    qty.textContent = it.qty;

    const plus = document.createElement("button");
    plus.textContent = "+";
    plus.type = "button";
    plus.onclick = () => {
      it.qty += 1;
      renderCart();
    };

    const remove = document.createElement("button");
    remove.textContent = "✕";
    remove.type = "button";
    remove.title = "Quitar";
    remove.onclick = () => {
      cartState.items = cartState.items.filter(x => x.id !== it.id);
      renderCart();
    };

    controls.append(minus, qty, plus, remove);
    row.append(name, controls);
    box.appendChild(row);
  
    // Segunda fila con precios
    const row2 = document.createElement("div");
    row2.style.display = "flex";
    row2.style.justifyContent = "space-between";
    row2.style.padding = "0 0 8px 0";
    row2.append(priceInfo, document.createElement("div"));
    box.appendChild(row2);
});

  // No tenemos precios; mostramos total como cantidad de ítems
  totalSpan.textContent = (totalAmount > 0 ? formatARS(totalAmount) : totalItems.toString());if (header) {
    header.textContent = `🧺 Carrito (${totalItems})`;
  }
}

// Inyecta selector de cantidad y botón de "Agregar al carrito" en el modal
(function injectModalControls(){
  const modal = document.getElementById("modal");
  const descBox = document.getElementById("descripcion");
  if (!modal || !descBox) return;

  const controls = document.createElement("div");
  controls.id = "modal-controls";
  controls.style.marginTop = "12px";
  controls.style.display = "flex";
  controls.style.alignItems = "center";
  controls.style.gap = "8px";
  controls.style.justifyContent = "center";

  // Cantidad
  const label = document.createElement("label");
  label.textContent = "Cantidad:";

  const qtyInput = document.createElement("input");
  qtyInput.type = "number";
  qtyInput.min = "1";
  qtyInput.value = "1";
  qtyInput.id = "modal-qty";
  qtyInput.style.width = "72px";
  qtyInput.style.padding = "6px";

  // Botón agregar
  const addBtn = document.createElement("button");
  addBtn.textContent = "Agregar al carrito";
  addBtn.type = "button";
  addBtn.id = "modal-add";

  controls.append(label, qtyInput, addBtn);
  descBox.appendChild(controls);

  // Asocia el botón a la última imagen clickeada
  let lastClickedImg = null;
  document.querySelectorAll(".subgrupo-fila img").forEach((img) => {
    img.addEventListener("click", () => {
      lastClickedImg = img;
      qtyInput.value = "1"; // reset
    });
  });

  addBtn.addEventListener("click", () => {
    if (!lastClickedImg) return;
    const id = productIdFromImg(lastClickedImg);
    const nombre = (document.getElementById("nombre-amigurumi").textContent || "Producto").trim();
    const qty = Math.max(1, parseInt(qtyInput.value || "1", 10));

    const existing = cartState.items.find(i => i.id == id);
    if (existing) {
      existing.qty += qty;
    } else {
      cartState.items.push({id, nombre, qty});
    }
    renderCart();
  });
})();

// Botones Vaciar / Finalizar

  // Precio almacenado en modal (si existe)
  const descBox = document.getElementById("descripcion");
  let priceNum = null;
  if (descBox && descBox.dataset && descBox.dataset.priceNumber) {
    const p = parseFloat(descBox.dataset.priceNumber);
    if (isFinite(p)) priceNum = p;
  }

  if (existing) {
    existing.qty += qty;
  } else {
    cartState.items.push({id, nombre, qty, price: priceNum});
  }
  renderCart();
}); // addBtn click
})(); // injectModalControls

// Botones Vaciar / Finalizar
(function setupCartButtons(){
  const btnClear = document.getElementById("clearCart");
  const btnCheckout = document.getElementById("checkout");
  if (btnClear) {
    btnClear.addEventListener("click", () => {
      cartState.items = [];
      renderCart();
    });
  }
  if (btnCheckout) {
    btnCheckout.addEventListener("click", () => {
      if (cartState.items.length === 0) return;
      // Armar resumen para WhatsApp
      const lines = cartState.items.map(it => `• ${it.nombre} x${it.qty}`).join("%0A");
      const msg = `Hola 👋 Quiero finalizar esta compra:%0A${lines}`;
      const url = "https://wa.me/5491169754570?text=" + msg;
      window.open(url, "_blank");
    });
  }
})();

// Inicializa contador en 0
renderCart();



// =========================
// Integración de precios desde Google Sheets
// =========================
const SHEET_ID = "1nJIU0ky7Ih_6zUF1M2ui3JVsLmdLXwgVXxpWt3ToiqM"; // provisto por el usuario
// Toma la PRIMERA hoja por defecto (gviz) sin necesidad de publicar explícitamente si está "Cualquiera con el enlace - lector"
const GVIZ_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

const priceIndex = {
  // key normalizado -> { nombre, precioNumber }
};

function normalizeKey(s) {
  if (s == null) return "";
  s = String(s).toLowerCase();
  // quita extensión de archivo
  s = s.replace(/\.(jpg|jpeg|png|webp)$/g, "");
  // reemplaza separadores comunes por espacio
  s = s.replace(/[._\-]+/g, " ");
  // quita tildes
  s = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  // quita todo lo que no sea alfanumérico
  s = s.replace(/[^a-z0-9]+/g, " ").trim();
  return s;
}

function numberFromAny(v) {
  if (v == null) return null;
  if (typeof v === "number") return v;
  const s = String(v).replace(/\./g, "").replace(",", ".").replace(/[^0-9.]/g, "");
  const n = parseFloat(s);
  return isFinite(n) ? n : null;
}

function formatARS(n) {
  try {
    return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);
  } catch {
    return "$ " + Math.round(n);
  }
}

async function loadPricesFromSheet() {
  try {
    const res = await fetch(GVIZ_URL);
    const txt = await res.text();
    const jsonStr = txt.replace(/^[^{]+/, "").replace(/;?$/, ""); // recorta wrapper
    const data = JSON.parse(jsonStr);
    const cols = data.table.cols.map(c => (c.label || "").toString().toLowerCase());

    // Detecta columnas
    const priceIdx = cols.findIndex(c => /(precio|price|importe|valor)/i.test(c));
    const codeIdx  = cols.findIndex(c => /(codigo|código|sku|id|producto|nombre)/i.test(c));
    const nameIdx  = cols.findIndex(c => /(producto|nombre|descripcion|descripción|detalle|item)/i.test(c));

    data.table.rows.forEach(row => {
      const c = row.c || [];
      const rawCode = codeIdx >= 0 && c[codeIdx] ? (c[codeIdx].v ?? c[codeIdx].f ?? "") : "";
      const rawName = nameIdx >= 0 && c[nameIdx] ? (c[nameIdx].v ?? c[nameIdx].f ?? "") : "";
      const rawPrice = priceIdx >= 0 && c[priceIdx] ? (c[priceIdx].v ?? c[priceIdx].f ?? "") : "";

      const precioNumber = numberFromAny(rawPrice);
      if (precioNumber == null) return;

      const keys = new Set();
      if (rawCode) keys.add(normalizeKey(rawCode));
      if (rawName) keys.add(normalizeKey(rawName));

      keys.forEach(k => {
        if (!k) return;
        priceIndex[k] = {
          nombre: String(rawName || rawCode || "").trim(),
          precioNumber
        };
      });
    });
  } catch (e) {
    console.warn("No se pudieron cargar precios desde Sheets:", e);
  }
}

// Llama una vez al inicio
loadPricesFromSheet();

function tryGetPriceForImage(img, altName) {
  const src = img.getAttribute("src") || "";
  const file = src.split("/").pop() || "";
  const base = file.replace(/\.(jpg|jpeg|png|webp)$/i, "");

  const candidates = [
    normalizeKey(base),
    normalizeKey(altName),
  ];

  for (const key of candidates) {
    if (key && priceIndex[key]) {
      return priceIndex[key];
    }
  }
  return null;
}
