# Mini API de la Cafetería del CRUI

API REST hecha con **Node.js** y **Express** para consultar y administrar el menú de la cafetería.
Los datos se guardan en un array en memoria: se conservan solo mientras el servidor está en ejecución.

Espacio curricular: Prácticas Profesionalizantes I · Modalidad: individual

## Requisitos
- [Node.js](https://nodejs.org/) 18 o superior
- npm (se instala junto con Node.js)

## Instalación
```bash
git clone <URL-DEL-REPOSITORIO>
cd cafeteria-crui
npm install
```

## Ejecución
```bash
npm start
```
El servidor queda escuchando en `http://localhost:3000`.

## Rutas

| Método | Ruta | Descripción | Respuestas |
|--------|------|-------------|------------|
| GET | `/` | Mensaje de bienvenida | 200 |
| GET | `/api/productos` | Lista todos los productos | 200 |
| GET | `/api/productos/:id` | Busca un producto por ID | 200 / 404 |
| POST | `/api/productos` | Crea un producto | 201 / 400 |
| PUT | `/api/productos/:id` | Modifica un producto | 200 / 400 / 404 |
| DELETE | `/api/productos/:id` | Elimina un producto | 200 / 404 |

## Validaciones
- `nombre`: obligatorio, texto, no vacío.
- `precio`: obligatorio, de tipo número y mayor que cero (no se acepta texto como `"1500"`).
- `categoria`: opcional, texto.
- El `id` lo genera el servidor.

## Ejemplo de producto
```json
{ "nombre": "Jugo de naranja", "precio": 2000, "categoria": "bebida" }
```

## Pruebas
El archivo `pruebas.http` contiene todas las peticiones de prueba (compatible con REST Client y ThunderClient de VS Code).
Las capturas de las pruebas están en la carpeta `capturas/`.
