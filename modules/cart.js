// /modules/cart.js

let cart = [];

export function addToCart(productId) {
    cart.push(productId);
    updateCartCount();
    console.log("Producto añadido al carrito:", productId);
    alert('¡Producto añadido al carrito! 🎉');
}

export function updateCartCount() {
    const cartCountElement = document.getElementById('cart-count');
    cartCountElement.textContent = cart.length;
}

export function getCart() {
    return cart;
}