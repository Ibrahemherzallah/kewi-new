import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { mockProducts } from "@/data/mockProducts";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const Home = () => {
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const featuredProducts = mockProducts.slice(0, 4);

  const categories = [
    {
      name: { en: 'Handbags', ar: 'حقائب اليد' },
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&h=600&fit=crop',
    },
    {
      name: { en: 'Backpacks', ar: 'حقائب الظهر' },
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=600&fit=crop',
    },
    {
      name: { en: 'Travel Bags', ar: 'حقائب السفر' },
      image: 'https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=800&h=600&fit=crop',
    },
    {
      name: { en: 'Perfumes', ar: 'العطور' },
      image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&h=600&fit=crop',
    },
    {
      name: { en: 'Accessories', ar: 'الإكسسوارات' },
      image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&h=600&fit=crop',
    },
  ];

  const handleAddToCart = (product: any) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingItem = cart.find((item: any) => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem("cart", JSON.stringify(cart));
    toast({
      title: t('toast.addedToCart'),
      description: `${product.name[language]} ${t('toast.addedDesc')}`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar cartCount={0} />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5" />
        <div className="container mx-auto px-4 py-24 relative">
          <div className="max-w-3xl mx-auto text-center space-y-8 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              {t('home.hero.title')}
            </h1>
            <p className="text-xl text-muted-foreground">
              {t('home.hero.subtitle')}
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/products">
                <Button size="lg" className="btn-scale bg-primary hover:bg-primary/90 group">
                  {t('home.shopNow')}
                  <ArrowRight className={`h-4 w-4 group-hover:translate-x-1 transition-transform ${language === 'ar' ? 'mr-2 rotate-180' : 'ml-2'}`} />
                </Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="outline" className="btn-scale">
                  {t('home.learnMore')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Slider */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">{t('home.shopNow')}</h2>
          </div>
          
          <Carousel className="w-full max-w-6xl mx-auto" opts={{ align: "start", loop: true }}>
            <CarouselContent>
              {categories.map((category, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <Link to="/products">
                    <div className="relative group overflow-hidden rounded-2xl h-80 cursor-pointer">
                      <img
                        src={category.image}
                        alt={category.name[language]}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-6">
                        <h3 className="text-white text-3xl font-bold">
                          {category.name[language]}
                        </h3>
                      </div>
                    </div>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className={language === 'ar' ? 'left-auto right-12' : 'left-12'} />
            <CarouselNext className={language === 'ar' ? 'right-auto left-12' : 'right-12'} />
          </Carousel>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">{t('home.featured')}</h2>
            <p className="text-muted-foreground text-lg">
              {t('home.featuredDesc')}
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/products">
              <Button size="lg" variant="outline" className="btn-scale">
                {t('home.viewAll')}
                <ArrowRight className={language === 'ar' ? 'mr-2 rotate-180' : 'ml-2'} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;
