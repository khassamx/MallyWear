// app.js

import { getProducts } from './modules/products.js';
import { addToCart, getCart, renderCartItems, calculateCartTotal } from './modules/cart.js';
import { showStatusMessage } from './modules/ui.js';

document.addEventListener('DOMContentLoaded', async () => {
    const productListElement = document.getElementById('product-list');
    const cartButton = document.getElementById('cart-btn');
    const cartModal = document.getElementById('cart-modal');
    const closeModalBtn = document.querySelector('.close-btn');
    const contactForm = document.getElementById('contact-form');
    const ctaButton = document.querySelector('.cta-button');

    // Cargar productos desde el archivo JSON
    const products = await getProducts();

    // Renderizar productos en la página
    products.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.className = 'producto';
        productDiv.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p class="precio">Gs. ${product.price_gs.toLocaleString('es-PY')}<br><span>($${product.price_usd.toFixed(2)})</span></p>
            <button class="add-to-cart" data-id="${product.id}">Añadir al Carrito</button>
        `;
        productListElement.appendChild(productDiv);
    });

    // Evento para añadir al carrito
    productListElement.addEventListener('click', (event) => {
        if (event.target.classList.contains('add-to-cart')) {
            const productId = event.target.dataset.id;
            const product = products.find(p => p.id === productId);
            if (product) {
                addToCart(product);
                showStatusMessage(`¡${product.name} ha sido añadido al carrito! 🎉`, 'success');
            }
        }
    });

    // Lógica del Carrito (Modal)
    cartButton.addEventListener('click', () => {
        renderCartItems();
        cartModal.style.display = 'block';
    });
    closeModalBtn.addEventListener('click', () => {
        cartModal.style.display = 'none';
    });
    window.addEventListener('click', (event) => {
        if (event.target === cartModal) {
            cartModal.style.display = 'none';
        }
    });

    // Lógica del botón "Finalizar Pedido"
    const checkoutBtn = document.getElementById('checkout-btn');
    checkoutBtn.addEventListener('click', () => {
        if (getCart().length === 0) {
            alert('Tu carrito está vacío. Añade productos antes de finalizar.');
            return;
        }
        cartModal.style.display = 'none';
        document.getElementById('contacto').scrollIntoView({ behavior: 'smooth' });
    });

    // Lógica para enviar el pedido (simulación)
    contactForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        showStatusMessage('Verificando ubicación...', 'info');
        
        try {
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            const countryCode = data.country_code;

            if (countryCode !== 'PY') {
                showStatusMessage('Lo sentimos, en este momento solo podemos procesar pedidos desde Paraguay. Si eres de otro país, por favor contáctanos directamente para más información. Gracias por tu comprensión.', 'error');
                return;
            }

            // Si está en Paraguay, procesa el pedido
            const formData = new FormData(contactForm);
            const pedido = {
                nombre: formData.get('name'),
                email: formData.get('email'),
                telefono: formData.get('phone'),
                detalles: formData.get('message'),
                productos: getCart().map(item => ({
                    id: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    price_gs: item.price_gs
                })),
                total_gs: calculateCartTotal()
            };

            console.log('--- Nuevo Pedido ---');
            console.log(pedido);

            showStatusMessage('¡Tu pedido ha sido enviado con éxito! Nos pondremos en contacto contigo lo más rápido posible. 🚀', 'success');

            // Aquí se reiniciaría el carrito después de un pedido exitoso
            // cart = [];
            // updateCartCount();
        } catch (error) {
            console.error('Error al verificar la ubicación:', error);
            showStatusMessage('Hubo un problema al verificar tu ubicación. Por favor, asegúrate de tener la ubicación activada en tu navegador.', 'error');
        }
    });

    // Lógica para el botón "Ver Colección"
    ctaButton.addEventListener('click', () => {
        document.getElementById('productos').scrollIntoView({ behavior: 'smooth' });
    });
});