import {useEffect, useMemo, useRef, useState} from "react";
import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Search, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import { useSearchParams } from "react-router-dom";

const API_BASE = import.meta.env.VITE_ENV || "https://kewi.ps";
const CATEGORY_PRODUCTS_API = (id: string) => `${API_BASE}/admin/api/products/category/${id}`;
const CATEGORIES_API = `${API_BASE}/admin/api/categories`;
const BRANDS_API = `${API_BASE}/admin/api/brands`;

type ApiProduct = {
    _id: string;
    id?: string;
    name: string | { [key: string]: string };
    description?: string | { [key: string]: string };
    image?: string[] | string;
    categoryId?: any;
    brandId?: any;
    customerPrice?: number;
    wholesalerPrice?: number;
    stockNumber?: number;
    size?: string;
};
type BackendProduct = {
    _id: string;
    id?: string; // your internal code "9999" etc.
    name?: string | { en: string; ar: string };
    description?: string | { en: string; ar: string };
    image?: string[];     // from DB
    images?: string[];    // in case some endpoints use this
    stockNumber?: number;
    customerPrice?: number;
    wholesalerPrice?: number;
    isMultiColor? : boolean;
    salePrice?: number;
    isOnSale?: boolean;
    isSoldOut?: boolean;
    gender?: string;
    size?: string;
    color?: string;
    brand?: string | { name: string };
};
type Category = {
    _id: string;
    name: string;
};
type Brand = {
    _id: string;
    name: string;
};

const DISCOUNT_CATEGORY_ID = "69dcf967b9a447739261582c";


const CategoryProducts = () => {
    const { categoryId } = useParams<{ categoryId: string }>();
    const { toast } = useToast();
    const { t, language } = useLanguage();
    const [searchParams, setSearchParams] = useSearchParams();
    const isDiscountCategory = categoryId === DISCOUNT_CATEGORY_ID;
    const searchQuery = searchParams.get("search") || "";
    const selectedBrand = searchParams.get("brand") || "all";
    const selectedSize = searchParams.get("size") || "all";
    const sortOrder = searchParams.get("sort") || "latest";
    const [products, setProducts] = useState<ApiProduct[]>([]);
    const [category, setCategory] = useState<Category | null>(null);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);

    const randomRankRef = useRef<Record<string, number>>({});
    const selectedCategoryFilter = searchParams.get("cat") || "all";


    const updateParam = (key: string, value: string) => {
        const newParams = new URLSearchParams(searchParams);

        if (value === "all" || value === "") {
            newParams.delete(key);
        } else {
            newParams.set(key, value);
        }

        setSearchParams(newParams);
    };
    const getRandomRank = (key: string) => {
        if (randomRankRef.current[key] == null) {
            randomRankRef.current[key] = Math.random();
        }
        return randomRankRef.current[key];
    };
    const getLocalizedName = (p: ApiProduct): string => {
        if (!p.name) return "";
        if (typeof p.name === "string") return p.name;
        return (
            p.name[language] ||
            p.name["en"] ||
            Object.values(p.name)[0] ||
            ""
        );
    };
    const getLocalizedDescription = (p: ApiProduct): string => {
        if (!p.description) return "";
        if (typeof p.description === "string") return p.description;
        return (
            p.description[language] ||
            p.description["en"] ||
            Object.values(p.description)[0] ||
            ""
        );
    };

    useEffect(() => {
        if (!categoryId) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const [prodRes, catRes, brandRes] = await Promise.all([
                    isDiscountCategory
                        ? fetch(`${import.meta.env.VITE_ENV}/admin/api/products/discount`)
                        : fetch(CATEGORY_PRODUCTS_API(categoryId)),

                    fetch(CATEGORIES_API),
                    fetch(BRANDS_API),
                ]);
                if (!prodRes.ok) throw new Error("Failed to fetch products");

                const productsData = await prodRes.json();

                setProducts(productsData);
                // if(!isDiscountCategory){}
                if (catRes.ok) {
                    const cats: Category[] = await catRes.json();
                    setCategories(cats)
                    const found = cats.find((c) => c._id === categoryId) || null;
                    setCategory(found);
                }

                if (brandRes.ok) {
                    const brandsData: Brand[] = await brandRes.json();
                    setBrands(brandsData);
                }
            } catch (err: any) {
                console.error(err);
                setError(err.message || "Error loading category products");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [categoryId]);
    const isHandbagsCategory = category?.name === "حقائب اليد"  || category?.name === "Kéwi bags";
    const sortWithSoldOutBottom = (list: ApiProduct[]) => {
        const arr = [...list];

        arr.sort((a, b) => {
            const aSold = !!(a as any).isSoldOut;
            const bSold = !!(b as any).isSoldOut;

            // ✅ 1) Sold out always at bottom
            if (aSold !== bSold) return aSold ? 1 : -1;

            // ✅ 2) If both same soldOut state, apply your chosen sort
            if (sortOrder === "random") {
                const aKey = String((a as any)._id || (a as any).id);
                const bKey = String((b as any)._id || (b as any).id);
                return getRandomRank(aKey) - getRandomRank(bKey); // your stable random
            }

            const aCreated = (a as any).createdAt;
            const bCreated = (b as any).createdAt;
            if (!aCreated || !bCreated) return 0;

            const aTime = new Date(aCreated).getTime();
            const bTime = new Date(bCreated).getTime();

            if (sortOrder === "latest") return bTime - aTime;
            if (sortOrder === "oldest") return aTime - bTime;

            return 0;
        });

        return arr;
    };

    const filteredProducts = useMemo(() => {
        const q = (searchQuery || "").toLowerCase();

        const list = [...products].filter((p) => {
            const name = getLocalizedName(p)?.toLowerCase() || "";
            const desc = getLocalizedDescription(p)?.toLowerCase() || "";
            const internalId = (p.id || "").toLowerCase();

            // 🔎 search
            const matchesSearch =
                name.includes(q) ||
                desc.includes(q) ||
                internalId.includes(q);

            // 🏷️ brand filter (ONLY for handbags, NOT discount page)
            let matchesBrand = true;
            if (!isDiscountCategory && isHandbagsCategory && selectedBrand !== "all") {
                const brandId =
                    typeof p.brandId === "object"
                        ? p.brandId?._id
                        : p.brandId;

                matchesBrand = brandId === selectedBrand;
            }

            // 📦 category filter (ONLY for discount page)
            let matchesCategory = true;
            if (isDiscountCategory && selectedCategoryFilter !== "all") {
                const catId =
                    typeof p.categoryId === "object"
                        ? p.categoryId?._id
                        : p.categoryId;

                matchesCategory = catId === selectedCategoryFilter;
            }

            // 📏 size filter
            let matchesSize = true;
            if (selectedSize !== "all") {
                matchesSize = (p as any).size === selectedSize;
            }

            return matchesSearch && matchesBrand && matchesCategory && matchesSize;
        });
        // 🔄 sorting
        list.sort((a, b) => {
            if (sortOrder === "random") {
                const aKey = String((a as any)._id || a.id);
                const bKey = String((b as any)._id || b.id);
                return getRandomRank(aKey) - getRandomRank(bKey);
            }

            const aTime = new Date((a as any).createdAt || 0).getTime();
            const bTime = new Date((b as any).createdAt || 0).getTime();

            if (sortOrder === "latest") return bTime - aTime;
            if (sortOrder === "oldest") return aTime - bTime;

            return 0;
        });

        return sortWithSoldOutBottom(list);
    }, [
        products,
        searchQuery,
        isHandbagsCategory,
        isDiscountCategory,        // ✅ important
        selectedBrand,
        selectedCategoryFilter,    // ✅ important
        selectedSize,
        sortOrder
    ]);

    const incrementBrandClick = async (brandId: string) => {
        try {
            await fetch(`${import.meta.env.VITE_ENV}/admin/api/brands/${brandId}/click`, {
                method: "PATCH", // or POST depending on your route
            });
        } catch (err) {
            console.error("Failed to increment brand click:", err);
        }
    };

    const getProductName = (product: BackendProduct, language: string) => {
        if (!product.name) return language === "ar" ? "منتج بدون اسم" : "Unnamed product";
        if (typeof product.name === "string") return product.name;

        return (
            product.name[language] ||
            product.name.en ||
            Object.values(product.name)[0] ||
            ""
        );
    };

    const handleAddToCart = (product: any) => {
        console.log("handleAddToCart")
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");

        // 🟦 1) Auto-select variant if multi color
        const isMulti = product.isMultiColor && Array.isArray(product.variants);
        const selectedVariant = isMulti && product.variants.length > 0
            ? product.variants[0]          // 👈 first variant by default
            : null;

        // 🟦 2) Choose correct images
        const variantImage = selectedVariant?.image ? [selectedVariant.image] : [];

        const fallbackImages =
            // some products use `images`, some `image`
            (Array.isArray((product as any).images) && (product as any).images.length > 0)
                ? (product as any).images
                : (Array.isArray(product.image) ? product.image : (product.image ? [product.image] : []));

        const images = variantImage.length > 0 ? variantImage : fallbackImages;

        // 🟦 3) Composite id (per color) – same pattern as ProductDetails
        const compositeId = selectedVariant
            ? `${product._id}-${selectedVariant._id}`
            : product._id;

        // 🟦 4) Find existing item by composite id
        const existingItem = cart.find((item: any) => item.id === compositeId);

        if (existingItem) {
            existingItem.quantity = (existingItem.quantity || 1) + 1;
        } else {
            cart.push({
                ...product,
                id: compositeId,           // unique per product+variant
                _id: product._id,          // REAL product id for backend
                quantity: 1,
                images,
                color: selectedVariant?.color || product.color,
                variantId: selectedVariant?._id || null,
            });
        }

        localStorage.setItem("cart", JSON.stringify(cart));

        const productName = getProductName(product, language);

        toast({
            title: t("toast.addedToCart"),
            description: `${productName}${
                selectedVariant ? ` (${selectedVariant.color})` : ""
            } ${t("toast.addedDesc")}`,
        });
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="container mx-auto px-4 py-12">
                {/* Back + title */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <Link to="/products">
                            <button className="inline-flex items-center justify-center rounded-full border border-border h-9 w-9">
                                <ArrowLeft className="h-4 w-4" />
                            </button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold">
                                {isDiscountCategory
                                    ? t('categoryProducts.discount.header')
                                    : category?.name}
                            </h1>
                            <p className="text-muted-foreground text-sm">
                                {t('categoryProducts.showAllProducts')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Search + (optional) brand filter */}
                <div className="mb-6 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
                    {/* Search */}
                    <div className="max-w-md w-full">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder={t('categoryProducts.search.placeholder')}
                                value={searchQuery}
                                onChange={(e) => updateParam("search", e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* Brand filter (only for handbags) */}
                    <div className="w-full md:w-auto flex flex-col md:flex-row gap-3">
                        {/* Brand filter (only for handbags) */}
                        {isHandbagsCategory && (
                            <div className="w-full md:w-64">
                                <Select value={selectedBrand} onValueChange={(value) => {
                                        updateParam("brand", value);

                                        if (value !== "all") {
                                            const selected = brands.find((b) => b._id === value);
                                            if (selected?.isFake) {
                                                incrementBrandClick(value);
                                            }
                                        }
                                    }}>
                                    <SelectTrigger>
                                        <SelectValue placeholder= {t('categoryProducts.dropdown.filterByBrand')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            {t('categoryProducts.dropdown.allBrands')}
                                        </SelectItem>
                                        {brands.map((brand) => (
                                            <SelectItem key={brand._id} value={brand._id}>
                                                {brand.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        {isDiscountCategory && (
                            <div className="w-full md:w-64">
                                <Select value={selectedCategoryFilter} onValueChange={(value) => updateParam("cat", value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('categoryProducts.dropdown.filterByCat')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            {t('categoryProducts.dropdown.allCat')}
                                        </SelectItem>

                                        {categories.map((cat) => (
                                            <SelectItem key={cat._id} value={cat._id}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        {/* Size filter (always visible) */}
                        <div className="w-full md:w-64">
                            <Select value={selectedSize} onValueChange={(value) => updateParam("size", value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('categoryProducts.dropdown.filterBySize')}/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        {t('categoryProducts.dropdown.allSizes')}
                                    </SelectItem>
                                    <SelectItem value="كبير">
                                        {t('categoryProducts.dropdown.large')}
                                    </SelectItem>
                                    <SelectItem value="وسط">
                                        {t('categoryProducts.dropdown.med')}
                                    </SelectItem>
                                    <SelectItem value="صغير">
                                        {t('categoryProducts.dropdown.small')}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* 🔹 Sort dropdown (always visible) */}
                        <div className="w-full md:w-64">
                            <Select value={sortOrder} onValueChange={(value) => updateParam("sort", value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('categoryProducts.dropdown.orderProducts')}/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="latest">
                                        {t('categoryProducts.dropdown.newest')}
                                    </SelectItem>
                                    <SelectItem value="oldest">
                                        {t('categoryProducts.dropdown.oldest')}
                                    </SelectItem>
                                    <SelectItem value="random">
                                        {t('categoryProducts.dropdown.random')}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {error && (
                    <p className="text-sm text-destructive mb-4">{error}</p>
                )}

                {loading ? (
                    <div className="text-center py-12 text-muted-foreground">
                        {t('categoryProducts.dropdown.loadingProducts')}
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground text-lg">
                            {t('categoryProducts.dropdown.noProducts')}
                        </p>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map((product) => (
                            <ProductCard
                                key={product._id}
                                product={product as any}
                                onAddToCart={handleAddToCart}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoryProducts;
