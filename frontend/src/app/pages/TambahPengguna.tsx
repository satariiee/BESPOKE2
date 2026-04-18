import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { toast } from "sonner";
import { createUser, updateUser, getUserById, deleteUser } from "../lib/api";
import { Mail, Phone, Lock, Shield, Save, X, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../components/ui/alert-dialog";

export function TambahPengguna() {
  const navigate = useNavigate();
  const { id: userId } = useParams();
  const isEditMode = !!userId;
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"admin" | "staff">("staff");

  useEffect(() => {
    if (isEditMode) {
      loadData();
    }
  }, [userId]);

  async function loadData() {
    try {
      if (!userId) return;
      const result = await getUserById(parseInt(userId));
      const data = result.data;

      setName(data.name);
      setEmail(data.email);
      setPhone(data.phone || "");
      setRole(data.role);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal memuat data pengguna");
      navigate("/pengguna");
    } finally {
      setLoading(false);
    }
  }

  const handleSimpan = async () => {
    // Validate required fields
    if (!name.trim()) {
      toast.error("Nama harus diisi");
      return;
    }
    if (!email.trim()) {
      toast.error("Email harus diisi");
      return;
    }

    if (!isEditMode) {
      if (!password.trim()) {
        toast.error("Password harus diisi");
        return;
      }
      if (password !== confirmPassword) {
        toast.error("Password tidak cocok");
        return;
      }
    } else if (password.trim() && password !== confirmPassword) {
      toast.error("Password tidak cocok");
      return;
    }

    try {
      setSaving(true);

      if (isEditMode) {
        const payload: any = {
          name,
          email,
          role,
        };
        if (phone) payload.phone = phone;
        if (password) payload.password = password;

        await updateUser(parseInt(userId!), payload);
        toast.success("Data pengguna berhasil diperbarui!");
      } else {
        await createUser({
          name,
          email,
          phone: phone || undefined,
          password,
          role: "staff",
        });
        toast.success("Pengguna berhasil ditambahkan!");
      }

      setTimeout(() => {
        navigate("/pengguna");
      }, 1000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan data");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteUser(parseInt(userId!));
      toast.success("Pengguna berhasil dihapus!");
      setTimeout(() => {
        navigate("/pengguna");
      }, 1000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menghapus pengguna");
    } finally {
      setDeleting(false);
    }
  };

  const handleBatal = () => {
    navigate("/pengguna");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Memuat...</h1>
        </div>
        <div className="text-center py-12">
          <p className="text-gray-500">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{isEditMode ? "Edit Pengguna" : "Tambah Pengguna"}</h1>
          <p className="text-gray-500 mt-1">{isEditMode ? "Ubah data pengguna" : "Tambahkan pengguna baru ke sistem"}</p>
        </div>
        <div className="flex gap-3">
          {isEditMode && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50" disabled={deleting}>
                  <Trash2 className="w-4 h-4" />
                  Hapus
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                  <AlertDialogDescription>Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex gap-3 justify-end">
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                    Hapus
                  </AlertDialogAction>
                </div>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button variant="outline" className="gap-2" onClick={handleBatal}>
            <X className="w-4 h-4" />
            Batal
          </Button>
          <Button className="gap-2 bg-[#1F6B7A] hover:bg-[#176059]" onClick={handleSimpan} disabled={saving}>
            <Save className="w-4 h-4" />
            {saving ? "Menyimpan..." : isEditMode ? "Simpan Perubahan" : "Tambah Pengguna"}
          </Button>
        </div>
      </div>

      {/* Required Field Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <span className="text-red-500 font-bold">*</span> Menandakan field yang wajib diisi
        </p>
      </div>

      {/* Form */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Informasi Pengguna</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Nama Lengkap <span className="text-red-500">*</span>
              </Label>
              <Input id="name" placeholder="Masukkan nama lengkap" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input id="email" type="email" placeholder="email@example.com" className="pl-10" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Nomor Telepon</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input id="phone" placeholder="0812-3456-7890" className="pl-10" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="role">
                Role <span className="text-red-500">*</span>
              </Label>
              <Select value={role} onValueChange={(value) => setRole(value as "admin" | "staff")} disabled={!isEditMode}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Pilih role" />
                </SelectTrigger>
                <SelectContent>
                  {isEditMode ? <SelectItem value="admin">Admin</SelectItem> : null}
                  <SelectItem value="staff">Marketing Staff</SelectItem>
                </SelectContent>
              </Select>
              {!isEditMode ? <p className="text-xs text-gray-500">Admin hanya dapat membuat akun staff.</p> : null}
            </div>
          </div>

          {/* Password Section */}
          <div className="border-t pt-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Password
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="password">
                  {isEditMode ? "Password Baru (kosongkan jika tidak ingin mengubah)" : "Password"} <span className={!isEditMode ? "text-red-500" : ""}>*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input id="password" type="password" placeholder="Masukkan password" className="pl-10" value={password} onChange={(e) => setPassword(e.target.value)} required={!isEditMode} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  Konfirmasi Password <span className={!isEditMode ? "text-red-500" : ""}>*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input id="confirmPassword" type="password" placeholder="Konfirmasi password" className="pl-10" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required={!isEditMode} />
                </div>
              </div>
            </div>
            {isEditMode && <p className="text-sm text-gray-500 mt-2">Kosongkan field password jika Anda tidak ingin mengubah password pengguna ini.</p>}
          </div>
        </CardContent>
      </Card>

      {/* Bottom Action Buttons */}
      <div className="flex justify-end gap-3 pb-6">
        <Button variant="outline" className="gap-2" onClick={handleBatal}>
          <X className="w-4 h-4" />
          Batal
        </Button>
        <Button className="gap-2 bg-[#1F6B7A] hover:bg-[#176059]" onClick={handleSimpan} disabled={saving}>
          <Save className="w-4 h-4" />
          {saving ? "Menyimpan..." : isEditMode ? "Simpan Perubahan" : "Tambah Pengguna"}
        </Button>
      </div>
    </div>
  );
}
