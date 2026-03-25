// src/components/admin/AddBrandDialog.tsx

import { useState, FormEvent, ChangeEvent } from "react";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Upload, Image as ImageIcon, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import imageCompression from "browser-image-compression";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/firebase";

const API_BASE = import.meta.env.VITE_ENV || "https://kewi.ps";
const BRANDS_API = `${API_BASE}/admin/api/brands`;

type AddBrandDialogProps = {
  onBrandCreated?: () => void;
};

export const AddBrandDialog: React.FC<AddBrandDialogProps> = ({onBrandCreated,}) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    name: "",
    image: "", // Firebase URL
    isFake: false,
  });

  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const resetForm = () => {
    setFormData({
      name: "",
      image: "",
      isFake: false,
    });
    setPreview(null);
  };

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
      const payload = {
        name: formData.name.trim(),
        image: formData.image, // URL (may be empty)
        isFake: formData.isFake,
      };

      const res = await fetch(BRANDS_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create brand");
      }

      toast({
        title: "Success",
        description: "Brand created successfully",
      });

      onBrandCreated?.();
      resetForm();
      setOpen(false);
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error",
        description: err.message || "Error creating brand",
        variant: "destructive",
      });
    }
  };

  return (
      <Dialog open={open} onOpenChange={(o) => !uploading && setOpen(o)}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Brand
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Brand</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="brand-name">Brand Name *</Label>
              <Input
                  id="brand-name"
                  value={formData.name}
                  onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                  }
                  required
              />
            </div>

            {/* Image uploader */}
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
                        id="brand-image-upload"
                        className="hidden"
                    />
                    <label
                        htmlFor="brand-image-upload"
                        className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {uploading ? "Uploading..." : "Choose Image"}
                    </label>
                  </div>
              )}

              {/* Optional manual URL input */}
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
                  id="isFake"
                  checked={formData.isFake}
                  onCheckedChange={(checked) =>
                      setFormData({ ...formData, isFake: checked as boolean })
                  }
              />
              <Label htmlFor="isFake">Is Fake Brand</Label>
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
              <Button type="submit" disabled={uploading}>
                {uploading ? "Saving..." : "Create Brand"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
  );
};
