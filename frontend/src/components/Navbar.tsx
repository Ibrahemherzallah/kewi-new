import { ShoppingCart, Menu, User, Heart, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFavorites } from "@/contexts/FavoritesContext";

interface NavbarProps {
  cartCount?: number;
}

export const Navbar = ({ cartCount = 0 }: NavbarProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t, language } = useLanguage();
  const { favorites } = useFavorites();

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border shadow-soft">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">K</span>
            </div>
            <span className="font-bold text-xl text-foreground">Kewi</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-foreground hover:text-primary transition-colors">
              {t('nav.home')}
            </Link>
            <Link to="/products" className="text-foreground hover:text-primary transition-colors">
              {t('nav.products')}
            </Link>
            <Link to="/purchase-history" className="text-foreground hover:text-primary transition-colors">
              {language === 'ar' ? 'الطلبات' : 'Orders'}
            </Link>
            <Link to="/about" className="text-foreground hover:text-primary transition-colors">
              {t('nav.about')}
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
            
            <Link to="/favorites">
              <Button variant="ghost" size="icon" className="btn-scale relative">
                <Heart className="h-5 w-5" />
                {favorites.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {favorites.length}
                  </Badge>
                )}
              </Button>
            </Link>

            <Link to="/admin">
              <Button variant="ghost" size="icon" className="btn-scale">
                <User className="h-5 w-5" />
              </Button>
            </Link>

            <Link to="/cart">
              <Button variant="ghost" size="icon" className="btn-scale relative">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden btn-scale"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 animate-slide-in border-t border-border">
            <div className="flex flex-col gap-3">
              <Link
                to="/"
                className="px-4 py-2 hover:bg-muted rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.home')}
              </Link>
              <Link
                to="/products"
                className="px-4 py-2 hover:bg-muted rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.products')}
              </Link>
              <Link
                to="/favorites"
                className="px-4 py-2 hover:bg-muted rounded-lg transition-colors flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Heart className="h-4 w-4" />
                {language === 'ar' ? 'المفضلة' : 'Favorites'}
              </Link>
              <Link
                to="/purchase-history"
                className="px-4 py-2 hover:bg-muted rounded-lg transition-colors flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <History className="h-4 w-4" />
                {language === 'ar' ? 'الطلبات' : 'Orders'}
              </Link>
              <Link
                to="/about"
                className="px-4 py-2 hover:bg-muted rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.about')}
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
