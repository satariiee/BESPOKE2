import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Calendar } from "../components/ui/calendar";
import { cn } from "../components/ui/utils";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { toast } from "sonner";
import { createCalonJemaah, updateCalonJemaah, getCalonJemaahById, deleteCalonJemaah, type CalonJemaah } from "../lib/api";
import { User, Phone, Mail, MapPin, Calendar as CalendarIcon, DollarSign, Users, FileText, Save, X, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../components/ui/alert-dialog";

export function TambahCalonJemaah() {
  const navigate = useNavigate();
  const { id: jemaahId } = useParams();
  const isEditMode = !!jemaahId;
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form state
  const [nama, setNama] = useState("");
  const [jenisKelamin, setJenisKelamin] = useState("");
  const [kota, setKota] = useState("");
  const [umur, setUmur] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [sumberLead, setSumberLead] = useState("");
  const [paket, setPaket] = useState("");
  const [budget, setBudget] = useState("");
  const [rencanaBerangkat, setRencanaBerangkat] = useState<Date>();
  const [openRencanaBerangkat, setOpenRencanaBerangkat] = useState(false);
  const [catatan, setCatatan] = useState("");

  useEffect(() => {
    if (isEditMode) {
      loadData();
    }
  }, [jemaahId]);

  async function loadData() {
    try {
      if (!jemaahId) return;
      const result = await getCalonJemaahById(parseInt(jemaahId));
      const data = result.data;

      setNama(data.nama);
      setWhatsapp(data.kontak);
      setKota(data.alamat || "");
      setSumberLead(data.sumber || "");
      setPaket(data.paket || "");
      setCatatan(data.notes || "");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal memuat data");
      navigate("/data-calon-jemaah");
    } finally {
      setLoading(false);
    }
  }

  const handleSimpan = async () => {
    // Validate required fields
    if (!nama.trim()) {
      toast.error("Nama lengkap harus diisi");
      return;
    }
    if (!whatsapp.trim()) {
      toast.error("Nomor WhatsApp harus diisi");
      return;
    }
    if (!sumberLead) {
      toast.error("Sumber lead harus dipilih");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        nama,
        kontak: whatsapp,
        alamat: kota || undefined,
        sumber: sumberLead || undefined,
        paket: paket || undefined,
        notes: catatan || undefined,
      };

      if (isEditMode) {
        await updateCalonJemaah(parseInt(jemaahId!), payload);
        toast.success("Data calon jemaah berhasil diperbarui!");
      } else {
        await createCalonJemaah(payload);
        toast.success("Data calon jemaah berhasil disimpan!");
      }

      setTimeout(() => {
        navigate("/data-calon-jemaah");
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
      await deleteCalonJemaah(parseInt(jemaahId!));
      toast.success("Data calon jemaah berhasil dihapus!");
      setTimeout(() => {
        navigate("/data-calon-jemaah");
      }, 1000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menghapus data");
    } finally {
      setDeleting(false);
    }
  };

  const handleBatal = () => {
    navigate("/data-calon-jemaah");
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
          <h1 className="text-3xl font-bold text-gray-900">{isEditMode ? "Edit Calon Jemaah" : "Tambah Calon Jemaah"}</h1>
          <p className="text-gray-500 mt-1">{isEditMode ? "Ubah data calon jemaah" : "Masukkan data calon jemaah baru ke dalam sistem"}</p>
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
                  <AlertDialogDescription>Apakah Anda yakin ingin menghapus data calon jemaah ini? Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
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
            {saving ? "Menyimpan..." : isEditMode ? "Simpan Perubahan" : "Simpan"}
          </Button>
        </div>
      </div>

      {/* Required Field Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <span className="text-red-500 font-bold">*</span> Menandakan field yang wajib diisi
        </p>
      </div>

      {/* Main Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Data Pribadi */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-3 rounded-lg">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <CardTitle>Data Pribadi</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="namaLengkap">
                Nama Lengkap <span className="text-red-500">*</span>
              </Label>
              <Input id="namaLengkap" placeholder="Masukkan nama lengkap" value={nama} onChange={(e) => setNama(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jenisKelamin">
                Jenis Kelamin <span className="text-red-500">*</span>
              </Label>
              <Select value={jenisKelamin} onValueChange={setJenisKelamin}>
                <SelectTrigger id="jenisKelamin">
                  <SelectValue placeholder="Pilih jenis kelamin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="laki-laki">Laki-laki</SelectItem>
                  <SelectItem value="perempuan">Perempuan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="kota">
                Kota / Domisili <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input id="kota" placeholder="Masukkan kota domisili" className="pl-10" value={kota} onChange={(e) => setKota(e.target.value)} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="umur">
                Umur <span className="text-red-500">*</span>
              </Label>
              <Input id="umur" type="number" placeholder="Masukkan umur" min="1" max="120" value={umur} onChange={(e) => setUmur(e.target.value)} required />
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Kontak */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-green-50 p-3 rounded-lg">
                <Phone className="w-5 h-5 text-green-600" />
              </div>
              <CardTitle>Kontak</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="whatsapp">
                Nomor WhatsApp <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input id="whatsapp" placeholder="0812-3456-7890" className="pl-10" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input id="email" type="email" placeholder="email@example.com" className="pl-10" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sumberLead">
                Sumber Lead <span className="text-red-500">*</span>
              </Label>
              <Select value={sumberLead} onValueChange={setSumberLead}>
                <SelectTrigger id="sumberLead">
                  <SelectValue placeholder="Pilih sumber lead" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="facebook">Facebook Ads</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="walk-in">Walk-in</SelectItem>
                  <SelectItem value="other">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Minat Umroh */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-purple-50 p-3 rounded-lg">
                <CalendarIcon className="w-5 h-5 text-purple-600" />
              </div>
              <CardTitle>Minat Umroh</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="paket">
                Paket Diminati <span className="text-red-500">*</span>
              </Label>
              <Select value={paket} onValueChange={setPaket}>
                <SelectTrigger id="paket">
                  <SelectValue placeholder="Pilih paket umroh" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ekonomi-9">Ekonomi 9 Hari</SelectItem>
                  <SelectItem value="ekonomi-12">Ekonomi 12 Hari</SelectItem>
                  <SelectItem value="silver-9">Silver 9 Hari</SelectItem>
                  <SelectItem value="silver-12">Silver 12 Hari</SelectItem>
                  <SelectItem value="gold-9">Gold 9 Hari</SelectItem>
                  <SelectItem value="gold-12">Gold 12 Hari</SelectItem>
                  <SelectItem value="platinum-12">Platinum 12 Hari</SelectItem>
                  <SelectItem value="vip-12">VIP 12 Hari</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">
                Budget <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Select value={budget} onValueChange={setBudget}>
                  <SelectTrigger id="budget" className="pl-10">
                    <SelectValue placeholder="Pilih range budget" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15-20">Rp 15-20 Juta</SelectItem>
                    <SelectItem value="20-25">Rp 20-25 Juta</SelectItem>
                    <SelectItem value="25-30">Rp 25-30 Juta</SelectItem>
                    <SelectItem value="30-35">Rp 30-35 Juta</SelectItem>
                    <SelectItem value="35-40">Rp 35-40 Juta</SelectItem>
                    <SelectItem value="40+">Rp 40 Juta+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>
                Rencana Berangkat <span className="text-red-500">*</span>
              </Label>
              <Button type="button" variant="outline" className={cn("w-full justify-start text-left font-normal", !rencanaBerangkat && "text-muted-foreground")} onClick={() => setOpenRencanaBerangkat((value) => !value)}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {rencanaBerangkat ? format(rencanaBerangkat, "PPP", { locale: id }) : <span>Pilih tanggal</span>}
              </Button>
              {openRencanaBerangkat ? (
                <div className="mt-2 inline-block w-fit rounded-md border bg-white p-2 shadow-sm">
                  <Calendar
                    mode="single"
                    selected={rencanaBerangkat}
                    onSelect={(date) => {
                      setRencanaBerangkat(date);
                      setOpenRencanaBerangkat(false);
                    }}
                    initialFocus
                  />
                </div>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="jumlahOrang">
                Jumlah Orang <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input id="jumlahOrang" type="number" placeholder="Jumlah jamaah" className="pl-10" min="1" defaultValue="1" required />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section 5: Catatan Marketing - Full Width */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-teal-50 p-3 rounded-lg">
              <FileText className="w-5 h-5 text-[#1F6B7A]" />
            </div>
            <CardTitle>Catatan Marketing</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="catatan">Catatan / Notes</Label>
            <Textarea
              id="catatan"
              placeholder="Tambahkan catatan penting tentang calon jemaah, minat khusus, pertanyaan yang diajukan, atau informasi lainnya..."
              className="min-h-32"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
            />
            <p className="text-sm text-gray-500">Informasi yang Anda masukkan di sini akan membantu tim marketing dalam melakukan follow up yang lebih personal dan efektif.</p>
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
          {saving ? "Menyimpan..." : isEditMode ? "Simpan Perubahan" : "Simpan Data Jemaah"}
        </Button>
      </div>
    </div>
  );
}
