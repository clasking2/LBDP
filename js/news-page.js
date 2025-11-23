// Variables globales
let NEWS = [];
let state, grid, pageInfo, prevBtn, nextBtn, modal;

// Funciones globales
function currentList() {
    const list = (state.category === 'Todas') ? NEWS : NEWS.filter(n => n.category === state.category);
    return [...list].sort((a, b) => new Date(b.date) - new Date(a.date));
}

function render() {
    console.log('🎨 render() iniciada');
    console.log('🎨 grid:', grid);
    if (!grid) {
        console.error('❌ grid no encontrado!');
        return;
    }

    const list = currentList();
    console.log('🎨 list:', list);
    console.log('🎨 list.length:', list.length);
    const totalPages = Math.max(1, Math.ceil(list.length / state.pageSize));
    state.page = Math.min(state.page, totalPages);
    const items = list.slice((state.page - 1) * state.pageSize, state.page * state.pageSize);
    console.log('🎨 items a renderizar:', items);

    grid.innerHTML = '';

    if (items.length === 0) {
        console.log('⚠️ No hay items para mostrar');
        grid.innerHTML = '<div class="col-12 text-center text-muted py-5">No hay noticias disponibles</div>';
        return;
    }


    items.forEach((n, idx) => {
        console.log(`🎨 Renderizando item ${idx}:`, n);
        try {
            const col = document.createElement('div');
            col.className = 'col-12 col-sm-6 col-lg-4 reveal';
            col.style.transitionDelay = `${idx * 60}ms`;
            console.log(`🎨 Creando HTML para: ${n.title}`);
            col.innerHTML = `
      <article class="card h-100 card-hover">
        <img class="thumb" src="${n.images && n.images[0] ? n.images[0] : './assets/img/default.jpg'}" alt="${n.title}">
        <div class="card-body">
          <span class="badge badge-liceo small">${n.category || 'General'}</span>
          <p class="text-muted small mb-1">${window.formatDate ? window.formatDate(n.date) : n.date}</p>
          <h3 class="h6">${n.title}</h3>
          <p class="small text-secondary">${n.excerpt || ''}</p>
          <button class="btn btn-sm btn-primary-liceo" data-id="${n.id}">Ver detalle</button>
        </div>
      </article>`;
            console.log(`🎨 Agregando al grid...`);
            grid.appendChild(col);
            console.log(`✅ Item ${idx} agregado correctamente`);
        } catch (error) {
            console.error(`❌ Error renderizando item ${idx}:`, error);
        }
    });

    if (pageInfo) {
        pageInfo.textContent = `${state.page} / ${Math.max(1, Math.ceil(list.length / state.pageSize))}`;
    }
    if (prevBtn) prevBtn.disabled = state.page === 1;
    if (nextBtn) nextBtn.disabled = state.page >= totalPages;

    document.querySelectorAll('#newsGrid button[data-id]').forEach(btn => {
        btn.addEventListener('click', () => openDetail(btn.getAttribute('data-id')));
    });

    // Re-inicializar animaciones para los nuevos elementos
    if (window.initRevealAnimations) {
        // Si la función global existe (en load-components.js), usarla
        // Pero como initRevealAnimations usa querySelectorAll('.reveal'), funcionará si la llamamos de nuevo
        // O mejor, simplemente observamos los nuevos elementos si tenemos acceso al observer global, 
        // pero como no lo tenemos fácil, confiamos en que el CSS y la clase reveal hagan su trabajo 
        // si el observer está vivo.
        // Sin embargo, el observer de load-components.js observa elementos existentes al inicio.
        // Necesitamos una forma de observar nuevos elementos.
        // Por simplicidad, crearemos un observer local pequeño para esta página dinámica.
        const io = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) e.target.classList.add('visible');
            });
        }, { threshold: .2 });
        document.querySelectorAll('.reveal').forEach(el => io.observe(el));
    }
}

function openDetail(id) {
    const n = NEWS.find(x => x.id === id);
    if (!n) return;

    document.getElementById('newsTitle').textContent = n.title;
    document.getElementById('newsMeta').innerHTML = `
    <p class="mb-2"><i class="bi bi-calendar3 me-2"></i><strong>Fecha:</strong> ${formatDate(n.date)}</p>
    <p class="mb-3 lead">${n.message}</p>
    <hr class="my-3">
    <p class="small text-muted mb-2"><i class="bi bi-images me-2"></i><strong>Galería de imágenes (${n.images.length})</strong></p>
  `;

    const inner = document.getElementById('galleryInner');
    const indicators = document.getElementById('galleryIndicators');
    inner.innerHTML = '';
    indicators.innerHTML = '';

    // Mostrar todas las imágenes (principal + subattachments)
    n.images.forEach((src, i) => {
        // Agregar imagen al carrusel
        const d = document.createElement('div');
        d.className = 'carousel-item' + (i === 0 ? ' active' : '');
        d.innerHTML = `<img class="d-block w-100" style="max-height:500px;object-fit:contain;background:#f8f9fa" src="${src}" alt="${n.title} - Imagen ${i + 1}">`;
        inner.appendChild(d);

        // Agregar indicador
        const indicator = document.createElement('button');
        indicator.type = 'button';
        indicator.setAttribute('data-bs-target', '#galleryCarousel');
        indicator.setAttribute('data-bs-slide-to', i);
        indicator.setAttribute('aria-label', `Imagen ${i + 1}`);
        if (i === 0) {
            indicator.className = 'active';
            indicator.setAttribute('aria-current', 'true');
        }
        indicators.appendChild(indicator);
    });

    if (modal) {
        modal.show();
    }
}

// Cargar noticias desde JSON
async function loadNews() {
    console.log('📰 loadNews() iniciada');
    try {
        await loadNewsFromJSON();
        console.log('📰 loadNewsFromJSON() completada');
        console.log('📰 window.NEWS_DATA:', window.NEWS_DATA);
        NEWS = window.NEWS_DATA;
        console.log('📰 NEWS local:', NEWS);
        console.log('📰 Llamando a render()...');
        render();
    } catch (error) {
        console.error('❌ Error en loadNews():', error);
        NEWS = [];
        render();
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar variables
    state = { page: 1, pageSize: 6, category: 'Todas' };
    grid = document.getElementById('newsGrid');
    pageInfo = document.getElementById('pageInfo');
    prevBtn = document.getElementById('prevBtn');
    nextBtn = document.getElementById('nextBtn');

    // Inicializar modal
    const modalElement = document.getElementById('newsModal');
    if (modalElement) {
        modal = new bootstrap.Modal(modalElement);
    }

    // Event listeners para paginación
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            state.page = Math.max(1, state.page - 1);
            render();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            state.page = state.page + 1;
            render();
        });
    }

    // Event listener para categorías
    const categorySelect = document.getElementById('category');
    if (categorySelect) {
        categorySelect.addEventListener('change', (e) => {
            state.category = e.target.value;
            state.page = 1;
            render();
        });
    }

    // Inicializar carga de noticias
    loadNews();

    // Manejar hash en URL
    if (location.hash) {
        const id = location.hash.replace('#', '');
        setTimeout(() => {
            if (NEWS.find(n => n.id === id)) openDetail(id);
        }, 500);
    }
});
