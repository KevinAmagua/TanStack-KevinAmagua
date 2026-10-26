# Biblioteca Personal

Aplicación desarrollada con React Native y Expo. Usa TanStack Query para consultar Open Library y guardar registros en MockAPI, con caché persistida y mutaciones que se reanudan después de recuperar la conexión.

## Tecnologías

- React Native y Expo
- TypeScript
- TanStack Query
- AsyncStorage
- MockAPI
- Open Library API
- Expo Network

## Query keys

Las claves están centralizadas en `src/lib/queryKeys.ts` y usan prefijos para permitir invalidaciones jerárquicas:

- Libros de Open Library:
  - `queryKeys.books.all`: `['books']`
  - `queryKeys.books.lists()`: todas las listas
  - `queryKeys.books.list(filters)`: lista por filtros de búsqueda
  - `queryKeys.books.details()`: todos los detalles
  - `queryKeys.books.detail(id)`: detalle por ID
- Registros propios de MockAPI:
  - `queryKeys.favorites.all`: `['favorites']`
  - `queryKeys.favorites.lists()`: todas las listas
  - `queryKeys.favorites.list()`: lista guardada
  - `queryKeys.favorites.details()`: todos los detalles
  - `queryKeys.favorites.detail(id)`: detalle por ID
- `mutationKeys.favorites.create` y `mutationKeys.favorites.update` identifican las mutaciones persistibles.

## Mutaciones e invalidaciones

Las mutaciones se configuran en `src/lib/queryClient.ts` para que sigan funcionando tras hidratar una cola persistida. Los hooks `src/hooks/mutations/useCreateFavorite.ts` y `useUpdateFavorite.ts` declaran sus respectivas `mutationKey`.

- **Crear un registro o guardar un libro:** la mutación `favorites/mutation/create` invalida `queryKeys.favorites.lists()` cuando el servidor confirma la creación, porque el contenido de la lista cambió.
- **Editar un registro:** la mutación `favorites/mutation/update` invalida las listas y `queryKeys.favorites.detail(id)`, porque tanto el resumen como el detalle pueden haber cambiado.
- Mientras la creación está pendiente, se agrega el elemento de forma optimista y aparece como **Pendiente de sincronizar** en su tarjeta dentro de **Guardados** y **Gestor** (no en el botón de guardar). Si la solicitud falla definitivamente, se quita ese elemento local.
- Cada registro muestra su fecha y hora de creación. En una creación offline se conserva la hora en que se pulsó **Guardar**, incluso si se sincroniza tras reabrir la app.
- Las operaciones pendientes se identifican con `networkMode: 'online'`: TanStack Query las pausa antes de llamar a la API cuando no hay conexión, en vez de intentar un POST offline.

## Caché

Los valores se configuran en `src/hooks/queries/`:

| Fuente | `staleTime` | Motivo |
|---|---:|---|
| Open Library | 5 minutos | Los datos bibliográficos suelen cambiar poco. |
| MockAPI | 30 segundos | Los registros personales cambian con más frecuencia. |

`gcTime` es de **24 horas** para ambas fuentes, igual que `PERSIST_MAX_AGE` en `src/lib/persister.ts`. Se debe mantener `gcTime >= maxAge`: si `gcTime` es menor, TanStack Query puede retirar una consulta inactiva de la caché en memoria antes de que expire el periodo de persistencia. La persistencia en AsyncStorage no se elimina automáticamente por eso, pero esa consulta podría no estar disponible en memoria y requerir una nueva lectura al volver a usarse.

## Persistencia de consultas y mutaciones

`src/app/_layout.tsx` monta `PersistQueryClientProvider` con `src/lib/persister.ts`, `createAsyncStoragePersister` y AsyncStorage. Se persisten las consultas exitosas y las mutaciones pausadas. Al iniciar, el provider restaura la caché antes de que las consultas se suscriban; si hay datos guardados, la pantalla puede mostrarlos mientras la actualización de red ocurre en segundo plano.

La mutación pausada y el elemento optimista se guardan en la caché persistida. Al volver a abrir la app, el provider restaura esa caché y luego llama a `resumePausedMutations()`. Los mutation defaults de `queryClient` proporcionan los `mutationFn` que TanStack necesita para reanudar una mutación después de reiniciar el proceso.

## Red y mutaciones offline

`src/lib/network.ts` usa `expo-network` para leer el estado inicial y escuchar cambios de conectividad. Cuando vuelve la conexión, `onlineManager` notifica a TanStack Query y la cola pausada se reanuda. `OfflineBanner` muestra el estado de desconexión y los elementos pendientes llevan una etiqueta visible en las pantallas de biblioteca y gestor.

### Demostración manual en Android/iOS

1. Inicia la app con conexión, busca libros y abre **Guardados** para cargar la colección.
2. Espera a que aparezcan los datos guardados y desactiva Wi-Fi/datos desde el dispositivo.
3. Guarda un libro de Open Library o crea un registro manual. Debe aparecer en la lista con **Pendiente de sincronizar**.
4. Espera a que aparezca la etiqueta antes de cerrar completamente la app; el persister escribe los cambios de caché en AsyncStorage.
5. Activa la conexión y abre de nuevo la app. La lista restaurada debe estar visible mientras se verifica el servidor; la mutación pausada se envía automáticamente.
6. Revisa la consola Metro/Expo. Los mensajes llevan fecha y hora ISO; los de creación también incluyen `savedAt`, que corresponde a la hora original en que se guardó el registro:

   ```text
   [2026-10-25T12:00:00.000Z] [network] offline; paused mutations: 0
   [2026-10-25T12:00:05.000Z] [mutation] queued offline: El título del libro; savedAt=2026-10-25T12:00:05.000Z
   [2026-10-25T12:01:00.000Z] [persistence] cache restored; cached favorites: 3; paused mutations: 1
   [2026-10-25T12:01:01.000Z] [mutation] sending create: El título del libro; savedAt=2026-10-25T12:00:05.000Z
   [2026-10-25T12:01:02.000Z] [mutation] create confirmed: El título del libro; savedAt=2026-10-25T12:00:05.000Z
   ```

La aplicación necesita permanecer instalada para conservar AsyncStorage. Para verificar la persistencia, cierra el proceso desde el sistema operativo; no borres los datos de la app ni la desinstales.

## Validación

- `npx tsc --noEmit` comprueba los tipos.
- `npm run lint` ejecuta el lint configurado para Expo.
- Prueba la reanudación offline en un dispositivo o emulador con la secuencia de demostración anterior; el cambio de conectividad y el cierre real de la app no pueden simularse completamente con una prueba unitaria del caché.

## Validación de Formularios, Eliminación y Funciones de UI/UX Profesionales

- **Validación de campos**:
  - **Título**: Obligatorio, mínimo 2 caracteres.
  - **Autor**: Opcional, mínimo 2 caracteres si se especifica.
  - **Descripción y Notas**: Opcionales, máximo 500 caracteres.
  - **Feedback visual en tiempo real**: Se marcan con borde rojo (`inputError`) y se muestra un mensaje de error específico debajo de cada campo. Al escribir en el campo, el error se limpia automáticamente.
- **Eliminación de registros**:
  - Soportada en tarjetas, pantallas de edición y formularios mediante la mutación de eliminación (`useDeleteFavorite`) conectada a MockAPI.
  - Incluye diálogo de confirmación (`Alert.alert`) antes de eliminar el registro.
- **Pull-to-Refresh (`RefreshControl`)**:
  - Implementado en las listas de registros guardados para actualizar la colección deslizando hacia abajo.
- **Notificaciones Toast (`ToastBanner`)**:
  - Avisos flotantes no intrusivos para retroalimentación de éxito o error al realizar acciones.
- **Estados vacíos enriquecidos**:
  - Diseñados con títulos descriptivos y botones de acción rápida (CTAs) para guiar al usuario.
