# UI/UX DESIGN SPECIFICATION

## Nombre de la aplicación

Biblioteca Personal

---

# Objetivo

Desarrollar una aplicación móvil moderna que permita explorar libros desde Open Library y gestionar favoritos y notas personales almacenadas en MockAPI.

La interfaz debe priorizar:

- Simplicidad
- Rapidez
- Claridad visual
- Experiencia offline
- Diseño profesional y no genérico

---

# Público objetivo

Usuarios interesados en:

- Lectura
- Descubrimiento de libros
- Organización de favoritos
- Guardar notas personales

---

# Estilo visual

## Diseño

Minimalista moderno.

Inspiración:

- Goodreads
- Kindle
- Google Books
- Material Design 3

---

## Colores

### Primario

Azul oscuro

```text
#1E3A8A
```

### Secundario

Azul claro

```text
#3B82F6
```

### Fondo

```text
#F8FAFC
```

### Texto principal

```text
#1E293B
```

### Texto secundario

```text
#64748B
```

### Éxito

```text
#22C55E
```

### Error

```text
#EF4444
```

### Pendiente Offline

```text
#F59E0B
```

---

# Tipografía

Familia:

```text
Inter
```

o

```text
System Default
```

Jerarquía:

- H1: 28
- H2: 22
- H3: 18
- Body: 16
- Small: 14

---

# Navegación

Bottom Tab Navigation

## Tabs

Inicio
Favoritos
Configuración

---

# Pantalla 1

## Inicio

Objetivo:

Permitir explorar libros.

### Componentes

Barra superior

- Logo
- Nombre aplicación

Buscador

- Placeholder:
  Buscar libros...

Lista de libros

Cada tarjeta debe mostrar:

- Portada
- Título
- Autor
- Año

Botón:

Ver detalle

---

# Pantalla 2

## Detalle del libro

Mostrar:

- Imagen grande
- Título
- Autor
- Fecha publicación
- Descripción

Acciones:

Agregar a favoritos

Agregar nota

---

# Pantalla 3

## Favoritos

Mostrar:

Lista de favoritos guardados.

Cada elemento debe incluir:

- Portada
- Título
- Nota personal

Acciones:

- Editar nota
- Eliminar favorito

---

# Pantalla 4

## Crear o Editar Nota

Formulario simple.

Campos:

Nota

Botones:

Guardar
Cancelar

---

# Pantalla 5

## Configuración

Mostrar:

Información aplicación

Estado conexión

Información caché

Versión

---

# Estados de interfaz

## Loading

Mostrar:

Skeleton Cards

No usar spinner como único elemento.

---

## Empty State

Mensaje:

No se encontraron libros.

Icono ilustrativo.

---

## Error State

Tarjeta amigable con:

- Mensaje
- Botón Reintentar

---

# Experiencia Offline

Cuando no exista conexión:

Mostrar banner superior.

Texto:

Sin conexión.

Trabajando con datos almacenados localmente.

---

# Indicadores de sincronización

Cuando una mutación esté pendiente:

Mostrar etiqueta:

Pendiente de sincronización

Color:

Amarillo

---

Cuando la sincronización termine:

Mostrar:

Sincronizado

Color:

Verde

---

# Accesibilidad

Requisitos:

- Contraste AA
- Área mínima táctil 44x44
- Textos escalables
- Navegación clara

---

# Responsive

Compatible con:

- Android pequeños
- Android medianos
- Tablets

---

# Animaciones

Utilizar únicamente:

- Fade In
- Fade Out
- Transiciones suaves

Evitar:

- Animaciones exageradas
- Efectos distractores

---

# Reglas