import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface Category {
  id: string;
  name: { en: string; ar: string };
  image: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export const CategoryFilter = ({ 
  categories, 
  selectedCategory, 
  onSelectCategory 
}: CategoryFilterProps) => {
  const { language, t } = useLanguage();

  const allCategory = {
    id: 'all',
    name: { en: 'All Products', ar: 'كل المنتجات' },
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400'
  };

  const allCategories = [allCategory, ...categories];

  return (
    <div className="w-full overflow-x-auto pb-4 scrollbar-hide">
      <div className="flex gap-4 min-w-max px-1">
        {allCategories.map((category) => {
          const isSelected = category.id === 'all' 
            ? selectedCategory === null 
            : selectedCategory === category.id;

          return (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id === 'all' ? null : category.id)}
              className={cn(
                "relative flex flex-col items-center gap-2 p-2 rounded-2xl transition-all duration-300 group",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                isSelected 
                  ? "ring-2 ring-primary ring-offset-2 bg-primary/5" 
                  : "hover:bg-muted"
              )}
            >
              {/* Category image */}
              <div className={cn(
                "relative w-20 h-20 rounded-xl overflow-hidden transition-transform duration-300",
                "group-hover:scale-105",
                isSelected && "ring-2 ring-primary"
              )}>
                <img
                  src={category.image}
                  alt={category.name[language]}
                  className="w-full h-full object-cover"
                />
                {isSelected && (
                  <div className="absolute inset-0 bg-primary/20" />
                )}
              </div>

              {/* Category name */}
              <span className={cn(
                "text-sm font-medium text-center max-w-[80px] truncate",
                isSelected ? "text-primary" : "text-foreground"
              )}>
                {category.name[language]}
              </span>

              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Mock categories for the products page
export const mockCategories = [
  {
    id: 'handbags',
    name: { en: 'Handbags', ar: 'حقائب اليد' },
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400'
  },
  {
    id: 'travel',
    name: { en: 'Travel Bags', ar: 'حقائب السفر' },
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400'
  },
  {
    id: 'backpacks',
    name: { en: 'Backpacks', ar: 'حقائب الظهر' },
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400'
  },
  {
    id: 'perfumes',
    name: { en: 'Perfumes', ar: 'العطور' },
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400'
  },
  {
    id: 'accessories',
    name: { en: 'Accessories', ar: 'الإكسسوارات' },
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400'
  }
];
