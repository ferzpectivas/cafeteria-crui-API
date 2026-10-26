// ============================================================
// Mini API de la Cafetería del CRUI
// Prácticas Profesionalizantes I - Evaluación individual
// Tecnologías: Node.js + Express
// ============================================================

// Importamos Express, el framework que nos permite crear el servidor HTTP
const express = require('express');

// Creamos la aplicación de Express
const app = express();

// Puerto en el que escuchará el servidor (lo exige la consigna)
const PORT = 3000;

// Middleware que permite a Express leer el cuerpo (body) de las peticiones en formato JSON.
// Sin esta línea, req.body sería undefined en los POST y PUT.
app.use(express.json());

// ------------------------------------------------------------
// Datos iniciales: los productos viven en un array en memoria.
// Los cambios se pierden al reiniciar el servidor (esto es lo esperado).
// Usamos "let" porque el array puede reasignarse (ej: al filtrar en DELETE).
// ------------------------------------------------------------
let productos = [
  { id: 1, nombre: 'Café con leche', precio: 1800, categoria: 'bebida' },
  { id: 2, nombre: 'Medialuna', precio: 900, categoria: 'comida' },
  { id: 3, nombre: 'Tostado de jamón y queso', precio: 3500, categoria: 'comida' },
  { id: 4, nombre: 'Agua mineral', precio: 1200, categoria: 'bebida' }
];

// Contador para generar IDs nuevos. Empieza en 5 porque ya existen del 1 al 4.
// Usar un contador (y no "length + 1") evita repetir IDs si se elimina un producto.
let siguienteId = 5;

// ------------------------------------------------------------
// Funciones auxiliares
// ------------------------------------------------------------

// Valida los datos recibidos. Devuelve un string con el error,
// o null si los datos son válidos.
function validarProducto(datos) {
  // Si no llegó body o no es un objeto, es inválido
  if (!datos || typeof datos !== 'object') {
    return 'El cuerpo de la petición debe ser un objeto JSON';
  }

  // El nombre es obligatorio, debe ser texto y no puede estar vacío
  // (trim() elimina espacios, así "   " también cuenta como vacío)
  if (typeof datos.nombre !== 'string' || datos.nombre.trim() === '') {
    return 'El nombre es obligatorio y no puede estar vacío';
  }

  // El precio debe ser de tipo number (no texto como "1500"),
  // finito (descarta NaN e Infinity) y mayor que cero
  if (typeof datos.precio !== 'number' || !Number.isFinite(datos.precio) || datos.precio <= 0) {
    return 'El precio debe ser un número mayor que cero';
  }

  // La categoría es opcional, pero si viene debe ser texto
  if (datos.categoria !== undefined && typeof datos.categoria !== 'string') {
    return 'La categoría debe ser un texto';
  }

  return null; // Sin errores
}

// Busca la posición de un producto en el array según su id (viene como texto en la URL).
// Devuelve -1 si no existe.
function buscarIndice(idTexto) {
  const id = Number(idTexto); // Convertimos el texto de la URL a número
  return productos.findIndex((p) => p.id === id);
}

// ------------------------------------------------------------
// RUTAS
// ------------------------------------------------------------

// GET / -> Mensaje de bienvenida
app.get('/', (req, res) => {
  res.send('¡Bienvenido a la API de la Cafetería del CRUI! Consultá los productos en /api/productos');
});

// GET /api/productos -> Devuelve todos los productos en JSON (200 por defecto)
app.get('/api/productos', (req, res) => {
  res.status(200).json(productos);
});

// GET /api/productos/:id -> Busca un producto por ID
app.get('/api/productos/:id', (req, res) => {
  const indice = buscarIndice(req.params.id);

  // Si no existe, respondemos 404
  if (indice === -1) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  res.status(200).json(productos[indice]);
});

// POST /api/productos -> Crea un producto nuevo
app.post('/api/productos', (req, res) => {
  // Primero validamos; si hay error, respondemos 400 (Bad Request)
  const error = validarProducto(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  // Armamos el producto con ID generado por el servidor.
  // Se toman solo los campos permitidos: así se ignora cualquier "id" enviado por el cliente.
  const nuevo = {
    id: siguienteId++, // Usamos el valor actual y luego incrementamos
    nombre: req.body.nombre.trim(),
    precio: req.body.precio,
    categoria: req.body.categoria || 'sin categoría'
  };

  productos.push(nuevo); // Lo agregamos al array

  // 201 = Created
  res.status(201).json(nuevo);
});

// PUT /api/productos/:id -> Modifica un producto existente
app.put('/api/productos/:id', (req, res) => {
  const indice = buscarIndice(req.params.id);

  // Si el producto no existe -> 404
  if (indice === -1) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  // Validamos los datos nuevos -> 400 si son inválidos
  const error = validarProducto(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  // Reemplazamos los datos manteniendo el mismo id.
  // Si no envían categoría, conservamos la que ya tenía.
  productos[indice] = {
    id: productos[indice].id,
    nombre: req.body.nombre.trim(),
    precio: req.body.precio,
    categoria: req.body.categoria || productos[indice].categoria
  };

  res.status(200).json(productos[indice]);
});

// DELETE /api/productos/:id -> Elimina un producto
app.delete('/api/productos/:id', (req, res) => {
  const indice = buscarIndice(req.params.id);

  // Si no existe -> 404
  if (indice === -1) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  // splice quita 1 elemento en la posición indicada y lo devuelve dentro de un array
  const [eliminado] = productos.splice(indice, 1);

  // Devolvemos el producto eliminado como confirmación (200)
  res.status(200).json({ mensaje: 'Producto eliminado', producto: eliminado });
});

// ------------------------------------------------------------
// Manejo de JSON mal formado: si el cliente envía un JSON roto,
// express.json() lanza un error. Lo capturamos y respondemos 400
// en lugar de devolver una página de error HTML.
// ------------------------------------------------------------
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'JSON mal formado' });
  }
  next(err);
});

// ------------------------------------------------------------
// Iniciamos el servidor
// ------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
