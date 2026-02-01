import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import imageCompression from "browser-image-compression";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/firebase.ts";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";
const CATEGORIES_API = `${API_BASE}/admin/categories`;
const BRANDS_API = `${API_BASE}/admin/brands`;
const PRODUCTS_API = `${API_BASE}/admin/products`;

type Category = {
    _id: string;
    name: string;
};

type Brand = {
    _id: string;
    name: string;
};

type Product = {
    _id: string;
    name: string;
    description?: string;
    id?: string;
    image?: string[];
    categoryId?: any;
    brandId?: any;
    stockNumber?: number;
    gender?: string;
    size?: string;
    color?: string;
    customerPrice?: number;
    wholesalerPrice?: number;
    salePrice?: number | null;
    isSoldOut?: boolean;
    isOnSale?: boolean;
    isSoon?: boolean;
};

type EditProductDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: Product;
    onUpdated: () => void;
};

export const EditProductDialog: React.FC<EditProductDialogProps> = ({
                                                                        open,
                                                                        onOpenChange,
                                                                        product,
                                                                        onUpdated,
                                                                    }) => {
    const { toast } = useToast();

    const [categories, setCategories] = useState<Category[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);

    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: product.name || "",
        id: product.id || "",
        image: (product.image || []) as string[],
        description: product.description || "",
        categoryId:
            typeof product.categoryId === "object"
                ? product.categoryId?._id || ""
                : product.categoryId || "",
        brandId:
            typeof product.brandId === "object"
                ? product.brandId?._id || ""
                : product.brandId || "",
        stockNumber: product.stockNumber?.toString() || "",
        gender: product.gender || "",
        color: product.color || "",
        size: product.size || "",
        customerPrice: product.customerPrice?.toString() || "",
        wholesalerPrice: product.wholesalerPrice?.toString() || "",
        salePrice: product.salePrice?.toString() || "",
        isSoldOut: product.isSoldOut || false,
        isOnSale: product.isOnSale || false,
        isSoon: product.isSoon || false,
    });

    useEffect(() => {
        // sync when product changes
        setFormData({
            name: product.name || "",
            id: product.id || "",
            image: (product.image || []) as string[],
            description: product.description || "",
            categoryId:
                typeof product.categoryId === "object"
                    ? product.categoryId?._id || ""
                    : product.categoryId || "",
            brandId:
                typeof product.brandId === "object"
                    ? product.brandId?._id || ""
                    : product.brandId || "",
            stockNumber: product.stockNumber?.toString() || "",
            gender: product.gender || "",
            color: product.color || "",
            size: product.size || "",
            customerPrice: product.customerPrice?.toString() || "",
            wholesalerPrice: product.wholesalerPrice?.toString() || "",
            salePrice: product.salePrice?.toString() || "",
            isSoldOut: product.isSoldOut || false,
            isOnSale: product.isOnSale || false,
            isSoon: product.isSoon || false,
        });
        setImagePreviews(product.image || []);
    }, [product]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catRes, brandRes] = await Promise.all([
                    fetch(CATEGORIES_API),
                    fetch(BRANDS_API),
                ]);

                if (catRes.ok) {
                    const cats: Category[] = await catRes.json();
                    setCategories(cats);
                }
                if (brandRes.ok) {
                    const brs: Brand[] = await brandRes.json();
                    setBrands(brs);
                }
            } catch (err) {
                console.error("Error fetching dropdown data:", err);
            }
        };

        if (open) fetchData();
    }, [open]);

    const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        if (files.length + imagePreviews.length > 5) {
            toast({
                title: "Error",
                description: "You can upload up to 5 images",
                variant: "destructive",
            });
            return;
        }

        setUploadingImages(true);

        try {
            const uploadPromises = files.map(async (file) => {
                const compressedFile = await imageCompression(file, {
                    maxSizeMB: 1,
                    maxWidthOrHeight: 1024,
                    useWebWorker: true,
                });

                const storageRef = ref(
                    storage,
                    `product_images/${Date.now()}-${compressedFile.name}`
                );
                const uploadTask = uploadBytesResumable(storageRef, compressedFile);

                const downloadURL: string = await new Promise((resolve, reject) => {
                    uploadTask.on(
                        "state_changed",
                        () => {},
                        (error) => reject(error),
                        async () => {
                            const url = await getDownloadURL(uploadTask.snapshot.ref);
                            resolve(url);
                        }
                    );
                });

                return downloadURL;
            });

            const urls = await Promise.all(uploadPromises);

            setImagePreviews((prev) => [...prev, ...urls]);
            setFormData((prev) => ({
                ...prev,
                image: [...prev.image, ...urls],
            }));
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Error uploading images",
                variant: "destructive",
            });
        } finally {
            setUploadingImages(false);
        }
    };

    const removeImage = (index: number) => {
        setImagePreviews((prev) => {
            const newPrev = prev.filter((_, i) => i !== index);
            setFormData((old) => ({
                ...old,
                image: newPrev,
            }));
            return newPrev;
        });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            if (!formData.name.trim()) {
                throw new Error("Name is required");
            }
            if (!formData.id.trim()) {
                throw new Error("ID is required");
            }
            if (!formData.categoryId) {
                throw new Error("Category is required");
            }

            const payload = {
                name: formData.name,
                description: formData.description,
                id: formData.id,
                categoryId: formData.categoryId,
                brandId: formData.brandId || null,
                stockNumber: Number(formData.stockNumber) || 0,
                gender: formData.gender || null,
                color: formData.color,
                size: formData.size,
                customerPrice: Number(formData.customerPrice) || 0,
                wholesalerPrice: Number(formData.wholesalerPrice) || 0,
                salePrice: formData.salePrice
                    ? Number(formData.salePrice)
                    : null,
                isSoldOut: formData.isSoldOut,
                isOnSale: formData.isOnSale,
                isSoon: formData.isSoon,
                images: formData.image,
            };

            const res = await fetch(`${PRODUCTS_API}/${product._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to update product");
            }

            toast({
                title: "Updated",
                description: "Product updated successfully",
            });

            onUpdated();
            onOpenChange(false);
        } catch (err: any) {
            console.error(err);
            toast({
                title: "Error",
                description: err.message || "Error updating product",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    const selectedCategory = categories.find(
        (c) => c._id === formData.categoryId
    );
    const showBrandSelect = selectedCategory?.name === "حقائب اليد";

    return (
        <Dialog open={open} onOpenChange={(o) => !saving && onOpenChange(o)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Product</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name + ID */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Name *</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>ID *</Label>
                            <Input
                                value={formData.id}
                                onChange={(e) =>
                                    setFormData({ ...formData, id: e.target.value })
                                }
                            />
                        </div>
                    </div>

                    {/* Images */}
                    <div className="space-y-2">
                        <Label>Product Images (up to 5)</Label>
                        <div className="space-y-4">
                            {imagePreviews.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    {imagePreviews.map((preview, index) => (
                                        <div key={index} className="relative">
                                            <img
                                                src={preview}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-24 object-cover rounded-lg border"
                                            />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => removeImage(index)}
                                                className="absolute top-1 right-1 h-6 w-6 p-0"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {imagePreviews.length < 5 && (
                                <>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                        <ImageIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                                        <p className="text-sm text-gray-500">
                                            اختر صور للمنتج ({imagePreviews.length}/5)
                                        </p>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        id="edit-product-images-upload"
                                    />
                                    <label
                                        htmlFor="edit-product-images-upload"
                                        className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        <Upload className="h-4 w-4 mr-2" />
                                        {uploadingImages ? "Uploading..." : "Choose Images"}
                                    </label>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                        />
                    </div>

                    {/* Category + Brand */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Category *</Label>
                            <Select
                                value={formData.categoryId}
                                onValueChange={(value) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        categoryId: value,
                                        brandId: "",
                                    }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat._id} value={cat._id}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {showBrandSelect && (
                            <div className="space-y-2">
                                <Label>Brand</Label>
                                <Select
                                    value={formData.brandId}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, brandId: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select brand" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {brands.map((brand) => (
                                            <SelectItem key={brand._id} value={brand._id}>
                                                {brand.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    {/* Stock + Color */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Stock Number *</Label>
                            <Input
                                type="number"
                                value={formData.stockNumber}
                                onChange={(e) =>
                                    setFormData({ ...formData, stockNumber: e.target.value })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Color</Label>
                            <Input
                                value={formData.color}
                                onChange={(e) =>
                                    setFormData({ ...formData, color: e.target.value })
                                }
                            />
                        </div>
                    </div>

                    {/* Size + Gender */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Size</Label>
                            <Select
                                value={formData.size}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, size: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select size" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="صغير">صغير</SelectItem>
                                    <SelectItem value="وسط">وسط</SelectItem>
                                    <SelectItem value="كبير">كبير</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Gender</Label>
                            <Select
                                value={formData.gender}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, gender: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="نسائي">نسائي</SelectItem>
                                    <SelectItem value="رجالي">رجالي</SelectItem>
                                    <SelectItem value="أطفال">أطفال</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Prices */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Customer Price *</Label>
                            <Input
                                type="number"
                                step="0.01"
                                value={formData.customerPrice}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        customerPrice: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Wholesaler Price *</Label>
                            <Input
                                type="number"
                                step="0.01"
                                value={formData.wholesalerPrice}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        wholesalerPrice: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Sale Price</Label>
                            <Input
                                type="number"
                                step="0.01"
                                value={formData.salePrice}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        salePrice: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>

                    {/* Flags */}
                    <div className="flex flex-wrap gap-6">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="edit-isSoldOut"
                                checked={formData.isSoldOut}
                                onCheckedChange={(checked) =>
                                    setFormData({
                                        ...formData,
                                        isSoldOut: checked as boolean,
                                    })
                                }
                            />
                            <Label htmlFor="edit-isSoldOut">Sold Out</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="edit-isOnSale"
                                checked={formData.isOnSale}
                                onCheckedChange={(checked) =>
                                    setFormData({
                                        ...formData,
                                        isOnSale: checked as boolean,
                                    })
                                }
                            />
                            <Label htmlFor="edit-isOnSale">On Sale</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="edit-isSoon"
                                checked={formData.isSoon}
                                onCheckedChange={(checked) =>
                                    setFormData({
                                        ...formData,
                                        isSoon: checked as boolean,
                                    })
                                }
                            />
                            <Label htmlFor="edit-isSoon">Coming Soon</Label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={uploadingImages || saving}>
                            {saving ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
