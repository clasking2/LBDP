# Estructura de API de Noticias - Facebook Graph API

## Descripción General

Este documento describe la estructura de datos para las noticias del sitio web del Liceo, obtenidas desde Facebook Graph API.

## Endpoint de Facebook Graph API

```
GET /{page-id}?fields=id,name,posts{created_time,message,attachments{media,title,url,subattachments}}
```

## Estructura JSON Esperada

El archivo `data/news.json` debe contener datos en el siguiente formato:

```json
{
  "id": "page_id",
  "name": "Nombre de la Página",
  "posts": {
    "data": [
      {
        "id": "post_id_único",
        "created_time": "2025-03-15T16:39:20+0000",
        "message": "Texto del mensaje del post",
        "attachments": {
          "data": [
            {
              "media": {
                "image": {
                  "height": 720,
                  "src": "https://url-de-la-imagen.com/imagen.jpg",
                  "width": 1280
                }
              },
              "title": "Título del attachment",
              "url": "URL opcional del enlace",
              "subattachments": {
                "data": [
                  {
                    "media": {
                      "image": {
                        "height": 720,
                        "src": "https://url-de-subimagen.com/imagen2.jpg",
                        "width": 1280
                      }
                    }
                  }
                ]
              }
            }
          ]
        }
      }
    ]
  }
}
```

## Campos Requeridos

### Nivel Raíz
- `id`: ID de la página de Facebook
- `name`: Nombre de la página
- `posts`: Objeto contenedor de posts

### Nivel Posts
- `posts.data`: Array de posts individuales

### Nivel Post Individual
- `id`: **[REQUERIDO]** ID único del post
- `created_time`: **[REQUERIDO]** Fecha de creación en formato ISO 8601
- `message`: **[REQUERIDO]** Contenido textual del post
- `attachments`: **[OPCIONAL]** Objeto contenedor de archivos adjuntos

### Nivel Attachments
- `attachments.data`: Array de attachments
  - `media`: Objeto de medios
    - `image`: Objeto de imagen
      - `src`: **[REQUERIDO]** URL de la imagen
      - `height`: Alto de la imagen
      - `width`: Ancho de la imagen
  - `title`: Título del attachment
  - `url`: URL del enlace asociado
  - `subattachments`: **[OPCIONAL]** Imágenes adicionales (álbumes)
    - `data`: Array de sub-imágenes con la misma estructura que `media`

## Transformación de Datos

El archivo `js/news-loader.js` transforma automáticamente los datos de Facebook al formato interno:

```javascript
{
  id: "post_id",
  title: "Título extraído del attachment",
  date: "created_time del post",
  category: "Noticias",
  excerpt: "Primeros 150 caracteres del message",
  message: "Mensaje completo del post",
  images: ["url1", "url2", "url3"] // Imagen principal + subattachments
}
```

## Notas Importantes

1. **Imágenes Múltiples**: Si un post tiene `subattachments`, todas las imágenes (principal + sub) se combinan en el array `images[]`

2. **Título Predeterminado**: Si no hay `attachment.title`, se usa "Sin título"

3. **Categoría**: Todos los posts se clasifican automáticamente como "Noticias"

4. **Fecha**: Se formatea automáticamente al formato chileno (DD de Mes de AAAA)

5. **Sin Attachments**: Si un post no tiene imágenes, se mostrará solo con el texto del mensaje

## Ejemplo de Query de Facebook Graph API

Para obtener los datos correctos desde Facebook:

```javascript
const pageId = 'TU_PAGE_ID';
const accessToken = 'TU_ACCESS_TOKEN';
const fields = 'id,name,posts{created_time,message,attachments{media,title,url,subattachments}}';

const url = `https://graph.facebook.com/v18.0/${pageId}?fields=${fields}&access_token=${accessToken}`;

fetch(url)
  .then(response => response.json())
  .then(data => {
    // Guardar data en news.json
    console.log(data);
  });
```

## Actualización de Noticias

Para actualizar las noticias del sitio web:

1. Ejecutar el query de Facebook Graph API desde tu aplicación externa
2. Obtener el JSON con la estructura especificada
3. Guardar el resultado en `data/news.json`
4. El sitio web cargará automáticamente las nuevas noticias

## Manejo de Errores

Si el archivo `news.json` no existe o tiene errores:
- El sistema mostrará un array vacío de noticias
- No se romperá la página
- Se registrará un error en la consola del navegador

## Compatibilidad

Esta estructura es compatible con:
- Facebook Graph API v18.0+
- Formato estándar de posts de páginas de Facebook
- Posts con y sin imágenes
- Posts con álbumes de fotos (subattachments)
- Posts con enlaces externos

