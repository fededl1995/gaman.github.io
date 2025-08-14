(function(){
  const modal = document.getElementById('modal');
  const cerrar = document.querySelector('.cerrar');
  const nombre = document.getElementById('nombre');
  const imgTag = document.getElementById('img');

  // Delegación de click
  document.addEventListener('click', (ev) => {
    const img = ev.target.closest('.subgrupo-fila img');
    if (!img) return;
    console.log('[TEST] Click en imagen', img.src);
    nombre.textContent = img.alt || 'Producto';
    imgTag.src = img.src;
    modal.classList.add('open');
  }, true);

  cerrar.addEventListener('click', () => modal.classList.remove('open'));
  modal.addEventListener('click', (ev) => { if (ev.target === modal) modal.classList.remove('open'); });
})();