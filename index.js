// script.js - Controla el splash screen

window.addEventListener("load", function () {
  setTimeout(function () {
    document.getElementById("splash").style.display = "none";
    document.getElementById("contenido-principal").style.display = "block";
  }, 2500); // 2500 milisegundos = 2.5 segundos
});
const imagenes = [
  "https://picnic.media/wp-content/uploads/2021/06/PORTADA-1140x700.jpg",
  "https://acdn-us.mitiendanube.com/stores/001/935/440/products/img_3806-40a9a9f4d66513d0f617222679218351-1024-1024.jpeg",
  "https://www.thesnuglies.com/wp-content/uploads/2023/06/tipos-de-amigurumi.png",
  "https://patronamigurumi.top/wp-content/uploads/tortuga-1024x1017.jpg" ,
  "https://devmedia.discovernikkei.org/articles/8911/amigurumi1.jpg" ,
  "https://mymodernmet.com/wp/wp-content/uploads/2019/01/what-is-amigurumi-17.jpg"
];

let index = 0;

setInterval(() => {
  index = (index + 1) % imagenes.length;
  document.body.style.backgroundImage = `url('${imagenes[index]}')`;
}, 6000);
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
      if (link) link.href = datos[alt].whatsapp;
    } else {
      imagenAmpliada.src = img.src;
      nombre.textContent = alt;
      historia.textContent = "Amigurumi artesanal hecho con dedicación.";
      if (link) link.href = "https://wa.me/549XXXXXXXXXX?text=Hola!%20Quiero%20consultar%20por%20el%20amigurumi%20" + encodeURIComponent(alt);
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
