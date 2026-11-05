(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const money = (value, currency) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: currency || 'ARS', maximumFractionDigits: 0 }).format(Number(value) || 0);
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const fallbackImage = 'assets/product-placeholder.svg';
  const state = { config: {}, products: [], category: 'Todos', search: '', sort: 'featured', cart: loadCart(), favorites: new Set() };
  function loadCart() { try { const parsed = JSON.parse(localStorage.getItem('tienda-demo-cart') || '[]'); return Array.isArray(parsed) ? parsed : []; } catch { return []; } }
  function saveCart() { try { localStorage.setItem('tienda-demo-cart', JSON.stringify(state.cart)); } catch { /* El carrito sigue funcionando durante esta visita. */ } }
  function imageTag(url, alt, className = 'product-image') { return `<img class="${className}" src="${escapeHtml(url || fallbackImage)}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='${fallbackImage}'">`; }
  function initStore() {
    const config = state.config;
    document.title = `${config.name || 'Tienda'} — ${config.shortDescription || 'Catálogo'}`;
    $('#store-name').textContent = config.name || 'Tienda Norte';
    $('#footer-store-name').textContent = config.name || 'Tienda Norte';
    $('#store-tagline').textContent = config.tagline || 'DISEÑO CUIDADO · USO DIARIO';
    $('#store-description').textContent = config.heroDescription || 'Objetos útiles y bien hechos para acompañarte todos los días.';
    $('#about-copy').textContent = config.about || 'Una selección de objetos cotidianos con buenos materiales, diseño honesto y detalles que hacen la diferencia.';
    $('#footer-year').textContent = `© ${new Date().getFullYear()} ${config.name || 'Tienda Norte'}`;
    renderCategories(); renderProducts(); renderCart();
  }
  function categories() { return ['Todos', ...new Set(state.products.map((product) => product.category).filter(Boolean))]; }
  function renderCategories() {
    $('#categories').innerHTML = categories().map((category) => `<button class="category-chip" type="button" aria-pressed="${state.category === category}" data-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`).join('');
  }
  function visibleProducts() {
    let items = state.products.filter((product) => (state.category === 'Todos' || product.category === state.category) && `${product.name} ${product.description} ${product.category} ${(product.tags || []).join(' ')}`.toLowerCase().includes(state.search.toLowerCase()));
    if (state.sort === 'price-asc') items = items.slice().sort((a, b) => a.price - b.price);
    if (state.sort === 'price-desc') items = items.slice().sort((a, b) => b.price - a.price);
    if (state.sort === 'name') items = items.slice().sort((a, b) => a.name.localeCompare(b.name, 'es'));
    return items;
  }
  function renderProducts() {
    const products = visibleProducts();
    $('#result-count').textContent = `${products.length} ${products.length === 1 ? 'producto' : 'productos'}`;
    $('#empty-state').hidden = products.length > 0;
    $('#product-grid').innerHTML = products.map((product) => {
      const soldOut = product.stock === 0;
      return `<article class="product-card"><div class="product-image-wrap" data-open="${escapeHtml(product.id)}" tabindex="0" role="button" aria-label="Ver ${escapeHtml(product.name)}">${imageTag(product.image, product.name)}${product.badge ? `<span class="product-badge">${escapeHtml(product.badge)}</span>` : ''}<button class="wish-button" type="button" data-wish="${escapeHtml(product.id)}" aria-label="${state.favorites.has(product.id) ? 'Quitar de' : 'Agregar a'} favoritos" aria-pressed="${state.favorites.has(product.id)}">${state.favorites.has(product.id) ? '♥' : '♡'}</button></div><div class="product-info"><p class="product-category">${escapeHtml(product.category || 'Colección')}</p><h3 class="product-name">${escapeHtml(product.name)}</h3><p class="product-desc">${escapeHtml(product.description || '')}</p><div class="product-bottom"><div><span class="price">${money(product.price, state.config.currency)}</span>${product.oldPrice ? `<span class="old-price">${money(product.oldPrice, state.config.currency)}</span>` : ''}</div>${soldOut ? '<span class="stock-note">Agotado</span>' : `<button class="add-button" type="button" data-add="${escapeHtml(product.id)}">Agregar +</button>`}</div></div></article>`;
    }).join('');
  }
  function productById(id) { return state.products.find((product) => String(product.id) === String(id)); }
  function addToCart(id) { const product = productById(id); if (!product || product.stock === 0) return; const existing = state.cart.find((item) => item.id === product.id); if (existing) existing.quantity = Math.min(existing.quantity + 1, product.stock || 99); else state.cart.push({ id: product.id, quantity: 1 }); saveCart(); renderCart(); showToast(`${product.name} agregado al carrito`); }
  function showProduct(id) {
    const product = productById(id); if (!product) return;
    const fields = product.customFields && typeof product.customFields === 'object' ? Object.entries(product.customFields) : [];
    const variants = Array.isArray(product.variants) ? product.variants : [];
    $('#dialog-content').innerHTML = `<div class="dialog-product">${imageTag(product.image, product.name, '')}<div class="dialog-product-copy"><p class="eyebrow">${escapeHtml(product.category || 'COLECCIÓN')}</p><h2 id="dialog-title">${escapeHtml(product.name)}</h2><p>${escapeHtml(product.longDescription || product.description || '')}</p><p class="price">${money(product.price, state.config.currency)}</p>${variants.length ? `<div class="custom-fields"><p class="product-category">OPCIONES</p><div class="custom-field"><span>Variantes</span><span>${variants.map(escapeHtml).join(' · ')}</span></div></div>` : ''}${fields.length ? `<div class="custom-fields">${fields.map(([key, value]) => `<div class="custom-field"><span>${escapeHtml(key)}</span><strong>${escapeHtml(Array.isArray(value) ? value.join(', ') : value)}</strong></div>`).join('')}</div>` : ''}<button class="add-button" type="button" data-add="${escapeHtml(product.id)}" ${product.stock === 0 ? 'disabled' : ''}>${product.stock === 0 ? 'Agotado' : 'Agregar al carrito +'}</button>${product.paymentUrl ? `<p><a class="product-category" href="${escapeHtml(product.paymentUrl)}" target="_blank" rel="noopener noreferrer">Ir al pago externo ↗</a></p>` : ''}</div></div>`;
    $('#product-dialog').showModal();
  }
  function cartProducts() { return state.cart.map((item) => ({ ...item, product: productById(item.id) })).filter((item) => item.product); }
  function renderCart() {
    const items = cartProducts(); const quantity = items.reduce((sum, item) => sum + item.quantity, 0); const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    $('#cart-count').textContent = quantity; $('#cart-dialog-count').textContent = `(${quantity})`; $('#cart-total').textContent = money(total, state.config.currency);
    $('#cart-items').innerHTML = items.length ? items.map(({ product, quantity: count }) => `<div class="cart-row">${imageTag(product.image, product.name, '')}<div><h3>${escapeHtml(product.name)}</h3><p>${money(product.price, state.config.currency)}</p><div class="quantity-controls"><button type="button" data-qty="${escapeHtml(product.id)}" data-delta="-1" aria-label="Quitar una unidad">−</button><span>${count}</span><button type="button" data-qty="${escapeHtml(product.id)}" data-delta="1" aria-label="Agregar una unidad">+</button></div></div><button class="remove-button" type="button" data-remove="${escapeHtml(product.id)}">Quitar</button></div>`).join('') : '<p class="cart-empty">Todavía no agregaste productos.<br>Encontrá algo que te guste en el catálogo.</p>';
    const configuredCheckout = state.config.checkoutUrl;
    $('#checkout-actions').innerHTML = configuredCheckout ? `<a class="checkout-button" href="${escapeHtml(configuredCheckout)}" target="_blank" rel="noopener noreferrer">Continuar al pago seguro ↗</a>` : `<button class="checkout-button" type="button" id="pay-demo" ${items.length ? '' : 'disabled'}>Continuar al pago ↗</button>${items.length ? `<div class="cart-pay-links">${items.map(({ product }) => product.paymentUrl ? `<a href="${escapeHtml(product.paymentUrl)}" target="_blank" rel="noopener noreferrer">Pagar ${escapeHtml(product.name)} ↗</a>` : '').join('')}</div>` : ''}`;
    const payButton = $('#pay-demo'); if (payButton) payButton.addEventListener('click', () => showToast('Demo: configurá checkoutUrl o un link de pago por producto en products.json'));
  }
  function showToast(message) { const toast = $('#toast'); toast.textContent = message; toast.classList.add('show'); clearTimeout(showToast.timer); showToast.timer = setTimeout(() => toast.classList.remove('show'), 2200); }
  document.addEventListener('click', (event) => {
    const category = event.target.closest('[data-category]'); if (category) { state.category = category.dataset.category; renderCategories(); renderProducts(); return; }
    const add = event.target.closest('[data-add]'); if (add) { addToCart(add.dataset.add); return; }
    const wish = event.target.closest('[data-wish]'); if (wish) { state.favorites.has(wish.dataset.wish) ? state.favorites.delete(wish.dataset.wish) : state.favorites.add(wish.dataset.wish); renderProducts(); return; }
    const open = event.target.closest('[data-open]'); if (open) { showProduct(open.dataset.open); return; }
    const qty = event.target.closest('[data-qty]'); if (qty) { const item = state.cart.find((entry) => String(entry.id) === qty.dataset.qty); if (item) { item.quantity += Number(qty.dataset.delta); if (item.quantity <= 0) state.cart = state.cart.filter((entry) => entry !== item); const product = productById(qty.dataset.qty); if (product && product.stock && item.quantity > product.stock) item.quantity = product.stock; saveCart(); renderCart(); } return; }
    const remove = event.target.closest('[data-remove]'); if (remove) { state.cart = state.cart.filter((entry) => String(entry.id) !== remove.dataset.remove); saveCart(); renderCart(); }
  });
  $('#product-grid').addEventListener('keydown', (event) => { if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('[data-open]')) { event.preventDefault(); showProduct(event.target.dataset.open); } });
  $('#search').addEventListener('input', (event) => { state.search = event.target.value.trim(); renderProducts(); });
  $('#sort').addEventListener('change', (event) => { state.sort = event.target.value; renderProducts(); });
  $('#cart-link').addEventListener('click', (event) => { event.preventDefault(); $('#cart-dialog').showModal(); });
  $('#cart-close').addEventListener('click', () => $('#cart-dialog').close());
  $('#dialog-close').addEventListener('click', () => $('#product-dialog').close());
  $('#product-dialog').addEventListener('click', (event) => { if (event.target === $('#product-dialog')) $('#product-dialog').close(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') { $('#product-dialog').close(); $('#cart-dialog').close(); } });
  fetch('products.json').then((response) => { if (!response.ok) throw new Error('No se pudo cargar products.json'); return response.json(); }).then((data) => {
    if (!data || !Array.isArray(data.products)) throw new Error('El catálogo no contiene una lista products');
    state.config = data.store || {}; state.products = data.products.filter((product) => product && product.id && product.name);
    if (state.cart.length) state.cart = state.cart.filter((item) => productById(item.id));
    initStore();
  }).catch((error) => { console.error(error); $('#load-error').hidden = false; $('#result-count').textContent = ''; });
})();
