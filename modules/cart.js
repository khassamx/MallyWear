// /modules/cart.js

let cart = [];

export function addToCart(product) {
    const existingProduct = cart.find(item => item.id === product.id);
    if (existingProduct) {
        existingProduct.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    updateCartCount();
    renderCartItems();
}

export function updateCartCount() {
    const cartCountElement = document.getElementById('cart-count');
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCountElement.textContent = totalItems;
}

export function renderCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Tu carrito está vacío.</p>';
        document.getElementById('cart-total-price').textContent = '0 Gs.';
        return;
    }

    cart.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        itemDiv.innerHTML = `
            <div class="cart-item-info">
                <img src="${item.image}" alt="${item.name}">
                <div>
                    <h4>${item.name}</h4>
                    <p>Cantidad: ${item.quantity}</p>
                </div>
            </div>
            <p>Gs. ${(item.price_gs * item.quantity).toLocaleString('es-PY')}</p>
        `;
        cartItemsContainer.appendChild(itemDiv);
    });
    
    document.getElementById('cart-total-price').textContent = `Gs. ${calculateCartTotal().toLocaleString('es-PY')}`;
}

export function calculateCartTotal() {
    return cart.reduce((total, item) => total + (item.price_gs * item.quantity), 0);
}

export function getCart() {
    return cart;
}