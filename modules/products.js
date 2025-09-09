// /modules/products.js

export const products = [
    { id: '1', name: 'Camiseta Básica Negra', price: 25.00, image: 'https://via.placeholder.com/300x400/000000/FFFFFF?text=Camiseta+Negra' },
    { id: '2', name: 'Sudadera con Logo', price: 55.00, image: 'https://via.placeholder.com/300x400/000000/FFFFFF?text=Sudadera+Logo' },
    { id: '3', name: 'Jeans Slim Fit', price: 65.00, image: 'https://via.placeholder.com/300x400/000000/FFFFFF?text=Jeans+Black' },
    { id: '4', name: 'Chaqueta de Cuero', price: 120.00, image: 'https://via.placeholder.com/300x400/000000/FFFFFF?text=Chaqueta+Cuero' }
];

export function displayProducts() {
    const productList = document.getElementById('product-list');
    
    products.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.className = 'producto';
        productDiv.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p class="precio">$${product.price.toFixed(2)}</p>
            <button class="add-to-cart" data-id="${product.id}">Añadir al Carrito</button>
        `;
        productList.appendChild(productDiv);
    });
}