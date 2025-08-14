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
  });

  // No tenemos precios; mostramos total como cantidad de ítems
  totalSpan.textContent = totalItems.toString();

  if (header) {
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
