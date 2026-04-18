import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Plus, Search, Edit, UserX, Shield, User } from "lucide-react";
import { getUsers, deactivateUser } from "../lib/api";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "../components/ui/alert-dialog";
import { TablePagination } from "../components/TablePagination";

type UserRow = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "staff";
  is_active: boolean;
  last_login_at: string | null;
};

const PAGE_SIZE = 10;

export function Pengguna() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deactivatingId, setDeactivatingId] = useState<number | null>(null);
  const [pendingDeactivateUser, setPendingDeactivateUser] = useState<{ id: number; name: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let active = true;
    setLoading(true);

    getUsers(search.trim() ? { search: search.trim() } : undefined)
      .then((response) => {
        if (!active) return;
        setRows(response.data);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const handleDeactivate = async (userId: number) => {
    try {
      setDeactivatingId(userId);
      await deactivateUser(userId);
      toast.success("Pengguna berhasil dinonaktifkan!");

      const response = await getUsers(search.trim() ? { search: search.trim() } : undefined);
      setRows(response.data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menonaktifkan pengguna");
    } finally {
      setDeactivatingId(null);
    }
  };

  const stats = useMemo(
    () => ({
      total: rows.length,
      admin: rows.filter((item) => item.role === "admin").length,
      staff: rows.filter((item) => item.role === "staff").length,
    }),
    [rows],
  );

  const getRoleIcon = (role: "admin" | "staff") => {
    return role === "admin" ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />;
  };

  const totalUserPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalUserPages);

  const paginatedRows = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;
    return rows.slice(startIndex, startIndex + PAGE_SIZE);
  }, [rows, safeCurrentPage]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Pengguna</h1>
          <p className="text-gray-500 mt-1">Kelola pengguna dan hak akses sistem</p>
        </div>
        <Button className="gap-2 bg-[#1F6B7A] hover:bg-[#176059]" onClick={() => navigate("/pengguna/tambah")}>
          <Plus className="w-4 h-4" />
          Tambah Pengguna
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Pengguna</p>
                <h3 className="text-3xl font-bold text-gray-900">{loading ? "..." : stats.total}</h3>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl">
                <User className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Admin</p>
                <h3 className="text-3xl font-bold text-gray-900">{loading ? "..." : stats.admin}</h3>
              </div>
              <div className="bg-purple-50 p-4 rounded-xl">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Marketing Staff</p>
                <h3 className="text-3xl font-bold text-gray-900">{loading ? "..." : stats.staff}</h3>
              </div>
              <div className="bg-green-50 p-4 rounded-xl">
                <User className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Cari nama atau email pengguna..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-gray-500">
                      Memuat data pengguna...
                    </TableCell>
                  </TableRow>
                ) : null}

                {!loading
                  ? paginatedRows.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell className="text-gray-600">{user.email}</TableCell>
                        <TableCell>
                          <Badge className={user.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"} variant="secondary">
                            <span className="flex items-center gap-1">
                              {getRoleIcon(user.role)}
                              {user.role === "admin" ? "Admin" : "Marketing Staff"}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={user.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"} variant="secondary">
                            {user.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-600">{user.last_login_at ?? "-"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => navigate(`/pengguna/${user.id}/edit`)}>
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            {user.is_active ? (
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => setPendingDeactivateUser({ id: user.id, name: user.name })}>
                                <UserX className="w-4 h-4 mr-1" />
                                Deactivate
                              </Button>
                            ) : null}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  : null}

                {!loading && rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-gray-500">
                      Tidak ada data pengguna.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>

          <TablePagination currentPage={safeCurrentPage} totalItems={rows.length} pageSize={PAGE_SIZE} itemLabel="pengguna" onPageChange={setCurrentPage} />
        </CardContent>
      </Card>

      <AlertDialog open={!!pendingDeactivateUser} onOpenChange={(open) => !open && setPendingDeactivateUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Nonaktifkan</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDeactivateUser ? `Apakah Anda yakin ingin menonaktifkan pengguna "${pendingDeactivateUser.name}"? Pengguna ini tidak akan bisa login lagi.` : "Apakah Anda yakin ingin menonaktifkan pengguna ini?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel onClick={() => setPendingDeactivateUser(null)}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!pendingDeactivateUser) return;
                handleDeactivate(pendingDeactivateUser.id);
                setPendingDeactivateUser(null);
              }}
              className="bg-red-600 hover:bg-red-700"
              disabled={deactivatingId === pendingDeactivateUser?.id}
            >
              {pendingDeactivateUser && deactivatingId === pendingDeactivateUser.id ? "Menonaktifkan..." : "Nonaktifkan"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
