// app.js

import { displayProducts, products } from './modules/products.js';
import { addToCart, getCart } from './modules/cart.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Mostrar los productos al cargar la página
    displayProducts();

    // 2. Lógica para añadir productos al carrito
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (event) => {
            const productId = event.target.dataset.id;
            addToCart(productId);
        });
    });

    // 3. Lógica para enviar el pedido (simulación)
    const contactForm = document.getElementById('contact-form');
    contactForm.addEventListener('submit', (event) => {
        event.preventDefault();

        // 3.1. Validar que el usuario está en Paraguay
        // En un sitio real, usarías una API de geolocalización. Aquí es una simulación.
        if (!navigator.geolocation) {
             alert('Tu navegador no soporta geolocalización. El pedido no puede ser enviado.');
             return;
        }

        navigator.geolocation.getCurrentPosition(position => {
            // SIMULACIÓN: En un sitio real, harías una llamada a una API
            // para verificar la ubicación basándote en la latitud/longitud.
            // Aquí simplemente asumimos que si la geolocalización funciona,
            // el pedido se puede procesar.
            
            const formData = new FormData(contactForm);
            const name = formData.get('name');
            const email = formData.get('email');
            const phone = formData.get('phone');
            const message = formData.get('message');
            const cartItems = getCart().map(id => {
                const product = products.find(p => p.id === id);
                return product ? product.name : 'Producto desconocido';
            }).join(', ');

            // 3.2. Crear el mensaje de pedido
            const pedido = {
                nombre: name,
                email: email,
                telefono: phone,
                detalles: message,
                productos: cartItems
            };

            console.log('--- Nuevo Pedido ---');
            console.log(pedido);
            alert('¡Pedido enviado con éxito! Nos pondremos en contacto contigo pronto para coordinar el pago y el envío.');
            
            // Aquí es donde un servidor real recibiría la información del pedido.
            // Tú recibirías un email o una notificación en tu panel de control.
        }, error => {
            // Si la geolocalización falla, mostramos el mensaje de error.
            alert('Lo siento, en este momento solo podemos procesar pedidos desde Paraguay. Por favor, asegúrate de tener la ubicación activada en tu navegador.');
            console.error(error);
        });
    });
});