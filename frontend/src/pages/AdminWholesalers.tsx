import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Building2, User2 } from "lucide-react";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";
import { AddWholesalerDialog } from "@/components/admin/AddWholesalerDialog";
import { EditWholesalerDialog } from "@/components/admin/EditWholesalerDialog";
import { useToast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";
// Check if DOB matches today's date
const isBirthdayToday = (dob?: string) => {
  if (!dob) return false;
  const d = new Date(dob);
  if (isNaN(d.getTime())) return false;
  const today = new Date();
  return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth()
  );
};

const AdminWholesaler = () => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"users" | "wholesalers">("users");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const token = localStorage.getItem("token");

  // Fetch USERS
  const { data: usersData = [], isLoading: loadingUsers, error } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const token = localStorage.getItem("token");

      const res = await fetch(`${import.meta.env.VITE_ENV}/admin/api/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch users");
      }

      return Array.isArray(data) ? data : [];
    },
  });

  // Fetch WHOLESALERS
  const { data: wholesalersData = [], isLoading: loadingWholesalers } = useQuery({
    queryKey: ["admin-wholesalers"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_ENV}/admin/api/wholesalers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });

  // Any user birthday today?
  const hasBirthdayToday = usersData.some((u) => isBirthdayToday(u.dob));

  // Filter
  const filteredUsers = usersData.filter(
      (u: any) =>
          (u.userName || "").toLowerCase().includes(search.toLowerCase()) ||
          (u.phone || "").toLowerCase().includes(search.toLowerCase()) ||
          (u.email || "").toLowerCase().includes(search.toLowerCase())
  );

  const filteredWholesalers = wholesalersData.filter(
      (w: any) =>
          (w.userName || w.name || "")
              .toLowerCase()
              .includes(search.toLowerCase()) ||
          (w.phone || "").toLowerCase().includes(search.toLowerCase())
  );

  const tableData = activeTab === "users" ? filteredUsers : filteredWholesalers;

  const isLoading = loadingUsers || loadingWholesalers;


  const handleDelete = async (id: string, type: "user" | "wholesaler", name: string) => {
    const confirmed = window.confirm(
        `Are you sure you want to delete this ${type}: ${name}?`
    );

    if (!confirmed) return;

    try {
      const endpoint =
          type === "user"
              ? `${import.meta.env.VITE_ENV}/admin/api/users/${id}`
              : `${import.meta.env.VITE_ENV}/admin/api/wholesalers/${id}`;

      const res = await fetch(endpoint, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Failed to delete ${type}`);
      }

      toast({
        title: "Success",
        description: `${type === "user" ? "User" : "Wholesaler"} deleted successfully`,
      });

      if (type === "user") {
        await queryClient.invalidateQueries({queryKey: ["admin-users"]});
      } else {
        await queryClient.invalidateQueries({queryKey: ["admin-wholesalers"]});
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to delete ${type}`,
        variant: "destructive",
      });
    }
  };



  return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/admin">
                <Button variant="outline" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-4xl font-bold mb-2">Users & Wholesalers</h1>
                <p className="text-muted-foreground">
                  Manage all users and wholesale accounts
                </p>
              </div>
            </div>

            {activeTab === "wholesalers" && <AddWholesalerDialog />}
          </div>

          {/* TABS */}
          <div className="mb-6 flex items-center gap-2 border-b border-border">
            <button
                onClick={() => setActiveTab("users")}
                className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px flex items-center gap-2 ${
                    activeTab === "users"
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
            >
              <User2 className="h-4 w-4" />
              Users
              {hasBirthdayToday && (
                  <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500 text-white">
                    🎂 Birthday Today
                  </span>
              )}
            </button>

            <button
                onClick={() => setActiveTab("wholesalers")}
                className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px flex items-center gap-2 ${
                    activeTab === "wholesalers"
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
            >
              <Building2 className="h-4 w-4" />
              Wholesalers
            </button>
          </div>

          {/* MAIN CARD */}
          <Card className="p-6">
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                    placeholder={
                      activeTab === "users"
                          ? "Search users..."
                          : "Search wholesalers..."
                    }
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                />
              </div>
            </div>

            {/* Loading */}
            {isLoading && <p>Loading...</p>}

            {/* Table */}
            {!isLoading && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Address</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      {activeTab === "users" && <TableHead>Date of Birth</TableHead>}
                      <TableHead>Total Orders</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tableData.map((item: any) => {
                      const isBirthday = activeTab === "users" && isBirthdayToday(item.dob);

                      return (
                          <TableRow key={item._id}>
                            <TableCell>{item.address}</TableCell>

                            <TableCell className="font-medium flex items-center gap-2">
                              {activeTab === "users" ? (
                                  <User2 className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                  <Building2 className="h-4 w-4 text-muted-foreground" />
                              )}
                              {item.userName || item.name}
                            </TableCell>

                            <TableCell>{item.phone}</TableCell>

                            {activeTab === "users" && (
                                <TableCell className="flex items-center gap-2">
                                  {item.dob
                                      ? new Date(item.dob).toLocaleDateString()
                                      : "-"}
                                  {isBirthday && (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500 text-white">
                                        🎂 Today
                                      </span>
                                  )}
                                </TableCell>
                            )}

                            <TableCell>
                              {item.orderHistory.length > 0 ? item.orderHistory.length : 0}
                            </TableCell>

                            <TableCell>
                              <span
                                  className={`px-2 py-1 rounded-full text-xs ${
                                      item.status === "Active"
                                          ? "bg-primary/10 text-primary"
                                          : "bg-muted text-muted-foreground"
                                  }`}
                              >
                                {item.status || "Active"}
                              </span>
                            </TableCell>

                            <TableCell>
                              <div className="flex items-center gap-2">
                                {activeTab === "wholesalers" && (
                                    <EditWholesalerDialog wholesaler={item} />
                                )}

                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() =>
                                        handleDelete(
                                            item._id,
                                            activeTab === "users" ? "user" : "wholesaler",
                                            item.userName || item.name || "Unknown"
                                        )
                                    }
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
            )}
          </Card>
        </div>
      </div>
  );
};

export default AdminWholesaler;
