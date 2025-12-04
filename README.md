# Product Fetcher Project

A product fetching application with two ways to interact: a web UI and a command-line script. The project includes a server API that serves products filtered by price range, and both a React client application and a Node.js script to fetch products.

## Project Structure

- **`server/`** - Express API server that serves products from a JSON file
- **`client/`** - React + Vite frontend application with UI for fetching products
- **`fetch-products.ts`** - Standalone script to fetch all products via command line

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## Setup

### 1. Install Server Dependencies

```bash
cd server
npm install
```

### 2. Install Client Dependencies

```bash
cd client
npm install
```

### 3. Generate Products for Testing

Before running the server, you need to generate the products data file:

```bash
cd server
npm run generate
```

This will create a `products.json` file with 100,000 products. The script ensures that no more than 1,000 products share the same price, which is important for testing the batching logic.

## Running the Application

There are two ways to run the code:

### Option 1: Web UI (Client Application)

1. Start the server:
```bash
cd server
npm start
```

The server will run on `http://localhost:3000`

2. In a new terminal, start the client:
```bash
cd client
npm run dev
```

The client will typically run on `http://localhost:5173` (or another port if 5173 is occupied)

3. Open your browser and navigate to the client URL to use the web interface.

### Option 2: Command-Line Script

1. Start the server (if not already running):
```bash
cd server
npm start
```

2. In a new terminal, run the fetch script from the root directory:
```bash
npx tsx fetch-products.ts
```

This script will:
- Fetch all products using binary search optimization
- Display the total number of products fetched
- Show the total number of API requests made

The script uses an efficient batching algorithm that fetches products in chunks of 1,000, minimizing the number of API requests needed.

## Generating Products

To generate test products, run:

```bash
cd server
npm run generate
```

This script:
- Generates 100,000 products with random prices between 0 and 100,000
- Ensures no more than 1,000 products share the same price
- Validates the constraint before saving
- Saves the products to `server/products.json`

You can modify the count in `server/src/generate-products.ts` if you need a different number of products for testing.

## API Endpoints

### GET `/api/products`

Query products by price range.

**Query Parameters:**
- `minPrice` (optional, default: 0) - Minimum price filter
- `maxPrice` (optional, default: 100000) - Maximum price filter

**Response:**
```json
{
  "total": 5000,
  "count": 1000,
  "products": [
    { "id": 1, "price": 100 },
    ...
  ]
}
```

- `total` - Total number of products matching the price range
- `count` - Number of products in the current batch (max 1000)
- `products` - Array of products in the batch

## Notes

- The server loads all products into memory at startup for fast filtering
- Products are sorted by price for efficient range queries
- The API returns batches of up to 1,000 products per request
- The fetch script uses binary search to optimize the number of requests needed to fetch all products

