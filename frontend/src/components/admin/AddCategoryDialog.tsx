// src/components/admin/AddCategoryDialog.tsx

import { useState, ChangeEvent, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageIcon, Upload } from "lucide-react";

import imageCompression from "browser-image-compression";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/firebase.ts";



type AddCategoryDialogProps = {
  onCategoryCreated?: () => void;
};

export const AddCategoryDialog: React.FC<AddCategoryDialogProps> = ({onCategoryCreated,}) => {
  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [other, setOther] = useState(false);
  const token = localStorage.getItem("token");

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setName("");
    setDescription("");
    setOther(false);
    setImagePreview(null);
    setImageUrl(null);
    setError(null);
  };

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError(null);

      // compress in browser
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(file, options);

      // preview
      const preview = URL.createObjectURL(compressedFile);
      setImagePreview(preview);

      // upload to Firebase
      const fileRef = ref(
          storage,
          `category_images/${Date.now()}-${compressedFile.name}`
      );
      const uploadTask = uploadBytesResumable(fileRef, compressedFile);

      const downloadURL: string = await new Promise((resolve, reject) => {
        uploadTask.on(
            "state_changed",
            () => {},
            (err) => reject(err),
            async () => {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(url);
            }
        );
      });

      setImageUrl(downloadURL);
    } catch (err) {
      console.error(err);
      setError("حدث خطأ أثناء رفع الصورة");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (!name.trim()) {
        setError("اسم التصنيف مطلوب");
        setSaving(false);
        return;
      }

      const body = {
        name: name.trim(),
        description: description.trim(),
        other,
        image: imageUrl || "", // 🔴 here we send the Firebase URL to BE
      };

      const res = await fetch(`${import.meta.env.VITE_ENV}/admin/api/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "فشل في إنشاء التصنيف");
      }

      onCategoryCreated?.(); // refresh table in AdminCategories

      resetForm();
      setOpen(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "حدث خطأ أثناء حفظ التصنيف");
    } finally {
      setSaving(false);
    }
  };

  return (
      <Dialog open={open} onOpenChange={(o) => !saving && setOpen(o)}>
        <DialogTrigger asChild>
          <Button>إضافة تصنيف</Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>إضافة تصنيف جديد</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="category-name">اسم التصنيف</Label>
              <Input
                  id="category-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: الفواكه"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="category-description">الوصف</Label>
              <Textarea
                  id="category-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="وصف قصير عن التصنيف"
              />
            </div>

            {/* Image upload */}
            <div className="space-y-2">
              <Label>صورة التصنيف</Label>
              <div className="space-y-3">
                {imagePreview ? (
                    <div className="relative w-full h-40 border rounded-md overflow-hidden flex items-center justify-center bg-muted">
                      <img
                          src={imagePreview}
                          alt="Category preview"
                          className="w-full h-full object-cover"
                      />
                    </div>
                ) : (
                    <div className="border-2 border-dashed border-muted rounded-md p-4 text-center text-sm text-muted-foreground flex flex-col items-center justify-center">
                      <ImageIcon className="h-8 w-8 mb-2" />
                      لا توجد صورة محددة
                    </div>
                )}

                <div className="flex items-center gap-3">
                  <input
                      id="category-image-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                  />
                  <label
                      htmlFor="category-image-input"
                      className="cursor-pointer inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium hover:bg-accent"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? "جاري الرفع..." : "اختيار صورة"}
                  </label>
                </div>
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <DialogFooter>
              <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (!saving) {
                      resetForm();
                      setOpen(false);
                    }
                  }}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={saving || uploading}>
                {saving ? "جاري الحفظ..." : "حفظ"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
  );
};
