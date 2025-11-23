# 📧 Configuración del Formulario de Contacto con EmailJS

El formulario de contacto del sitio web utiliza **EmailJS** para enviar correos electrónicos directamente desde el navegador, sin necesidad de un servidor backend.

---

## 🚀 Pasos para Configurar EmailJS

### **Paso 1: Crear una Cuenta en EmailJS**

1. Ve a [https://www.emailjs.com/](https://www.emailjs.com/)
2. Haz clic en **"Sign Up"** (Registrarse)
3. Crea una cuenta gratuita usando tu email
4. Verifica tu correo electrónico

---

### **Paso 2: Conectar un Servicio de Email**

1. Una vez dentro del dashboard, ve a **"Email Services"** en el menú lateral
2. Haz clic en **"Add New Service"**
3. Selecciona tu proveedor de email preferido:
   - **Gmail** (recomendado para facilidad)
   - Outlook
   - Yahoo
   - Otro servicio SMTP personalizado

4. **Si eliges Gmail:**
   - Haz clic en **"Connect Account"**
   - Autoriza a EmailJS para enviar emails desde tu cuenta de Gmail
   - Se abrirá una ventana de Google para dar permisos
   - ⚠️ **Importante:** Usa una cuenta de Gmail específica para el Liceo (ejemplo: `contacto@liceo.edu.cl` si es Gmail)

5. Dale un nombre a tu servicio (ejemplo: "Liceo Contact Service")
6. Guarda el **Service ID** que se genera (ejemplo: `service_abc123`)

---

### **Paso 3: Crear una Plantilla de Email**

1. Ve a **"Email Templates"** en el menú lateral
2. Haz clic en **"Create New Template"**
3. Configura la plantilla con los siguientes campos:

#### **Configuración de la Plantilla:**

**Subject (Asunto del email):**
```
Nuevo mensaje de contacto - {{asunto}}
```

**Content (Cuerpo del email):**
```
Has recibido un nuevo mensaje desde el formulario de contacto del sitio web del Liceo.

DATOS DEL REMITENTE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Nombre: {{nombre}}
Email: {{email}}
Teléfono: {{telefono}}
Asunto: {{asunto}}
Fecha: {{fecha}}

MENSAJE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{{mensaje}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Este email fue enviado automáticamente desde el formulario de contacto del sitio web del Liceo.
Para responder, envía un email directamente a: {{email}}
```

**From Name (Nombre del remitente):**
```
Formulario Liceo - {{nombre}}
```

**From Email:**
```
{{email}}
```

**To Email (Destinatario - donde recibirás los mensajes):**
```
contacto@liceo.edu.cl
```
_(O el email que quieras que reciba los mensajes)_

4. Haz clic en **"Save"**
5. Guarda el **Template ID** que se genera (ejemplo: `template_xyz789`)

---

### **Paso 4: Obtener tu Public Key**

1. Ve a **"Account"** en el menú lateral
2. En la sección **"API Keys"**, encontrarás tu **Public Key**
3. Copia esta clave (ejemplo: `AbC123XyZ-DefGhi456`)

---

### **Paso 5: Configurar las Credenciales en el Sitio Web**

Abre el archivo `contacto.html` y reemplaza los siguientes valores:

#### **Línea 224 - Inicializar EmailJS:**
```javascript
// ANTES:
emailjs.init('YOUR_PUBLIC_KEY');

// DESPUÉS (reemplaza con tu Public Key real):
emailjs.init('AbC123XyZ-DefGhi456');
```

#### **Línea 267 - Configurar Service ID y Template ID:**
```javascript
// ANTES:
emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', formData)

// DESPUÉS (reemplaza con tus IDs reales):
emailjs.send('service_abc123', 'template_xyz789', formData)
```

---

## ✅ **Paso 6: Probar el Formulario**

1. Abre el sitio web en tu navegador
2. Ve a la página de **Contacto**
3. Llena el formulario con datos de prueba
4. Haz clic en **"Enviar Mensaje"**
5. Deberías ver el mensaje **"¡Mensaje enviado!"**
6. Revisa el email configurado en **"To Email"** para verificar que llegó el mensaje

---

## 🎨 **Datos que se Envían por Email**

El formulario recopila y envía:

| Campo | Descripción | Obligatorio |
|-------|-------------|-------------|
| **Nombre** | Nombre completo del contacto | ✅ Sí |
| **Email** | Correo electrónico de respuesta | ✅ Sí |
| **Teléfono** | Número de contacto | ❌ No (opcional) |
| **Asunto** | Categoría del mensaje | ✅ Sí |
| **Mensaje** | Contenido de la consulta | ✅ Sí |
| **Fecha** | Fecha y hora del envío (automático) | ✅ Sí (auto) |

---

## 🔒 **Privacidad y Seguridad**

### **Lo que SÍ hace el formulario:**
✅ Envía emails usando la API de EmailJS  
✅ Los datos viajan encriptados (HTTPS)  
✅ No almacena datos en el servidor (sin backend)  
✅ Validación de campos en el cliente

### **Lo que NO hace el formulario:**
❌ NO guarda datos en base de datos  
❌ NO guarda datos en localStorage del navegador  
❌ NO comparte información con terceros (más allá de EmailJS para el envío)  
❌ NO usa cookies de seguimiento

---

## 💰 **Límites del Plan Gratuito de EmailJS**

- **200 emails por mes** (gratis)
- Si necesitas más, puedes actualizar al plan Personal (150 emails/mes por $9 USD) o Business (más volumen)

---

## 🛠️ **Solución de Problemas**

### **Error: "Failed to send email"**
- Verifica que las credenciales (Public Key, Service ID, Template ID) sean correctas
- Asegúrate de haber autorizado la cuenta de Gmail si usas ese servicio
- Revisa que el servicio de EmailJS esté activo en tu dashboard

### **El email no llega**
- Revisa la carpeta de **Spam/Correo no deseado**
- Verifica que el **"To Email"** en la plantilla sea correcto
- Comprueba los límites de tu plan (200 emails/mes en plan gratuito)

### **Error de CORS**
- EmailJS maneja CORS automáticamente, pero asegúrate de que el sitio esté servido desde un dominio válido (no `file://`)
- Usa `http-server` o similar para desarrollo local

---

## 📚 **Recursos Adicionales**

- **Dashboard de EmailJS:** [https://dashboard.emailjs.com/](https://dashboard.emailjs.com/)
- **Documentación oficial:** [https://www.emailjs.com/docs/](https://www.emailjs.com/docs/)
- **Soporte:** [https://www.emailjs.com/support/](https://www.emailjs.com/support/)

---

## 📝 **Resumen de Configuración**

Para activar el formulario, necesitas reemplazar en `contacto.html`:

```javascript
// 1. Tu Public Key
emailjs.init('TU_PUBLIC_KEY_AQUI');

// 2. Tu Service ID y Template ID
emailjs.send('TU_SERVICE_ID_AQUI', 'TU_TEMPLATE_ID_AQUI', formData)
```

¡Y listo! El formulario de contacto estará funcionando y enviando emails directamente. 🎉

