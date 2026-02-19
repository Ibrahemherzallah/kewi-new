import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'الرجاء ملء جميع الحقول المطلوبة' : 'Please fill in all required fields',
        variant: "destructive",
      });
      return;
    }

    // Frontend only - just show success message
    toast({
      title: language === 'ar' ? 'تم الإرسال بنجاح' : 'Message Sent',
      description: language === 'ar' ? 'شكراً لتواصلك معنا! سنرد عليك قريباً' : 'Thank you for contacting us! We\'ll get back to you soon.',
    });
    
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5" />
        <div className="container mx-auto px-4 py-24 relative">
          <div className="max-w-3xl mx-auto text-center space-y-6 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              {language === 'ar' ? 'تواصل معنا' : 'Contact Us'}
            </h1>
            <p className="text-xl text-muted-foreground">
              {language === 'ar' 
                ? 'نحن هنا للمساعدة والإجابة على أي سؤال قد يكون لديك' 
                : 'We\'re here to help and answer any questions you might have'}
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-6">
                  {language === 'ar' ? 'معلومات التواصل' : 'Get in Touch'}
                </h2>
                <p className="text-muted-foreground text-lg">
                  {language === 'ar'
                    ? 'يمكنك التواصل معنا من خلال أي من الطرق التالية'
                    : 'Feel free to reach out to us through any of the following methods'}
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4 p-6 bg-card rounded-xl border border-border">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</h3>
                    <p className="text-muted-foreground" dir="ltr">contact@example.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 bg-card rounded-xl border border-border">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{language === 'ar' ? 'الهاتف' : 'Phone'}</h3>
                    <p className="text-muted-foreground" dir="ltr">+1 (555) 123-4567</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 bg-card rounded-xl border border-border">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{language === 'ar' ? 'العنوان' : 'Address'}</h3>
                    <p className="text-muted-foreground">
                      {language === 'ar' ? 'شارع 123، المدينة، الدولة' : '123 Street, City, Country'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-card p-8 rounded-2xl border border-border">
              <h2 className="text-2xl font-bold mb-6">
                {language === 'ar' ? 'أرسل رسالة' : 'Send a Message'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {language === 'ar' ? 'الاسم' : 'Name'} *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={language === 'ar' ? 'أدخل اسمك' : 'Enter your name'}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {language === 'ar' ? 'البريد الإلكتروني' : 'Email'} *
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder={language === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {language === 'ar' ? 'الموضوع' : 'Subject'}
                  </label>
                  <Input
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder={language === 'ar' ? 'موضوع الرسالة' : 'Message subject'}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {language === 'ar' ? 'الرسالة' : 'Message'} *
                  </label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder={language === 'ar' ? 'اكتب رسالتك هنا' : 'Write your message here'}
                    rows={5}
                    required
                  />
                </div>

                <Button type="submit" size="lg" className="w-full bg-primary hover:bg-primary/90">
                  {language === 'ar' ? 'إرسال الرسالة' : 'Send Message'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;