# RetroTime: Tienda Online de Videojuegos Retro

Bienvenido al repositorio de RetroTime, una tienda online especializada en videojuegos retro desarrollada como Trabajo de Fin de Grado.

## 🎮 Sobre el Proyecto

RetroTime es una aplicación web full-stack que combina un enfoque híbrido MPA/SPA para ofrecer una experiencia de usuario óptima y un buen SEO. La plataforma permite a los usuarios explorar, buscar y comprar videojuegos retro de diferentes consolas y generaciones.

## 🛠️ Stack Tecnológico

### Frontend
- **Astro 5.6**: Framework web que proporciona rendimiento y flexibilidad
- **Tailwind CSS v4.1**: Framework CSS para el diseño responsivo
- **React**: Para componentes interactivos como el carrito de compras

### Backend
- **Laravel**: Framework PHP para el backend y API REST
- **MySQL**: Sistema de gestión de bases de datos

### Procesamiento de pagos
- Stripe
- PayPal

### Infraestructura
- Docker para desarrollo y despliegue

## 🏗️ Arquitectura

El proyecto sigue un enfoque híbrido:

- **MPA (Multi-Page Application)** con Astro para páginas estáticas:
  - Home, Catálogo, Páginas de categorías, Detalles de producto
- **SPA (Single-Page Application)** con React para componentes interactivos:
  - Carrito de compras, Proceso de pago, Búsqueda en vivo, Lista de deseos

## 📦 Estructura del Proyecto
```
videogames-store/
│
├── frontend/                      # Proyecto Astro + React
│   ├── public/                    # Archivos estáticos
│   ├── src/
│   │   ├── components/            # Componentes reutilizables
│   │   ├── layouts/               # Layouts de Astro
│   │   ├── pages/                 # Páginas de Astro (MPA)
│   │   ├── stores/                # Estado global React
│   │   ├── utils/                 # Funciones de utilidad
│   │   ├── hooks/                 # Custom hooks de React
│   │   └── styles/                # Estilos globales
│   └── ...
│
├── backend/                       # Proyecto Laravel
│   ├── app/
│   │   ├── Http/                  # Controladores y Middleware
│   │   ├── Models/                # Modelos Eloquent
│   │   ├── Services/              # Servicios de negocio
│   │   └── ...
│   ├── database/                  # Migraciones y Seeders
│   ├── routes/                    # Definición de rutas
│   └── ...
│
└── docker-compose.yml             # Configuración Docker
```

## 🚀 Instalación y Configuración

### Requisitos Previos
- Docker y Docker Compose
- Node.js (v18+) para desarrollo local
- Composer para desarrollo local

### Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/santigg07/Proyecto-TFG-Videogames-Stores-.git
cd Proyecto-TFG-Videogames-Stores
```
2. Iniciar los contenedores con Docker Compose:
```bash
bashdocker-compose up -d
```
3. Instalar dependencias del frontend:
```bash
bashcd frontend
npm install
```
4. Instalar dependencias del backend:
```bash
bashcd backend
composer install
```
5. Configurar variables de entorno:

-Copiar .env.example a .env en la carpeta backend
-Configurar las credenciales de la base de datos y de los servicios de pago


6. Ejecutar migraciones y seeders:
```bash
bashdocker-compose exec backend php artisan migrate --seed
```

🖥️ Uso

Frontend: http://localhost:4321
Backend API: http://localhost:8000/api
PHPMyAdmin: http://localhost:8080

✨ Características

Catálogo de juegos por consola y categoría
Detalles completos de productos
Carrito de compras interactivo
Procesamiento de pagos con Stripe y PayPal
Panel de administración para gestión de productos
Perfil de usuario con historial de compras
Lista de deseos
Reviews y comentarios

🔄 API RESTful
El backend de Laravel expone una API RESTful para que el frontend consuma:

Autenticación mediante Laravel Sanctum
Endpoints para gestión de:

Usuarios
Productos
Carrito
Pagos
Categorías y consolas



📊 Base de Datos
El sistema incluye tablas para:

Usuarios y roles
Productos (juegos)
Categorías y consolas
Pedidos y elementos de pedido
Integraciones con sistemas de pago
Lista de deseos

🧪 Pruebas
Para ejecutar las pruebas del backend:
```bash
bashdocker-compose exec backend php artisan test
```
📝 Licencia
MIT
📧 Contacto
Para consultas o sugerencias sobre el proyecto, puedes contactar al autor a través de santi-91@alumnos.alborfp.com.

Desarrollado como Trabajo de Fin de Grado - 2025