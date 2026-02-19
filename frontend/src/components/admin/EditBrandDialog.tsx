import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, Image as ImageIcon, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import imageCompression from "browser-image-compression";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/firebase";

const API_BASE = import.meta.env.VITE_API_URL || "https://kewi.ps";
const BRANDS_API = `${API_BASE}/admin/brands`;

export type Brand = {
    _id: string;
    name: string;
    image?: string;
    isFake?: boolean;
    numOfClicks?: number;
};

type EditBrandDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    brand: Brand;
    onUpdated?: () => void;
};

export const EditBrandDialog: React.FC<EditBrandDialogProps> = ({
                                                                    open,
                                                                    onOpenChange,
                                                                    brand,
                                                                    onUpdated,
                                                                }) => {
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        name: brand.name || "",
        image: brand.image || "",
        isFake: brand.isFake ?? false,
    });

    const [preview, setPreview] = useState<string | null>(brand.image || null);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Sync when brand changes
    useEffect(() => {
        setFormData({
            name: brand.name || "",
            image: brand.image || "",
            isFake: brand.isFake ?? false,
        });
        setPreview(brand.image || null);
    }, [brand]);

    const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);

            const compressed = await imageCompression(file, {
                maxSizeMB: 1,
                maxWidthOrHeight: 1024,
                useWebWorker: true,
            });

            const storageRef = ref(
                storage,
                `brand_images/${Date.now()}-${compressed.name}`
            );
            const uploadTask = uploadBytesResumable(storageRef, compressed);

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

            setFormData((prev) => ({ ...prev, image: downloadURL }));
            setPreview(downloadURL);
        } catch (err) {
            console.error(err);
            toast({
                title: "Error",
                description: "Error uploading image",
                variant: "destructive",
            });
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast({
                title: "Validation Error",
                description: "Brand name is required",
                variant: "destructive",
            });
            return;
        }

        try {
            setSaving(true);

            const payload = {
                name: formData.name.trim(),
                image: formData.image,
                isFake: formData.isFake,
            };

            const res = await fetch(`${BRANDS_API}/${brand._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to update brand");
            }

            toast({
                title: "Updated",
                description: "Brand updated successfully",
            });

            onUpdated?.();
            onOpenChange(false);
        } catch (err: any) {
            console.error(err);
            toast({
                title: "Error",
                description: err.message || "Error updating brand",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(o) => !saving && onOpenChange(o)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Brand</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="edit-brand-name">Brand Name *</Label>
                        <Input
                            id="edit-brand-name"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                            required
                        />
                    </div>

                    {/* Image */}
                    <div className="space-y-2">
                        <Label>Brand Image</Label>
                        {preview ? (
                            <div className="relative w-32 h-32">
                                <img
                                    src={preview}
                                    alt="Brand"
                                    className="w-full h-full object-cover rounded-lg border"
                                />
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute -top-2 -right-2 h-6 w-6"
                                    onClick={() => {
                                        setPreview(null);
                                        setFormData((prev) => ({ ...prev, image: "" }));
                                    }}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                    <ImageIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-500">
                                        Upload a brand logo (optional)
                                    </p>
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    id="edit-brand-image-upload"
                                    className="hidden"
                                />
                                <label
                                    htmlFor="edit-brand-image-upload"
                                    className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    <Upload className="h-4 w-4 mr-2" />
                                    {uploading ? "Uploading..." : "Choose Image"}
                                </label>
                            </div>
                        )}

                        {/* Manual URL override */}
                        <Input
                            placeholder="Or paste image URL..."
                            value={formData.image}
                            onChange={(e) => {
                                setFormData({ ...formData, image: e.target.value });
                                setPreview(e.target.value || null);
                            }}
                        />
                    </div>

                    {/* Fake flag */}
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="edit-isFake"
                            checked={formData.isFake}
                            onCheckedChange={(checked) =>
                                setFormData({ ...formData, isFake: checked as boolean })
                            }
                        />
                        <Label htmlFor="edit-isFake">Is Fake Brand</Label>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={uploading || saving}>
                            {saving ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
