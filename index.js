// script.js - Controla el splash screen

window.addEventListener("load", function () {
  setTimeout(function () {
    document.getElementById("splash").style.display = "none";
    document.getElementById("contenido-principal").style.display = "block";
  }, 2500); // 2500 milisegundos = 2.5 segundos
});
// const imagenes = []; // replaced: now auto-build from media images

let index = 0;

// slideshow interval replaced below
document.querySelectorAll(".subgrupo-fila img").forEach((img, i) => {
  img.addEventListener("click", () => {
    const modal = document.getElementById("modal");
    const imagenAmpliada = document.getElementById("imagen-ampliada");
    const nombre = document.getElementById("nombre-amigurumi");
    const historia = document.getElementById("historia-amigurumi");
    const link = document.getElementById("whatsapp-link");

    // Datos de ejemplo: reemplazá esto por tu información real
    const datos = {
      "Gatito": {
        nombre: "Gatito tierno",
        historia: "Este amigurumi fue tejido a mano en 2024 con lana suave y mucho amor.",
        whatsapp: "https://wa.me/549XXXXXXXXXX?text=Hola!%20Me%20interesa%20el%20Gatito%20tierno"
      },
      "Osito": {
        nombre: "Osito cariñoso",
        historia: "Este osito acompaña dulces sueños desde hace generaciones.",
        whatsapp: "https://wa.me/549XXXXXXXXXX?text=Hola!%20Quiero%20más%20info%20sobre%20el%20Osito%20cariñoso"
      },
      "Conejo": {
        nombre: "Conejo saltarín",
        historia: "Tejido con amor para saltar de alegría con vos.",
        whatsapp: "https://wa.me/549XXXXXXXXXX?text=Hola!%20Estoy%20interesado%20en%20el%20Conejo%20saltarín"
      }
    };

    const alt = img.alt;
    if (datos[alt]) {
      imagenAmpliada.src = img.src;
      nombre.textContent = datos[alt].nombre;
      historia.textContent = datos[alt].historia;
      link.href = datos[alt].whatsapp;
    } else {
      imagenAmpliada.src = img.src;
      nombre.textContent = alt;
      historia.textContent = "Amigurumi artesanal hecho con dedicación.";
      link.href = "https://wa.me/549XXXXXXXXXX?text=Hola!%20Quiero%20consultar%20por%20el%20amigurumi%20" + encodeURIComponent(alt);
    }

    modal.style.display = "flex";
  });
});

// Para cerrar el modal
document.querySelector(".cerrar").addEventListener("click", () => {
  document.getElementById("modal").style.display = "none";
});


// Cerrar si se hace clic fuera del contenido del modal
document.getElementById("modal").addEventListener("click", (event) => {
  // Si se clickea directamente sobre el fondo (el modal mismo), se cierra
  if (event.target.id === "modal") {
    event.currentTarget.style.display = "none";
  }
});

/* === Background slideshow built from media images present in the page === */
(function setupBackgroundFromMedia(){
  // Collect unique image sources from the galleries
  const imgs = Array.from(document.querySelectorAll(".subgrupo-fila img"));
  const sources = Array.from(new Set(imgs.map(img => img.getAttribute("src")).filter(Boolean)));

  // Fallback: if nothing found, keep current background without rotating
  if (sources.length === 0) return;

  // Preload images to avoid flashes
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


/* === Productos desde Google Sheets === */
(function(){
  const SHEET_ID   = "1nJIU0ky7Ih_6zUF1M2ui3JVsLmdLXwgVXxpWt3ToiqM";
  const SHEET_NAME = "Hoja 1"; // Cambiá si tu pestaña se llama distinto
  const SHEET_URL  = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}&cachebust=${Date.now()}`;

  async function fetchProducts(){
    const res = await fetch(SHEET_URL, { cache: "no-store" });
    const txt = await res.text();
    // gviz envuelve el JSON en una función, por eso recortamos:
    const json = JSON.parse(txt.substring(47, txt.length - 2));
    const cols = json.table.cols.map(c => (c.label || "").toLowerCase().trim());
    const rows = json.table.rows.map(r => r.c.map(c => c?.v ?? ""));

    // Columnas esperadas (al menos): id, nombre, precio
    const idx = {
      id: cols.indexOf("id"),
      nombre: cols.indexOf("nombre"),
      precio: cols.indexOf("precio"),
      stock: cols.indexOf("stock"),
      imagen: cols.indexOf("imagen"),
      activo: cols.indexOf("activo"),
      descripcion: cols.indexOf("descripcion"),
    };

    function val(r, k){
      const i = idx[k];
      return i >= 0 ? r[i] : "";
    }

    const productos = rows.map(r => {
      const activo = String(val(r, "activo")).toLowerCase();
      const isActive = (activo === "" || activo === "true" || activo === "si" || activo === "sí" || activo === "1");
      const precioNum = Number(val(r, "precio"));
      return {
        id: String(val(r, "id") || ""),
        nombre: String(val(r, "nombre") || ""),
        precio: Number.isFinite(precioNum) ? precioNum : 0,
        stock: Number(val(r, "stock") || 0),
        imagen: val(r, "imagen") || "media/logo.jpeg",
        activo: isActive,
        descripcion: String(val(r, "descripcion") || ""),
      };
    }).filter(p => p.activo && p.nombre && Number.isFinite(p.precio));

    return productos;
  }

  function renderProductos(list){
    const el = document.getElementById("lista-productos");
    if (!el) return;
    el.innerHTML = "";
    list.forEach(p => {
      const card = document.createElement("div");
      card.className = "card";
      const precio = `$ ${p.precio.toLocaleString("es-AR")}`;
      const wa = `https://wa.me/5491169754570?text=${encodeURIComponent("Hola! Quiero comprar: " + p.nombre + " (" + precio + ")")}`;
      card.innerHTML = `
        <img src="${p.imagen}" alt="${p.nombre}">
        <h4>${p.nombre}</h4>
        <p><strong>${precio}</strong></p>
        ${p.descripcion ? `<p class="muted">${p.descripcion}</p>` : ``}
        <a class="btn-buy" href="${wa}" target="_blank" rel="noopener">Comprar por WhatsApp</a>
      `;
      el.appendChild(card);
    });
  }

  // Cargar al inicio (después de que aparezca el contenido principal)
  window.addEventListener("load", async () => {
    try{
      const productos = await fetchProducts();
      renderProductos(productos);
    }catch(err){
      console.error("No pudimos cargar productos desde Google Sheets:", err);
    }
  });
})();


/* === Carrito (localStorage) === */
const CART_KEY = "carrito_tienda";
function getCart(){ try { return JSON.parse(localStorage.getItem(CART_KEY)||"[]"); } catch(e){ return []; } }
function saveCart(c){ localStorage.setItem(CART_KEY, JSON.stringify(c)); renderCart(); }
function addToCart(item){
  const cart = getCart();
  const idx = cart.findIndex(x => x.id === item.id);
  if (idx >= 0) cart[idx].qty += (item.qty||1);
  else cart.push({ id:item.id, nombre:item.nombre, precio:item.precio, qty:item.qty||1 });
  saveCart(cart);
}
function removeFromCart(id){ saveCart(getCart().filter(i => i.id !== id)); }
function renderCart(){
  const cart = getCart();
  const wrap = document.getElementById("cartItems");
  if (!wrap) return;
  wrap.innerHTML = "";
  let total = 0;
  cart.forEach(i => {
    const sub = i.precio * i.qty;
    total += sub;
    const line = document.createElement("div");
    line.className = "line";
    line.innerHTML = `
      <div>
        <strong>${i.nombre}</strong>
        <div class="meta">$ ${i.precio.toLocaleString("es-AR")} x ${i.qty}</div>
      </div>
      <div class="row">
        <div>$ ${sub.toLocaleString("es-AR")}</div>
        <button class="del" title="Quitar" data-del="${i.id}">✕</button>
      </div>
    `;
    wrap.appendChild(line);
  });
  const totalEl = document.getElementById("cartTotal");
  if (totalEl) totalEl.textContent = `$ ${total.toLocaleString("es-AR")}`;
  wrap.querySelectorAll("[data-del]").forEach(btn => {
    btn.addEventListener("click", () => removeFromCart(btn.getAttribute("data-del")));
  });
}
document.getElementById("clearCart")?.addEventListener("click", () => saveCart([]));
document.getElementById("checkout")?.addEventListener("click", () => {
  const cart = getCart();
  if (!cart.length) return alert("Tu carrito está vacío.");
  const resumen = cart.map(i => `${i.nombre} x${i.qty} ($${i.precio.toLocaleString("es-AR")})`).join(", ");
  const total = document.getElementById("cartTotal")?.textContent || "";
  const msg = encodeURIComponent(`Pedido: ${resumen} | Total: ${total}`);
  window.open(`https://wa.me/5491169754570?text=${msg}`, "_blank");
});
window.addEventListener("load", renderCart);


/* === Integración ALT->producto (galería existente) === */
let _productosPorNombre = {}; // nombre normalizado -> producto

function normName(s){ return String(s||"").trim().toLowerCase(); }

async function getSheetProducts(){
  // Reutiliza el bloque de Google Sheets si ya existe, sino define uno mínimo
  if (typeof fetchProducts === "function"){
    return await fetchProducts();
  }
  // Definición mínima (por si el bloque no está)
  const SHEET_ID   = "1nJIU0ky7Ih_6zUF1M2ui3JVsLmdLXwgVXxpWt3ToiqM";
  const SHEET_NAME = "Hoja 1";
  const SHEET_URL  = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}&cachebust=${Date.now()}`;
  const res = await fetch(SHEET_URL, { cache: "no-store" });
  const txt = await res.text();
  const json = JSON.parse(txt.substring(47, txt.length - 2));
  const cols = json.table.cols.map(c => (c.label || "").toLowerCase().trim());
  const rows = json.table.rows.map(r => r.c.map(c => c?.v ?? ""));
  const idx = { id: cols.indexOf("id"), nombre: cols.indexOf("nombre"), precio: cols.indexOf("precio"), activo: cols.indexOf("activo") };
  return rows.map(r => ({
    id: String(idx.id>=0 ? r[idx.id] : ""),
    nombre: String(idx.nombre>=0 ? r[idx.nombre] : ""),
    precio: Number(idx.precio>=0 ? r[idx.precio] : 0),
    activo: String(idx.activo>=0 ? r[idx.activo] : "").toLowerCase() !== "false"
  })).filter(p => p.activo && p.nombre && Number.isFinite(p.precio));
}

async function vincularGaleriaConCarrito(){
  try {
    const productos = await getSheetProducts();
    _productosPorNombre = {};
    productos.forEach(p => { _productosPorNombre[normName(p.nombre)] = p; });

    // Cuando el usuario abre el modal de una imagen, mostramos precio si hay match y permitimos "Agregar al carrito"
    const modal = document.getElementById("modal");
    const precioEl = document.getElementById("precio-amigurumi");
    const btnAdd = document.getElementById("agregar-carrito");
    const nombreEl = document.getElementById("nombre-amigurumi");

    // Guardamos el último producto match en memoria temporal
    let productoActual = null;

    // Reemplazamos el listener existente para click en imagen, sin romper tu lógica actual
    document.querySelectorAll(".subgrupo-fila img").forEach(img => {
      img.addEventListener("click", () => {
        const alt = img.alt || "";
        const p = _productosPorNombre[normName(alt)] || null;
        productoActual = p;

        if (p){
          if (nombreEl) nombreEl.textContent = p.nombre;
          if (precioEl) precioEl.textContent = `$ ${p.precio.toLocaleString("es-AR")}`;
        } else {
          if (precioEl) precioEl.textContent = ``;
        }
      });
    });

    btnAdd?.addEventListener("click", () => {
      if (!productoActual){
        alert("No tenemos el precio cargado de esta pieza todavía. Nombrá el producto en Sheets igual que el ALT de la imagen.");
        return;
      }
      addToCart({ id: productoActual.id || normName(productoActual.nombre), nombre: productoActual.nombre, precio: productoActual.precio, qty: 1 });
      // Cerrar modal opcionalmente
      if (modal) modal.style.display = "none";
    });
  } catch (e){
    console.error("Error vinculando galería con carrito:", e);
  }
}

window.addEventListener("load", vincularGaleriaConCarrito);
