# Especificación de Requisitos de Software (SRS)

## 1. Descripción del sistema

La aplicación será un sitio web propio, cerrado y protegido. Su función será permitir al propietario:

- Compartir información de contacto.
- Generar archivos para guardar contactos.
- Generar enlaces de referencia con información bancaria o de pago.
- Compartir dichos enlaces con otras personas.
- Controlar el acceso mediante contraseñas y sesiones temporales.

La aplicación **no recibe, procesa ni confirma pagos**. La persona receptora utilizará la información compartida para realizar el pago directamente desde su propia plataforma bancaria.

## 2. Tipos de usuarios

1.  **Propietario:** Administrador principal. Puede configurar la información, generar enlaces y gestionar el acceso.
2.  **Consulta:** Usuario externo (cliente, amigo, familiar, etc.) que recibe el enlace. Solo puede visualizar la información de contacto y los datos bancarios. No puede realizar modificaciones.

## 3. Características principales

### 3.1. Protección por contraseña y control de acceso

- El acceso al sitio estará restringido por contraseñas.
- Se implementarán dos roles:
    - **Contraseña de Propietario:** Acceso total a la configuración y generación de enlaces.
    - **Contraseña de Consulta:** Acceso limitado de solo lectura a los datos compartidos.
- Las sesiones caducarán automáticamente (ej. 24 horas, o un tiempo configurable) para mayor seguridad.
- La pantalla de inicio de sesión será la única pública; todo el contenido estará bloqueado tras ella.

### 3.2. Información de contacto

- Mostrar nombre completo, correo electrónico, número de teléfono (con enlace a WhatsApp/llamada) y otros enlaces relevantes (LinkedIn, sitio web).
- **Botón "Guardar Contacto":** Generará y descargará automáticamente un archivo de contacto estándar (vCard - `.vcf`) para que el usuario de Consulta lo agregue a su agenda.

### 3.3. Información bancaria y de pago

- Sección dedicada a mostrar los datos necesarios para realizar transferencias.
- **Datos requeridos:**
    - Nombre del titular.
    - Banco.
    - CLABE Interbancaria (18 dígitos).
    - Cuenta (opcional).
    - Tarjeta (opcional).
- **Botones de copiar:** Cada dato bancario tendrá un botón para copiarlo fácilmente al portapapeles.
- La aplicación **no** tendrá integraciones con pasarelas de pago (Stripe, PayPal, etc.). Solo mostrará la información estática.

### 3.4. Generación de enlaces de referencia

- El Propietario podrá generar URLs específicas para compartir (ej. `misitio.com/pago?ref=123`).
- El enlace de referencia contendrá de forma predeterminada la contraseña de Consulta para un acceso sin fricción, pero con un tiempo de expiración (ej. 24 horas).
- Pasado el tiempo de expiración, el enlace de referencia dejará de funcionar y pedirá la contraseña de Consulta manualmente.

## 4. Requisitos no funcionales

### 4.1. Interfaz y Experiencia de Usuario (UI/UX)

- Diseño limpio, minimalista y profesional.
- Totalmente responsivo (adaptable a móviles y computadoras).
- Tiempos de carga rápidos.
- Modo oscuro (opcional, pero recomendado).

### 4.2. Seguridad

- Contraseñas cifradas.
- Protección básica contra ataques de fuerza bruta (limitación de intentos de inicio de sesión).
- Uso de HTTPS obligatorio.

### 4.3. Infraestructura

- **Hosting:** AWS (Amazon Web Services).
- **Dominio:** Propio (ej. `mi-dominio.com`).
- **Infraestructura como Código (IaC):** OpenTofu (para gestionar los recursos de AWS como S3, CloudFront, Route53, etc.).
- **Despliegue:** Sitio web estático (HTML, CSS, JS) alojado en S3 y distribuido mediante CloudFront. Si se requiere backend para las sesiones, se utilizará AWS Lambda y API Gateway (arquitectura Serverless).

## 5. Diseño y Estilos Originales (Legado)

El sistema original empleaba un diseño "Glassmorphism" con variables de color modo claro/oscuro integradas, tarjetas flotantes, botones interactivos con respuesta háptica y generación de archivos vCard interactuando directamente con APIs nativas (como Web Share API).

Se usó una arquitectura de componentes con:
- Paleta monocromática con acentos (`--success: #16a34a`).
- Efectos de blur (`backdrop-filter: blur(24px)`).
- Interacciones avanzadas (arrastre, swiping en móviles, botones que copian al portapapeles).

Las funciones principales heredadas del Hub de Contacto incluyen:
- `openBankModal() / closeBankModal()`
- `initFareEditor()` (Generador de conceptos interactivo)
- `generateAndDownloadVCF()` (Creación de vCards dinámicas)
- Integración con portapapeles (`copyToClipboard`) y notificaciones "Toast".

### 5.1 Inferencias de Proyectos Adicionales

1. **Candle (Vela Virtual Interactiva)**:
   - **Estilo Visual**: Pixel art (`image-rendering: pixelated;`), fondos dinámicos que cambian según la "luz" de la vela (sistema de iluminación con variables radial-gradient).
   - **Funciones Principales**: Simulación de derretimiento de vela a través del tiempo (12 horas usando `requestAnimationFrame`), estados faciales de la vela, guardado de estado en `localStorage`, partículas de humo por canvas y llamadas API (`/api/notify`) para avisar a un contacto específico (James) de eventos.

2. **WPR (Welcome Party Ricardo)**:
   - **Estilo Visual**: Implementación avanzada de Glassmorphism con orbes flotantes, modales "pop-up" fluidos, colores de sistema (dark/light) y tarjetas de detalles paso a paso.
   - **Funciones Principales**: Uso de modales anidados (`openItineraryModal`, `openCostModal`, `openCodiModal`, `openBankModal`), desglose de costos detallado en la interfaz, sistema de confirmaciones, integración directa a enlaces de terceros (Stripe, iCloud Invites), y generadores de conceptos para SPEI/CODI que evitan errores humanos.
