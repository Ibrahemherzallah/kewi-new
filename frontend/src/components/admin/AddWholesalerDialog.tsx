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
import { Plus, ChevronsUpDown, Check } from "lucide-react";
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

export const AddWholesalerDialog = () => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [nameSearch, setNameSearch] = useState("");
  const [formData, setFormData] = useState({
    userName: "",
    password: "",
    phone: "",
    address: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [namePopoverOpen, setNamePopoverOpen] = useState(false);

  // 🔹 Fetch existing users to get all usernames
  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["admin-users-for-wholesaler"],
    queryFn: async () => {
      const res = await fetch("https://kewi.ps/admin/api/wholesalers");
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });

  // Unique username options
  const nameOptions: string[] = Array.from(
      new Set(
          users
              .map((u: any) => u.userName)
              .filter((name: any) => typeof name === "string" && name.trim() !== "")
      )
  );

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

    try {
      setSubmitting(true);

      const res = await fetch("https://kewi.ps/admin/api/wholesalers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
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

      setFormData({
        userName: "",
        password: "",
        phone: "",
        address: "",
      });
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

  const normalized = (s: string) => s.trim().toLowerCase();

  const filteredNameOptions = nameOptions.filter((n) =>
      normalized(n).includes(normalized(nameSearch))
  );

  const canCreateNew =
      nameSearch.trim().length > 0 &&
      !nameOptions.some((n) => normalized(n) === normalized(nameSearch));

  return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Wholesaler
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Wholesaler</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 🔻 Username Combobox with Search */}
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
                    <CommandInput placeholder="Search or type a new username..." value={nameSearch} onValueChange={setNameSearch}/>
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
                                  setNameSearch(""); // optional: clear
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

              {/* Optional: allow manual override with a hidden Input if you want:
            <Input
              id="userName"
              className="mt-2"
              value={formData.userName}
              onChange={(e) =>
                setFormData({ ...formData, userName: e.target.value })
              }
              placeholder="Or type a new username"
            />
            */}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  minLength={8}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                  }
                  required
                  minLength={10}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                  }
              />
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
