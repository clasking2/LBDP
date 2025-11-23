// ------- Cargar datos desde JSON --------- v2.2 Refactored
/**
 * HomeApp: Clase principal para manejar la lógica de la página de inicio.
 * Encapsula la carga de noticias, mural y efectos visuales.
 */
const HomeApp = {
  // Estado interno
  state: {
    news: [],
    muralNotes: [],
    currentMuralPage: 1,
    notesPerPage: 9,
    io: null // IntersectionObserver
  },

  // Configuración
  config: {
    muralJsonPath: './data/mural.json',
    parallaxFactor: 12
  },

  /**
   * Inicializa la aplicación
   */
  init() {
    this.initIntersectionObserver();
    this.loadNewsData();
    this.loadMuralData();
    this.initEventListeners();
    this.initParallax();
  },

  /**
   * Inicializa el IntersectionObserver para animaciones 'reveal'
   */
  initIntersectionObserver() {
    this.state.io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.2 });
  },

  /**
   * Observa nuevos elementos con la clase .reveal
   */
  observeRevealElements() {
    document.querySelectorAll('.reveal').forEach(el => this.state.io.observe(el));
  },

  /**
   * Carga las noticias usando news-loader.js
   */
  async loadNewsData() {
    try {
      // loadNewsFromJSON y NEWS_DATA vienen de news-loader.js (global por ahora, idealmente módulo)
      if (typeof loadNewsFromJSON === 'function') {
        await loadNewsFromJSON();
        this.state.news = window.NEWS_DATA || []; // Asumiendo que news-loader expone esto o retorna
      } else {
        console.warn('loadNewsFromJSON no está definido.');
        this.state.news = [];
      }
      this.renderLatestNews();
    } catch (error) {
      console.error('Error cargando noticias:', error);
      this.state.news = [];
      this.renderLatestNews();
    }
  },

  /**
   * Renderiza las últimas 3 noticias
   */
  renderLatestNews() {
    const latestContainer = document.getElementById('latestNews');
    if (!latestContainer) return;

    latestContainer.innerHTML = '';

    const latest = [...this.state.news]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3);

    if (latest.length === 0) {
      latestContainer.innerHTML = '<div class="col-12 text-center text-muted">No hay noticias disponibles</div>';
      return;
    }

    const fragment = document.createDocumentFragment();

    latest.forEach((n, idx) => {
      const col = document.createElement('div');
      col.className = 'col-12 col-sm-6 col-lg-4 reveal';
      col.style.transitionDelay = `${idx * 60}ms`;
      col.innerHTML = `
        <article class="card h-100 card-hover" role="article">
          <img class="thumb" src="${n.images[0]}" alt="${n.title}" loading="lazy">
          <div class="card-body">
            <p class="text-muted small mb-1">${this.formatDate(n.date)}</p>
            <h3 class="h6">${n.title}</h3>
            <p class="small text-secondary">${n.excerpt}</p>
            <a href="./noticias.html#${n.id}" class="btn btn-sm btn-primary-liceo" aria-label="Ver detalle de ${n.title}">Ver detalle</a>
          </div>
        </article>`;
      fragment.appendChild(col);
    });

    latestContainer.appendChild(fragment);
    this.observeRevealElements();
  },

  /**
   * Carga datos del mural
   */
  async loadMuralData() {
    try {
      const response = await fetch(this.config.muralJsonPath);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      this.state.muralNotes = await response.json();
    } catch (error) {
      console.error('Error cargando datos del mural:', error);
      // Fallback
      this.state.muralNotes = [
        { id: 'a1', title: 'Reunión de Apoderados', body: 'Jueves 19:00 en sala de clases.', cat: 'Comunicados', pinned: true, createdAt: '2025-07-01T10:00:00Z' },
        { id: 'a2', title: 'Feria de Ciencias', body: 'Viernes 10:00 en gimnasio.', cat: 'Eventos', pinned: false, createdAt: '2025-07-05T10:00:00Z' }
      ];
    }
    this.renderNotes();
  },

  /**
   * Obtiene notas filtradas y ordenadas
   */
  getFilteredNotes() {
    const muralFilter = document.getElementById('muralFilter');
    if (!muralFilter) return this.state.muralNotes;

    const cat = muralFilter.value;
    // Ordenar: Pinned primero, luego por fecha descendente
    const sorted = [...this.state.muralNotes].sort((a, b) => {
      if (a.pinned === b.pinned) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return a.pinned ? -1 : 1;
    });

    return cat === 'all' ? sorted : sorted.filter(n => n.cat === cat);
  },

  /**
   * Renderiza las notas del mural con paginación
   */
  renderNotes() {
    const muralGrid = document.getElementById('muralGrid');
    if (!muralGrid) return;

    const filtered = this.getFilteredNotes();
    const totalPages = Math.ceil(filtered.length / this.state.notesPerPage);

    // Asegurar página válida
    if (this.state.currentMuralPage > totalPages && totalPages > 0) {
      this.state.currentMuralPage = totalPages;
    }
    if (this.state.currentMuralPage < 1) this.state.currentMuralPage = 1;

    const startIdx = (this.state.currentMuralPage - 1) * this.state.notesPerPage;
    const endIdx = startIdx + this.state.notesPerPage;
    const paginated = filtered.slice(startIdx, endIdx);

    if (filtered.length === 0) {
      muralGrid.innerHTML = '<div class="text-center text-muted py-4">No hay comunicados disponibles</div>';
      this.updateMuralPagination(0, 0);
      return;
    }

    const fragment = document.createDocumentFragment();

    paginated.forEach((n, idx) => {
      const div = document.createElement('div');
      const rot = ((idx % 5) - 2) * 0.6; // Variación de rotación
      div.innerHTML = `
        <article class="note ${n.pinned ? 'note-pinned' : ''} reveal" style="--r:${rot}deg" aria-label="${n.title}">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <div>
              <span class="badge bg-warning-subtle text-dark border">${n.cat}</span>
              ${n.pinned ? '<span class="badge bg-info-subtle text-dark border"><i class="bi bi-pin-angle-fill"></i> Destacado</span>' : ''}
            </div>
            <small class="text-muted">${new Date(n.createdAt).toLocaleDateString()}</small>
          </div>
          <h3 class="h6 mt-1 mb-1">${n.title}</h3>
          <p class="small mb-2">${n.body}</p>
        </article>`;
      fragment.appendChild(div.firstElementChild);
    });

    muralGrid.appendChild(fragment);
    this.observeRevealElements();
    this.updateMuralPagination(filtered.length, totalPages);
  },

  /**
   * Actualiza controles de paginación
   */
  updateMuralPagination(totalNotes, totalPages) {
    const container = document.getElementById('muralPagination');
    const info = document.getElementById('muralPageInfo');
    const prevBtn = document.getElementById('muralPrevBtn');
    const nextBtn = document.getElementById('muralNextBtn');

    if (!container || !info || !prevBtn || !nextBtn) return;

    if (totalNotes === 0 || totalPages <= 1) {
      container.style.display = 'none';
      return;
    }

    container.style.display = 'flex';
    info.textContent = `Página ${this.state.currentMuralPage} de ${totalPages}`;
    prevBtn.disabled = this.state.currentMuralPage === 1;
    nextBtn.disabled = this.state.currentMuralPage === totalPages;
  },

  /**
   * Cambia página del mural
   */
  changeMuralPage(direction) {
    const filtered = this.getFilteredNotes();
    const totalPages = Math.ceil(filtered.length / this.state.notesPerPage);

    if (direction === 'next' && this.state.currentMuralPage < totalPages) {
      this.state.currentMuralPage++;
    } else if (direction === 'prev' && this.state.currentMuralPage > 1) {
      this.state.currentMuralPage--;
    } else {
      return; // No cambio
    }

    this.renderNotes();
    const muralEl = document.getElementById('mural');
    if (muralEl) muralEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },

  /**
   * Inicializa listeners de eventos
   */
  initEventListeners() {
    const muralFilter = document.getElementById('muralFilter');
    if (muralFilter) {
      muralFilter.addEventListener('change', () => {
        this.state.currentMuralPage = 1;
        this.renderNotes();
      });
    }

    const muralPrevBtn = document.getElementById('muralPrevBtn');
    if (muralPrevBtn) {
      muralPrevBtn.addEventListener('click', () => this.changeMuralPage('prev'));
    }

    const muralNextBtn = document.getElementById('muralNextBtn');
    if (muralNextBtn) {
      muralNextBtn.addEventListener('click', () => this.changeMuralPage('next'));
    }
  },

  /**
   * Inicializa efecto Parallax optimizado
   */
  initParallax() {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          this.updateParallax();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  },

  /**
   * Actualiza posición de imágenes parallax
   */
  updateParallax() {
    const images = document.querySelectorAll('.parallax-img');
    const vh = window.innerHeight || 800;

    images.forEach(img => {
      const rect = img.getBoundingClientRect();
      // Solo animar si está visible en viewport (aproximado)
      if (rect.bottom > 0 && rect.top < vh) {
        const progress = Math.min(1, Math.max(0, 1 - rect.top / vh));
        const y = progress * this.config.parallaxFactor;
        img.style.transform = `translateY(${y}px) scale(1.02)`;
      }
    });
  },

  /**
   * Utilidad para formatear fecha (duplicada de news-loader pero útil tenerla aquí si se desacopla)
   */
  formatDate(dateString) {
    if (typeof formatDate === 'function') return formatDate(dateString); // Usar global si existe
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
};

// Inicialización al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
  HomeApp.init();
});
