import { getProducts } from './modules/products.js';
import { addToCart, getCart, renderCartItems, calculateCartTotal, removeFromCart, updateCartCount } from './modules/cart.js';
import { showStatusMessage } from './modules/ui.js';

let allProducts = [];
let slideIndex = 0; // Para el carrusel de imágenes

// Función para el carrusel de la sección hero
function showSlides() {
    const slides = document.querySelectorAll('.carousel-slide');
    for (let i = 0; i < slides.length; i++) {
        slides[i].classList.remove('active');
    }
    slideIndex++;
    if (slideIndex > slides.length) {
        slideIndex = 1;
    }
    slides[slideIndex - 1].classList.add('active');
    setTimeout(showSlides, 5000); // Cambia de imagen cada 5 segundos
}

// Renderiza los productos en la galería
function renderProducts(productsToRender) {
    const productListElement = document.getElementById('product-list');
    productListElement.innerHTML = ''; // Limpia la lista existente

    if (productsToRender.length === 0) {
        productListElement.innerHTML = '<p class="no-results">No se encontraron productos.</p>';
        return;
    }

    productsToRender.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.className = 'producto';
        productDiv.innerHTML = `
            <img src="${product.images[0]}" alt="${product.name}" class="product-main-image" id="img-${product.id}">
            <div class="product-gallery">
                ${product.images.map((img, index) => `
                    <img src="${img}" alt="Miniatura ${index + 1}" class="gallery-thumbnail" data-product-id="${product.id}" data-img-index="${index}">
                `).join('')}
            </div>
            <h3>${product.name}</h3>
            <div class="opciones">
                <label for="color-${product.id}">Color:</label>
                <select id="color-${product.id}" class="color-select">
                    ${[...new Set(product.variants.map(v => v.color))].map(color => `<option value="${color}">${color}</option>`).join('')}
                </select>
                <label for="size-${product.id}">Talla:</label>
                <select id="size-${product.id}" class="size-select">
                    ${[...new Set(product.variants.map(v => v.size))].map(size => `<option value="${size}">${size}</option>`).join('')}
                </select>
            </div>
            <p class="precio" id="precio-${product.id}"></p>
            <button class="add-to-cart" data-id="${product.id}">Añadir al Carrito</button>
        `;
        productListElement.appendChild(productDiv);

        // Lógica de la galería de imágenes del producto
        const thumbnails = productDiv.querySelectorAll('.gallery-thumbnail');
        thumbnails.forEach(thumbnail => {
            thumbnail.addEventListener('click', (event) => {
                const productId = event.target.dataset.productId;
                const mainImage = document.getElementById(`img-${productId}`);
                mainImage.src = event.target.src;
            });
        });

        // Establece el precio inicial del producto según la primera variante
        const initialVariant = product.variants.find(v => v.color === product.variants[0].color && v.size === product.variants[0].size);
        document.getElementById(`precio-${product.id}`).textContent = `Gs. ${initialVariant.price_gs.toLocaleString('es-PY')}`;
    });
}

// Actualiza el precio de un producto cuando se cambian las opciones (color/talla)
function updatePrice(productId) {
    const productElement = document.getElementById(`precio-${productId}`).closest('.producto');
    const selectedColor = productElement.querySelector('.color-select').value;
    const selectedSize = productElement.querySelector('.size-select').value;

    const productData = allProducts.find(p => p.id === productId);
    const variant = productData.variants.find(v => v.color === selectedColor && v.size === selectedSize);

    if (variant) {
        document.getElementById(`precio-${productId}`).textContent = `Gs. ${variant.price_gs.toLocaleString('es-PY')}`;
    }
}

// Lógica que se ejecuta cuando el DOM está completamente cargado
document.addEventListener('DOMContentLoaded', async () => {
    allProducts = await getProducts(); // Carga todos los productos
    renderProducts(allProducts);      // Renderiza los productos en la página
    updateCartCount();                // Actualiza el contador del carrito
    showSlides();                     // Inicia el carrusel de la sección hero

    // Referencias a elementos del DOM
    const cartButton = document.getElementById('cart-btn');
    const cartModal = document.getElementById('cart-modal');
    const closeModalBtn = document.querySelector('.close-btn');
    const contactForm = document.getElementById('contact-form');
    const ctaButton = document.querySelector('.cta-button');
    const searchInput = document.getElementById('search-input');
    const whatsappBtn = document.getElementById('whatsapp-link'); // Botón flotante de WhatsApp
    const ownerPhoneNumber = '595981123456'; // Número de WhatsApp del dueño de la tienda

    // Lógica del buscador de productos
    searchInput.addEventListener('keyup', (event) => {
        const query = event.target.value.toLowerCase();
        const filteredProducts = allProducts.filter(product => 
            product.name.toLowerCase().includes(query) || 
            product.description.toLowerCase().includes(query) ||
            product.variants.some(v => v.color.toLowerCase().includes(query) || v.size.toLowerCase().includes(query))
        );
        renderProducts(filteredProducts);
    });

    // Lógica para actualizar el precio del producto al cambiar color/talla
    document.addEventListener('change', (event) => {
        if (event.target.classList.contains('color-select') || event.target.classList.contains('size-select')) {
            const productId = event.target.closest('.producto').querySelector('.add-to-cart').dataset.id;
            updatePrice(productId);
        }
    });

    // Lógica para añadir productos al carrito
    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('add-to-cart')) {
            const productId = event.target.dataset.id;
            const productElement = event.target.closest('.producto');
            const selectedColor = productElement.querySelector('.color-select').value;
            const selectedSize = productElement.querySelector('.size-select').value;
            
            const productData = allProducts.find(p => p.id === productId);
            const variant = productData.variants.find(v => v.color === selectedColor && v.size === selectedSize);

            if (variant && variant.stock > 0) {
                addToCart({
                    id: variant.sku,
                    name: `${productData.name} - ${variant.color} (${variant.size})`,
                    price_gs: variant.price_gs,
                    price_usd: variant.price_usd,
                    image: productData.images[0] // Usamos la primera imagen del producto
                });
                showStatusMessage(`¡${productData.name} (${variant.color}, ${variant.size}) añadido al carrito! 🎉`, 'success');
            } else if (variant && variant.stock === 0) {
                showStatusMessage('Lo sentimos, esta variante está agotada. 😔', 'error');
            } else {
                showStatusMessage('Por favor, selecciona una talla y un color válidos.', 'error');
            }
        }
    });

    // Abrir el modal del carrito
    cartButton.addEventListener('click', () => {
        renderCartItems(); // Asegura que el carrito se muestre actualizado
        cartModal.style.display = 'block';
    });
    
    // Cerrar el modal del carrito
    closeModalBtn.addEventListener('click', () => {
        cartModal.style.display = 'none';
    });
    
    // Cerrar el modal del carrito haciendo clic fuera de él
    window.addEventListener('click', (event) => {
        if (event.target === cartModal) {
            cartModal.style.display = 'none';
        }
    });

    // Botón "Finalizar Pedido" del carrito
    const checkoutBtn = document.getElementById('checkout-btn');
    checkoutBtn.addEventListener('click', () => {
        if (getCart().length === 0) {
            alert('Tu carrito está vacío. Añade productos antes de finalizar.');
            return;
        }
        cartModal.style.display = 'none';
        document.getElementById('contacto').scrollIntoView({ behavior: 'smooth' }); // Desplaza a la sección de contacto
    });

    // Manejo del envío del formulario de contacto (para encomienda)
    contactForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Evita el envío tradicional del formulario

        showStatusMessage('Verificando ubicación y preparando pedido...', 'info');
        
        try {
            // Verifica la ubicación (solo permite pedidos desde Paraguay)
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            const countryCode = data.country_code;

            if (countryCode !== 'PY') {
                showStatusMessage('Lo sentimos, en este momento solo podemos procesar pedidos desde Paraguay. Si eres de otro país, por favor contáctanos directamente para más información. Gracias por tu comprensión.', 'error');
                return;
            }

            const formData = new FormData(contactForm); // Recoge los datos del formulario

            // Crea el mensaje para WhatsApp con todos los detalles del pedido
            const productosEnCarrito = getCart().map(item => `  - ${item.name} (x${item.quantity}) - Gs. ${item.price_gs.toLocaleString('es-PY')}`).join('\n');
            const totalPedido = calculateCartTotal().toLocaleString('es-PY');

            const whatsappMessage = `*¡Nuevo Pedido para Encomienda en MallyWear!*%0A%0A` +
                                  `*Datos del Cliente:*%0A` +
                                  `*Nombre:* ${formData.get('Nombre')}%0A` +
                                  `*Cédula:* ${formData.get('Cedula')}%0A` +
                                  `*Teléfono:* ${formData.get('Telefono')}%0A` +
                                  `*Ciudad:* ${formData.get('Ciudad')}%0A` +
                                  `*Región/Departamento:* ${formData.get('Region')}%0A` +
                                  `*Dirección:* ${formData.get('Direccion')}%0A` +
                                  (formData.get('Mensaje') ? `*Mensaje adicional:* ${formData.get('Mensaje')}%0A%0A` : '%0A') +
                                  `*Productos Solicitados:*%0A` +
                                  `${productosEnCarrito}%0A%0A` +
                                  `*TOTAL DEL PEDIDO:* Gs. ${totalPedido}%0A%0A` +
                                  `_Por favor, contacta al cliente para coordinar el pago y envío._`;

            // Abre WhatsApp con el mensaje pre-escrito (para el dueño de la tienda)
            window.open(`https://wa.me/${ownerPhoneNumber}?text=${encodeURIComponent(whatsappMessage)}`, '_blank');

            // Envía los datos a Formspree (para que lleguen al correo electrónico del dueño)
            // Se realiza con un fetch para que la página no se recargue completamente.
            const formspreeUrl = contactForm.action; // La URL de Formspree está en el 'action' del formulario
            const formspreeResponse = await fetch(formspreeUrl, {
                method: contactForm.method, // POST
                body: formData,
                headers: {
                    'Accept': 'application/json' // Importante para Formspree
                }
            });

            if (formspreeResponse.ok) {
                showStatusMessage('¡Tu pedido ha sido enviado con éxito! Revisa tu WhatsApp y correo electrónico. 🚀', 'success');
                contactForm.reset();     // Limpia el formulario
                localStorage.clear();    // Limpia el carrito del cliente
                updateCartCount();       // Actualiza el contador del carrito a 0
            } else {
                showStatusMessage('Hubo un error al enviar el pedido por correo. Por favor, inténtalo de nuevo.', 'error');
            }
            
        } catch (error) {
            console.error('Error en el proceso de pedido:', error);
            showStatusMessage('Hubo un problema al procesar tu pedido. Por favor, asegúrate de tener la ubicación activada en tu navegador e inténtalo de nuevo.', 'error');
        }
    });

    // Botón "Ver Colección" del carrusel para desplazar a productos
    ctaButton.addEventListener('click', () => {
        document.getElementById('productos').scrollIntoView({ behavior: 'smooth' });
    });

    // Configuración del botón flotante de WhatsApp (para consultas generales)
    const initialWhatsappMessage = encodeURIComponent('Hola MallyWear, ¡estoy interesado en un producto y me gustaría hacer una consulta!');
    whatsappBtn.href = `https://wa.me/${ownerPhoneNumber}?text=${initialWhatsappMessage}`;
});