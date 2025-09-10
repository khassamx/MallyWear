export async function getProducts() {
    try {
        const response = await fetch('../data/products.json');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al cargar los productos:', error);
        return [];
    }
}