/**
 * Load Components - Carga componentes HTML dinámicamente
 * Topbar, Navbar y Footer centralizados
 */

// Función para cargar un componente
async function loadComponent(elementId, componentPath) {
  try {
    const response = await fetch(componentPath);
    if (!response.ok) {
      throw new Error(`Error loading ${componentPath}: ${response.status}`);
    }
    const html = await response.text();
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = html;
    }
  } catch (error) {
    console.error(`Failed to load component ${componentPath}:`, error);
  }
}

// Cargar todos los componentes cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async function () {
  // Cargar componentes en paralelo
  await Promise.all([
    loadComponent('topbar-container', './components/topbar.html'),
    loadComponent('navbar-container', './components/navbar.html'),
    loadComponent('footer-container', './components/footer.html')
  ]);

  // Actualizar el año en el footer después de cargarlo
  const yearElement = document.getElementById('year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // Inicializar funcionalidad del navbar y back-to-top después de cargar componentes
  initScrollEffects();

  // Inicializar animaciones globales
  initRevealAnimations();
});

/**
 * Inicializar efectos de scroll para navbar y botón back-to-top
 */
function initScrollEffects() {
  const navbar = document.querySelector('.navbar-liceo');
  const backTop = document.getElementById('backTop');

  // Manejar scroll para navbar elevado y botón back-to-top
  window.addEventListener('scroll', function () {
    const scrollY = window.scrollY;

    // Agregar clase navbar-elevated cuando se hace scroll
    if (navbar) {
      navbar.classList.toggle('navbar-elevated', scrollY > 12);
    }

    // Mostrar botón back-to-top cuando se baja más de 240px
    if (backTop) {
      backTop.classList.toggle('show', scrollY > 240);
    }
  });

  // Click en botón back-to-top para volver arriba
  if (backTop) {
    backTop.addEventListener('click', function () {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
}

/**
 * Inicializar animaciones de revelado al hacer scroll
 */
function initRevealAnimations() {
  const observerOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // Dejar de observar una vez revelado
      }
    });
  }, observerOptions);

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}
