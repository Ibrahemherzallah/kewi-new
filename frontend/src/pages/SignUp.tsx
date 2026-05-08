import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Package } from "lucide-react";

const SignUp = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { t,language } = useLanguage();

    const [formData, setFormData] = useState({
        username: "",
        phone: "",
        password: "",
        address: "",
        dob: "", // ✅ NEW
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const res = await fetch(`${import.meta.env.VITE_ENV}/auth/api/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: formData.username,
                    phone: formData.phone,
                    password: formData.password,
                    address: formData.address,
                    dob: formData.dob,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Signup failed");
            }

            // Save token + role + user
            localStorage.setItem("token", data.token);
            localStorage.setItem("userRole", data.user.role);
            localStorage.setItem("user", JSON.stringify(data.user));

            toast({
                title: t('toast.welcome'),
                description: t('toast.welcome.signup'),
            });

            if (data.user.role === "admin") {
                navigate("/admin");
            } else {
                navigate("/");
            }
        } catch (err: any) {
            toast({
                title: t('toast.err'),
                description: err.message || t('toast.createAccount.err'),
                variant: "destructive",
            });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mt-4">
                        {t('signup.header')}
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        {t('signup.desc')}
                    </p>
                </div>

                <div className="bg-card p-8 rounded-2xl border border-border shadow-lg">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Username */}
                        <div>
                            <label className="text-sm font-medium mb-2 block">
                                {t('signup.field.username')}
                            </label>
                            <Input
                                type="text"
                                value={formData.username}
                                onChange={(e) =>
                                    setFormData({ ...formData, username: e.target.value })
                                }
                                placeholder={t('signup.field.username.placeholder')}
                                required
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="text-sm font-medium mb-2 block">
                                {t('signup.field.phone')}
                            </label>
                            <Input
                                type="tel"
                                dir={language === "ar" ? "rtl" : "ltr"}
                                value={formData.phone}
                                onChange={(e) =>
                                    setFormData({ ...formData, phone: e.target.value })
                                }
                                placeholder={t('signup.field.phone.placeholder')}
                                required
                            />
                        </div>

                        {/* DOB */}
                        <div>
                            <label className="text-sm font-medium mb-2 block">
                                {t('signup.field.dob')}
                            </label>
                            <Input
                                type="date"
                                value={formData.dob}
                                onChange={(e) =>
                                    setFormData({ ...formData, dob: e.target.value })
                                }
                                required={false} // you can make it required later if you want
                            />
                        </div>

                        {/* Address */}
                        <div>
                            <label className="text-sm font-medium mb-2 block">
                                {t('signup.field.address')}
                            </label>
                            <Input
                                value={formData.address}
                                onChange={(e) =>
                                    setFormData({ ...formData, address: e.target.value })
                                }
                                placeholder={t('signup.field.address.placeholder')}
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="text-sm font-medium mb-2 block">
                                {t('signup.field.password')}
                            </label>
                            <Input
                                type="password"
                                value={formData.password}
                                onChange={(e) =>
                                    setFormData({ ...formData, password: e.target.value })
                                }
                                placeholder={t('signup.field.password.placeholder')}
                                required
                            />
                        </div>

                        <Button type="submit" size="lg" className="w-full bg-primary hover:bg-primary/90">
                            {t('signup.btnSignup')}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        {t('signup.haveAccount')}{" "}
                        <Link to="/login" className="text-primary hover:underline">
                            {t('signup.login')}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
