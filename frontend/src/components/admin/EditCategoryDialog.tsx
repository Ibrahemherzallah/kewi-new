import { useEffect, useState, ChangeEvent } from "react";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, ImageIcon } from "lucide-react";

import imageCompression from "browser-image-compression";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/firebase.ts";

const API_BASE = import.meta.env.VITE_ENV
    ? `${import.meta.env.VITE_ENV}/admin/api/categories`
    : `https://kewi.ps/admin/api/categories`;

export const EditCategoryDialog = ({open, setOpen, category, onUpdated,}: {
    open: boolean;
    setOpen: (val: boolean) => void;
    category: any;
    onUpdated: () => void;
}) => {
    const [name, setName] = useState(category?.name || "");
    const [description, setDescription] = useState(category?.description || "");
    const [other, setOther] = useState(category?.other || false);
    const [imagePreview, setImagePreview] = useState<string | null>(category?.image || null);
    const [imageUrl, setImageUrl] = useState<string | null>(category?.image || null);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (category) {
            setName(category.name);
            setDescription(category.description);
            setOther(category.other);
            setImagePreview(category.image);
            setImageUrl(category.image);
        }
    }, [category]);

    const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);

            const compressed = await imageCompression(file, {
                maxSizeMB: 1,
                maxWidthOrHeight: 1024,
            });

            const preview = URL.createObjectURL(compressed);
            setImagePreview(preview);

            const fileRef = ref(storage, `category_images/${Date.now()}-${compressed.name}`);
            const uploadTask = uploadBytesResumable(fileRef, compressed);

            const downloadURL: string = await new Promise((resolve, reject) => {
                uploadTask.on(
                    "state_changed",
                    () => {},
                    reject,
                    async () => resolve(await getDownloadURL(uploadTask.snapshot.ref))
                );
            });

            setImageUrl(downloadURL);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async () => {
        setSaving(true);

        try {
            const body = {
                name,
                description,
                other,
                image: imageUrl,
            };

            const res = await fetch(`${API_BASE}/${category._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });

            if (!res.ok) throw new Error("Update failed");

            onUpdated();
            setOpen(false);
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(o) => !saving && setOpen(o)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>تعديل التصنيف</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <Label>الاسم</Label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} />
                    </div>

                    <div>
                        <Label>الوصف</Label>
                        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>

                    {/* Image */}
                    <div className="space-y-2">
                        <Label>الصورة</Label>
                        <div className="space-y-3">
                            {imagePreview ? (
                                <img src={imagePreview} className="h-32 w-full object-cover rounded-md border" />
                            ) : (
                                <div className="flex items-center justify-center h-32 border rounded-md">
                                    <ImageIcon className="h-10 w-10 text-muted-foreground" />
                                </div>
                            )}

                            <input id="edit-cat-img" type="file" className="hidden" onChange={handleImageChange} />
                            <label
                                htmlFor="edit-cat-img"
                                className="cursor-pointer flex items-center gap-2 px-4 py-2 border rounded-md"
                            >
                                <Upload className="h-4 w-4" />
                                {uploading ? "جاري الرفع..." : "تغيير الصورة"}
                            </label>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <input type="checkbox" checked={other} onChange={(e) => setOther(e.target.checked)} />
                        <Label>تصنيف "أخرى"</Label>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)}>
                            إلغاء
                        </Button>
                        <Button disabled={saving || uploading} onClick={handleSubmit}>
                            {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
};
