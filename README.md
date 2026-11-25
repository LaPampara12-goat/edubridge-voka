# EduBridge — HTML, CSS y JavaScript

Versión de EduBridge adaptada a archivos web tradicionales para trabajar desde Visual Studio Code.

## Archivos
- `index.html`: entrada y redirección a inicio de sesión.
- `login.html`: inicio de sesión, registro y acceso con Google.
- `reportar.html`: captura de un reporte, estado del estudiante y ubicación GPS.
- `buscar.html`: búsqueda de estudiantes.
- `dashboard.html`: estadísticas, filtros por grado/fecha, zonas y exportación CSV.
- `usuarios.html`: administración de roles.
- `css/styles.css`: diseño responsive compartido.
- `js/app.js`: autenticación, navegación, utilidades y funciones comunes.
- `js/*.js`: comportamiento de cada pantalla.
- `assets/`: logo e iconos.
- `config.js.example`: plantilla de configuración de Supabase.

## Configuración necesaria
1. Abre esta carpeta en Visual Studio Code.
2. Copia `config.js.example` y pega la copia con el nombre `config.js`.
3. En `config.js`, escribe la URL y la clave **publicable** de tu proyecto Supabase.
4. Ejecuta la página con la extensión **Live Server** (clic derecho en `index.html` → Open with Live Server), o sirve la carpeta con cualquier servidor estático local.
5. Inicia sesión con un usuario de tu proyecto.

No uses nunca una clave `service_role` en el navegador.

## Requisitos del backend
La app sigue utilizando el backend Supabase del proyecto original. Para que todas las funciones trabajen, deben existir las tablas/vistas y permisos configurados en el proyecto:
- `reports`
- `latest_status`
- `profiles`
- `user_roles`
- RPC `set_user_role`

El acceso, las políticas RLS, las confirmaciones de correo y OAuth con Google se configuran en Supabase. La URL del sitio local debe estar permitida en la configuración de redirecciones de autenticación.

## Alcance de la conversión
Se conservaron las pantallas principales, el estilo visual aproximado, los estados de emergencia, el formulario con GPS, búsqueda, panel, filtros, exportación CSV, administración de roles, autenticación con correo y OAuth Google. El proyecto ya no necesita React, TypeScript, Tailwind ni npm para mostrar la interfaz; Supabase se carga desde CDN y sí requiere conexión a internet. La cola de reportes sin conexión y la exportación PDF del original no se han replicado en esta versión.
