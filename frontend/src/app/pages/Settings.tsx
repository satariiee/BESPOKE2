import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Separator } from "../components/ui/separator";
import { User, Lock, Settings as SettingsIcon, Mail, Phone, Save } from "lucide-react";
import { changePassword, getProfile, updateProfile } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export function Settings() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState<{
    id: number;
    name: string;
    email: string;
    phone: string | null;
    role: "admin" | "staff";
    is_active: boolean;
    last_login_at: string | null;
    created_at: string;
    updated_at: string;
  } | null>(null);
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const syncProfileState = (nextProfile: { id: number; name: string; email: string; phone: string | null; role: "admin" | "staff"; is_active: boolean; last_login_at: string | null; created_at: string; updated_at: string }) => {
    setProfile(nextProfile);
    setProfileForm({
      name: nextProfile.name,
      email: nextProfile.email,
      phone: nextProfile.phone ?? "",
    });
  };

  useEffect(() => {
    let active = true;

    getProfile()
      .then((response) => {
        if (!active) return;
        syncProfileState({
          id: response.data.id,
          name: response.data.name,
          email: response.data.email,
          phone: response.data.phone,
          role: response.data.role,
          is_active: response.data.is_active,
          last_login_at: response.data.last_login_at,
          created_at: "",
          updated_at: "",
        });
      })
      .catch(() => {
        if (!active) return;
        if (user) {
          syncProfileState({
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone ?? null,
            role: user.role,
            is_active: user.is_active,
            last_login_at: user.last_login_at,
            created_at: user.created_at,
            updated_at: user.updated_at,
          });
        }
      });

    return () => {
      active = false;
    };
  }, [user]);

  const roleLabel = useMemo(() => {
    if (!profile) return "-";
    return profile.role === "admin" ? "Admin" : "Staff";
  }, [profile]);

  const handleProfileSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!profile) return;

    setProfileSaving(true);
    setProfileMessage(null);
    setProfileError(null);

    try {
      const response = await updateProfile({
        name: profileForm.name.trim(),
        email: profileForm.email.trim(),
        phone: profileForm.phone.trim(),
      });

      const updated = {
        id: response.data.id,
        name: response.data.name,
        email: response.data.email,
        phone: response.data.phone,
        role: response.data.role,
        is_active: response.data.is_active,
        last_login_at: response.data.last_login_at,
        created_at: user?.created_at ?? "",
        updated_at: user?.updated_at ?? "",
      };

      syncProfileState(updated);
      updateUser(updated);
      setProfileMessage(response.message || "Profil berhasil diperbarui");
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : "Gagal memperbarui profil");
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setPasswordMessage(null);
    setPasswordError(null);

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError("Semua field password wajib diisi");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError("Password baru minimal 8 karakter");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Konfirmasi password tidak sama");
      return;
    }

    setPasswordSaving(true);

    try {
      const response = await changePassword({
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword,
        new_password_confirmation: passwordForm.confirmPassword,
      });

      setPasswordMessage(response.message || "Password berhasil diperbarui");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : "Gagal memperbarui password");
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Kelola preferensi dan konfigurasi sistem</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-3 rounded-lg">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle>Profile Settings</CardTitle>
                <p className="text-sm text-gray-500 mt-1">Update informasi profil Anda</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <form className="space-y-4" onSubmit={handleProfileSubmit}>
              <div className="space-y-2">
                <Label htmlFor="fullName">Nama Lengkap</Label>
                <Input id="fullName" placeholder="Masukkan nama lengkap" value={profileForm.name} onChange={(event) => setProfileForm((prev) => ({ ...prev, name: event.target.value }))} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input id="email" type="email" placeholder="email@example.com" value={profileForm.email} onChange={(event) => setProfileForm((prev) => ({ ...prev, email: event.target.value }))} className="pl-10" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Nomor Telepon</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input id="phone" type="tel" placeholder="0812-3456-7890" value={profileForm.phone} onChange={(event) => setProfileForm((prev) => ({ ...prev, phone: event.target.value }))} className="pl-10" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input id="role" value={roleLabel} disabled className="bg-gray-50" />
              </div>

              <Separator className="my-4" />

              {profileError ? <p className="text-sm text-red-600">{profileError}</p> : null}
              {profileMessage ? <p className="text-sm text-green-600">{profileMessage}</p> : null}

              <Button className="w-full bg-[#1F6B7A] hover:bg-[#176059]" type="submit" disabled={profileSaving || !profile}>
                <Save className="w-4 h-4 mr-2" />
                {profileSaving ? "Menyimpan..." : "Simpan Perubahan Profil"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-purple-50 p-3 rounded-lg">
                <Lock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <CardTitle>Change Password</CardTitle>
                <p className="text-sm text-gray-500 mt-1">Update password untuk keamanan akun</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <form className="space-y-4" onSubmit={handlePasswordSubmit}>
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Password Saat Ini</Label>
                <Input id="currentPassword" type="password" placeholder="Masukkan password saat ini" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Password Baru</Label>
                <Input id="newPassword" type="password" placeholder="Masukkan password baru" value={passwordForm.newPassword} onChange={(event) => setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))} />
                <p className="text-xs text-gray-500">Minimal 8 karakter dengan kombinasi huruf dan angka</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                <Input id="confirmPassword" type="password" placeholder="Konfirmasi password baru" value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))} />
              </div>

              <Separator className="my-4" />

              {passwordError ? <p className="text-sm text-red-600">{passwordError}</p> : null}
              {passwordMessage ? <p className="text-sm text-green-600">{passwordMessage}</p> : null}

              <Button className="w-full bg-[#1F6B7A] hover:bg-[#176059]" type="submit" disabled={passwordSaving}>
                <Lock className="w-4 h-4 mr-2" />
                {passwordSaving ? "Memproses..." : "Update Password"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Notification Settings
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-green-50 p-3 rounded-lg">
                <Bell className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <CardTitle>Notification Settings</CardTitle>
                <p className="text-sm text-gray-500 mt-1">Atur preferensi notifikasi Anda</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="emailNotif">Email Notifications</Label>
                <p className="text-sm text-gray-500">Terima notifikasi melalui email</p>
              </div>
              <Switch id="emailNotif" defaultChecked />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="followUpNotif">Follow Up Reminders</Label>
                <p className="text-sm text-gray-500">Pengingat jadwal follow up jemaah</p>
              </div>
              <Switch id="followUpNotif" defaultChecked />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="closingNotif">Closing Notifications</Label>
                <p className="text-sm text-gray-500">Notifikasi saat ada closing baru</p>
              </div>
              <Switch id="closingNotif" defaultChecked />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="reportNotif">Weekly Reports</Label>
                <p className="text-sm text-gray-500">Laporan mingguan performa tim</p>
              </div>
              <Switch id="reportNotif" />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="systemNotif">System Updates</Label>
                <p className="text-sm text-gray-500">Informasi update dan maintenance</p>
              </div>
              <Switch id="systemNotif" defaultChecked />
            </div>
          </CardContent>
        </Card> */}

        {/* System Preferences
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-orange-50 p-3 rounded-lg">
                <SettingsIcon className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <CardTitle>System Preferences</CardTitle>
                <p className="text-sm text-gray-500 mt-1">Konfigurasi preferensi sistem</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="language">Bahasa</Label>
              <Select defaultValue="id">
                <SelectTrigger id="language">
                  <SelectValue placeholder="Pilih bahasa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="id">Bahasa Indonesia</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ar">العربية</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Zona Waktu</Label>
              <Select defaultValue="wib">
                <SelectTrigger id="timezone">
                  <SelectValue placeholder="Pilih zona waktu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wib">WIB (GMT+7)</SelectItem>
                  <SelectItem value="wita">WITA (GMT+8)</SelectItem>
                  <SelectItem value="wit">WIT (GMT+9)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateFormat">Format Tanggal</Label>
              <Select defaultValue="dd-mm-yyyy">
                <SelectTrigger id="dateFormat">
                  <SelectValue placeholder="Pilih format tanggal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dd-mm-yyyy">DD/MM/YYYY</SelectItem>
                  <SelectItem value="mm-dd-yyyy">MM/DD/YYYY</SelectItem>
                  <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Mata Uang</Label>
              <Select defaultValue="idr">
                <SelectTrigger id="currency">
                  <SelectValue placeholder="Pilih mata uang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="idr">IDR (Rupiah)</SelectItem>
                  <SelectItem value="usd">USD (Dollar)</SelectItem>
                  <SelectItem value="sar">SAR (Riyal)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator className="my-4" />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="darkMode">Dark Mode</Label>
                <p className="text-sm text-gray-500">Aktifkan tema gelap</p>
              </div>
              <Switch id="darkMode" />
            </div>

            <Separator className="my-4" />

            <Button className="w-full bg-[#1F6B7A] hover:bg-[#176059]">
              <Save className="w-4 h-4 mr-2" />
              Simpan Preferensi
            </Button>
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
}
