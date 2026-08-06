import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
    Command,
    CommandInput,
    CommandList,
    CommandItem,
    CommandEmpty,
    CommandGroup,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Wholesaler {
    _id: string;
    userName: string;
    phone: string;
    address?: string;
    isWholesaler?: boolean;
    wholesalerCategories?: string[]; // array of category IDs
}

interface EditWholesalerDialogProps {
    wholesaler: Wholesaler;
}

export const EditWholesalerDialog = ({ wholesaler }: EditWholesalerDialogProps) => {
    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [categorySearch, setCategorySearch] = useState("");
    const [categoryPopoverOpen, setCategoryPopoverOpen] = useState(false);
    const [allCategories, setAllCategories] = useState(true);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

    const { toast } = useToast();
    const queryClient = useQueryClient();
    const token = localStorage.getItem("token");

    const [formData, setFormData] = useState({
        userName: wholesaler.userName || "",
        password: "",
        phone: wholesaler.phone || "",
        address: wholesaler.address || "",
        isWholesaler: wholesaler.isWholesaler ?? true,
    });

    // Fetch all categories
    const { data: categories = [], isLoading: loadingCategories } = useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            const res = await fetch(`${import.meta.env.VITE_ENV}/api/categories`);
            const data = await res.json();
            return Array.isArray(data) ? data : [];
        },
    });

    // When dialog opens, reset form and pre-fill category selections
    useEffect(() => {
        if (open) {
            setFormData({
                userName: wholesaler.userName || "",
                password: "",
                phone: wholesaler.phone || "",
                address: wholesaler.address || "",
                isWholesaler: wholesaler.isWholesaler ?? true,
            });

            const existingCategories = wholesaler.wholesalerCategories ?? [];

            // if no specific categories saved, treat as "all"
            if (existingCategories.length === 0) {
                setAllCategories(true);
                setSelectedCategoryIds([]);
            } else {
                setAllCategories(false);
                setSelectedCategoryIds(existingCategories);
            }
        }
    }, [open, wholesaler]);

    const normalized = (s: string) => s.trim().toLowerCase();

    const filteredCategories = categories.filter((c: any) =>
        normalized(c.name).includes(normalized(categorySearch))
    );

    const toggleCategory = (id: string) => {
        setSelectedCategoryIds((prev) =>
            prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
        );
    };

    const removeCategory = (id: string) => {
        setSelectedCategoryIds((prev) => prev.filter((c) => c !== id));
    };

    const getCategoryName = (id: string) => {
        return categories.find((c: any) => c._id === id)?.name ?? id;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.userName || !formData.phone) {
            toast({
                title: "Validation Error",
                description: "Username and phone are required",
                variant: "destructive",
            });
            return;
        }

        if (formData.phone.length < 10) {
            toast({
                title: "Validation Error",
                description: "Phone number must be at least 10 characters",
                variant: "destructive",
            });
            return;
        }

        if (formData.password && formData.password.length < 8) {
            toast({
                title: "Validation Error",
                description: "Password must be at least 8 characters long",
                variant: "destructive",
            });
            return;
        }

        if (!allCategories && selectedCategoryIds.length === 0) {
            toast({
                title: "Validation Error",
                description: "Please select at least one category or switch to All Categories",
                variant: "destructive",
            });
            return;
        }

        try {
            setSubmitting(true);

            const payload: any = {
                userName: formData.userName,
                phone: formData.phone,
                address: formData.address,
                isWholesaler: formData.isWholesaler,
                wholesalerCategories: allCategories
                    ? categories.map((c: any) => c._id)  // all → send all IDs
                    : selectedCategoryIds,
            };

            if (formData.password.trim()) {
                payload.password = formData.password;
            }

            const res = await fetch(
                `${import.meta.env.VITE_ENV}/admin/api/wholesalers/${wholesaler._id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || data.message || "Failed to update wholesaler");
            }

            toast({
                title: "Success",
                description: "Wholesaler updated successfully",
            });

            queryClient.invalidateQueries({ queryKey: ["admin-wholesalers"] });
            setOpen(false);
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Failed to update wholesaler",
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    Edit
                </Button>
            </DialogTrigger>

            <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Wholesaler</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Username */}
                    <div className="space-y-2">
                        <Label htmlFor="edit-userName">Username *</Label>
                        <Input
                            id="edit-userName"
                            value={formData.userName}
                            onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                        />
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <Label htmlFor="edit-password">New Password</Label>
                        <Input
                            id="edit-password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="Leave empty to keep current password"
                        />
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                        <Label htmlFor="edit-phone">Phone *</Label>
                        <Input
                            id="edit-phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>

                    {/* Address */}
                    <div className="space-y-2">
                        <Label htmlFor="edit-address">Address</Label>
                        <Input
                            id="edit-address"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                    </div>

                    {/* ─── Wholesale Categories ─── */}
                    <div className="space-y-3 rounded-lg border p-4">
                        <Label className="text-sm font-semibold">Wholesale Price Categories</Label>

                        {/* All Categories Toggle */}
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                                Apply wholesale price to all categories
                            </span>
                            <Switch
                                checked={allCategories}
                                onCheckedChange={(val) => {
                                    setAllCategories(val);
                                    if (val) setSelectedCategoryIds([]);
                                }}
                            />
                        </div>

                        {/* Specific Category Selector */}
                        {!allCategories && (
                            <div className="space-y-2">
                                <Popover open={categoryPopoverOpen} onOpenChange={setCategoryPopoverOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            role="combobox"
                                            className="w-full justify-between"
                                        >
                                            {loadingCategories ? "Loading categories..." : "Select categories..."}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[280px] p-0">
                                        <Command>
                                            <CommandInput
                                                placeholder="Search categories..."
                                                value={categorySearch}
                                                onValueChange={setCategorySearch}
                                            />
                                            <CommandList>
                                                <CommandEmpty>No categories found.</CommandEmpty>
                                                <CommandGroup>
                                                    {filteredCategories.map((cat: any) => (
                                                        <CommandItem
                                                            key={cat._id}
                                                            value={cat.name}
                                                            onSelect={() => toggleCategory(cat._id)}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    selectedCategoryIds.includes(cat._id)
                                                                        ? "opacity-100"
                                                                        : "opacity-0"
                                                                )}
                                                            />
                                                            {cat.name}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>

                                {/* Selected category badges */}
                                {selectedCategoryIds.length > 0 && (
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {selectedCategoryIds.map((id) => (
                                            <Badge key={id} variant="secondary" className="flex items-center gap-1">
                                                {getCategoryName(id)}
                                                <X
                                                    className="h-3 w-3 cursor-pointer"
                                                    onClick={() => removeCategory(id)}
                                                />
                                            </Badge>
                                        ))}
                                    </div>
                                )}

                                {selectedCategoryIds.length === 0 && (
                                    <p className="text-xs text-muted-foreground">
                                        No categories selected. Select at least one.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? "Updating..." : "Update Wholesaler"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
