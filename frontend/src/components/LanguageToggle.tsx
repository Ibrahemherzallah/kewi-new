import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export const LanguageToggle = ({apply}) => {
  const { language, setLanguage } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
      className={`${apply ? 'hidden md:flex' : ''} btn-scale`}
    >
      <Languages className="h-5 w-5" />
      <span className="ml-2 text-sm font-medium">{language === 'en' ? 'ع' : 'EN'}</span>
    </Button>
  );
};
