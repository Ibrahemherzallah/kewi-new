import {useEffect, useMemo, useRef, useState} from "react";
import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Search, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";
const CATEGORY_PRODUCTS_API = (id: string) =>
    `${API_BASE}/admin/products/category/${id}`;
const CATEGORIES_API = `${API_BASE}/admin/categories`;
const BRANDS_API = `${API_BASE}/admin/brands`;

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

const CategoryProducts = () => {
    const { categoryId } = useParams<{ categoryId: string }>();
    const { toast } = useToast();
    const { t, language } = useLanguage();
    const [sortOrder, setSortOrder] = useState<string>("latest"); // 👈 new (الأحدث)
    const [products, setProducts] = useState<ApiProduct[]>([]);
    const [category, setCategory] = useState<Category | null>(null);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [selectedBrand, setSelectedBrand] = useState<string>("all");
    const [selectedSize, setSelectedSize] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const randomRankRef = useRef<Record<string, number>>({});

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
                    fetch(CATEGORY_PRODUCTS_API(categoryId)),
                    fetch(CATEGORIES_API),
                    fetch(BRANDS_API),
                ]);

                if (!prodRes.ok) throw new Error("Failed to fetch category products");
                const productsData: ApiProduct[] = await prodRes.json();
                setProducts(productsData);

                if (catRes.ok) {
                    const cats: Category[] = await catRes.json();
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

    const isHandbagsCategory = category?.name === "حقائب اليد";
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
        const q = searchQuery.toLowerCase();

        const list = [...products].filter((p) => {
            const name = getLocalizedName(p).toLowerCase();
            const desc = getLocalizedDescription(p).toLowerCase();
            const internalId = (p.id || "").toLowerCase();

            const matchesSearch =
                name.includes(q) || desc.includes(q) || internalId.includes(q);

            // brand filter (handbags only)
            let matchesBrand = true;
            if (isHandbagsCategory && selectedBrand !== "all") {
                if (!p.brandId) matchesBrand = false;
                else if (typeof p.brandId === "object") matchesBrand = p.brandId?._id === selectedBrand;
                else matchesBrand = p.brandId === selectedBrand;
            }

            // size filter
            let matchesSize = true;
            if (selectedSize !== "all") {
                const productSize = (p as any).size;
                matchesSize = productSize === selectedSize;
            }

            return matchesSearch && matchesBrand && matchesSize;
        });

        // ✅ Sort
        list.sort((a, b) => {
            if (sortOrder === "random") {
                const aKey = String((a as any)._id || a.id);
                const bKey = String((b as any)._id || b.id);
                return getRandomRank(aKey) - getRandomRank(bKey);
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

        return sortWithSoldOutBottom(list);
    }, [products, searchQuery, isHandbagsCategory, selectedBrand, selectedSize, sortOrder,]);


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
        console.log("isMulti is :" , isMulti)
        const selectedVariant = isMulti && product.variants.length > 0
            ? product.variants[0]          // 👈 first variant by default
            : null;
        console.log("isMulti selectedVariant is :" , selectedVariant)

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
                                {category
                                    ? category.name
                                    : language === "ar"
                                        ? "المنتجات"
                                        : "Products"}
                            </h1>
                            <p className="text-muted-foreground text-sm">
                                {language === "ar"
                                    ? "عرض جميع المنتجات ضمن هذا التصنيف"
                                    : "Showing all products in this category"}
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
                                placeholder={
                                    language === "ar"
                                        ? "ابحث في هذا التصنيف..."
                                        : "Search in this category..."
                                }
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* Brand filter (only for handbags) */}
                    <div className="w-full md:w-auto flex flex-col md:flex-row gap-3">
                        {/* Brand filter (only for handbags) */}
                        {isHandbagsCategory && (
                            <div className="w-full md:w-64">
                                <Select
                                    value={selectedBrand}
                                    onValueChange={(value) => setSelectedBrand(value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue
                                            placeholder={
                                                language === "ar" ? "تصفية حسب الماركة" : "Filter by brand"
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            {language === "ar" ? "كل الماركات" : "All brands"}
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

                        {/* Size filter (always visible) */}
                        <div className="w-full md:w-64">
                            <Select
                                value={selectedSize}
                                onValueChange={(value) => setSelectedSize(value)}
                            >
                                <SelectTrigger>
                                    <SelectValue
                                        placeholder={
                                            language === "ar" ? "تصفية حسب المقاس" : "Filter by size"
                                        }
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        {language === "ar" ? "كل المقاسات" : "All sizes"}
                                    </SelectItem>
                                    <SelectItem value="كبير">
                                        {language === "ar" ? "كبير" : "Large"}
                                    </SelectItem>
                                    <SelectItem value="وسط">
                                        {language === "ar" ? "وسط" : "Medium"}
                                    </SelectItem>
                                    <SelectItem value="صغير">
                                        {language === "ar" ? "صغير" : "Small"}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* 🔹 Sort dropdown (always visible) */}
                        <div className="w-full md:w-64">
                            <Select
                                value={sortOrder}
                                onValueChange={(value) => setSortOrder(value)}
                            >
                                <SelectTrigger>
                                    <SelectValue
                                        placeholder={
                                            language === "ar" ? "ترتيب المنتجات" : "Sort products"
                                        }
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="latest">
                                        {language === "ar" ? "الأحدث" : "Newest"}
                                    </SelectItem>
                                    <SelectItem value="oldest">
                                        {language === "ar" ? "الأقدم" : "Oldest"}
                                    </SelectItem>
                                    <SelectItem value="random">
                                        {language === "ar" ? "عشوائي" : "Random"}
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
                        {language === "ar"
                            ? "جاري تحميل المنتجات..."
                            : "Loading products..."}
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground text-lg">
                            {language === "ar"
                                ? "لا توجد منتجات في هذا التصنيف"
                                : "No products in this category"}
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
