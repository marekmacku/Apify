import * as fs from 'fs';
import faker from 'faker';

// Generate 10,000 products with random prices
// Ensures no more than 1000 products have the same price
const generateProducts = (count: number) => {
  const products = [];
  const priceCounts = new Map<number, number>();
  const maxProductsPerPrice = 1000;

  for (let i = 0; i < count; i++) {
    let price: number;
    let attempts = 0;
    const maxAttempts = 1000;

    // Find a price that hasn't reached the limit
    do {
      price = faker.datatype.number({ min: 0, max: 100000 });
      attempts++;
      
      if (attempts >= maxAttempts) {
        // If we can't find a valid price after many attempts,
        // find the first price that hasn't reached the limit
        for (let p = 0; p <= 100000; p++) {
          const currentCount = priceCounts.get(p) || 0;
          if (currentCount < maxProductsPerPrice) {
            price = p;
            break;
          }
        }
        break;
      }
    } while ((priceCounts.get(price) || 0) >= maxProductsPerPrice);

    // Update the count for this price
    const currentCount = priceCounts.get(price) || 0;
    priceCounts.set(price, currentCount + 1);

    products.push({
      id: i + 1,
      price,
    });
  }
  return products;
};

// Generate 10 000 products and save them to json
const products = generateProducts(100000);

// Validate constraint: no price should have more than 1000 products
const priceCounts = new Map<number, number>();
for (const product of products) {
  const count = priceCounts.get(product.price) || 0;
  priceCounts.set(product.price, count + 1);
}

const maxCount = Math.max(...Array.from(priceCounts.values()));
if (maxCount > 1000) {
  console.error(`ERROR: Found price with ${maxCount} products (exceeds limit of 1000)`);
  process.exit(1);
}

fs.writeFileSync('products.json', JSON.stringify(products, null, 2));

console.log('Products generated and saved to products.json');
