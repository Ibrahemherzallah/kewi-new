import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const AddProductDialog = () => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    image: "",
    description: "",
    categoryId: "",
    brandId: "",
    stockNumber: "",
    gender: "",
    color: "",
    size: "",
    customerPrice: "",
    wholesalerPrice: "",
    salePrice: "",
    isSoldOut: false,
    isOnSale: false,
    isSoon: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.image || !formData.categoryId || !formData.stockNumber || !formData.customerPrice || !formData.wholesalerPrice) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    // In a real app, this would call an API
    console.log("Creating product:", formData);
    
    toast({
      title: "Success",
      description: "Product created successfully",
    });
    
    setOpen(false);
    setFormData({
      name: "",
      image: "",
      description: "",
      categoryId: "",
      brandId: "",
      stockNumber: "",
      gender: "",
      color: "",
      size: "",
      customerPrice: "",
      wholesalerPrice: "",
      salePrice: "",
      isSoldOut: false,
      isOnSale: false,
      isSoon: false,
    });
  };

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
              <Label htmlFor="image">Image URL *</Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="categoryId">Category *</Label>
              <Input
                id="categoryId"
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brandId">Brand</Label>
              <Input
                id="brandId"
                value={formData.brandId}
                onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stockNumber">Stock Number *</Label>
              <Input
                id="stockNumber"
                type="number"
                value={formData.stockNumber}
                onChange={(e) => setFormData({ ...formData, stockNumber: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="نسائي">نسائي</SelectItem>
                  <SelectItem value="رجالي">رجالي</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="size">Size</Label>
              <Select value={formData.size} onValueChange={(value) => setFormData({ ...formData, size: value })}>
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
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerPrice">Customer Price *</Label>
              <Input
                id="customerPrice"
                type="number"
                step="0.01"
                value={formData.customerPrice}
                onChange={(e) => setFormData({ ...formData, customerPrice: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, wholesalerPrice: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isSoldOut"
                checked={formData.isSoldOut}
                onCheckedChange={(checked) => setFormData({ ...formData, isSoldOut: checked as boolean })}
              />
              <Label htmlFor="isSoldOut">Sold Out</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isOnSale"
                checked={formData.isOnSale}
                onCheckedChange={(checked) => setFormData({ ...formData, isOnSale: checked as boolean })}
              />
              <Label htmlFor="isOnSale">On Sale</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isSoon"
                checked={formData.isSoon}
                onCheckedChange={(checked) => setFormData({ ...formData, isSoon: checked as boolean })}
              />
              <Label htmlFor="isSoon">Coming Soon</Label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Product</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
