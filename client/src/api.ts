import type { Product } from "./types";

export const fetchProducts = async (minPrice: number, maxPrice: number): Promise<Product[]> => {
    const response = await fetch(`http://localhost:3000/api/products?minPrice=${minPrice}&maxPrice=${maxPrice}`);
    
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
 * @returns The price that will give the target count of products, if no price is found, return -1
 */
export const searchProducts = async (minPrice: number, maxPrice: number, targetCount: number): Promise<number> => {
    let low = minPrice;
    let high = maxPrice;
    let currentPrice = 0;
    while (low <= high) {
        const mid = Math.floor((low + high) / 2); // calculate the middle price
        const response = await fetch(`http://localhost:3000/api/products?minPrice=${low}&maxPrice=${mid}`);
        
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
