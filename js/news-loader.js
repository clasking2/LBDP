// Script para cargar y procesar noticias desde el archivo JSON
// Formato: posts.data con attachments y subattachments

let NEWS_DATA = [];

// Función para transformar el formato de Facebook a formato interno
function transformNewsData(fbData) {
  if (!fbData || !fbData.posts || !fbData.posts.data) {
    console.error('Formato de datos incorrecto');
    return [];
  }

  return fbData.posts.data.map(post => {
    const attachment = post.attachments?.data?.[0];
    const mainImage = attachment?.media?.image?.src || '';
    const title = attachment?.title || 'Sin título';
    
    // Recopilar todas las imágenes (imagen principal + subattachments)
    const allImages = [mainImage];
    
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
      excerpt: post.message ? post.message.substring(0, 150) + '...' : '',
      message: post.message || '',
      images: allImages.filter(img => img) // Filtrar imágenes vacías
    };
  });
}

// Cargar noticias desde JSON
async function loadNewsFromJSON() {
  try {
    const response = await fetch('./data/news.json');
    if (!response.ok) {
      throw new Error('Error al cargar el archivo JSON');
    }
    const data = await response.json();
    NEWS_DATA = transformNewsData(data);
    return NEWS_DATA;
  } catch (error) {
    console.error('Error cargando noticias:', error);
    // Datos de respaldo en caso de error
    NEWS_DATA = [];
    return NEWS_DATA;
  }
}

// Obtener las últimas N noticias
function getLatestNews(count = 3) {
  const sorted = [...NEWS_DATA].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );
  return sorted.slice(0, count);
}

// Obtener una noticia por ID
function getNewsById(id) {
  return NEWS_DATA.find(n => n.id === id);
}

// Formatear fecha
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}