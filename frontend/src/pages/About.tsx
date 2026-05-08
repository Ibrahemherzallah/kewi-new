import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Package, Users, Award, Target } from "lucide-react";
import {useEffect, useState} from "react";
import axios from "axios";

const About = () => {
  const { t, language } = useLanguage();
  const token = localStorage.getItem("token");
  const [statss, setStats] = useState({
    totalProducts: 0,
    pendingOrders: 0,
    monthlyRevenue: 0,
    wholesalers: 0,
  });
  const stats = [
    { icon: Package, label: { en: "Products", ar: "منتجات", he: 'מוצרים' }, value: `${statss.totalProducts}+`},
    { icon: Users, label: { en: "Happy Customers", ar: "عملاء سعداء", he: 'לקוחות מרוצים' }, value: "10K+" },
    { icon: Award, label: { en: "Years Experience", ar: "سنوات خبرة" , he: 'שנות ניסיון'}, value: "12+" },
    { icon: Target, label: { en: "City", ar: "مدينة وقرية" , he: 'עִיר'}, value: "40+" },
  ];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(
            `${import.meta.env.VITE_ENV}/admin/api/dashboard-stats`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
        );
        setStats(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5" />
        <div className="container mx-auto px-4 py-24 relative">
          <div className="max-w-3xl mx-auto text-center space-y-6 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              {t('about.title')}
            </h1>
            <p className="text-xl text-muted-foreground">
              {t('about.desc')}
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
                {t('about.ourStory')}
              </h2>
            </div>
            
            <div className="prose prose-lg max-w-none dark:prose-invert">
              <p className="text-muted-foreground text-lg leading-relaxed">
                {t('about.ourStory.1')}
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                {t('about.ourStory.2')}
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