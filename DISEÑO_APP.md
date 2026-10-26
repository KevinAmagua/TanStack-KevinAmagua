# Diseño de la Aplicación - Biblioteca Personal

## 1. Objetivo
Aplicación móvil para buscar libros en OpenLibrary, guardar favoritos en MockAPI y gestionar una biblioteca personal con soporte offline mediante TanStack Query.

## 2. Arquitectura General

### Patrón
- **Arquitectura por capas**: API / Hooks / Componentes / Pantallas
- **File-based routing**: Expo Router
- **State management**: TanStack Query para datos remotos
- **Offline-first**: Configurado con networkMode offlineFirst

### Tecnologías
| Tecnología | Versión | Uso |
|---|---|---|
| Expo SDK | 58 | Framework base |
| React Native | 0.81.x | UI nativa |
| TypeScript | 5.x | Tipado estricto |
| Expo Router | 6.x | Navegación |
| TanStack Query | 5.x | Data fetching y caché |
| AsyncStorage | Latest | Persistencia (preparado) |
| OpenLibrary API | v1 | Búsqueda de libros |
| MockAPI | - | CRUD de favoritos |

## 3. Diseño de Navegación

### Estructura de Tabs
`
(Tabs)
├── index (Libros) - Búsqueda y listado
├── favorites (Favoritos) - Lista de guardados
└── explore (Explorar) - Info de la app
`

### Stack Navigation
`
Root Stack
├── (tabs) - Navegador principal
├── book/[id] - Detalle de libro
├── favorite/[id] - Editar favorito
└── favorite/create - Crear favorito
`

### Flujo de usuario
1. **Inicio**: Tab "Libros" - Buscar libro por nombre
2. **Detalle libro**: Tap en libro -> Ver información completa
3. **Guardar favorito**: Desde "Favoritos" -> "+" Crear o tap en favorito para editar
4. **Gestionar favoritos**: CRUD completo con MockAPI

## 4. Diseño de UI/UX

### Paleta de colores
`	ypescript
// Modo claro/oscuro gestionado por tema
background: adaptativo
primary: #007AFF (botones principales)
success: #34C759 (agregar)
danger: #FF3B30 (errores)
`

### Componentes principales

#### Pantalla de Búsqueda (index.tsx)
- **Header**: Campo de búsqueda con botón
- **Estados**: Loading, Error, Sin búsqueda, Sin resultados, Resultados
- **Lista**: FlatList con cards de libros
- **Navegación**: Tap -> /book/[id]

#### Pantalla de Favoritos (favorites.tsx)
- **Header**: Título + botón "Agregar"
- **Lista**: FlatList con favoritos guardados
- **Estados**: Loading, Error, Vacío, Con datos
- **Acciones**: Crear nuevo, Editar existente

#### Detalle de Libro (book/[id].tsx)
- **ScrollView**: Información organizada por secciones
- **Secciones**: Título, Autores, Año, Fecha, Descripción, Temas
- **Estados**: Loading, Error, Datos

#### Formulario Favorito (favorite/[id].tsx y crud/[id].tsx)
- **Campos**: Título* (obligatorio, mín. 2 car.), Autor (mín. 2 car. si se ingresa), Descripción (máx. 500 car.), Notas (máx. 500 car.)
- **Acciones**: Guardar/Crear con validación en tiempo real e inline errors (borde rojo y mensaje de error específico), y opción de **Eliminar** (con diálogo de confirmación `Alert.alert` y mutación `useDeleteFavorite`).
- **Feedback**: Alert de éxito/error y limpieza de errores al escribir.
- **Navegación**: Vuelve atrás tras guardar o eliminar.

### Patrones de diseño
- **Cards**: Bordes redondeados, padding 16, fondo sutil
- **Botones**: Primarios azules, secundarios adaptativos
- **Inputs**: Bordes grises, padding, height 44
- **Estados vacíos**: Enriquecidos con iconos, descripciones claras y botones de llamada a la acción (CTA)
- **Pull-to-Refresh**: Integrado mediante `RefreshControl` en listas de datos guardados
- **Notificaciones Toast**: Componente flotante `ToastBanner` para feedback no intrusivo
- **Loading**: ActivityIndicator centrado y estados optimistas

## 5. Gestión de Datos

### Query Keys
`	ypescript
books: {
  all: ['books'],
  lists: () => ['books', 'list'],
  list: (filters) => ['books', 'list', normalizedFilters],
  details: () => ['books', 'detail'],
  detail: (id) => ['books', 'detail', id]
}

favorites: {
  all: ['favorites'],
  lists: () => ['favorites', 'list'],
  list: () => ['favorites', 'list'],
  details: () => ['favorites', 'detail'],
  detail: (id) => ['favorites', 'detail', id]
}
`

### Configuración TanStack Query
- **Queries**: staleTime 5min (libros), 30s (favoritos), gcTime 24h
- **Mutations**: networkMode offlineFirst, retry 0
- **Invalidación**: Al crear/actualizar favorito -> invalida favorites.lists()

### APIs

#### OpenLibrary
- **Base URL**: https://openlibrary.org (desde .env)
- **Endpoint búsqueda**: /search.json?q={query}&limit=20&offset={offset}
- **Endpoint detalle**: /works/{id}.json

#### MockAPI
- **URL de colección**: https://6ad90d0bf89c5702ed9a6438.mockapi.io/libros (desde .env)
- **Endpoint**: la URL configurada es directamente el recurso `libros`; los elementos individuales usan `/{id}`.
- **Métodos**: GET, POST, PUT, DELETE

## 6. Validaciones

### Búsqueda de libros
- Requiere query no vacío
- Ejecuta solo con enabled: query.length > 0

### Formulario favoritos
- Título obligatorio
- Campos opcionales: autor, descripción, notas
- Trim automático antes de enviar

## 7. Estados y Feedback

| Estado | Comportamiento |
|---|---|
| Loading | ActivityIndicator + mensaje descriptivo |
| Error | Mensaje de error + botón "Reintentar" |
| Empty | Mensaje + CTA cuando aplica |
| Success | Alert nativo + navegación |

## 8. Consideraciones Técnicas

### Rendimiento
- FlatList para listas largas
- Keys únicas en listas
- Mappers para separar DTOs de dominio
- Queries con staleTime para evitar refetch innecesarios

### Mantenibilidad
- Tipado estricto en TypeScript
- Componentes reutilizables
- Hooks personalizados para lógica de datos
- Separación clara por capas

### Escalabilidad
- Estructura preparada para persistencia offline
- Query keys centralizadas
- Fácil añadir nuevos endpoints
- Sistema de temas implementado

## 9. Testing Manual

### Flujo de prueba recomendado
1. Abrir app -> Tab Libros
2. Buscar "Harry Potter" -> Ver resultados
3. Tocar un libro -> Ver detalle
4. Ir a tab Favoritos -> Tocar "+" 
5. Rellenar formulario -> Guardar
6. Ver favorito en lista -> Tocar para editar
7. Modificar y guardar
8. Verificar cambios reflejados

## 10. Próximas Mejoras (Opcionales)
- Implementar persistencia completa con AsyncStorage
- Añadir funcionalidad offline con reanudación de mutaciones
- Mejorar UI con imágenes de portadas
- Añadir pull-to-refresh
- Implementar búsqueda con debounce