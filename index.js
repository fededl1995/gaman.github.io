// Splash screen
window.addEventListener("load", function () {
  setTimeout(function () {
    document.getElementById("splash").style.display = "none";
    document.getElementById("contenido-principal").style.display = "block";
  }, 2500);
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
let index = 0;
setInterval(() => {
  index = (index + 1) % imagenes.length;
  document.body.style.backgroundImage = `url('${imagenes[index]}')`;
}, 6000);

/* ========== GOOGLE SHEETS PRECIOS ========== */
const SHEET_ID = "1nJIU0ky7Ih_6zUF1M2ui3JVsLmdLXwgVXxpWt3ToiqM";
const SHEET_TAB = "Sheet1"; 
const COL_NAME = "Producto";
const COL_PRICE = "Precio";
let preciosMap = new Map();

async function cargarPrecios() {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=${SHEET_TAB}&tqx=out:json`;
  const res = await fetch(url);
  const text = await res.text();
  const json = JSON.parse(text.replace(/^[^\(]+\(/, "").replace(/\);?$/, ""));
  const cols = json.table.cols.map(c => (c.label || "").trim());
  const idxName = cols.indexOf(COL_NAME);
  const idxPrice = cols.indexOf(COL_PRICE);
  json.table.rows.forEach(r => {
    const c = r.c || [];
    const name = (c[idxName]?.v ?? "").toString().trim().toLowerCase();
    const price = parseFloat((c[idxPrice]?.v ?? "").toString().replace(",", "."));
    if (name && !isNaN(price)) preciosMap.set(name, price);
  });
}
cargarPrecios();

/* ========== MODAL ========== */
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

    // Buscar precio
    const precio = preciosMap.get(alt.toLowerCase()) ?? null;
    if (precio) {
      precioEl.textContent = `$ ${precio}`;
      totalEl.textContent = `$ ${precio}`;
      cantidadInput.value = 1;

      cantidadInput.oninput = () => {
        const cant = parseInt(cantidadInput.value) || 1;
        totalEl.textContent = `$ ${precio * cant}`;
      };
    } else {
      precioEl.textContent = "Consultar";
      totalEl.textContent = "-";
    }

    // WhatsApp link dinámico
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
