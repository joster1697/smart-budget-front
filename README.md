# SmartBudget - Frontend

Frontend de la aplicación SmartBudget construido con React, TypeScript y Vite.

## 🚀 Stack Tecnológico

- **React 18** con TypeScript
- **Vite** - Build tool y dev server
- **React Router v7** - Routing
- **Tailwind CSS v4** - Estilos
- **Axios** - HTTP client (si aplica)

## 📋 Requisitos

- Node.js 18+ 
- npm o pnpm

## 🛠️ Instalación y Configuración

1. **Clonar el repositorio**
```bash
git clone https://github.com/joster1697/smart-budget-front.git
cd smart-budget-front
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar .env con tus configuraciones
# VITE_API_URL=http://localhost:3000
```

4. **Iniciar el servidor de desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 📦 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Genera el build de producción
- `npm run preview` - Preview del build de producción
- `npm run lint` - Ejecuta ESLint

## 🔗 Conexión con el Backend

Asegúrate de que el backend esté corriendo en el puerto configurado en `VITE_API_URL` (por defecto: `http://localhost:3000`).

El repositorio del backend se encuentra en: [URL_DEL_REPO_BACKEND]

## 📁 Estructura del Proyecto

```
src/
├── assets/          # Imágenes, fuentes, etc.
├── components/      # Componentes reutilizables
│   ├── menus/      # Sidebar, Footer, etc.
│   └── ui/         # Botones, inputs, etc.
├── pages/          # Páginas/vistas principales
├── App.tsx         # Componente principal
├── main.tsx        # Entry point
└── index.css       # Estilos globales (Tailwind)
```

## 📝 Licencia

Este proyecto es de código abierto bajo la licencia MIT.
