import { useState, useEffect, useMemo } from "react";
import { Phone, MessageCircle, Users, Calendar as CalendarIcon, Loader, AlertCircle, X, Save, Edit } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Calendar } from "../components/ui/calendar";
import { cn } from "../components/ui/utils";
import { getJadwalFollowUp, updateJadwalFollowUp, createStatusKomunikasi, type JadwalFollowUpItem } from "../../app/lib/api";
import { TablePagination } from "../../app/components/TablePagination";

const PAGE_SIZE = 10;

export function JadwalFollowUp() {
  const [schedules, setSchedules] = useState<JadwalFollowUpItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<"Hari Ini" | "Minggu Ini" | "Semua">("Semua");
  const [selectedSchedule, setSelectedSchedule] = useState<JadwalFollowUpItem | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [openNextFollowUpCalendar, setOpenNextFollowUpCalendar] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [updateForm, setUpdateForm] = useState({
    metodeKomunikasi: "",
    statusKomunikasi: "",
    hasilFollowUp: "",
    nextFollowUp: "",
    statusTask: "Pending",
    nilaiPembayaran: "",
    tipePembayaran: "",
  });

  const statusKomunikasiOptions = ["Prospek Baru", "Dihubungi", "Tertarik", "Closing", "Tidak Jadi", "Menunggu Keputusan"];

  const taskStatusOptions = ["Pending", "In Progress", "Done"];

  const tipePembayaranOptions = ["DP", "Lunas"] as const;

  const formatDateForInput = (displayDate: string | null): string => {
    if (!displayDate) return "";
    const date = new Date(displayDate);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().slice(0, 10);
  };

  const formatDateForApi = (date: string): string => {
    if (!date) return "";
    return `${date} 09:00:00`;
  };

  const parseInputDate = (value: string): Date | undefined => {
    if (!value) return undefined;
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return undefined;
    return date;
  };

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getJadwalFollowUp();
      setSchedules(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengambil data jadwal");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const openUpdateModal = (schedule: JadwalFollowUpItem) => {
    setSelectedSchedule(schedule);
    setShowUpdateModal(true);
    setError(null);
    setSuccessMessage(null);
    setUpdateForm({
      metodeKomunikasi: schedule.metode || "",
      statusKomunikasi: schedule.status_komunikasi || "",
      hasilFollowUp: schedule.catatan || "",
      nextFollowUp: "",
      statusTask: schedule.status || "Pending",
      nilaiPembayaran: "",
      tipePembayaran: "",
    });
    setOpenNextFollowUpCalendar(false);
  };

  const closeUpdateModal = () => {
    setShowUpdateModal(false);
    setSelectedSchedule(null);
    setIsSaving(false);
    setOpenNextFollowUpCalendar(false);
  };

  const handleSaveUpdate = async () => {
    if (!selectedSchedule) return;

    const isClosingDone = updateForm.statusKomunikasi === "Closing" && updateForm.statusTask === "Done";
    const nilaiPembayaran = Number(updateForm.nilaiPembayaran);

    if (!updateForm.metodeKomunikasi || !updateForm.statusKomunikasi || !updateForm.hasilFollowUp.trim()) {
      setError("Metode komunikasi, status komunikasi, dan hasil follow up wajib diisi.");
      return;
    }

    if (isClosingDone) {
      if (!updateForm.nilaiPembayaran || Number.isNaN(nilaiPembayaran) || nilaiPembayaran <= 0) {
        setError("Nilai pembayaran wajib diisi dengan nominal lebih dari 0 saat closing dan task done.");
        return;
      }

      if (!updateForm.tipePembayaran) {
        setError("Tipe pembayaran wajib dipilih (DP atau Lunas) saat closing dan task done.");
        return;
      }
    }

    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);

      await updateJadwalFollowUp(selectedSchedule.id, {
        metode: updateForm.metodeKomunikasi,
        status: updateForm.statusTask,
        catatan: updateForm.hasilFollowUp,
        tanggal: updateForm.nextFollowUp ? formatDateForApi(updateForm.nextFollowUp) : undefined,
      });

      await createStatusKomunikasi({
        jadwal_follow_up_id: selectedSchedule.id,
        metode: updateForm.metodeKomunikasi,
        status: updateForm.statusKomunikasi,
        catatan: updateForm.hasilFollowUp,
        follow_up_at: new Date().toISOString(),
        nilai_pembayaran: isClosingDone ? nilaiPembayaran : undefined,
        tipe_pembayaran: isClosingDone ? (updateForm.tipePembayaran as "DP" | "Lunas") : undefined,
      });

      await fetchSchedules();
      closeUpdateModal();
      setSuccessMessage("Update follow up berhasil disimpan.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan update follow up");
    } finally {
      setIsSaving(false);
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-500 text-white";
      case "In Progress":
        return "bg-blue-500 text-white";
      case "Done":
        return "bg-green-600 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getMetodeIcon = (metode: string) => {
    switch (metode) {
      case "Call":
        return <Phone className="w-4 h-4" />;
      case "WhatsApp":
        return <MessageCircle className="w-4 h-4" />;
      case "Meeting":
        return <Users className="w-4 h-4" />;
      default:
        return <Phone className="w-4 h-4" />;
    }
  };

  const getMetodeColor = (metode: string) => {
    switch (metode) {
      case "Call":
        return "bg-orange-100 text-orange-800";
      case "WhatsApp":
        return "bg-green-100 text-green-800";
      case "Meeting":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredSchedules = schedules.filter((schedule) => {
    if (filterTab === "Hari Ini") {
      // Filter today's tasks (would need date comparison)
      return true;
    } else if (filterTab === "Minggu Ini") {
      // Filter this week's tasks
      return true;
    }
    return true;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [filterTab]);

  const totalSchedulePages = Math.max(1, Math.ceil(filteredSchedules.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalSchedulePages);

  const paginatedSchedules = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;
    return filteredSchedules.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredSchedules, safeCurrentPage]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-gray-600">Memuat jadwal follow up...</p>
        </div>
      </div>
    );
  }

  const isClosingDone = updateForm.statusKomunikasi === "Closing" && updateForm.statusTask === "Done";

  return (
    <>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Jadwal Follow Up</h1>
        <p className="text-gray-500 mt-1">Kelola dan update hasil follow up dengan jemaah</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <p className="text-sm text-green-700">{successMessage}</p>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 mb-6 inline-flex gap-2">
        {(["Hari Ini", "Minggu Ini", "Semua"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterTab(tab)}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${filterTab === tab ? "text-white" : "text-gray-600 hover:bg-gray-50"}`}
            style={filterTab === tab ? { backgroundColor: "#1F6B7A" } : {}}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Schedule Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredSchedules.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500">Tidak ada jadwal follow up</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Jemaah</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kontak</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metode</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {paginatedSchedules.map((schedule) => (
                  <tr key={schedule.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-medium text-gray-900">{schedule.calon_jemaah}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-600">{schedule.kontak}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">{schedule.tanggal}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getMetodeColor(schedule.metode || "")}`}>
                        {getMetodeIcon(schedule.metode || "")}
                        {schedule.metode}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getTaskStatusColor(schedule.status || "Pending")}`}>{schedule.status || "Pending"}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button onClick={() => openUpdateModal(schedule)} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: "#1F6B7A" }}>
                        <Edit className="w-4 h-4" />
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredSchedules.length > 0 ? <TablePagination currentPage={safeCurrentPage} totalItems={filteredSchedules.length} pageSize={PAGE_SIZE} itemLabel="jadwal" onPageChange={setCurrentPage} className="border-gray-100" /> : null}
      </div>

      {showUpdateModal && selectedSchedule && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Update Follow Up</h2>
                <p className="text-gray-500 mt-1">Catat hasil follow up dan update status</p>
              </div>
              <button onClick={closeUpdateModal} className="p-2 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Informasi Jemaah</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <p>
                    <span className="text-gray-500">Nama:</span> <span className="font-medium text-gray-900">{selectedSchedule.calon_jemaah || "-"}</span>
                  </p>
                  <p>
                    <span className="text-gray-500">Kontak:</span> <span className="font-medium text-gray-900">{selectedSchedule.kontak || "-"}</span>
                  </p>
                  <p>
                    <span className="text-gray-500">Tanggal Jadwal:</span> <span className="font-medium text-gray-900">{selectedSchedule.tanggal || "-"}</span>
                  </p>
                  <p>
                    <span className="text-gray-500">PIC:</span> <span className="font-medium text-gray-900">{selectedSchedule.staff || "-"}</span>
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Metode Komunikasi <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={updateForm.metodeKomunikasi}
                    onChange={(e) => setUpdateForm((prev) => ({ ...prev, metodeKomunikasi: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                  >
                    <option value="">Pilih metode</option>
                    <option value="Call">Call</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Meeting">Meeting</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status Komunikasi <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={updateForm.statusKomunikasi}
                    onChange={(e) => setUpdateForm((prev) => ({ ...prev, statusKomunikasi: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                  >
                    <option value="">Pilih status</option>
                    {statusKomunikasiOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hasil Follow Up <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={5}
                    value={updateForm.hasilFollowUp}
                    onChange={(e) => setUpdateForm((prev) => ({ ...prev, hasilFollowUp: e.target.value }))}
                    placeholder="Tuliskan detail hasil follow up (percakapan, keputusan, kendala, dll)..."
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Next Follow Up</label>
                  <button
                    type="button"
                    className={cn("w-full border border-gray-300 rounded-xl px-4 py-3 text-left focus:outline-none focus:ring-2 focus:ring-teal-500/30 inline-flex items-center gap-2", !updateForm.nextFollowUp && "text-gray-400")}
                    onClick={() => setOpenNextFollowUpCalendar((value) => !value)}
                  >
                    <CalendarIcon className="w-4 h-4" />
                    {updateForm.nextFollowUp ? format(parseInputDate(updateForm.nextFollowUp) ?? new Date(), "PPP", { locale: id }) : "Pilih tanggal"}
                  </button>
                  {openNextFollowUpCalendar ? (
                    <div className="mt-2 inline-block w-fit rounded-md border bg-white p-2 shadow-sm">
                      <Calendar
                        mode="single"
                        selected={parseInputDate(updateForm.nextFollowUp)}
                        onSelect={(date) => {
                          setUpdateForm((prev) => ({
                            ...prev,
                            nextFollowUp: date ? format(date, "yyyy-MM-dd") : "",
                          }));
                          setOpenNextFollowUpCalendar(false);
                        }}
                        initialFocus
                      />
                    </div>
                  ) : null}
                  <p className="text-xs text-gray-500 mt-1">Opsional - Jadwalkan follow up berikutnya jika diperlukan</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status Task</label>
                  <select
                    value={updateForm.statusTask}
                    onChange={(e) => setUpdateForm((prev) => ({ ...prev, statusTask: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                  >
                    {taskStatusOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                {isClosingDone ? (
                  <>
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">Closing dengan task selesai mewajibkan pengisian nilai dan tipe pembayaran.</div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nilai Pembayaran <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="0.01"
                        value={updateForm.nilaiPembayaran}
                        onChange={(e) => setUpdateForm((prev) => ({ ...prev, nilaiPembayaran: e.target.value }))}
                        placeholder="Contoh: 5000000"
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipe Pembayaran <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={updateForm.tipePembayaran}
                        onChange={(e) => setUpdateForm((prev) => ({ ...prev, tipePembayaran: e.target.value }))}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                      >
                        <option value="">Pilih tipe pembayaran</option>
                        {tipePembayaranOptions.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                ) : null}
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 flex gap-3">
              <button onClick={closeUpdateModal} disabled={isSaving} className="flex-1 rounded-xl py-3 font-semibold border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-60">
                Batal Update
              </button>
              <button onClick={handleSaveUpdate} disabled={isSaving} className="flex-1 rounded-xl py-3 font-semibold text-white disabled:opacity-60 inline-flex items-center justify-center gap-2" style={{ backgroundColor: "#1F6B7A" }}>
                {isSaving ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Simpan Update
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
