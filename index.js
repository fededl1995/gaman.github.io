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
