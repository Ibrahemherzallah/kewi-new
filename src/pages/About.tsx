import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Package, Users, Award, Target } from "lucide-react";

const About = () => {
  const { t, language } = useLanguage();

  const stats = [
    { icon: Package, label: { en: "Products", ar: "منتجات" }, value: "500+" },
    { icon: Users, label: { en: "Happy Customers", ar: "عملاء سعداء" }, value: "10K+" },
    { icon: Award, label: { en: "Years Experience", ar: "سنوات خبرة" }, value: "15+" },
    { icon: Target, label: { en: "Countries", ar: "دول" }, value: "25+" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5" />
        <div className="container mx-auto px-4 py-24 relative">
          <div className="max-w-3xl mx-auto text-center space-y-6 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              {t('about.title') || (language === 'ar' ? 'من نحن' : 'About Us')}
            </h1>
            <p className="text-xl text-muted-foreground">
              {language === 'ar' 
                ? 'نحن نقدم أفضل المنتجات عالية الجودة لعملائنا حول العالم' 
                : 'We provide the finest quality products to our customers worldwide'}
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center space-y-4 p-6 bg-card rounded-2xl border border-border hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <stat.icon className="w-8 h-8 text-primary" />
                </div>
                <div className="text-4xl font-bold text-primary">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label[language]}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">
                {language === 'ar' ? 'قصتنا' : 'Our Story'}
              </h2>
            </div>
            
            <div className="prose prose-lg max-w-none dark:prose-invert">
              <p className="text-muted-foreground text-lg leading-relaxed">
                {language === 'ar' 
                  ? 'بدأنا رحلتنا منذ أكثر من 15 عامًا بهدف توفير منتجات عالية الجودة لعملائنا. نحن نؤمن بأن كل منتج يحكي قصة، ونحن هنا لمساعدتك في العثور على القصة المثالية لك.' 
                  : 'We started our journey over 15 years ago with a mission to provide high-quality products to our customers. We believe every product tells a story, and we\'re here to help you find your perfect one.'}
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                {language === 'ar'
                  ? 'فريقنا ملتزم بتقديم أفضل تجربة تسوق ممكنة، من اختيار المنتجات إلى خدمة ما بعد البيع. نحن نفخر بعلاقاتنا طويلة الأمد مع عملائنا وشركائنا.'
                  : 'Our team is committed to delivering the best shopping experience possible, from product selection to after-sales service. We pride ourselves on our long-lasting relationships with our customers and partners.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;