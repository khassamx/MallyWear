import { getProducts } from './modules/products.js';
import { addToCart, getCart, renderCartItems, calculateCartTotal, removeFromCart, updateCartCount } from './modules/cart.js';
import { showStatusMessage } from './modules/ui.js';

let allProducts = [];

function renderProducts(productsToRender) {
    const productListElement = document.getElementById('product-list');
    productListElement.innerHTML = '';
    
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

        // Lógica de la galería de imágenes
        const thumbnails = productDiv.querySelectorAll('.gallery-thumbnail');
        thumbnails.forEach(thumbnail => {
            thumbnail.addEventListener('click', (event) => {
                const productId = event.target.dataset.productId;
                const mainImage = document.getElementById(`img-${productId}`);
                mainImage.src = event.target.src;
            });
        });

        // Lógica de actualización de precio en tiempo real
        const initialVariant = product.variants.find(v => v.color === product.variants[0].color && v.size === product.variants[0].size);
        document.getElementById(`precio-${product.id}`).textContent = `Gs. ${initialVariant.price_gs.toLocaleString('es-PY')}`;
    });
}

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

document.addEventListener('DOMContentLoaded', async () => {
    allProducts = await getProducts();
    renderProducts(allProducts);
    updateCartCount();

    const cartButton = document.getElementById('cart-btn');
    const cartModal = document.getElementById('cart-modal');
    const closeModalBtn = document.querySelector('.close-btn');
    const contactForm = document.getElementById('contact-form');
    const ctaButton = document.querySelector('.cta-button');
    const searchInput = document.getElementById('search-input');

    // Lógica del buscador
    searchInput.addEventListener('keyup', (event) => {
        const query = event.target.value.toLowerCase();
        const filteredProducts = allProducts.filter(product => 
            product.name.toLowerCase().includes(query) || 
            product.description.toLowerCase().includes(query) ||
            product.variants.some(v => v.color.toLowerCase().includes(query) || v.size.toLowerCase().includes(query))
        );
        renderProducts(filteredProducts);
    });

    // Lógica para actualizar el precio
    document.addEventListener('change', (event) => {
        if (event.target.classList.contains('color-select') || event.target.classList.contains('size-select')) {
            const productId = event.target.closest('.producto').querySelector('.add-to-cart').dataset.id;
            updatePrice(productId);
        }
    });

    // Lógica del carrito y botones
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
                    image: productData.images[0]
                });
                showStatusMessage(`¡${productData.name} (${variant.color}, ${variant.size}) añadido al carrito! 🎉`, 'success');
            } else if (variant.stock === 0) {
                showStatusMessage('Lo sentimos, esta variante está agotada. 😔', 'error');
            } else {
                showStatusMessage('Por favor, selecciona una talla y un color válidos.', 'error');
            }
        }
    });

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

    const checkoutBtn = document.getElementById('checkout-btn');
    checkoutBtn.addEventListener('click', () => {
        if (getCart().length === 0) {
            alert('Tu carrito está vacío. Añade productos antes de finalizar.');
            return;
        }
        cartModal.style.display = 'none';
        document.getElementById('contacto').scrollIntoView({ behavior: 'smooth' });
    });

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

            showStatusMessage('¡Tu pedido ha sido enviado con éxito! Nos pondremos en contacto contigo lo más rápido posible. El envío puede tardar entre 2 y 5 días. 🚀', 'success');
            
            contactForm.reset();
            localStorage.clear();
            
        } catch (error) {
            console.error('Error al verificar la ubicación:', error);
            showStatusMessage('Hubo un problema al verificar tu ubicación. Por favor, asegúrate de tener la ubicación activada en tu navegador.', 'error');
        }
    });

    ctaButton.addEventListener('click', () => {
        document.getElementById('productos').scrollIntoView({ behavior: 'smooth' });
    });

    // Código de WhatsApp
    const whatsappLink = document.getElementById('whatsapp-link');
    const phoneNumber = '595981123456'; 
    const message = encodeURIComponent('Hola MallyWear, ¡estoy interesado en un producto y me gustaría hacer una consulta!');
    whatsappLink.href = `https://wa.me/${phoneNumber}?text=${message}`;

});