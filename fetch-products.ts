// Product interface
export interface Product {
    id: number;
    price: number;
}
  

export async function fetchProducts(
    minPrice: number,
    maxPrice: number,
    onRequest?: () => void
): Promise<Product[]> {
    const response = await fetch(`http://localhost:3000/api/products?minPrice=${minPrice}&maxPrice=${maxPrice}`);
    
    if (onRequest) onRequest();
    
    if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.products;
}

/**
 * Search for the price range that will give the target count of products
 * @param minPrice - The minimum price to search from
 * @param maxPrice - The maximum price to search to
 * @param targetCount - The target count of products
 * @param onRequest - Optional callback function called for each API request
 * @returns The price that will give the target count of products, if no price is found, return -1
 */
export const searchProducts = async (
    minPrice: number,
    maxPrice: number,
    targetCount: number,
    onRequest?: () => void
): Promise<number> => {
    let low = minPrice;
    let high = maxPrice;
    let currentPrice = 0;
    while (low <= high) {
        const mid = Math.floor((low + high) / 2); // calculate the middle price
        const response = await fetch(`http://localhost:3000/api/products?minPrice=${low}&maxPrice=${mid}`);
        
        if (onRequest) onRequest();
        
        if (!response.ok) {
            throw new Error(`Failed to search products: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        const totalCount = data.total; // Total count for the current price range

        // Check if the total count is greater than or equal to the target count 
        if (totalCount >= targetCount) {
            currentPrice = mid; // set the current price to the middle price
            high = mid - 1; // set the high price to the middle price - 1 (to avoid overlap)
        } else {
            low = mid + 1; // set the low price to the middle price + 1 (to avoid overlap)
        }
    }
    return currentPrice ?? -1;
}

/**
 * Fetches all products by batching them in chunks of 1000 using binary search
 * @returns Object containing array of all products and the number of requests made
 */
export async function getAllProducts(): Promise<{ products: Product[]; requestCount: number }> {
    let requestCount = 0;

    // Get total count
    const initialResponse = await fetch('http://localhost:3000/api/products?minPrice=0&maxPrice=100000');
    requestCount++;
    
    if (!initialResponse.ok) {
        throw new Error(`Failed to fetch products: ${initialResponse.status} ${initialResponse.statusText}`);
    }
    
    const initialData = await initialResponse.json();
    const totalCount = initialData.total;

    // If no products found, return empty array
    if (totalCount === 0) {
        return { products: [], requestCount };
    }

    const allProducts: Product[] = [];
    const batchSize = 1000;
    let currentMinPrice = 0;
    const maxPrice = 100000;

    // Callback to track requests
    const trackRequest = () => {
        requestCount++;
    };

    // Use binary search to fetch all products in batches
    while (allProducts.length < totalCount) {
        const remainingCount = totalCount - allProducts.length;
        const targetCount = Math.min(batchSize, remainingCount);

        // Use binary search to find the price boundary that gives us the target count
        const optimalMaxPrice = await searchProducts(currentMinPrice, maxPrice, targetCount, trackRequest);

        if (optimalMaxPrice === -1) {
            // No more products found, fetch remaining with max price
            const batch = await fetchProducts(currentMinPrice, maxPrice, trackRequest);
            allProducts.push(...batch);
            break;
        }

        // Fetch the batch
        const batch = await fetchProducts(currentMinPrice, optimalMaxPrice, trackRequest);
        allProducts.push(...batch);

        // If we got less than batchSize or reached the max price, we're done
        if (batch.length < batchSize || optimalMaxPrice >= maxPrice) {
            break;
        }

        // Move to next batch
        currentMinPrice = optimalMaxPrice;
    }

    return { products: allProducts, requestCount };
}

async function main() {
    try {
        console.log('Fetching all products...');
        const { products, requestCount } = await getAllProducts();
        console.log(`Successfully fetched ${products.length} products`);
        console.log(`Total number of requests: ${requestCount}`);
    } catch (error) {
        console.error('Error fetching products:', error instanceof Error ? error.message : 'Unknown error');
        throw error;
    }
}

main();