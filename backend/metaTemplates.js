// backend/metaTemplates.js
export const homeMeta = () => ({
    title: 'Kewi Store | أكسسورات وشنط وعطور',
    description:
        'تسوق أجمل الشنط والأكسسوارات والعطور بجودة عالية وتوصيل سريع داخل فلسطين.',
    image: '/seo-preview.jpg',
    url: 'https://kewi.ps',
    type: 'website',
});

export const productMeta = (p) => {
    const title =
        (p?.name ? `${p.name} | Kewi Store` : 'Kewi Store | منتج') ;
    const desc =
        p?.description?.slice(0, 160) ||
        'منتج مختار من كيوي ستور — جودة عالية وخدمة توصيل داخل فلسطين.';
    const image =
        (Array.isArray(p?.images) && p.images[0]) || '/seo-preview.jpg';

    return {
        title,
        description: desc,
        image,
        url: `https://kewi.ps/product/${p?._id || ''}`,
        type: 'product',
        // Optional JSON-LD (rich results)
        jsonld: {
            '@context': 'https://schema.org/',
            '@type': 'Product',
            name: p?.name || 'منتج',
            image: [image],
            description: desc,
            offers: p?.price
                ? {
                    '@type': 'Offer',
                    priceCurrency: 'ILS',
                    price: String(p.price),
                    availability: 'https://schema.org/InStock',
                    url: `https://kewi.ps/product/${p?._id || ''}`,
                }
                : undefined,
            brand: p?.brand?.name ? { '@type': 'Brand', name: p.brand.name } : undefined,
        },
    };
};

export const categoryMeta = ({ catName, firstImage, id }) => {
    const title = catName
        ? `${catName} | Kewi Store`
        : 'التصنيفات | Kewi Store';

    const desc =
        catName
            ? `اكتشف تشكيلة ${catName} من كيوي ستور — جودة عالية وتوصيل داخل فلسطين.`
            : 'تسوق أفضل التصنيفات من كيوي ستور — جودة عالية وتوصيل داخل فلسطين.';

    return {
        title,
        description: desc,
        image: firstImage || '/seo-preview.jpg',
        url: `https://kewi.ps/category/${id || ''}`,
        type: 'website',
    };
};
