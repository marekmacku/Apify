# Product Fetcher Project

## Problem
Retrieve all of products form an API with as little requests as possible. The API will always return maximum of 1000 products. The only way to overcome this issue is to use `minPrice` and `maxPrice` query parameters. The API doesn't accept any other parameter.

## My Solution

I implemented a binary search aålgorithm on product prices to efficiently fetch all products with minimal API requests. The key insight is that by using binary search to find optimal price boundaries, we can consistently retrieve batches that are as close to the maximum batch size (1000) as possible.

### Algorithm Overview

1. **Initial Request**: Start by fetching the total count of products with a full price range query (`$0 - $100,000`)

2. **Binary Search for Optimal Boundaries**: For each batch, use binary search to find the maximum price that yields exactly (or close to) 1000 products:
   - Start with a price range (e.g., `$0 - $100,000`)
   - Use binary search to narrow down to the price that gives us as close to 1000 products as possible
   - This ensures we maximize the number of products per request

3. **Iterative Batching**: 
   - Fetch the batch using the optimal price boundary found
   - Move the `minPrice` to the last fetched price (to avoid overlap)
   - Repeat until all products are fetched

### Key Functions

- **`searchProducts()`**: Performs binary search on the price range to find the optimal `maxPrice` that yields the target count of products
- **`getAllProducts()`**: Orchestrates the batching process, using binary search to find optimal boundaries for each batch

### Example Flow

For 10000 products:
1. Initial request: Get total count (1 request)
2. Batch 1: Binary search finds `maxPrice = $25,000` yields 11000 products (approximetly 10 requests for binary search + 1 fetch = 11 requests)
3. Batch 2: Start from `$25,000`, find next boundary... (similar process)
4. Continue until all products fetched

Total: 100-200 requests (depending on the products distribution)
### Why binary search
- I've decided to go with binary search because all of my other ideas worked only under very strict assumptions or needed additional knowledge to make them work. Also with binary search being well known pattern I believe it makes the code easier to read and understand. It's over all optimal and robust solution with acceptable time complexity even for large scale of items.
## Assumptions
- There CANNOT be more than 1000 products with the same price.
- The price of the products is always stored as a whole number (never decimal). This is only for simplicity.
- The products are sorted by price. Otherwise the binary search would be impossible.



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


## Personal notes
### Notes
Binary search needs sorted values to work --> sort prices
`searchProducts` will search for products until there is a valid space to search in. i.e. while `low<= high` (e.g. `[0, 100] ✅ [50,100] ✅ [100-100] ✅ [101,100] ❌ --> loop exits`)

While there is a valid space to search in we calculate `mid` price witch we then use to fetch the products as the `maxPrice` param and `minPrice` as the `minPrice` param

If the `totalCount` of products for current price range is bigger or equal to the `targetCount` (`totalCount` = total products for price range, `targetCount` = desired batch size) the answer is at `mid` or lower.  We set the `currentPrice` to `mid` and `high` to `mid - 1`. `currentPrice` is the value we return after the loop ends. And we adjust the `high` because the answer is lower than the prev `high`.

If the `totalCount` is lower than the `targetCount` the answer is above `mid` so we adjust the `low` to `mid + 1`. We need the + 1 and - 1 to prevent infinite loops.
