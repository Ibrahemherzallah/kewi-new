import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "./contexts/LanguageContext";
import { LoyaltyProvider } from "./contexts/LoyaltyContext";
import { FavoritesProvider } from "./contexts/FavoritesContext";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProducts from "./pages/AdminProducts";
import AdminAccounting from "./pages/AdminAccounting";
import AdminBrands from "./pages/AdminBrands";
import AdminCategories from "./pages/AdminCategories";
import AdminWholesalers from "./pages/AdminWholesalers";
import AdminOrders from "./pages/AdminOrders";
import PurchaseHistory from "./pages/PurchaseHistory";
import Cart from "./pages/Cart";
import Favorites from "./pages/Favorites";
import NotFound from "./pages/NotFound";
import CategoryProducts from "@/pages/CategoryProducts.tsx";
import ProtectedRoute from "@/components/ProtectedRoute";
import SignUp from "./pages/SignUp";
import Profile from "./pages/Profile";
import DeliveryTerms from "@/pages/DeliveryTerms.tsx";
import PaymentCallback from "./pages/PaymentCallback";
const queryClient = new QueryClient();

// Language, theme, loyalty, and favorites providers configured

const App = () => (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <LanguageProvider>
          <LoyaltyProvider>
            <FavoritesProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/favorites" element={<Favorites />} />
                    <Route path="/payment-callback" element={<PaymentCallback />} />
                    <Route
                        path="/purchase-history"
                        element={
                          <ProtectedRoute allowedRoles={["user", "wholesaler", "admin"]}>
                            <PurchaseHistory />
                          </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                          <ProtectedRoute allowedRoles={["user", "wholesaler", "admin"]}>
                            <Profile />
                          </ProtectedRoute>
                        }
                    />
                    <Route path="/category/:categoryId" element={<CategoryProducts />} />
                    <Route path="/delivery-terms" element={<DeliveryTerms />} />
                    {/* Admin-only routes */}
                    <Route
                        path="/admin"
                        element={
                          <ProtectedRoute allowedRoles={["admin"]}>
                            <AdminDashboard />
                          </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/products/page"
                        element={
                          <ProtectedRoute allowedRoles={["admin"]}>
                            <AdminProducts />
                          </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/accounting"
                        element={
                          <ProtectedRoute allowedRoles={["admin"]}>
                            <AdminAccounting />
                          </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/brands/page"
                        element={
                          <ProtectedRoute allowedRoles={["admin"]}>
                            <AdminBrands />
                          </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/categories/page"
                        element={
                          <ProtectedRoute allowedRoles={["admin"]}>
                            <AdminCategories />
                          </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/wholesalers/page"
                        element={
                          <ProtectedRoute allowedRoles={["admin"]}>
                            <AdminWholesalers />
                          </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/orders/page"
                        element={
                          <ProtectedRoute allowedRoles={["admin"]}>
                            <AdminOrders />
                          </ProtectedRoute>
                        }
                    />

                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </FavoritesProvider>
          </LoyaltyProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
);

export default App;
