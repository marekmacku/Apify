import { useEffect, useState } from "react";
import { fetchProducts, searchProducts } from "./api";
import type { Product } from "./types";

export const useProducts = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const getAllProducts = async () => {
            try {
                setLoading(true);
                setError(null);

                // Get total count
                const initialResponse = await fetch('http://localhost:3000/api/products?minPrice=0&maxPrice=100000');
                
                if (!initialResponse.ok) {
                    throw new Error(`Failed to fetch products: ${initialResponse.status} ${initialResponse.statusText}`);
                }
                
                const initialData = await initialResponse.json();
                const totalCount = initialData.total;

                // If no products found, set products to empty array and return
                if (totalCount === 0) {
                    setProducts([]);
                    setLoading(false);
                    return;
                }

                const allProducts: Product[] = [];
                const batchSize = 1000;
                let currentMinPrice = 0;
                const maxPrice = 100000;

                // Use binary search to fetch all products in batches
                while (allProducts.length < totalCount) {
                    const remainingCount = totalCount - allProducts.length;
                    const targetCount = Math.min(batchSize, remainingCount);

                    // Use binary search to find the price boundary that gives us the target count
                    const optimalMaxPrice = await searchProducts(currentMinPrice, maxPrice, targetCount);

                    if (optimalMaxPrice === -1) {
                        // No more products found, fetch remaining with max price
                        const batch = await fetchProducts(currentMinPrice, maxPrice);
                        allProducts.push(...batch);
                        break;
                    }

                    // Fetch the batch
                    const batch = await fetchProducts(currentMinPrice, optimalMaxPrice);
                    allProducts.push(...batch);

                    // If we got less than batchSize or reached the max price, we're done
                    if (batch.length < batchSize || optimalMaxPrice >= maxPrice) {
                        break;
                    }

                    // Move to next batch
                    currentMinPrice = optimalMaxPrice;
                }

                setProducts(allProducts);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch products');
            } finally {
                setLoading(false);
            }
        };

        getAllProducts();
    }, []);

    return { products, loading, error };
}       