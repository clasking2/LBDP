// ------- Cargar datos desde JSON --------- v2.1
let NEWS = [];

// Cargar noticias desde JSON
async function loadNews() {
  try {
    // loadNewsFromJSON y NEWS_DATA vienen de news-loader.js
    await loadNewsFromJSON();
    NEWS = NEWS_DATA;
    renderLatestNews();
  } catch (error) {
    console.error('Error cargando noticias:', error);
    NEWS = [];
    renderLatestNews();
  }
}

// Cargar datos del mural desde JSON
let MURAL_NOTES = [];
async function loadMuralData() {
  try {
    const response = await fetch('./data/mural.json');
    MURAL_NOTES = await response.json();
  } catch (error) {
    console.error('Error cargando datos del mural:', error);
    // Fallback a datos por defecto
    MURAL_NOTES = [
      { id:'a1', title:'Reunión de Apoderados', body:'Jueves 19:00 en sala de clases.', cat:'Comunicados', pinned:true, createdAt:'2025-07-01T10:00:00Z' },
    ];
  }
  renderNotes();
}

// Render últimas 3 noticias + stagger reveal
function renderLatestNews() {
  const latest = [...NEWS].sort((a,b)=>new Date(b.date) - new Date(a.date)).slice(0,3);
  const latestContainer = document.getElementById('latestNews');
  if (!latestContainer) return;

  latestContainer.innerHTML = '';
  
  if (latest.length === 0) {
    latestContainer.innerHTML = '<div class="col-12 text-center text-muted">No hay noticias disponibles</div>';
    return;
  }
  
  latest.forEach((n, idx) => {
    const col = document.createElement('div');
    col.className = 'col-12 col-sm-6 col-lg-4 reveal';
    col.style.transitionDelay = `${idx*60}ms`;
    col.innerHTML = `
      <article class="card h-100 card-hover" role="article">
        <img class="thumb" src="${n.images[0]}" alt="${n.title}">
        <div class="card-body">
          <p class="text-muted small mb-1">${formatDate(n.date)}</p>
          <h3 class="h6">${n.title}</h3>
          <p class="small text-secondary">${n.excerpt}</p>
          <a href="./noticias.html#${n.id}" class="btn btn-sm btn-primary-liceo">Ver detalle</a>
        </div>
      </article>`;
    latestContainer.appendChild(col);
  });
  
  // Re-aplicar observer a nuevos elementos
  observeRevealElements();
}

// Variable global para el IntersectionObserver
let io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.2 });

// Función para observar elementos reveal
function observeRevealElements() {
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
}

function updateParallax(){
  document.querySelectorAll('.parallax-img').forEach(img=>{
    const rect = img.getBoundingClientRect();
    const vh = window.innerHeight || 800;
    const progress = Math.min(1, Math.max(0, 1 - rect.top/vh));
    const y = progress * 12;
    img.style.transform = `translateY(${y}px) scale(1.02)`;
  });
}

// --------- Diario Mural (Solo lectura desde JSON) con Paginación ----------
let currentMuralPage = 1;
const notesPerPage = 9;

function loadNotes(){
  return MURAL_NOTES;
}

function getFilteredNotes() {
  const muralFilter = document.getElementById('muralFilter');
  if (!muralFilter) return MURAL_NOTES;
  
  const cat = muralFilter.value;
  const sorted = [...MURAL_NOTES].sort((a,b)=> (a.pinned===b.pinned ? (a.createdAt<b.createdAt?1:-1) : (a.pinned? -1:1)));
  return cat==='all' ? sorted : sorted.filter(n=>n.cat===cat);
}

function renderNotes(){
  const muralGrid = document.getElementById('muralGrid');
  const muralFilter = document.getElementById('muralFilter');
  
  if (!muralGrid || !muralFilter) {
    // console.error('Elementos del mural no inicializados'); // Silencioso si no estamos en home
    return;
  }
  
  const filtered = getFilteredNotes();
  const totalPages = Math.ceil(filtered.length / notesPerPage);
  const startIdx = (currentMuralPage - 1) * notesPerPage;
  const endIdx = startIdx + notesPerPage;
  const paginated = filtered.slice(startIdx, endIdx);
  
  muralGrid.innerHTML = '';
  
  if (filtered.length === 0) {
    muralGrid.innerHTML = '<div class="text-center text-muted py-4">No hay comunicados disponibles</div>';
    updateMuralPagination(0, 0);
    return;
  }
  
  paginated.forEach((n, idx)=>{
    const div = document.createElement('div');
    const rot = ((idx%5)-2)*0.6; // pequeña variación
    div.innerHTML = `
      <article class="note ${n.pinned?'note-pinned':''} reveal" style="--r:${rot}deg" aria-label="${n.title}">
        <div class="d-flex align-items-center justify-content-between mb-2">
          <div>
            <span class="badge bg-warning-subtle text-dark border">${n.cat}</span>
            ${n.pinned?'<span class="badge bg-info-subtle text-dark border"><i class="bi bi-pin-angle-fill"></i> Destacado</span>':''}
          </div>
          <small class="text-muted">${new Date(n.createdAt).toLocaleDateString()}</small>
        </div>
        <h3 class="h6 mt-1 mb-1">${n.title}</h3>
        <p class="small mb-2">${n.body}</p>
      </article>`;
    muralGrid.appendChild(div.firstElementChild);
  });

  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
  updateMuralPagination(filtered.length, totalPages);
}

function updateMuralPagination(totalNotes, totalPages) {
  const muralPageInfo = document.getElementById('muralPageInfo');
  const muralPrevBtn = document.getElementById('muralPrevBtn');
  const muralNextBtn = document.getElementById('muralNextBtn');
  
  if (!muralPageInfo || !muralPrevBtn || !muralNextBtn) return;
  
  if (totalNotes === 0 || totalPages <= 1) {
    // Ocultar paginación si no hay notas o solo hay una página
    document.getElementById('muralPagination').style.display = 'none';
    return;
  }
  
  document.getElementById('muralPagination').style.display = 'flex';
  muralPageInfo.textContent = `Página ${currentMuralPage} de ${totalPages}`;
  
  // Deshabilitar/habilitar botones según la página actual
  muralPrevBtn.disabled = currentMuralPage === 1;
  muralNextBtn.disabled = currentMuralPage === totalPages;
}

function changeMuralPage(direction) {
  const filtered = getFilteredNotes();
  const totalPages = Math.ceil(filtered.length / notesPerPage);
  
  if (direction === 'next' && currentMuralPage < totalPages) {
    currentMuralPage++;
    renderNotes();
    // Scroll suave al inicio del mural
    const muralEl = document.getElementById('mural');
    if(muralEl) muralEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else if (direction === 'prev' && currentMuralPage > 1) {
    currentMuralPage--;
    renderNotes();
    // Scroll suave al inicio del mural
    const muralEl = document.getElementById('mural');
    if(muralEl) muralEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar datos
  loadNews();
  loadMuralData();
  
  // Inicializar animaciones reveal
  observeRevealElements();

  // Event listeners para Mural
  const muralFilter = document.getElementById('muralFilter');
  if (muralFilter) {
    muralFilter.addEventListener('change', () => {
      currentMuralPage = 1; // Reset a la primera página al cambiar filtro
      renderNotes();
    });
  }

  const muralPrevBtn = document.getElementById('muralPrevBtn');
  if (muralPrevBtn) {
    muralPrevBtn.addEventListener('click', () => changeMuralPage('prev'));
  }

  const muralNextBtn = document.getElementById('muralNextBtn');
  if (muralNextBtn) {
    muralNextBtn.addEventListener('click', () => changeMuralPage('next'));
  }

  // Parallax effect (agregado al scroll)
  window.addEventListener('scroll', () => {
    updateParallax();
  }, { passive: true });
});
