import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

type BackendProduct = {
    _id: string;
    name?: string | { en: string; ar: string };
    image?: string[];
    customerPrice?: number;
    color?: string;
    isMultiColor?: boolean;
    variants?: { color: string; stockNumber: number; image: string; _id?: string }[];
};

type Props = {
    products: BackendProduct[];
    onAddToCart: (product: BackendProduct) => void;
};

export const NewArrivalsSection = ({ products, onAddToCart }: Props) => {
    const { language } = useLanguage();
    const trackRef = useRef<HTMLDivElement>(null);
    const posRef = useRef(0);
    const pausedRef = useRef(false);
    const rafRef = useRef<number>();

    const getName = (product: BackendProduct) => {
        if (!product.name) return language === "ar" ? "منتج" : "Product";
        if (typeof product.name === "string") return product.name;
        return product.name[language as "en" | "ar"] || product.name.en || "";
    };

    const getImage = (product: BackendProduct): string => {
        if (product.isMultiColor && product.variants?.[0]?.image) {
            return product.variants[0].image;
        }
        return product.image?.[0] || "https://via.placeholder.com/400x400.png?text=No+Image";
    };

    const getColor = (product: BackendProduct): string | null => {
        if (product.isMultiColor && product.variants?.[0]?.color) {
            return product.variants[0].color;
        }
        return product.color || null;
    };

    useEffect(() => {
        const track = trackRef.current;
        if (!track || products.length === 0) return;

        const pause = () => { pausedRef.current = true; };
        const resume = () => { pausedRef.current = false; };
        const resumeDelayed = () => { setTimeout(() => { pausedRef.current = false; }, 2000); };

        track.addEventListener("mouseenter", pause);
        track.addEventListener("mouseleave", resume);
        track.addEventListener("touchstart", pause, { passive: true });
        track.addEventListener("touchend", resumeDelayed, { passive: true });

// AFTER
        const isRTL = document.documentElement.dir === "rtl" || language === "ar";

        const scroll = () => {
            if (!pausedRef.current) {
                const maxScroll = track.scrollWidth - track.clientWidth;
                if (isRTL) {
                    posRef.current -= 0.6;
                    if (Math.abs(posRef.current) >= maxScroll) posRef.current = 0;
                } else {
                    posRef.current += 0.6;
                    if (posRef.current >= maxScroll) posRef.current = 0;
                }
                track.scrollLeft = posRef.current;
            }
            rafRef.current = requestAnimationFrame(scroll);
        };

        rafRef.current = requestAnimationFrame(scroll);

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            track.removeEventListener("mouseenter", pause);
            track.removeEventListener("mouseleave", resume);
            track.removeEventListener("touchstart", pause);
            track.removeEventListener("touchend", resumeDelayed);
        };
    }, [products]);

    if (products.length === 0) return null;

    return (
        <section className="py-16 overflow-hidden">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="flex items-end justify-between mb-6">
                    <div>
                        <h2 className="text-3xl font-bold mb-1">
                            {language === "ar" ? "وصل حديثاً" : "New Arrivals"}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {language === "ar" ? "أحدث ما وصل إلى متجرنا" : "Just landed in store"}
                        </p>
                    </div>
                    <Link to="/products?filter=new">
                        <Button variant="ghost" size="sm" className="gap-1 text-primary">
                            {language === "ar" ? "عرض الكل" : "View all"}
                            <ArrowRight className={`h-4 w-4 ${language !== "en" ? "rotate-180" : ""}`} />
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Scroll track — full bleed, no container constraint */}
            <div
                ref={trackRef}
                dir="ltr"
                className="flex gap-5 overflow-x-auto pb-4 px-6"
                style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                    WebkitOverflowScrolling: "touch",
                }}
            >
                {products.map((product) => {
                    const image = getImage(product);
                    const color = getColor(product);
                    const name = getName(product);

                    return (
                        <div
                            key={product._id}
                            className="flex-shrink-0 w-60 rounded-2xl border bg-card overflow-hidden
                         transition-transform duration-200 hover:-translate-y-1 cursor-pointer"
                        >
                            {/* Image */}
                            <Link to={`/product/${product._id}`} className="block">
                                <div className="relative h-64 bg-muted overflow-hidden">
                                    <img
                                        src={image}
                                        alt={name}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                    {/* NEW badge */}
                                    <span
                                        className="absolute top-2 left-2 text-[10px] font-medium
                               bg-foreground text-background rounded-full px-2 py-0.5"
                                    >
                    {language === "ar" ? "جديد" : "New"}
                  </span>
                                </div>
                            </Link>

                            {/* Body */}
                            <div className="p-3">
                                <p className="text-sm font-medium truncate mb-1">{name}</p>
                                {color && (
                                    <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                    <span
                        className="inline-block w-2 h-2 rounded-full border"
                        style={{ backgroundColor: color }}
                    />
                                        {color}
                                    </p>
                                )}
                                <p className="text-base font-semibold mb-2">
                                    ₪{product.customerPrice ?? 0}
                                </p>
                                <button
                                    onClick={() => onAddToCart(product)}
                                    className="w-full text-xs py-1.5 rounded-lg border border-border
                             hover:bg-muted transition-colors"
                                >
                                    {language === "ar" ? "أضف للسلة" : "Add to cart"}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};