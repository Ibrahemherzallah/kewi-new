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
import { useQueryClient } from "@tanstack/react-query";

interface Wholesaler {
    _id: string;
    userName: string;
    phone: string;
    address?: string;
    isWholesaler?: boolean;
}

interface EditWholesalerDialogProps {
    wholesaler: Wholesaler;
}

export const EditWholesalerDialog = ({wholesaler,}: EditWholesalerDialogProps) => {
    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
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

    useEffect(() => {
        if (open) {
            setFormData({
                userName: wholesaler.userName || "",
                password: "",
                phone: wholesaler.phone || "",
                address: wholesaler.address || "",
                isWholesaler: wholesaler.isWholesaler ?? true,
            });
        }
    }, [open, wholesaler]);

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

        try {
            setSubmitting(true);

            const payload: any = {
                userName: formData.userName,
                phone: formData.phone,
                address: formData.address,
                isWholesaler: formData.isWholesaler,
            };

            // only send password if user entered a new one
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

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Wholesaler</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-userName">Username *</Label>
                        <Input
                            id="edit-userName"
                            value={formData.userName}
                            onChange={(e) =>
                                setFormData({ ...formData, userName: e.target.value })
                            }
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-password">New Password</Label>
                        <Input
                            id="edit-password"
                            type="password"
                            value={formData.password}
                            onChange={(e) =>
                                setFormData({ ...formData, password: e.target.value })
                            }
                            placeholder="Leave empty to keep current password"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-phone">Phone *</Label>
                        <Input
                            id="edit-phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) =>
                                setFormData({ ...formData, phone: e.target.value })
                            }
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-address">Address</Label>
                        <Input
                            id="edit-address"
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
                            {submitting ? "Updating..." : "Update Wholesaler"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};