document.addEventListener('DOMContentLoaded', () => {

    // --- Lógica de la Tienda y el Carrito ---
    const productGallery = document.getElementById('product-gallery');
    const cartCount = document.getElementById('cart-count');
    const cartModal = document.getElementById('cart-modal');
    const closeBtn = document.querySelector('.close-btn');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const cartIcon = document.querySelector('.cart-icon');
    const categoryButtons = document.getElementById('category-buttons');
    const searchInput = document.getElementById('search-input');
    const contactForm = document.getElementById('contact-form');
    const statusMessage = document.getElementById('status-message');

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let products = [];

    // Carga los productos desde el JSON local
    fetch('products.json')
        .then(response => response.json())
        .then(data => {
            products = data;
            renderProducts(products);
        })
        .catch(error => console.error('Error al cargar productos:', error));

    function renderProducts(productsToRender) {
        productGallery.innerHTML = '';
        if (productsToRender.length === 0) {
            productGallery.innerHTML = '<p>No se encontraron productos.</p>';
            return;
        }

        productsToRender.forEach(product => {
            const productElement = document.createElement('div');
            productElement.classList.add('producto');
            productElement.innerHTML = `
                <img src="${product.images[0]}" alt="${product.name}" class="product-main-image">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="product-options">
                    <select class="product-size">
                        <option value="S">Talla S</option>
                        <option value="M">Talla M</option>
                        <option value="L">Talla L</option>
                        <option value="XL">Talla XL</option>
                    </select>
                </div>
                <div class="precio">$${product.price.toFixed(2)}</div>
                <button class="add-to-cart" data-id="${product.id}">Agregar al Carrito</button>
            `;
            productGallery.appendChild(productElement);
        });
    }

    function updateCartCount() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }

    function renderCart() {
        cartItemsContainer.innerHTML = '';
        let total = 0;
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Tu carrito está vacío.</p>';
        } else {
            cart.forEach(item => {
                const cartItemElement = document.createElement('div');
                cartItemElement.classList.add('cart-item');
                cartItemElement.innerHTML = `
                    <div class="cart-item-info">
                        <img src="${item.image}" alt="${item.name}">
                        <div>
                            <h4>${item.name} (${item.size})</h4>
                            <p>Cantidad: ${item.quantity}</p>
                            <p>Precio: $${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                    </div>
                    <button class="remove-btn" data-id="${item.id}" data-size="${item.size}">&times;</button>
                `;
                cartItemsContainer.appendChild(cartItemElement);
                total += item.price * item.quantity;
            });
        }
        cartTotal.textContent = `Total: $${total.toFixed(2)}`;
    }

    function addToCart(productId, size) {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const existingItem = cart.find(item => item.id === productId && item.size === size);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.images[0],
                quantity: 1,
                size: size
            });
        }
        saveCart();
        updateCartCount();
        renderCart();
    }

    function removeFromCart(productId, size) {
        cart = cart.filter(item => !(item.id === productId && item.size === size));
        saveCart();
        updateCartCount();
        renderCart();
    }

    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    productGallery.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart')) {
            const productId = parseInt(e.target.dataset.id);
            const size = e.target.closest('.producto').querySelector('.product-size').value;
            addToCart(productId, size);
        }
    });

    cartItemsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-btn')) {
            const productId = parseInt(e.target.dataset.id);
            const size = e.target.dataset.size;
            removeFromCart(productId, size);
        }
    });

    cartIcon.addEventListener('click', () => {
        cartModal.style.display = 'block';
        renderCart();
    });

    closeBtn.addEventListener('click', () => {
        cartModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === cartModal) {
            cartModal.style.display = 'none';
        }
    });

    categoryButtons.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            const category = e.target.dataset.category;
            const filteredProducts = products.filter(p => p.category === category);
            renderProducts(filteredProducts);

            document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
        }
    });

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm) || p.description.toLowerCase().includes(searchTerm));
        renderProducts(filteredProducts);
    });

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;

        console.log('Mensaje enviado:', { name, email, message });
        
        statusMessage.textContent = '¡Mensaje enviado con éxito! Nos pondremos en contacto contigo pronto.';
        statusMessage.classList.remove('error');
        statusMessage.classList.add('success');
        statusMessage.style.display = 'block';

        contactForm.reset();
        setTimeout(() => {
            statusMessage.style.display = 'none';
        }, 5000);
    });

    updateCartCount();

    // --- Lógica para el Personaje Diminuto ---
    const character = document.getElementById('tiny-character');
    if (character) {
        let currentPosition = 50;
        let direction = 1;
        let isTransitioning = false;

        function updateCharacterPosition() {
            if (isTransitioning) return;
            const screenWidth = window.innerWidth;
            const characterWidth = character.offsetWidth;

            currentPosition += direction * 2;

            if (currentPosition + characterWidth > screenWidth) {
                direction = -1;
                isTransitioning = true;
                setTimeout(() => isTransitioning = false, 100);
            } else if (currentPosition < 0) {
                direction = 1;
                isTransitioning = true;
                setTimeout(() => isTransitioning = false, 100);
            }
            character.style.left = `${currentPosition}px`;
            requestAnimationFrame(updateCharacterPosition);
        }

        character.addEventListener('click', () => {
            character.classList.add('character-wow');
            setTimeout(() => {
                character.classList.remove('character-wow');
            }, 300);
        });

        requestAnimationFrame(updateCharacterPosition);
    }
});