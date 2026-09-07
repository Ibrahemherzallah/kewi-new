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
import { Upload, X, Image as ImageIcon, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import imageCompression from "browser-image-compression";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/firebase.ts";

const API_BASE = import.meta.env.VITE_ENV || "https://kewi.ps";
const CATEGORIES_API = `${API_BASE}/admin/api/categories`;
const BRANDS_API = `${API_BASE}/admin/brands`;
const PRODUCTS_API = `${API_BASE}/admin/api/products`;

type Category = {
    _id: string;
    name: string;
};

type Brand = {
    _id: string;
    name: string;
};

type Variant = {
    color: string;
    stockNumber: string; // keep as string for inputs, convert on submit
    image: string;
};

type Product = {
    _id: string;
    name: string;
    description?: string;
    id?: string;
    image?: string[];
    categoryId?: any;
    categories?: any[];
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
    // NEW FIELDS
    isMultiColor?: boolean;
    variants?: { color?: string; stockNumber?: number; image?: string }[];
};

type EditProductDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: Product;
    onUpdated: () => void;
};

type ProductStatus = "normal" | "soldOut" | "onSale" | "soon";

export const EditProductDialog: React.FC<EditProductDialogProps> = ({open, onOpenChange, product, onUpdated,}) => {
    const { toast } = useToast();

    const [categories, setCategories] = useState<Category[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);

    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [saving, setSaving] = useState(false);
    const token = localStorage.getItem("token");

    const [isMultiColor, setIsMultiColor] = useState<boolean>(
        !!product.isMultiColor
    );
    const [variants, setVariants] = useState<Variant[]>(
        (product.variants || []).map((v) => ({
            color: v.color || "",
            stockNumber: v.stockNumber?.toString() || "",
            image: v.image || "",
        }))
    );

    const [productStatus, setProductStatus] = useState<ProductStatus>(() => {
        if (product.isSoldOut) return "soldOut";
        if (product.isOnSale) return "onSale";
        if (product.isSoon) return "soon";
        return "normal";
    });

    const [formData, setFormData] = useState({
        name: product.name || "",
        id: product.id || "",
        image: (product.image || []) as string[],
        description: product.description || "",
        categoryId:
            typeof product.categoryId === "object"
                ? product.categoryId?._id || ""
                : (product.categoryId as string) || "",
        categories: (product.categories || []).map((c: any) =>
            typeof c === "object" ? c._id : c
        ),
        brandId:
            typeof product.brandId === "object"
                ? product.brandId?._id || ""
                : (product.brandId as string) || "",
        stockNumber: product.stockNumber?.toString() || "",
        gender: product.gender || "",
        color: product.color || "",
        size: product.size || "",
        customerPrice: product.customerPrice?.toString() || "",
        wholesalerPrice: product.wholesalerPrice?.toString() || "",
        salePrice: product.salePrice?.toString() || "",
    });

    // Sync when product changes
    useEffect(() => {
        setFormData({
            name: product.name || "",
            id: product.id || "",
            image: (product.image || []) as string[],
            description: product.description || "",
            categoryId:
                typeof product.categoryId === "object"
                    ? product.categoryId?._id || ""
                    : (product.categoryId as string) || "",
            categories: (product.categories || []).map((c: any) =>
                typeof c === "object" ? c._id : c
            ),
            brandId:
                typeof product.brandId === "object"
                    ? product.brandId?._id || ""
                    : (product.brandId as string) || "",
            stockNumber: product.stockNumber?.toString() || "",
            gender: product.gender || "",
            color: product.color || "",
            size: product.size || "",
            customerPrice: product.customerPrice?.toString() || "",
            wholesalerPrice: product.wholesalerPrice?.toString() || "",
            salePrice: product.salePrice?.toString() || "",
        });
        setImagePreviews((product.image || []) as string[]);
        setIsMultiColor(!!product.isMultiColor);
        setVariants(
            (product.variants || []).map((v) => ({
                color: v.color || "",
                stockNumber: v.stockNumber?.toString() || "",
                image: v.image || "",
            }))
        );
        setProductStatus(() => {
            if (product.isSoldOut) return "soldOut";
            if (product.isOnSale) return "onSale";
            if (product.isSoon) return "soon";
            return "normal";
        });
    }, [product]);

    // Load dropdown data
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

    /* ---------- Image Upload (single-color mode) ---------- */

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

    /* ---------- Variant helpers (multi-color) ---------- */

    const handleAddVariant = () => {
        setVariants((prev) => [
            ...prev,
            { color: "", stockNumber: "", image: "" },
        ]);
    };

    const handleRemoveVariant = (index: number) => {
        setVariants((prev) => prev.filter((_, i) => i !== index));
    };

    const handleVariantChange = (index: number, field: keyof Variant, value: string) => {
        setVariants((prev) =>
            prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
        );
    };

    const handleVariantImageUpload = async (index: number, e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const compressedFile = await imageCompression(file, {
                maxSizeMB: 1,
                maxWidthOrHeight: 1024,
                useWebWorker: true,
            });

            const storageRef = ref(
                storage,
                `product_variants/${Date.now()}-${compressedFile.name}`
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

            setVariants((prev) =>
                prev.map((v, i) => (i === index ? { ...v, image: downloadURL } : v))
            );
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Error uploading variant image",
                variant: "destructive",
            });
        }
    };

    /* ---------- Submit ---------- */

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (saving) return;
        setSaving(true);

        try {
            // Basic validation
            if (!formData.name.trim()) {
                throw new Error("Name is required");
            }
            if (!formData.id.trim()) {
                throw new Error("ID is required");
            }
            if (!formData.categoryId) {
                throw new Error("Category is required");
            }

            const selectedCategory = categories.find(
                (c) => c._id === formData.categoryId
            );
            const isHandbags = selectedCategory?.name === "حقائب اليد";

            if (isHandbags && !formData.brandId) {
                throw new Error("Brand is required for handbags category");
            }

            // Multi-color validation
            if (isMultiColor) {
                if (variants.length === 0) {
                    throw new Error("Add at least one color variant");
                }

                const invalid = variants.some(
                    (v) => !v.color || !v.stockNumber || !v.image
                );
                if (invalid) {
                    throw new Error(
                        "Each color variant must have a color, stock number, and image"
                    );
                }
            } else {
                if (!formData.stockNumber) {
                    throw new Error("Stock number is required");
                }
                if (!formData.image || formData.image.length === 0) {
                    throw new Error("At least one image is required");
                }
            }

            if (!formData.customerPrice || !formData.wholesalerPrice) {
                throw new Error("Customer & wholesaler prices are required");
            }

            // Build payload
            let isSoldOut = false;
            let isOnSale = false;
            let isSoon = false;

            switch (productStatus) {
                case "soldOut":
                    isSoldOut = true;
                    break;
                case "onSale":
                    isOnSale = true;
                    break;
                case "soon":
                    isSoon = true;
                    break;
            }

            let stockNumberToSend = 0;
            let imagesToSend: string[] = [];

            let variantsToSend: {
                color: string;
                stockNumber: number;
                image: string;
            }[] = [];

            if (isMultiColor) {
                variantsToSend = variants.map((v) => ({
                    color: v.color,
                    stockNumber: Number(v.stockNumber) || 0,
                    image: v.image,
                }));
                stockNumberToSend = variantsToSend.reduce(
                    (sum, v) => sum + v.stockNumber,
                    0
                );
                imagesToSend = variantsToSend.map((v) => v.image).filter(Boolean);
            } else {
                stockNumberToSend = Number(formData.stockNumber) || 0;
                imagesToSend = formData.image;
            }

            const payload = {
                name: formData.name,
                description: formData.description,
                id: formData.id,
                categoryId: formData.categoryId,
                categories: formData.categories,
                brandId: formData.brandId || null,
                stockNumber: stockNumberToSend,
                gender: formData.gender || null,
                color: isMultiColor ? null : formData.color,
                size: formData.size,
                customerPrice: Number(formData.customerPrice) || 0,
                wholesalerPrice: Number(formData.wholesalerPrice) || 0,
                salePrice: formData.salePrice
                    ? Number(formData.salePrice)
                    : null,
                isSoldOut,
                isOnSale,
                isSoon,
                images: imagesToSend,
                isMultiColor,
                variants: variantsToSend,
            };

            const res = await fetch(`${PRODUCTS_API}/${product._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
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

    const toggleExtraCategory = (id: string) => {
        setFormData((prev) => ({
            ...prev,
            categories: prev.categories.includes(id)
                ? prev.categories.filter((c) => c !== id)
                : [...prev.categories, id],
        }));
    };


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

                    {/* Multi-color toggle */}
                    <div className="space-y-2">
                        <Label>Color Mode</Label>
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="edit-isMultiColor"
                                checked={isMultiColor}
                                onCheckedChange={(checked) =>
                                    setIsMultiColor(Boolean(checked))
                                }
                            />
                            <span className="text-sm text-muted-foreground">
                Multiple colors, each with its own stock & image
              </span>
                        </div>
                    </div>

                    {/* Single-color images */}
                    {!isMultiColor && (
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
                    )}

                    {/* Multi-color variants */}
                    {isMultiColor && (
                        <div className="space-y-3">
                            <Label>Color Variants</Label>
                            {variants.map((variant, index) => (
                                <div
                                    key={index}
                                    className="grid grid-cols-[1.5fr,1fr,1.5fr,auto] gap-3 items-end"
                                >
                                    <div className="space-y-1">
                                        <Label className="text-xs">Color</Label>
                                        <Input
                                            value={variant.color}
                                            onChange={(e) =>
                                                handleVariantChange(index, "color", e.target.value)
                                            }
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Stock</Label>
                                        <Input
                                            type="number"
                                            value={variant.stockNumber}
                                            onChange={(e) =>
                                                handleVariantChange(
                                                    index,
                                                    "stockNumber",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Image</Label>
                                        {variant.image && (
                                            <img
                                                src={variant.image}
                                                className="w-full h-16 object-cover rounded border"
                                            />
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            id={`variant-image-${index}`}
                                            onChange={(e) => handleVariantImageUpload(index, e)}
                                        />
                                        <label
                                            htmlFor={`variant-image-${index}`}
                                            className="cursor-pointer inline-flex items-center px-3 py-1 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 mt-1"
                                        >
                                            <Upload className="h-3 w-3 mr-1" />
                                            {variant.image ? "Change" : "Upload"}
                                        </label>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleRemoveVariant(index)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}

                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="mt-2"
                                onClick={handleAddVariant}
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                Add Variant
                            </Button>
                        </div>
                    )}

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
                                <Label>Brand *</Label>
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


                    {/* Additional categories */}
                    <div className="space-y-2">
                        <Label>Additional Categories (optional)</Label>
                        <div className="border rounded-md p-3 max-h-40 overflow-y-auto space-y-2">
                            {categories
                                .filter((cat) => cat._id !== formData.categoryId)
                                .map((cat) => (
                                    <div key={cat._id} className="flex items-center gap-2">
                                        <Checkbox
                                            id={`edit-extra-cat-${cat._id}`}
                                            checked={formData.categories.includes(cat._id)}
                                            onCheckedChange={() => toggleExtraCategory(cat._id)}
                                        />
                                        <Label
                                            htmlFor={`edit-extra-cat-${cat._id}`}
                                            className="font-normal cursor-pointer"
                                        >
                                            {cat.name}
                                        </Label>
                                    </div>
                                ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            The product will also appear in these categories.
                        </p>
                    </div>

                    {/* Stock + Color (single-color only) */}
                    {!isMultiColor && (
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
                    )}

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

                    {/* Status (single-choice) */}
                    <div className="space-y-2">
                        <Label>Product status</Label>
                        <div className="flex flex-wrap gap-6">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="edit-status-normal"
                                    checked={productStatus === "normal"}
                                    onCheckedChange={() => setProductStatus("normal")}
                                />
                                <Label htmlFor="edit-status-normal">Available</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="edit-status-onSale"
                                    checked={productStatus === "onSale"}
                                    onCheckedChange={() => setProductStatus("onSale")}
                                />
                                <Label htmlFor="edit-status-onSale">On Sale</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="edit-status-soon"
                                    checked={productStatus === "soon"}
                                    onCheckedChange={() => setProductStatus("soon")}
                                />
                                <Label htmlFor="edit-status-soon">Coming Soon</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="edit-status-soldOut"
                                    checked={productStatus === "soldOut"}
                                    onCheckedChange={() => setProductStatus("soldOut")}
                                />
                                <Label htmlFor="edit-status-soldOut">Sold Out</Label>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={saving}
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
