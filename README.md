# Backend - Películas API

Este es el backend del proyecto, desarrollado con **NestJS** y **Supabase**, que gestiona la información de las películas, usuarios y la interacción con la API de **TMDB**. Además, se encarga de la autenticación de usuarios y el almacenamiento de imágenes en **Supabase**.

## **Tecnologías Utilizadas**
- **NestJS**: Framework backend para Node.js.
- **Supabase**: Base de datos, autenticación y almacenamiento en la nube.
- **TMDB API**: API externa para obtener información sobre películas.
- **PostgreSQL**: Base de datos relacional utilizada por Supabase.

## **Endpoints Principales**
1. **Autenticación**
   - `POST /auth/register`: Registrar un nuevo usuario.
   - `POST /auth/login`: Iniciar sesión y obtener un token de acceso.

2. **Películas**
   - `GET /movies`: Obtener una lista de películas agrupadas por categorías.
   - `POST /movies/favorites`: Agregar una película a los favoritos de un usuario.
   - `GET /movies/favorites`: Obtener las películas favoritas de un usuario.
   - `POST /movies/create`: Crear una nueva película.
   - `GET /movies/recommendations`: Obtener recomendaciones basadas en una película.
   - `GET /movies/by-genre`: Obtener películas por género.
   - `GET /movies/genres`: Obtener una lista de géneros.
   - `GET /movies/:id`: Obtener detalles de una película por su ID.

3. **TMDB**
   - `GET /tmdb/popular`: Obtener las películas populares desde la API de TMDB.

## **Variables de Entorno**
Antes de ejecutar el proyecto, asegúrate de configurar las siguientes variables de entorno en tu archivo `.env`:
- `SUPABASE_URL`: URL de tu proyecto en Supabase.
- `SUPABASE_SERVICE_KEY`: Clave privada para interactuar con Supabase.
- `SUPABASE_PUBLIC_ANON_KEY`: Clave pública para las operaciones de lectura/escritura.
- `TMDB_API_KEY`: Clave de API de TMDB.
- `TMDB_BASE_URL`: URL base de la API de TMDB.

## **Iniciar el Proyecto**
1. Instala las dependencias:
   ```bash
   npm install

## **Licencia y Derechos de Autor**

El diseño y la implementación del backend fueron creados por el equipo de desarrollo como parte de un proyecto personal y educativo. El código fuente de este proyecto está protegido por derechos de autor, a menos que se indique lo contrario.

### **Licencia**
Este proyecto está licenciado bajo la **Licencia MIT**. Puedes usar, copiar, modificar y distribuir el código de este proyecto, siempre y cuando incluyas la misma licencia en las distribuciones.

### **Uso de APIs**
Este proyecto hace uso de la **API de TMDB** para obtener información sobre películas. El uso de esta API está sujeto a los términos y condiciones establecidos por **TMDB**. Puedes consultar su documentación en: [TMDB Terms of Service](https://www.themoviedb.org/terms-of-use).

### **Créditos de Diseño**
El diseño de la base de datos y la estructura del backend siguen principios de arquitectura limpia y modular, con un enfoque en escalabilidad y mantenimiento. Los componentes clave del sistema (como la autenticación y la gestión de películas) están implementados siguiendo las mejores prácticas recomendadas por la comunidad de **NestJS**.


Este archivo contiene toda la información esencial sobre cómo configurar, ejecutar y desplegar el backend. Si necesitas algún ajuste o tienes dudas, ¡avísame! 😊

