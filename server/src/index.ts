import express, { Request, Response } from 'express';
import cors from 'cors';
import * as fs from 'fs';

// Product interface
interface Product {
  id: number;
  price: number;
}

// Read products from the file
const loadProducts = (): Product[] => {
  const data = fs.readFileSync('products.json', 'utf-8');
  return JSON.parse(data);
  };
  
// Load all products once at the start
const products = loadProducts();

// Sort products by price
products.sort((a, b) => a.price - b.price);

const app = express();
const PORT = 3000;

// Enable CORS for all routes
app.use(cors());

// Simple helper to filter products by price range
const filterProducts = (minPrice: number, maxPrice: number): Product[] => {
  return products.filter(product => product.price >= minPrice && product.price <= maxPrice);
};

// Get products by price range (if not provided return all proucts)
app.get('/api/products', (req: Request, res: Response) => {
  const minPrice = parseFloat(req.query.minPrice as string) || 0;
  const maxPrice = parseFloat(req.query.maxPrice as string) || 100000;

  // Get the filtered products from the array
  const filteredProducts = filterProducts(minPrice, maxPrice);

  // Calculate total count of the filtered products
  const totalCount = filteredProducts.length;

  // Get the first 1000 products for the batch (or less if there are fewer than 1000)
  const batchSize = 1000;
  const productsBatch = filteredProducts.slice(0, batchSize);

  // Return the result
  res.json({
    total: totalCount,           // Total products in the price range
    count: productsBatch.length, // Count of products in the current batch
    products: productsBatch      // The actual batch of products
  });
});

// Starting the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
