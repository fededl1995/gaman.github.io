// Splash screen
window.addEventListener("load", function () {
  setTimeout(function () {
    document.getElementById("splash").style.display = "none";
    document.getElementById("contenido-principal").style.display = "block";
  }, 800); // más rápido para probar
});

// Fondo rotativo
const imagenes = [
  "https://picnic.media/wp-content/uploads/2021/06/PORTADA-1140x700.jpg",
  "https://acdn-us.mitiendanube.com/stores/001/935/440/products/img_3806-40a9a9f4d66513d0f617222679218351-1024-1024.jpeg",
  "https://www.thesnuglies.com/wp-content/uploads/2023/06/tipos-de-amigurumi.png",
  "https://patronamigurumi.top/wp-content/uploads/tortuga-1024x1017.jpg",
  "https://devmedia.discovernikkei.org/articles/8911/amigurumi1.jpg",
  "https://mymodernmet.com/wp/wp-content/uploads/2019/01/what-is-amigurumi-17.jpg"
];
let indexBg = 0;
setInterval(() => {
  indexBg = (indexBg + 1) % imagenes.length;
  document.body.style.backgroundImage = `url('${imagenes[indexBg]}')`;
}, 6000);

/* ========== GOOGLE SHEETS PRECIOS (robusto) ========== */
const SHEET_ID = "1nJIU0ky7Ih_6zUF1M2ui3JVsLmdLXwgVXxpWt3ToiqM";
const tabCandidates = ["Sheet1", "Hoja 1", "Hoja1", "Precios", "Productos", "Lista"];
const COL_NAME = "Producto";
const COL_PRICE = "Precio";
const CSV_URL = ""; // opcional, pegar URL CSV publicada
let preciosMap = new Map();

function toNumberAR(value) {
  if (typeof value !== "string") value = String(value ?? "");
  const v = value.replace(/\s|\$/g, "").replace(/\./g, "").replace(",", ".");
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}
function formatCurrencyARS(n) {
  try {
    return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);
  } catch {
    return "$ " + Math.round(n);
  }
}

async function fetchCSV(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`CSV HTTP ${res.status}`);
  const text = await res.text();
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) throw new Error("CSV vacío");
  const headers = lines[0].split(",").map(h => h.trim());
  const idxName = headers.indexOf(COL_NAME);
  const idxPrice = headers.indexOf(COL_PRICE);
  if (idxName === -1 || idxPrice === -1) {
    throw new Error(`CSV sin columnas ${COL_NAME} / ${COL_PRICE}`);
  }
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");
    const name = (cols[idxName] || "").trim().toLowerCase();
    const price = toNumberAR(cols[idxPrice] || "");
    if (name && Number.isFinite(price)) preciosMap.set(name, price);
  }
}
async function fetchGViz(sheetId, tabName) {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?sheet=${encodeURIComponent(tabName)}&tqx=out:json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GViz HTTP ${res.status}`);
  const text = await res.text();
  const json = JSON.parse(text.replace(/^[^(]+\(/, "").replace(/\);?$/, ""));
  const cols = json.table.cols.map(c => (c.label || "").trim());
  const idxName = cols.indexOf(COL_NAME);
  const idxPrice = cols.indexOf(COL_PRICE);
  if (idxName === -1 || idxPrice === -1) {
    throw new Error(`Pestaña "${tabName}" sin columnas ${COL_NAME}/${COL_PRICE}`);
  }
  (json.table.rows || []).forEach(r => {
    const c = r.c || [];
    const name = (c[idxName]?.v ?? "").toString().trim().toLowerCase();
    const rawPrice = (c[idxPrice]?.v ?? c[idxPrice]?.f ?? "").toString().trim();
    const price = toNumberAR(rawPrice);
    if (name && Number.isFinite(price)) preciosMap.set(name, price);
  });
}
async function cargarPrecios() {
  preciosMap.clear();
  if (CSV_URL) {
    try { await fetchCSV(CSV_URL); console.info("[PRECIOS] CSV:", preciosMap.size); return; }
    catch(e){ console.warn("[PRECIOS] CSV falló:", e.message); }
  }
  let ultimoError = null;
  for (const tab of tabCandidates) {
    try {
      await fetchGViz(SHEET_ID, tab);
      if (preciosMap.size > 0) { console.info(`[PRECIOS] GViz "${tab}":`, preciosMap.size); return; }
    } catch(e) {
      ultimoError = e;
      console.warn(`[PRECIOS] Tab "${tab}" falló:`, e.message);
    }
  }
  if (ultimoError) console.error(ultimoError);
}
cargarPrecios();

/* ========== MODAL PRODUCTO ========== */
let ultimoProductoAbierto = { nombre: null, precio: null };

document.querySelectorAll(".subgrupo-fila img").forEach((img) => {
  img.addEventListener("click", () => {
    const modal = document.getElementById("modal");
    const imagenAmpliada = document.getElementById("imagen-ampliada");
    const nombre = document.getElementById("nombre-amigurumi");
    const historia = document.getElementById("historia-amigurumi");
    const precioEl = document.getElementById("precio-amigurumi");
    const cantidadInput = document.getElementById("cantidad");
    const totalEl = document.getElementById("total-amigurumi");
    const link = document.getElementById("whatsapp-product-link");

    const alt = img.alt.trim();
    imagenAmpliada.src = img.src;
    nombre.textContent = alt;
    historia.textContent = "Amigurumi artesanal hecho con dedicación.";

    const precio = preciosMap.get(alt.toLowerCase()) ?? null;
    ultimoProductoAbierto = { nombre: alt, precio };

    if (precio) {
      precioEl.textContent = formatCurrencyARS(precio);
      totalEl.textContent = formatCurrencyARS(precio);
      cantidadInput.value = 1;
      cantidadInput.oninput = () => {
        const cant = Math.max(1, parseInt(cantidadInput.value) || 1);
        totalEl.textContent = formatCurrencyARS(precio * cant);
      };
    } else {
      precioEl.textContent = "Consultar";
      totalEl.textContent = "-";
      cantidadInput.value = 1;
      cantidadInput.oninput = null;
    }

    link.href = "https://wa.me/5491169754570?text=Hola!%20Quiero%20consultar%20por%20el%20amigurumi%20" + encodeURIComponent(alt);
    modal.style.display = "flex";
  });
});

// Cerrar modal
document.querySelector(".cerrar").addEventListener("click", () => {
  document.getElementById("modal").style.display = "none";
});
document.getElementById("modal").addEventListener("click", (event) => {
  if (event.target.id === "modal") event.currentTarget.style.display = "none";
});

/* ========== CARRITO ========== */
const LS_KEY = "cart_items_v1";
function loadCart() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; }
  catch { return []; }
}
function saveCart(items) {
  localStorage.setItem(LS_KEY, JSON.stringify(items));
}
function cartCount(items) { return items.reduce((acc, it) => acc + it.qty, 0); }
function cartTotal(items) { return items.reduce((acc, it) => acc + (it.price || 0) * it.qty, 0); }

function updateCartBadge() {
  const items = loadCart();
  document.getElementById("cart-count").textContent = cartCount(items);
}

function addToCart(nombre, precio, qty) {
  const items = loadCart();
  const key = nombre.toLowerCase();
  const idx = items.findIndex(it => it.name.toLowerCase() === key && (it.price || 0) === (precio || 0));
  if (idx >= 0) {
    items[idx].qty += qty;
  } else {
    items.push({ name: nombre, price: precio, qty });
  }
  saveCart(items);
  updateCartBadge();
}

document.getElementById("add-to-cart").addEventListener("click", () => {
  const cantidadInput = document.getElementById("cantidad");
  const qty = Math.max(1, parseInt(cantidadInput.value) || 1);
  const { nombre, precio } = ultimoProductoAbierto;
  addToCart(nombre, precio, qty);
  // Feedback rápido
  document.getElementById("modal").style.display = "none";
  openCart();
});

/* ========== Drawer del carrito ========== */
const drawer = document.getElementById("cart-drawer");
const cartBtn = document.getElementById("cart-button");
const cartClose = document.getElementById("cart-close");
const cartItemsEl = document.getElementById("cart-items");
const cartTotalEl = document.getElementById("cart-total");

function openCart() { drawer.classList.add("open"); drawer.setAttribute("aria-hidden", "false"); renderCart(); }
function closeCart() { drawer.classList.remove("open"); drawer.setAttribute("aria-hidden", "true"); }

cartBtn.addEventListener("click", openCart);
cartClose.addEventListener("click", closeCart);

function renderCart() {
  const items = loadCart();
  cartItemsEl.innerHTML = "";
  items.forEach((it, idx) => {
    const li = document.createElement("li");
    const precioTxt = it.price ? formatCurrencyARS(it.price) : "Consultar";
    const subtotal = it.price ? formatCurrencyARS((it.price||0) * it.qty) : "-";
    li.innerHTML = `
      <div>
        <div class="cart-line-title">${it.name}</div>
        <div class="cart-line-meta">${precioTxt} · Subtotal: ${subtotal}</div>
      </div>
      <div class="qty-controls" data-idx="${idx}">
        <button class="dec">-</button>
        <span>${it.qty}</span>
        <button class="inc">+</button>
        <button class="remove-line" title="Quitar">🗑</button>
      </div>
    `;
    cartItemsEl.appendChild(li);
  });
  cartTotalEl.textContent = formatCurrencyARS(cartTotal(items));

  // Bind controls
  cartItemsEl.querySelectorAll(".qty-controls").forEach(ctrl => {
    const i = parseInt(ctrl.dataset.idx);
    ctrl.querySelector(".dec").onclick = () => { changeQty(i, -1); };
    ctrl.querySelector(".inc").onclick = () => { changeQty(i, +1); };
    ctrl.querySelector(".remove-line").onclick = () => { removeLine(i); };
  });
}
function changeQty(i, delta) {
  const items = loadCart();
  items[i].qty = Math.max(1, items[i].qty + delta);
  saveCart(items); renderCart(); updateCartBadge();
}
function removeLine(i) {
  const items = loadCart();
  items.splice(i, 1);
  saveCart(items); renderCart(); updateCartBadge();
}

// Finalizar pedido -> compone WhatsApp
document.getElementById("finalizar-btn").addEventListener("click", () => {
  const items = loadCart();
  if (!items.length) { alert("Tu carrito está vacío."); return; }
  const lineas = items.map(it => {
    const precioTxt = it.price ? formatCurrencyARS(it.price) : "Consultar";
    const subtotal = it.price ? formatCurrencyARS((it.price||0) * it.qty) : "Consultar";
    return `• ${it.name} x${it.qty} @ ${precioTxt} = ${subtotal}`;
  });
  const total = formatCurrencyARS(cartTotal(items));
  const mensaje = `Hola! Quiero hacer este pedido:%0A%0A${encodeURIComponent(lineas.join("%0A"))}%0A%0ATotal: ${encodeURIComponent(total)}%0A%0A¿Me confirmás disponibilidad y tiempos?`;

  const wa = `https://wa.me/5491169754570?text=${mensaje}`;
  window.open(wa, "_blank");

  // Opcional: limpiar carrito tras abrir WhatsApp
  // localStorage.removeItem(LS_KEY);
  // updateCartBadge(); renderCart(); closeCart();
});

// Init badge on load
updateCartBadge();
