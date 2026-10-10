
export function getProductImage(product) {
    if (Array.isArray(product?.images) && product.images.length > 0) {
        const firstImage = product.images[0];

        return typeof firstImage === "string"
            ? firstImage
            : firstImage?.url || "";
    }

    return "";
}
