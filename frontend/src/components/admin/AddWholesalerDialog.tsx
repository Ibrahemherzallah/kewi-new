import { useState } from "react";
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
import { Plus, ChevronsUpDown, Check, X } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

export const AddWholesalerDialog = () => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [nameSearch, setNameSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [categoryPopoverOpen, setCategoryPopoverOpen] = useState(false);
  const [allCategories, setAllCategories] = useState(true); // toggle: all or specific
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  const token = localStorage.getItem("token");
  const [formData, setFormData] = useState({
    userName: "",
    password: "",
    phone: "",
    address: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [namePopoverOpen, setNamePopoverOpen] = useState(false);

  // Fetch existing wholesalers for username suggestions
  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["admin-users-for-wholesaler"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_ENV}/admin/api/wholesalers`);
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });

  // Fetch categories
  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_ENV}/admin/api/categories`);
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });

  const nameOptions: string[] = Array.from(
      new Set(
          users
              .map((u: any) => u.userName)
              .filter((name: any) => typeof name === "string" && name.trim() !== "")
      )
  );

  const normalized = (s: string) => s.trim().toLowerCase();

  const filteredNameOptions = nameOptions.filter((n) =>
      normalized(n).includes(normalized(nameSearch))
  );

  const filteredCategories = categories.filter((c: any) =>
      normalized(c.name).includes(normalized(categorySearch))
  );

  const canCreateNew =
      nameSearch.trim().length > 0 &&
      !nameOptions.some((n) => normalized(n) === normalized(nameSearch));

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

    if (!formData.userName || !formData.password || !formData.phone) {
      toast({
        title: "Validation Error",
        description: "Username, password, and phone are required",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 8) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 8 characters long",
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

    if (!allCategories && selectedCategoryIds.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one category or choose All Categories",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        ...formData,
        // if allCategories → send empty array (backend treats [] as "all")
        // or send all category IDs — your choice, adjust to match your backend
        wholesalerCategories: allCategories
            ? categories.map((c: any) => c._id)
            : selectedCategoryIds,
      };

      const res = await fetch(`${import.meta.env.VITE_ENV}/admin/api/wholesalers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data.error || data.message || "Failed to create wholesaler";
        throw new Error(msg);
      }

      toast({
        title: "Success",
        description: "Wholesaler created successfully",
      });

      setFormData({ userName: "", password: "", phone: "", address: "" });
      setSelectedCategoryIds([]);
      setAllCategories(true);
      setOpen(false);

      queryClient.invalidateQueries({ queryKey: ["admin-wholesalers"] });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to create wholesaler",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Wholesaler
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Wholesaler</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Username Combobox */}
            <div className="space-y-2">
              <Label htmlFor="userName">Username *</Label>
              <Popover open={namePopoverOpen} onOpenChange={setNamePopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                      type="button"
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between"
                  >
                    {formData.userName
                        ? formData.userName
                        : loadingUsers
                            ? "Loading usernames..."
                            : "Select username"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[280px] p-0">
                  <Command
                      onKeyDown={(e: any) => {
                        if (e.key === "Enter" && canCreateNew) {
                          e.preventDefault();
                          const newName = nameSearch.trim();
                          setFormData({ ...formData, userName: newName });
                          setNamePopoverOpen(false);
                          setNameSearch("");
                        }
                      }}
                  >
                    <CommandInput
                        placeholder="Search or type a new username..."
                        value={nameSearch}
                        onValueChange={setNameSearch}
                    />
                    <CommandList>
                      <CommandEmpty>No usernames found.</CommandEmpty>
                      <CommandGroup heading="Results">
                        {filteredNameOptions.map((name) => (
                            <CommandItem
                                key={name}
                                value={name}
                                onSelect={(currentValue) => {
                                  setFormData({ ...formData, userName: currentValue });
                                  setNamePopoverOpen(false);
                                  setNameSearch("");
                                }}
                            >
                              <Check
                                  className={cn(
                                      "mr-2 h-4 w-4",
                                      formData.userName === name ? "opacity-100" : "opacity-0"
                                  )}
                              />
                              {name}
                            </CommandItem>
                        ))}
                      </CommandGroup>
                      {canCreateNew && (
                          <CommandGroup heading="Create">
                            <CommandItem
                                value={nameSearch}
                                onSelect={() => {
                                  const newName = nameSearch.trim();
                                  setFormData({ ...formData, userName: newName });
                                  setNamePopoverOpen(false);
                                  setNameSearch("");
                                }}
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Use "{nameSearch.trim()}"
                            </CommandItem>
                          </CommandGroup>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={8}
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  minLength={10}
              />
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                  id="address"
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

              {/* Specific Category Selector — shown only when toggle is off */}
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
                                      onSelect={() => {
                                        toggleCategory(cat._id);
                                      }}
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
                {submitting ? "Creating..." : "Create Wholesaler"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
  );
};
