import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Upload, X, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import imageCompression from "browser-image-compression";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/firebase.ts";

// API base helpers
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

type AddProductDialogProps = {
  onProductCreated?: () => void;
};

type ColorVariant = {
  color: string;
  stockNumber: string;
  image: string | null;
};

type StatusKey = "isSoldOut" | "isOnSale" | "isSoon";

export const AddProductDialog: React.FC<AddProductDialogProps> = ({
                                                                    onProductCreated,
                                                                  }) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  // dropdown data
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  // image state
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [isMultiColor, setIsMultiColor] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    id: "",
    gender: "",
    image: [] as string[],
    description: "",
    categoryId: "",
    brandId: "",
    stockNumber: "",
    color: "",
    size: "",
    customerPrice: "",
    wholesalerPrice: "",
    salePrice: "",
    isSoldOut: false,
    isOnSale: false,
    isSoon: false,
  });
  const [variants, setVariants] = useState<ColorVariant[]>([]);

  // fetch categories & brands once
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

    fetchData();
  }, []);

  const resetForm = () => {
    setFormData({
      name: "",
      id: "",
      image: [],
      description: "",
      categoryId: "",
      brandId: "",
      stockNumber: "",
      color: "",
      gender: '',
      size: "",
      customerPrice: "",
      wholesalerPrice: "",
      salePrice: "",
      isSoldOut: false,
      isOnSale: false,
      isSoon: false,
    });
    setImagePreviews([]);
  };

  // 🔹 multi image upload (max 5) -> Firebase -> URLs
  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (files.length + imagePreviews.length > 5) {
      toast({
        title: "خطأ",
        description: "يمكن تحميل حتى 5 صور فقط",
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

        const storageRef = ref(storage, `product_images/${Date.now()}-${compressedFile.name}`);
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
        image: [...prev.image, ...urls], // store URLs
      }));
    } catch (error) {
      console.error(error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء رفع الصور",
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

    // ---------------------------
    // BASIC VALIDATION
    // ---------------------------
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Name is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.id.trim()) {
      toast({
        title: "Validation Error",
        description: "ID is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.categoryId) {
      toast({
        title: "Validation Error",
        description: "Category is required",
        variant: "destructive",
      });
      return;
    }

    // ✅ brand required if category is "حقائب اليد"
    const selectedCategory = categories.find(
        (c) => c._id === formData.categoryId
    );
    const isHandbags = selectedCategory?.name === "حقائب اليد";

    if (isHandbags && !formData.brandId) {
      toast({
        title: "Validation Error",
        description: "Brand is required for handbags category",
        variant: "destructive",
      });
      return;
    }

    // ---------------------------
    // MULTI-COLOR VS SINGLE-COLOR
    // ---------------------------
    if (isMultiColor) {
      // Multi-color validation
      if (variants.length === 0) {
        toast({
          title: "Validation Error",
          description: "Add at least one color variant",
          variant: "destructive",
        });
        return;
      }

      const invalid = variants.some(
          (v) => !v.color || !v.stockNumber || !v.image
      );
      if (invalid) {
        toast({
          title: "Validation Error",
          description:
              "Each color variant must have a color, stock number, and image",
          variant: "destructive",
        });
        return;
      }
    } else {
      // Single-color validation (stock + at least one image)
      if (!formData.stockNumber) {
        toast({
          title: "Validation Error",
          description: "Stock number is required",
          variant: "destructive",
        });
        return;
      }

      if (formData.image.length === 0) {
        toast({
          title: "Validation Error",
          description: "At least one image is required",
          variant: "destructive",
        });
        return;
      }
    }

    if (!formData.customerPrice || !formData.wholesalerPrice) {
      toast({
        title: "Validation Error",
        description: "Customer & wholesaler prices are required",
        variant: "destructive",
      });
      return;
    }

    try {
      // ---------------------------
      // BUILD PAYLOAD
      // ---------------------------
      const totalStock = isMultiColor
          ? variants.reduce(
              (sum, v) => sum + Number(v.stockNumber || 0),
              0
          )
          : Number(formData.stockNumber);

      const variantImages = variants
          .map((v) => v.image)
          .filter((img): img is string => Boolean(img));

      const payload: any = {
        name: formData.name,
        description: formData.description,
        id: formData.id,
        categoryId: formData.categoryId,
        brandId: formData.brandId || null,
        stockNumber: totalStock,
        gender: formData.gender || null,
        size: formData.size || null,
        // single-color: keep color; multi-color: colors live in variants
        color: isMultiColor ? null : formData.color,
        customerPrice: Number(formData.customerPrice),
        wholesalerPrice: Number(formData.wholesalerPrice),
        salePrice: formData.salePrice ? Number(formData.salePrice) : null,
        isSoldOut: formData.isSoldOut,
        isOnSale: formData.isOnSale,
        isSoon: formData.isSoon,

        // images: from variants in multi-color mode, otherwise from main uploader
        images: isMultiColor ? variantImages : formData.image,

        // extra fields so BE can support multi-color later
        isMultiColor,
        variants: isMultiColor
            ? variants.map((v) => ({
              color: v.color,
              stockNumber: Number(v.stockNumber),
              image: v.image,
            }))
            : [],
      };

      const res = await fetch(PRODUCTS_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create product");
      }

      toast({
        title: "Success",
        description: "Product created successfully",
      });

      onProductCreated?.(); // refresh list in AdminProducts
      resetForm();
      setOpen(false);
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error",
        description: err.message || "Error creating product",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = (key: StatusKey, checked: boolean | "indeterminate") => {
    const value = checked === true;
    setFormData((prev) => {
      if (!value) {
        // if user unchecks, just turn that one off
        return { ...prev, [key]: false };
      }
      // if user checks, turn others off
      return {
        ...prev,
        isSoldOut: key === "isSoldOut",
        isOnSale: key === "isOnSale",
        isSoon: key === "isSoon",
      };
    });
  };
  const selectedCategory = categories.find((c) => c._id === formData.categoryId);
  const showBrandSelect = selectedCategory?.name === "حقائب اليد";

  return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name + ID (instead of gender) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="idField">ID *</Label>
                <Input
                    id="idField"
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    required
                />
              </div>
            </div>

            {/* Images (up to 5) */}
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
                          id="new-product-images-upload"
                      />
                      <label
                          htmlFor="new-product-images-upload"
                          className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {uploadingImages ? "جاري الرفع..." : "اختيار صور"}
                      </label>
                    </>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Category + Brand (conditional) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select
                    value={formData.categoryId}
                    onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, categoryId: value, brandId: "" }))
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
                    <Label>
                      Brand {showBrandSelect && <span className="text-red-500">*</span>}
                    </Label>
                    <Select
                        value={formData.brandId}
                        onValueChange={(value) => setFormData({ ...formData, brandId: value })}
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

            {/* Single / Multi color toggle */}
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <Checkbox
                    id="isMultiColor"
                    checked={isMultiColor}
                    onCheckedChange={(checked) => {
                      const value = checked === true;
                      setIsMultiColor(value);
                      if (!value) {
                        // switching back to single-color mode -> clear variants
                        setVariants([]);
                      }
                    }}
                />
                <Label htmlFor="isMultiColor">This product has multiple colors</Label>
              </div>
            </div>

            {/* If NOT multi-color: original Stock + Color / Size */}
            {!isMultiColor && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="stockNumber">Stock Number *</Label>
                      <Input
                          id="stockNumber"
                          type="number"
                          value={formData.stockNumber}
                          onChange={(e) =>
                              setFormData({ ...formData, stockNumber: e.target.value })
                          }
                          required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="color">Color</Label>
                      <Input
                          id="color"
                          value={formData.color}
                          onChange={(e) =>
                              setFormData({ ...formData, color: e.target.value })
                          }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {/* Size */}
                    <div className="space-y-2">
                      <Label>Size</Label>
                      <Select
                          value={formData.size}
                          onValueChange={(value) => setFormData({ ...formData, size: value })}
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

                    {/* Gender */}
                    <div className="space-y-2">
                      <Label>Gender</Label>
                      <Select
                          value={formData.gender}
                          onValueChange={(value) =>
                              setFormData((prev) => ({ ...prev, gender: value }))
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
                </>
            )}

            {/* If multi-color: variants UI */}
            {isMultiColor && (
                <div className="space-y-4 border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <Label className="font-semibold">Color Variants</Label>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            setVariants((prev) => [
                              ...prev,
                              { color: "", stockNumber: "", image: null },
                            ])
                        }
                    >
                      + Add Color
                    </Button>
                  </div>

                  {variants.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No colors added yet. Click &quot;Add Color&quot; to create one.
                      </p>
                  )}

                  <div className="space-y-3">
                    {variants.map((variant, idx) => (
                        <div
                            key={idx}
                            className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_auto] gap-3 items-end border rounded-md p-3"
                        >
                          {/* Color */}
                          <div className="space-y-1">
                            <Label>Color</Label>
                            <Input
                                value={variant.color}
                                onChange={(e) =>
                                    setVariants((prev) => {
                                      const copy = [...prev];
                                      copy[idx] = { ...copy[idx], color: e.target.value };
                                      return copy;
                                    })
                                }
                                placeholder="e.g. أسود"
                            />
                          </div>

                          {/* Stock */}
                          <div className="space-y-1">
                            <Label>Stock</Label>
                            <Input
                                type="number"
                                value={variant.stockNumber}
                                onChange={(e) =>
                                    setVariants((prev) => {
                                      const copy = [...prev];
                                      copy[idx] = { ...copy[idx], stockNumber: e.target.value };
                                      return copy;
                                    })
                                }
                                placeholder="0"
                            />
                          </div>

                          {/* Image upload (one image per color) */}
                          <div className="space-y-1">
                            <Label>Image</Label>
                            <div className="flex items-center gap-2">
                              {variant.image && (
                                  <img
                                      src={variant.image}
                                      alt={variant.color || `Color ${idx + 1}`}
                                      className="h-10 w-10 object-cover rounded border"
                                  />
                              )}
                              <input
                                  type="file"
                                  accept="image/*"
                                  id={`variant-image-${idx}`}
                                  className="hidden"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    try {
                                      setUploadingImages(true);

                                      const compressedFile = await imageCompression(file, {
                                        maxSizeMB: 1,
                                        maxWidthOrHeight: 1024,
                                        useWebWorker: true,
                                      });

                                      const storageRef = ref(
                                          storage,
                                          `product_variants/${Date.now()}-${compressedFile.name}`
                                      );
                                      const uploadTask = uploadBytesResumable(
                                          storageRef,
                                          compressedFile
                                      );

                                      const downloadURL: string = await new Promise(
                                          (resolve, reject) => {
                                            uploadTask.on(
                                                "state_changed",
                                                () => {},
                                                (error) => reject(error),
                                                async () => {
                                                  const url = await getDownloadURL(
                                                      uploadTask.snapshot.ref
                                                  );
                                                  resolve(url);
                                                }
                                            );
                                          }
                                      );

                                      setVariants((prev) => {
                                        const copy = [...prev];
                                        copy[idx] = { ...copy[idx], image: downloadURL };
                                        return copy;
                                      });
                                    } catch (error) {
                                      console.error(error);
                                      toast({
                                        title: "خطأ",
                                        description:
                                            "حدث خطأ أثناء رفع صورة اللون، حاول مجدداً",
                                        variant: "destructive",
                                      });
                                    } finally {
                                      setUploadingImages(false);
                                    }
                                  }}
                              />
                              <label
                                  htmlFor={`variant-image-${idx}`}
                                  className="cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                              >
                                <Upload className="h-3 w-3 mr-2" />
                                {variant.image ? "Change" : "Upload"}
                              </label>
                              <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                      setVariants((prev) => prev.filter((_, i) => i !== idx))
                                  }
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Size */}
                    <div className="space-y-2">
                      <Label>Size</Label>
                      <Select
                          value={formData.size}
                          onValueChange={(value) => setFormData({ ...formData, size: value })}
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

                    {/* Gender */}
                    <div className="space-y-2">
                      <Label>Gender</Label>
                      <Select
                          value={formData.gender}
                          onValueChange={(value) =>
                              setFormData((prev) => ({ ...prev, gender: value }))
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
                </div>
            )}



            {/* Prices */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerPrice">Customer Price *</Label>
                <Input
                    id="customerPrice"
                    type="number"
                    step="0.01"
                    value={formData.customerPrice}
                    onChange={(e) =>
                        setFormData({ ...formData, customerPrice: e.target.value })
                    }
                    required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wholesalerPrice">Wholesaler Price *</Label>
                <Input
                    id="wholesalerPrice"
                    type="number"
                    step="0.01"
                    value={formData.wholesalerPrice}
                    onChange={(e) =>
                        setFormData({ ...formData, wholesalerPrice: e.target.value })
                    }
                    required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salePrice">Sale Price</Label>
                <Input
                    id="salePrice"
                    type="number"
                    step="0.01"
                    value={formData.salePrice}
                    onChange={(e) =>
                        setFormData({ ...formData, salePrice: e.target.value })
                    }
                />
              </div>
            </div>

            {/* Flags */}
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                    id="isSoldOut"
                    checked={formData.isSoldOut}
                    onCheckedChange={(checked) => handleStatusChange("isSoldOut", checked)}
                />
                <Label htmlFor="isSoldOut">Sold Out</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                    id="isOnSale"
                    checked={formData.isOnSale}
                    onCheckedChange={(checked) => handleStatusChange("isOnSale", checked)}
                />
                <Label htmlFor="isOnSale">On Sale</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                    id="isSoon"
                    checked={formData.isSoon}
                    onCheckedChange={(checked) => handleStatusChange("isSoon", checked)}
                />
                <Label htmlFor="isSoon">Coming Soon</Label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setOpen(false);
                  }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={uploadingImages}>
                {uploadingImages ? "Uploading..." : "Create Product"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
  );
};
