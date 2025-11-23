// Script para cargar y procesar noticias desde el archivo JSON
// Formato: posts.data con attachments y subattachments

// Exponer variables globales
window.NEWS_DATA = [];

/**
 * Transforma el formato de Facebook a formato interno con validación
 * @param {Object} fbData - Datos crudos de Facebook
 * @returns {Array} - Array de noticias procesadas
 */
function transformNewsData(fbData) {
  if (!fbData || typeof fbData !== 'object') {
    console.error('Datos de entrada inválidos');
    return [];
  }

  // Soporte para estructura directa o anidada en 'posts'
  const postsList = fbData.posts?.data || fbData.data;

  if (!Array.isArray(postsList)) {
    console.error('No se encontró lista de posts válida');
    return [];
  }

  return postsList.map(post => {
    try {
      const attachment = post.attachments?.data?.[0];
      const mainImage = attachment?.media?.image?.src || '';
      const title = attachment?.title || 'Sin título';

      // Recopilar todas las imágenes (imagen principal + subattachments)
      const allImages = [];
      if (mainImage) allImages.push(mainImage);

      if (attachment?.subattachments?.data) {
        attachment.subattachments.data.forEach(sub => {
          const subImage = sub.media?.image?.src;
          if (subImage) {
            allImages.push(subImage);
          }
        });
      }

      return {
        id: post.id,
        title: title,
        date: post.created_time,
        category: 'Noticias',
        excerpt: post.message ? (post.message.length > 150 ? post.message.substring(0, 150) + '...' : post.message) : '',
        message: post.message || '',
        images: allImages
      };
    } catch (err) {
      console.warn('Error procesando post individual:', err, post);
      return null;
    }
  }).filter(item => item !== null); // Eliminar items fallidos
}

async function loadNewsFromJSON(url = './data/news.json') {
  console.log('🔵 Iniciando carga de noticias desde:', url);
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('✅ Datos JSON cargados correctamente:', data);
    window.NEWS_DATA = transformNewsData(data);
    console.log('✅ NEWS_DATA procesada:', window.NEWS_DATA.length, 'noticias');
    return window.NEWS_DATA;
  } catch (error) {
    console.error('❌ Error cargando noticias:', error);
    console.warn('⚠️ Usando datos de respaldo (fallback) debido a error de carga.');

    // Datos de respaldo para cuando falla la carga (ej. CORS local)
    const fallbackData = {
      posts: {
        data: [
          {
            id: "post_fallback_1",
            created_time: "2025-11-20T15:30:00+0000",
            message: "¡Felicitaciones a la generación 2025! Hoy celebramos la ceremonia de graduación de nuestros estudiantes de 4º medio.",
            attachments: { data: [{ media: { image: { src: "./assets/img/estudiantes.jpg" } }, title: "Graduación 2025" }] }
          },
          {
            id: "post_fallback_2",
            created_time: "2025-10-16T11:45:00+0000",
            message: "Hoy celebramos a nuestros queridos profesores en su día. Gracias por su dedicación.",
            attachments: { data: [{ media: { image: { src: "./assets/img/edificio-blanco.jpg" } }, title: "Día del Profesor" }] }
          },
          {
            id: "post_fallback_3",
            created_time: "2025-09-19T09:00:00+0000",
            message: "¡Viva Chile! Celebramos Fiestas Patrias con alegría y entusiasmo.",
            attachments: { data: [{ media: { image: { src: "./assets/img/danza.jpg" } }, title: "Fiestas Patrias" }] }
          }
        ]
      }
    };

    window.NEWS_DATA = transformNewsData(fallbackData);
    console.log('✅ Fallback NEWS_DATA cargada:', window.NEWS_DATA.length, 'noticias');
    return window.NEWS_DATA;
  }
}

function getLatestNews(count = 3) {
  // Assuming NEWS_DATA is sorted by date, or needs sorting.
  // For simplicity, let's just take the first 'count' items.
  // A more robust implementation would sort by created_time.
  return window.NEWS_DATA.slice(0, count);
}

function getNewsById(id) {
  return window.NEWS_DATA.find(n => n.id === id);
}

/**
 * Formatear fecha
 * @param {string} dateString
 * @returns {string}
 */
function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  // Validar fecha
  if (isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Exponer funciones globalmente
window.loadNewsFromJSON = loadNewsFromJSON;
window.getLatestNews = getLatestNews;
window.getNewsById = getNewsById;
window.formatDate = formatDate;