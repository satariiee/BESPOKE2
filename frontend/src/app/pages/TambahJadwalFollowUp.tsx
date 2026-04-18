import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
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
import { createJadwalFollowUp, getCalonJemaah, getJadwalFollowUp, getUsers, type CalonJemaah, type JadwalFollowUpItem, type UserItem } from "../lib/api";
import { User, Phone, Calendar as CalendarIcon, Clock, Users, CheckCircle, FileText, Save, X } from "lucide-react";

export function TambahJadwalFollowUp() {
  const navigate = useNavigate();
  const [tanggalFollowUp, setTanggalFollowUp] = useState<Date>();
  const [openTanggalFollowUp, setOpenTanggalFollowUp] = useState(false);
  const [jamFollowUp, setJamFollowUp] = useState("09:00");
  const [selectedJemaah, setSelectedJemaah] = useState<string>("");
  const [selectedJemaahData, setSelectedJemaahData] = useState<CalonJemaah | null>(null);
  const [jemaahList, setJemaahList] = useState<CalonJemaah[]>([]);
  const [loadingJemaah, setLoadingJemaah] = useState(true);
  const [jemaahError, setJemaahError] = useState<string | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState("Pending");
  const [catatan, setCatatan] = useState("");
  const [jadwalList, setJadwalList] = useState<JadwalFollowUpItem[]>([]);
  const [loadingJadwal, setLoadingJadwal] = useState(true);
  const [jadwalError, setJadwalError] = useState<string | null>(null);
  const [staffList, setStaffList] = useState<UserItem[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [staffError, setStaffError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    getCalonJemaah()
      .then((response) => {
        if (!active) return;
        setJemaahList(response.data);
      })
      .catch((error) => {
        if (!active) return;
        setJemaahError(error instanceof Error ? error.message : "Gagal memuat data jemaah");
      })
      .finally(() => {
        if (!active) return;
        setLoadingJemaah(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    getJadwalFollowUp()
      .then((response) => {
        if (!active) return;
        setJadwalList(response.data);
      })
      .catch((error) => {
        if (!active) return;
        setJadwalError(error instanceof Error ? error.message : "Gagal memuat data jadwal follow up");
      })
      .finally(() => {
        if (!active) return;
        setLoadingJadwal(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const availableJemaahList = useMemo(() => {
    const scheduledIds = new Set(jadwalList.map((item) => item.calon_jemaah_id));
    return jemaahList.filter((item) => {
      const isClosed = item.status_komunikasi === "Closing" || item.status_komunikasi === "Tidak Jadi";
      const hasSchedule = scheduledIds.has(item.id);
      return !isClosed && !hasSchedule;
    });
  }, [jemaahList, jadwalList]);

  useEffect(() => {
    if (!selectedJemaah) return;
    const stillAvailable = availableJemaahList.some((item) => item.id.toString() === selectedJemaah);
    if (!stillAvailable) {
      setSelectedJemaah("");
      setSelectedJemaahData(null);
    }
  }, [availableJemaahList, selectedJemaah]);

  useEffect(() => {
    let active = true;

    getUsers({ role: "staff" })
      .then((response) => {
        if (!active) return;
        setStaffList(response.data);
      })
      .catch((error) => {
        if (!active) return;
        setStaffError(error instanceof Error ? error.message : "Gagal memuat data staff");
      })
      .finally(() => {
        if (!active) return;
        setLoadingStaff(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleJemaahChange = (value: string) => {
    setSelectedJemaah(value);
    const jemaah = availableJemaahList.find((j) => j.id.toString() === value);
    setSelectedJemaahData(jemaah || null);
  };

  const handleSimpan = async () => {
    if (!selectedJemaah) {
      toast.error("Jemaah harus dipilih");
      return;
    }

    if (!selectedStaff) {
      toast.error("Staff marketing harus dipilih");
      return;
    }

    if (!tanggalFollowUp) {
      toast.error("Tanggal follow up harus dipilih");
      return;
    }

    try {
      setSaving(true);

      await createJadwalFollowUp({
        calon_jemaah_id: parseInt(selectedJemaah),
        staff_id: parseInt(selectedStaff),
        tanggal: format(tanggalFollowUp, "yyyy-MM-dd"),
        metode: "WhatsApp",
        status: selectedStatus,
        catatan: catatan || undefined,
      });

      toast.success("Jadwal follow up berhasil ditambahkan!");
      setTimeout(() => {
        navigate("/jadwal-follow-up");
      }, 1000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan jadwal follow up");
    } finally {
      setSaving(false);
    }
  };

  const handleBatal = () => {
    navigate("/jadwal-follow-up");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tambah Jadwal Follow Up</h1>
          <p className="text-gray-500 mt-1">Buat jadwal follow up baru untuk calon jemaah</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" onClick={handleBatal}>
            <X className="w-4 h-4" />
            Batal
          </Button>
          <Button className="gap-2 bg-[#1F6B7A] hover:bg-[#176059]" onClick={handleSimpan}>
            <Save className="w-4 h-4" />
            Simpan
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
        {/* Section 1: Informasi Jemaah */}
        <Card className="shadow-sm lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-3 rounded-lg">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <CardTitle>Informasi Jemaah</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pilihJemaah">
                  Pilih Jemaah <span className="text-red-500">*</span>
                </Label>
                <Select value={selectedJemaah} onValueChange={handleJemaahChange} disabled={loadingJemaah || loadingJadwal || !!jemaahError || !!jadwalError}>
                  <SelectTrigger id="pilihJemaah">
                    <SelectValue placeholder={loadingJemaah || loadingJadwal ? "Memuat data jemaah..." : "Cari dan pilih jemaah"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableJemaahList.map((jemaah) => (
                      <SelectItem key={jemaah.id} value={jemaah.id.toString()}>
                        {jemaah.nama} - {jemaah.kontak}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {jemaahError ? <p className="text-sm text-red-600 mt-1">{jemaahError}</p> : null}
                {jadwalError ? <p className="text-sm text-red-600 mt-1">{jadwalError}</p> : null}
                {!loadingJemaah && !loadingJadwal && !jemaahError && !jadwalError && availableJemaahList.length === 0 ? <p className="text-sm text-gray-500 mt-1">Tidak ada jemaah yang tersedia untuk dibuatkan jadwal follow up.</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="kontak">Kontak</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input id="kontak" placeholder="Auto-filled" value={selectedJemaahData?.kontak || ""} readOnly className="pl-10 bg-gray-50" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paketDiminati">Paket Diminati</Label>
                <Input id="paketDiminati" placeholder="Auto-filled" value={selectedJemaahData?.paket || ""} readOnly className="bg-gray-50" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Jadwal Follow Up */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-green-50 p-3 rounded-lg">
                <CalendarIcon className="w-5 h-5 text-green-600" />
              </div>
              <CardTitle>Jadwal Follow Up</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>
                Tanggal Follow Up <span className="text-red-500">*</span>
              </Label>
              <Button type="button" variant="outline" className={cn("w-full justify-start text-left font-normal", !tanggalFollowUp && "text-muted-foreground")} onClick={() => setOpenTanggalFollowUp((value) => !value)}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {tanggalFollowUp ? format(tanggalFollowUp, "PPP", { locale: id }) : <span>Pilih tanggal</span>}
              </Button>
              {openTanggalFollowUp ? (
                <div className="mt-2 inline-block w-fit rounded-md border bg-white p-2 shadow-sm">
                  <Calendar
                    mode="single"
                    selected={tanggalFollowUp}
                    onSelect={(date) => {
                      setTanggalFollowUp(date);
                      setOpenTanggalFollowUp(false);
                    }}
                    initialFocus
                  />
                </div>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="jamFollowUp">
                Jam Follow Up <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input id="jamFollowUp" type="time" className="pl-10" value={jamFollowUp} onChange={(e) => setJamFollowUp(e.target.value)} required />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Penanggung Jawab */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-purple-50 p-3 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <CardTitle>Penanggung Jawab</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="staffMarketing">
                Staff Marketing <span className="text-red-500">*</span>
              </Label>
              <Select value={selectedStaff} onValueChange={setSelectedStaff} disabled={loadingStaff || !!staffError}>
                <SelectTrigger id="staffMarketing">
                  <SelectValue placeholder={loadingStaff ? "Memuat staff..." : "Pilih staff"} />
                </SelectTrigger>
                <SelectContent>
                  {staffList.map((staff) => (
                    <SelectItem key={staff.id} value={staff.id.toString()}>
                      {staff.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {staffError ? <p className="text-sm text-red-600 mt-1">{staffError}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">
                Status <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <CheckCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger id="status" className="pl-10">
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        Pending
                      </div>
                    </SelectItem>
                    <SelectItem value="In Progress">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        In Progress
                      </div>
                    </SelectItem>
                    <SelectItem value="Done">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        Done
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Catatan Follow Up - Full Width */}
        <Card className="shadow-sm lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-orange-50 p-3 rounded-lg">
                <FileText className="w-5 h-5 text-orange-600" />
              </div>
              <CardTitle>Catatan Follow Up</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes / Keterangan</Label>
              <Textarea
                id="notes"
                placeholder="Tambahkan catatan atau agenda yang akan dibahas saat follow up, pertanyaan khusus, atau informasi penting lainnya..."
                className="min-h-32"
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
              />
              <p className="text-sm text-gray-500">Catatan ini akan membantu staff marketing dalam mempersiapkan materi follow up yang lebih efektif.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Action Buttons */}
      <div className="flex justify-end gap-3 pb-6">
        <Button variant="outline" className="gap-2" onClick={handleBatal}>
          <X className="w-4 h-4" />
          Batal
        </Button>
        <Button className="gap-2 bg-[#1F6B7A] hover:bg-[#176059]" onClick={handleSimpan} disabled={saving}>
          <Save className="w-4 h-4" />
          {saving ? "Menyimpan..." : "Simpan Jadwal Follow Up"}
        </Button>
      </div>
    </div>
  );
}
