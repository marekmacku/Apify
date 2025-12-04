import { useProducts } from "./useProducts";

export function ProductFetcher() {
    const { products, loading, error } = useProducts();

    if (loading) {
        return (
            <div className="p-8 max-w-2xl mx-auto">
                <p className="text-gray-600">Loading...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 max-w-2xl mx-auto">
                <p className="text-red-600">Error: {error}</p>
            </div>
        );
    }

    const minPrice = products.length > 0 ? Math.min(...products.map(p => p.price)) : 0;
    const maxPrice = products.length > 0 ? Math.max(...products.map(p => p.price)) : 0;
    const avgPrice = products.length > 0 
        ? (products.reduce((sum, p) => sum + p.price, 0) / products.length).toFixed(2)
        : 0;

    console.log("products length: ", products.length);


    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-2xl font-semibold mb-6">Products</h1>
            <div className="border border-gray-200 rounded p-6 bg-gray-50">
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Total:</span>
                        <span className="font-medium">{products.length}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Min Price:</span>
                        <span className="font-medium">${minPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Max Price:</span>
                        <span className="font-medium">${maxPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Avg Price:</span>
                        <span className="font-medium">${avgPrice}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

