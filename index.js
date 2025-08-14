
// === Anti-colgado del splash ===
(function hardSplashKill(){
  function show(){
    try{
      var s = document.getElementById('splash');
      var m = document.getElementById('contenido-principal');
      if (s) s.style.display = 'none';
      if (m) m.style.display = 'block';
    }catch(e){ /* noop */ }
  }
  // Varias garantías de ejecución
  document.addEventListener('DOMContentLoaded', show);
  window.addEventListener('load', show);
  setTimeout(show, 2000);
  setTimeout(show, 4000); // doble fallback
})();
// === Fin Anti-colgado ===

// index.js — comportamiento de splash, fondo y modal
document.addEventListener("DOMContentLoaded", function () {
  const splash = document.getElementById("splash");
  const main = document.getElementById("contenido-principal");

  const showApp = () => {
    if (splash) splash.style.display = "none";
    if (main) main.style.display = "block";
  };

  // Mostrar rápido cuando el DOM está listo
  setTimeout(showApp, 600);
  // Fallback por si algo demora imágenes/recursos
  setTimeout(showApp, 4000);

  // Lazy-load para todas las imágenes de galería
  document.querySelectorAll(".subgrupo-fila img").forEach((img) => {
    if (!img.hasAttribute("loading")) img.setAttribute("loading", "lazy");
  });

  // Rotación de imagen de fondo (arranca después de mostrar contenido)
  const imagenes = [
    "https://picnic.media/wp-content/uploads/2021/06/PORTADA-1140x700.jpg",
    "https://acdn-us.mitiendanube.com/stores/001/935/440/products/img_3806-40a9a9f4d66513d0f617222679218351-1024-1024.jpeg",
    "https://www.thesnuglies.com/wp-content/uploads/2023/06/tipos-de-amigurumi.png",
    "https://patronamigurumi.top/wp-content/uploads/tortuga-1024x1017.jpg",
    "https://devmedia.discovernikkei.org/articles/8911/amigurumi1.jpg",
    "https://mymodernmet.com/wp/wp-content/uploads/2019/01/what-is-amigurumi-17.jpg"
  ];
  let index = 0;
  const startBgRotation = () => {
    setInterval(() => {
      index = (index + 1) % imagenes.length;
      document.body.style.backgroundImage = `url('${imagenes[index]}')`;
    }, 6000);
  };
  setTimeout(startBgRotation, 1200);

  // ========= Modal =========
  const modal = document.getElementById("modal");
  const imagenAmpliada = document.getElementById("imagen-ampliada");
  const nombre = document.getElementById("nombre-amigurumi");
  const historia = document.getElementById("historia-amigurumi");
  const link = document.getElementById("whatsapp-link");

  // Datos de ejemplo — reemplazar por datos reales si se desea
  const datos = {
    "Gatito": {
      nombre: "Gatito tierno",
      historia: "Tejido a mano con lana suave y mucho amor.",
      whatsapp: "https://wa.me/541169754570?text=Hola!%20Me%20interesa%20el%20Gatito%20tierno"
    },
    "Osito": {
      nombre: "Osito cariñoso",
      historia: "Este osito acompaña dulces sueños desde hace generaciones.",
      whatsapp: "https://wa.me/541169754570?text=Hola!%20Quiero%20m%C3%A1s%20info%20sobre%20el%20Osito%20cari%C3%B1oso"
    },
    "Conejo": {
      nombre: "Conejo saltarín",
      historia: "Tejido con amor para saltar de alegría con vos.",
      whatsapp: "https://wa.me/541169754570?text=Hola!%20Estoy%20interesado%20en%20el%20Conejo%20saltar%C3%ADn"
    }
  };

  // Abrir modal al hacer clic en cualquier imagen de la galería
  document.querySelectorAll(".subgrupo-fila img").forEach((img) => {
    img.addEventListener("click", () => {
      const alt = img.alt || "Amigurumi";
      imagenAmpliada.src = img.src;
      if (datos[alt]) {
        nombre.textContent = datos[alt].nombre;
        historia.textContent = datos[alt].historia;
        link.href = datos[alt].whatsapp;
      } else {
        nombre.textContent = alt;
        historia.textContent = "Amigurumi artesanal hecho con dedicación.";
        link.href = "https://wa.me/541169754570?text=Hola!%20Quiero%20consultar%20por%20" + encodeURIComponent(alt);
      }
      if (modal) modal.style.display = "flex";
    });
  });

  // Cerrar modal (botón)
  const cerrarBtn = document.querySelector(".cerrar");
  if (cerrarBtn) {
    cerrarBtn.addEventListener("click", () => {
      modal.style.display = "none";
    });
  }

  // Cerrar modal haciendo clic fuera de la imagen
  if (modal) {
    modal.addEventListener("click", (event) => {
      if (event.target.id === "modal") {
        modal.style.display = "none";
      }
    });
  }
});

// === Precios desde Google Sheets ===
// Ajusta los nombres en la hoja para que coincidan con data-nombre o con el alt de la imagen
(function cargarPreciosDesdeSheets() {
  const sheetUrl = "https://docs.google.com/spreadsheets/d/1nJIU0ky7Ih_6zUF1M2ui3JVsLmdLXwgVXxpWt3ToiqM/gviz/tq?tqx=out:csv";
  fetch(sheetUrl)
    .then(r => r.text())
    .then(text => {
      // Parseo CSV simple (asume separador coma y 2 columnas: Producto,Precio)
      const filas = text.split(/\r?\n/).filter(Boolean).map(linea => {
        // Permite comas dentro de comillas básicas
        const cells = [];
        let cur = '';
        let inQuotes = false;
        for (let i = 0; i < linea.length; i++) {
          const ch = linea[i];
          if (ch === '"') {
            inQuotes = !inQuotes;
          } else if (ch === ',' && !inQuotes) {
            cells.push(cur);
            cur = '';
          } else {
            cur += ch;
          }
        }
        cells.push(cur);
        return cells.map(c => c.replace(/^"|"$/g, '').trim());
      });
      if (filas.length <= 1) return;
      const encabezados = filas[0].map(h => h.toLowerCase());
      const idxNombre = encabezados.findIndex(h => h.includes('producto') || h.includes('nombre'));
      const idxPrecio = encabezados.findIndex(h => h.includes('precio'));
      if (idxNombre === -1 || idxPrecio === -1) return;
      const mapa = {};
      for (let i = 1; i < filas.length; i++) {
        const nombre = (filas[i][idxNombre] || '').trim();
        const precio = (filas[i][idxPrecio] || '').trim();
        if (nombre) mapa[nombre] = precio;
      }
      window.priceMap = mapa;
      document.querySelectorAll('.producto').forEach(prod => {
        const clave = prod.dataset.nombre || prod.querySelector('img')?.alt || '';
        let precio = mapa[clave];
        if (precio === undefined) {
          // intento con mayúsc/minúsc
          const claveAlt = Object.keys(mapa).find(k => k.toLowerCase() === clave.toLowerCase());
          if (claveAlt) precio = mapa[claveAlt];
        }
        const precioEl = prod.querySelector('.precio');
        if (precioEl) {
          precioEl.textContent = (precio && precio !== '') ? `$${precio}` : 'Precio no disponible';
        }
      });
    })
    .catch(err => {
      console.error('No se pudieron cargar precios desde Sheets:', err);
    });
})();

// === Carrito de compras ===
const Cart = (() => {
  let items = []; // {nombre, precioNum, qty, img}
  const load = () => {
    try { items = JSON.parse(localStorage.getItem('cart_items') || '[]'); } catch { items = []; }
  };
  const save = () => localStorage.setItem('cart_items', JSON.stringify(items));
  const count = () => items.reduce((a,b)=>a + b.qty, 0);
  const total = () => items.reduce((a,b)=>a + (b.precioNum * b.qty), 0);
  const add = (nombre, precioNum, qty, img) => {
    const i = items.findIndex(x => x.nombre.toLowerCase() === nombre.toLowerCase());
    if (i >= 0) items[i].qty += qty;
    else items.push({nombre, precioNum, qty, img});
    save(); UI.updateBadge(); UI.render();
  };
  const updateQty = (nombre, qty) => {
    const it = items.find(x => x.nombre.toLowerCase() === nombre.toLowerCase());
    if (!it) return;
    it.qty = Math.max(1, qty|0);
    save(); UI.updateBadge(); UI.render();
  };
  const remove = (nombre) => {
    items = items.filter(x => x.nombre.toLowerCase() !== nombre.toLowerCase());
    save(); UI.updateBadge(); UI.render();
  };
  const clear = () => { items = []; save(); UI.updateBadge(); UI.render(); };
  const get = () => items.slice();
  const UI = {
    updateBadge(){
      const badge = document.getElementById('cart-count');
      if (badge) badge.textContent = String(count());
    },
    render(){
      const cont = document.getElementById('cart-items');
      const tot = document.getElementById('cart-total-amount');
      if (!cont) return;
      cont.innerHTML = '';
      get().forEach(it => {
        const row = document.createElement('div');
        row.className = 'cart-item';
        row.innerHTML = \`
          <img src="\${it.img}" alt="\${it.nombre}">
          <div>\${it.nombre}</div>
          <div>$\${it.precioNum.toLocaleString('es-AR')}</div>
          <div>
            <input type="number" min="1" value="\${it.qty}" data-nombre="\${it.nombre}" class="cart-qty" />
          </div>
          <button class="cart-remove" data-nombre="\${it.nombre}">✕</button>
        \`;
        cont.appendChild(row);
      });
      if (tot) tot.textContent = '$' + total().toLocaleString('es-AR');
      // bind qty & remove
      cont.querySelectorAll('.cart-qty').forEach(inp => {
        inp.addEventListener('change', e => {
          const nombre = e.target.getAttribute('data-nombre');
          Cart.updateQty(nombre, parseInt(e.target.value || '1', 10));
        });
      });
      cont.querySelectorAll('.cart-remove').forEach(btn => {
        btn.addEventListener('click', e => {
          const nombre = e.target.getAttribute('data-nombre');
          Cart.remove(nombre);
        });
      });
    },
    open(){ const m = document.getElementById('cart-modal'); if (m) m.style.display = 'flex'; },
    close(){ const m = document.getElementById('cart-modal'); if (m) m.style.display = 'none'; }
  };
  // listeners globales
  document.addEventListener('DOMContentLoaded', () => {
    load(); UI.updateBadge();
    const btn = document.getElementById('cart-btn');
    if (btn) btn.addEventListener('click', UI.open);
    const close = document.getElementById('close-cart');
    if (close) close.addEventListener('click', UI.close);
    const clear = document.getElementById('clear-cart');
    if (clear) clear.addEventListener('click', clearCart);
    const checkout = document.getElementById('checkout-cart');
    if (checkout) checkout.addEventListener('click', () => {
      // Simple: armar mensaje de WhatsApp con el detalle del carrito
      const detalle = get().map(it => \`\${it.nombre} x\${it.qty} - $\${(it.precioNum*it.qty).toLocaleString('es-AR')}\`).join('%0A');
      const totalStr = total().toLocaleString('es-AR');
      const msg = \`Hola! Quiero confirmar este pedido:%0A\${detalle}%0ATotal: $\${totalStr}\`;
      window.open('https://wa.me/541169754570?text=' + msg, '_blank');
    });
    function clearCart(){ Cart.clear(); }
  });
  return { add, updateQty, remove, clear, get };
})();

// Exponer priceMap global desde la carga de Sheets
window.priceMap = window.priceMap || {};

// === Integración modal con carrito y precios ===
document.addEventListener('DOMContentLoaded', () => {
  const precioModal = document.getElementById('precio-modal');
  const qtyModal = document.getElementById('qty-modal');
  const addBtn = document.getElementById('add-to-cart');
  const imagenAmpliada = document.getElementById('imagen-ampliada');
  const nombreEl = document.getElementById('nombre-amigurumi');

  // al abrir modal (ya lo hace el código existente), actualizaremos precio y qty=1
  function actualizarPrecioModal(nombre) {
    if (!precioModal) return;
    let precioTxt = '';
    let precioNum = 0;
    if (window.priceMap && Object.keys(window.priceMap).length) {
      let key = Object.keys(window.priceMap).find(k => k.toLowerCase() == nombre.toLowerCase());
      if (!key) key = Object.keys(window.priceMap).find(k => nombre.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(nombre.toLowerCase()));
      if (key) {
        precioTxt = window.priceMap[key];
        const num = parseFloat(String(precioTxt).replace(/[^0-9.,]/g,'').replace('.','').replace(',','.'));
        if (!isNaN(num)) precioNum = num;
      }
    }
    if (precioTxt) {
      precioModal.textContent = 'Precio: $' + precioTxt;
      precioModal.dataset.precioNum = precioNum || 0;
    } else {
      precioModal.textContent = 'Precio: consultar';
      precioModal.dataset.precioNum = 0;
    }
    if (qtyModal) qtyModal.value = 1;
  }

  // interceptar cuando se abre el modal: observamos cambios en #nombre-amigurumi
  const obs = new MutationObserver(() => {
    const nombre = nombreEl?.textContent?.trim() || '';
    if (nombre) actualizarPrecioModal(nombre);
  });
  if (nombreEl) obs.observe(nombreEl, { childList: true });

  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const nombre = (nombreEl?.textContent || '').trim();
      const qty = parseInt(qtyModal?.value || '1', 10);
      const precioNum = parseFloat(precioModal?.dataset?.precioNum || '0');
      const imgSrc = imagenAmpliada?.src || '';
      if (!nombre || !qty) return;
      Cart.add(nombre, isNaN(precioNum)?0:precioNum, qty, imgSrc);
      // feedback simple
      addBtn.textContent = 'Agregado ✓';
      setTimeout(() => addBtn.textContent = 'Agregar al carrito', 900);
    });
  }
});



// Si ocurre cualquier error no controlado, ocultamos igual el splash
window.addEventListener('error', function(){
  try{
    var s = document.getElementById('splash');
    var m = document.getElementById('contenido-principal');
    if (s) s.style.display = 'none';
    if (m) m.style.display = 'block';
  }catch(e){}
});
