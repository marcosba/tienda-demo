# Tienda Norte — demo estática

Tienda de demostración rápida y editable sin frameworks, paquetes ni servidor. El catálogo y la información del comercio viven en `products.json`; el sitio funciona en GitHub Pages y en cualquier hosting estático.

## Probar localmente

Abrí `index.html` en un navegador moderno. Si el navegador bloquea `fetch()` desde archivos locales, ejecutá un servidor estático sencillo desde la carpeta (por ejemplo, `python3 -m http.server 8000`) y visitá `http://localhost:8000`.

## Editar la tienda

Modificá `products.json` y guardá el archivo. No hace falta cambiar JavaScript para agregar productos ni campos opcionales.

- `store`: nombre, textos, moneda y link general de checkout.
- `products`: cada objeto de producto tiene `id`, `name`, `category`, `description`, `price` e `image`.
- Campos opcionales incluidos en la demo: `longDescription`, `oldPrice`, `badge`, `stock`, `tags`, `variants`, `paymentUrl` y `customFields`.
- `customFields` acepta cualquier propiedad adicional, por ejemplo `{"Talle":"M","Origen":"Mendoza","Garantía":"2 años"}`. Los campos aparecen automáticamente en el detalle del producto.
- `image` y `paymentUrl` son URLs editables. Si la imagen no carga, se muestra `assets/product-placeholder.svg`.
- `stock: 0` indica agotado; si no se define stock, el artículo se considera disponible.
- `currency` usa un código ISO 4217, por ejemplo `ARS`, `USD` o `CLP`.

Ejemplo mínimo:

```json
{
  "id": "producto-nuevo",
  "name": "Producto nuevo",
  "category": "Accesorios",
  "description": "Una descripción breve.",
  "price": 25000,
  "image": "https://tu-dominio.com/imagen.jpg",
  "stock": 10,
  "customFields": { "Material": "Algodón", "Talle": "Único" },
  "paymentUrl": "https://tu-proveedor.com/tu-link-de-pago"
}
