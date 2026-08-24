import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const languages = ["en", "ar", "he"] as const;

export const LanguageToggle = ({ apply }: { apply?: boolean }) => {
  const { language, setLanguage } = useLanguage();

  const handleChangeLanguage = () => {
    const currentIndex = languages.indexOf(language);
    const nextIndex = (currentIndex + 1) % languages.length;
    setLanguage(languages[nextIndex]);
  };

  const languageLabel = {
    en: "AR",
    ar: "HE",
    he: "EN",
  };

  return (
      <Button
          variant="ghost"
          size="icon"
          onClick={handleChangeLanguage}
          className="btn-scale"
      >
        <Languages className="h-5 w-5" />
        <span className="ml-2 text-sm font-medium">
          {languageLabel[language]}
        </span>
      </Button>
  );
};