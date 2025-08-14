
(function hardSplashKill(){
  function show(){
    try{
      var s = document.getElementById('splash');
      var m = document.getElementById('contenido-principal');
      if (s) s.style.display = 'none';
      if (m) m.style.display = 'block';
    }catch(e){}
  }
  document.addEventListener('DOMContentLoaded', show);
  window.addEventListener('load', show);
  setTimeout(show, 1500);
  setTimeout(show, 3000);
})();
window.addEventListener('error', function(){
  try{
    var s = document.getElementById('splash');
    var m = document.getElementById('contenido-principal');
    if (s) s.style.display = 'none';
    if (m) m.style.display = 'block';
  }catch(e){}
});

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".subgrupo-fila").forEach(fila => {
    const imgs = Array.from(fila.querySelectorAll("img"));
    fila.innerHTML = "";
    imgs.forEach(img => {
      const wrap = document.createElement("div");
      wrap.className = "producto";
      wrap.dataset.nombre = img.alt || "Producto";
      const precio = document.createElement("p");
      precio.className = "precio";
      precio.textContent = "Consultando precio...";
      const qty = document.createElement("input");
      qty.className = "cantidad";
      qty.type = "number"; qty.min = "1"; qty.value = "1";
      img.addEventListener("click", () => abrirModal(img, wrap.dataset.nombre));
      wrap.appendChild(img);
      wrap.appendChild(precio);
      wrap.appendChild(qty);
      fila.appendChild(wrap);
    });
  });

  const modal = document.getElementById("modal");
  const cerrar = document.getElementById("cerrar-modal");
  const imagenAmpliada = document.getElementById("imagen-ampliada");
  const nombreEl = document.getElementById("nombre-amigurumi");
  const historia = document.getElementById("historia-amigurumi");
  const precioModal = document.getElementById("precio-modal");
  const qtyModal = document.getElementById("qty-modal");
  const link = document.getElementById("whatsapp-link");

  function abrirModal(img, nombre) {
    imagenAmpliada.src = img.src;
    nombreEl.textContent = nombre;
    historia.textContent = "Amigurumi artesanal hecho con dedicación.";
    link.href = "https://wa.me/541169754570?text=Hola!%20Quiero%20consultar%20por%20" + encodeURIComponent(nombre);
    actualizarPrecioModal(nombre);
    qtyModal.value = 1;
    modal.style.display = "flex";
  }
  cerrar.addEventListener("click", () => modal.style.display = "none");
  modal.addEventListener("click", (e) => { if (e.target.id === "modal") modal.style.display = "none"; });

  const Cart = (() => {
    let items = [];
    const load = () => { try{ items = JSON.parse(localStorage.getItem('cart_items')||'[]'); }catch{ items=[]; } };
    const save = () => localStorage.setItem('cart_items', JSON.stringify(items));
    const count = () => items.reduce((a,b)=>a+b.qty,0);
    const total = () => items.reduce((a,b)=>a+(b.precioNum*b.qty),0);
    const add = (nombre, precioNum, qty, img) => { const i = items.findIndex(x => x.nombre.toLowerCase()===nombre.toLowerCase());
      if (i>=0) items[i].qty += qty; else items.push({nombre, precioNum, qty, img}); save(); UI.updateBadge(); UI.render(); };
    const updateQty = (nombre, qty) => { const it = items.find(x => x.nombre.toLowerCase()===nombre.toLowerCase()); if (!it) return;
      it.qty = Math.max(1, qty|0); save(); UI.updateBadge(); UI.render(); };
    const remove = (nombre) => { items = items.filter(x => x.nombre.toLowerCase()!==nombre.toLowerCase()); save(); UI.updateBadge(); UI.render(); };
    const clear = () => { items = []; save(); UI.updateBadge(); UI.render(); };
    const get = () => items.slice();
    const UI = {
      updateBadge(){ const b = document.getElementById('cart-count'); if (b) b.textContent = String(count()); },
      render(){
        const cont = document.getElementById('cart-items'); const tot = document.getElementById('cart-total-amount'); if (!cont) return;
        cont.innerHTML = '';
        get().forEach(it => {
          const row = document.createElement('div');
          row.className = 'cart-item';
          row.innerHTML = `
            <img src="${it.img}" alt="${it.nombre}">
            <div>${it.nombre}</div>
            <div>$${it.precioNum.toLocaleString('es-AR')}</div>
            <div><input type="number" min="1" value="${it.qty}" data-nombre="${it.nombre}" class="cart-qty" /></div>
            <button class="cart-remove" data-nombre="${it.nombre}">✕</button>`;
          cont.appendChild(row);
        });
        if (tot) tot.textContent = '$' + total().toLocaleString('es-AR');
        cont.querySelectorAll('.cart-qty').forEach(inp => inp.addEventListener('change', e => updateQty(e.target.getAttribute('data-nombre'), parseInt(e.target.value||'1',10))));
        cont.querySelectorAll('.cart-remove').forEach(btn => btn.addEventListener('click', e => remove(e.target.getAttribute('data-nombre'))));
      },
      open(){ const m = document.getElementById('cart-modal'); if (m) m.style.display = 'flex'; },
      close(){ const m = document.getElementById('cart-modal'); if (m) m.style.display = 'none'; }
    };
    document.getElementById('cart-btn')?.addEventListener('click', UI.open);
    document.getElementById('close-cart')?.addEventListener('click', UI.close);
    document.getElementById('clear-cart')?.addEventListener('click', clear);
    document.getElementById('checkout-cart')?.addEventListener('click', () => {
      const detalle = get().map(it => `${it.nombre} x${it.qty} - $${(it.precioNum*it.qty).toLocaleString('es-AR')}`).join('%0A');
      const totalStr = total().toLocaleString('es-AR');
      const msg = `Hola! Quiero confirmar este pedido:%0A${detalle}%0ATotal: $${totalStr}`;
      window.open('https://wa.me/541169754570?text=' + msg, '_blank');
    });
    load(); UI.updateBadge(); UI.render();
    return { add };
  })();

  document.getElementById('add-to-cart')?.addEventListener('click', () => {
    const nombre = (document.getElementById('nombre-amigurumi')?.textContent || '').trim();
    const qty = parseInt(document.getElementById('qty-modal')?.value || '1', 10);
    const precioNum = parseFloat(document.getElementById('precio-modal')?.dataset?.precioNum || '0');
    const imgSrc = document.getElementById('imagen-ampliada')?.src || '';
    if (!nombre || !qty) return;
    Cart.add(nombre, isNaN(precioNum)?0:precioNum, qty, imgSrc);
    const btn = document.getElementById('add-to-cart');
    btn.textContent = 'Agregado ✓'; setTimeout(()=>btn.textContent='Agregar al carrito', 900);
  });

  window.priceMap = {};
  const SHEETS_CSV = "https://docs.google.com/spreadsheets/d/1nJIU0ky7Ih_6zUF1M2ui3JVsLmdLXwgVXxpWt3ToiqM/gviz/tq?tqx=out:csv";
  fetch(SHEETS_CSV).then(r => r.text()).then(text => {
    const filas = text.split(/\r?\n/).filter(Boolean).map(linea => {
      const out = []; let cur = ""; let q = false;
      for (let i=0;i<linea.length;i++){
        const ch = linea[i];
        if (ch === '"'){ q = !q; continue; }
        if (ch === ',' && !q){ out.push(cur); cur=""; continue; }
        cur += ch;
      }
      out.push(cur);
      return out.map(c => c.trim().replace(/^"|"$/g,""));
    });
    if (filas.length <= 1) return;
    const headers = filas[0].map(h => h.toLowerCase());
    const idxNombre = headers.findIndex(h => h.includes('producto') || h.includes('nombre'));
    const idxPrecio = headers.findIndex(h => h.includes('precio'));
    if (idxNombre === -1 || idxPrecio === -1) return;
    for (let i=1;i<filas.length;i++){
      const nombre = (filas[i][idxNombre]||'').trim();
      const precio = (filas[i][idxPrecio]||'').trim();
      if (nombre) window.priceMap[nombre] = precio;
    }
    document.querySelectorAll('.producto').forEach(prod => {
      const clave = prod.dataset.nombre || prod.querySelector('img')?.alt || '';
      let precio = window.priceMap[clave];
      if (precio === undefined) {
        const altKey = Object.keys(window.priceMap).find(k => k.toLowerCase() === clave.toLowerCase());
        if (altKey) precio = window.priceMap[altKey];
      }
      const precioEl = prod.querySelector('.precio');
      if (precioEl) precioEl.textContent = (precio && precio!=="") ? `$${precio}` : 'Precio no disponible';
    });
  }).catch(()=>{
    document.querySelectorAll('.precio').forEach(p => p.textContent = 'Precio no disponible');
  });

  function actualizarPrecioModal(nombre) {
    const precioTxt = resolverPrecio(nombre);
    const precioNum = toNumber(precioTxt);
    const el = document.getElementById('precio-modal');
    el.textContent = (precioTxt && precioTxt!=="") ? ('Precio: $' + precioTxt) : 'Precio: consultar';
    el.dataset.precioNum = isNaN(precioNum) ? 0 : precioNum;
  }
  function resolverPrecio(nombre){
    if (!nombre) return '';
    if (window.priceMap[nombre] !== undefined) return window.priceMap[nombre];
    const key = Object.keys(window.priceMap).find(k => k.toLowerCase() === nombre.toLowerCase());
    if (key) return window.priceMap[key];
    return '';
  }
  function toNumber(txt){
    if (!txt) return NaN;
    return parseFloat(String(txt).replace(/[^0-9.,]/g,'').replace(/\./g,'').replace(',', '.'));
  }
});
