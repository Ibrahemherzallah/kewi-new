import { useEffect, useState } from "react";
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
    const { language } = useLanguage();

    const [products, setProducts] = useState<ApiProduct[]>([]);
    const [category, setCategory] = useState<Category | null>(null);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [selectedBrand, setSelectedBrand] = useState<string>("all");

    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

    const filteredProducts = products.filter((p) => {
        const q = searchQuery.toLowerCase();
        const name = getLocalizedName(p).toLowerCase();
        const desc = getLocalizedDescription(p).toLowerCase();
        const internalId = (p.id || "").toLowerCase();

        const matchesSearch =
            name.includes(q) || desc.includes(q) || internalId.includes(q);

        // brand filter only active for handbags category
        let matchesBrand = true;
        if (isHandbagsCategory && selectedBrand !== "all") {
            if (!p.brandId) {
                matchesBrand = false;
            } else if (typeof p.brandId === "object") {
                matchesBrand = p.brandId?._id === selectedBrand;
            } else {
                matchesBrand = p.brandId === selectedBrand;
            }
        }

        return matchesSearch && matchesBrand;
    });

    const handleAddToCart = (product: ApiProduct) => {
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
        const existingItem = cart.find((item: any) => item._id === product._id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }

        localStorage.setItem("cart", JSON.stringify(cart));

        const displayName = getLocalizedName(product);

        toast({
            title: language === "ar" ? "تمت الإضافة للسلة" : "Added to cart",
            description:
                displayName +
                " " +
                (language === "ar"
                    ? "تمت إضافته إلى سلتك"
                    : "has been added to your cart."),
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
