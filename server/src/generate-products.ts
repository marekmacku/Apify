import * as fs from 'fs';
import faker from 'faker';

// Generate 10,000 products with random prices
const generateProducts = (count: number) => {
  const products = [];
  for (let i = 0; i < count; i++) {
    products.push({
      id: i + 1,
      price: faker.random.number({ min: 0, max: 100000 }),
    });
  }
  return products;
};

// Generate 10 000 products and save them to json
const products = generateProducts(10000);

fs.writeFileSync('products.json', JSON.stringify(products, null, 2));

console.log('Products generated and saved to products.json');
