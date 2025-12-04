"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const products = [
    { id: 1, price: 10 },
    { id: 2, price: 15 },
    { id: 3, price: 25 },
    { id: 4, price: 30 },
    { id: 5, price: 50 },
    { id: 6, price: 50 },
    { id: 7, price: 50 },
    { id: 8, price: 70 },
    { id: 9, price: 100 },
    { id: 10, price: 150 },
];
// Sort products by price
products.sort((a, b) => a.price - b.price);
const app = (0, express_1.default)();
const PORT = 3000;
// Simple helper to filter products by price range
const filterProducts = (minPrice, maxPrice) => {
    return products.filter(product => product.price >= minPrice && product.price <= maxPrice);
};
// Get products by price range (if not provided return all proucts)
app.get('/api/products', (req, res) => {
    const minPrice = parseFloat(req.query.minPrice) || 0;
    const maxPrice = parseFloat(req.query.maxPrice) || 100000;
    // Get the filtered products from the array
    const filteredProducts = filterProducts(minPrice, maxPrice);
    // Calculate total count of the filtered products
    const totalCount = filteredProducts.length;
    // Get the first 1000 products for the batch (or less if there are fewer than 1000)
    const batchSize = 1000;
    const productsBatch = filteredProducts.slice(0, batchSize);
    // Return the result
    res.json({
        total: totalCount, // Total products in the price range
        count: productsBatch.length, // Count of products in the current batch
        products: productsBatch // The actual batch of products
    });
});
// Starting the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
