import { useState, useEffect, useMemo } from "react";
import { Search, Filter, Eye, X, Calendar, Phone, MessageCircle, Users, Loader, AlertCircle } from "lucide-react";
import { getStatusKomunikasi, type StatusKomunikasiItem } from "../../app/lib/api";
import { TablePagination } from "../../app/components/TablePagination";

const PAGE_SIZE = 10;

export function StatusKomunikasi() {
  const [communications, setCommunications] = useState<StatusKomunikasiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("Semua");
  const [selectedComm, setSelectedComm] = useState<StatusKomunikasiItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchCommunications = async () => {
      try {
        setLoading(true);
        setError(null);
        const statusResponse = await getStatusKomunikasi();
        setCommunications(statusResponse.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal mengambil data status komunikasi");
      } finally {
        setLoading(false);
      }
    };

    fetchCommunications();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Prospek Baru":
        return "bg-gray-100 text-gray-800";
      case "Dihubungi":
        return "bg-blue-100 text-blue-800";
      case "Tertarik":
        return "bg-yellow-100 text-yellow-800";
      case "Closing":
        return "bg-green-100 text-green-800";
      case "Tidak Jadi":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getMethodIcon = (method?: string | null) => {
    const value = (method || "").toLowerCase();
    if (value.includes("whatsapp")) {
      return <MessageCircle className="w-4 h-4" />;
    }
    if (value.includes("meeting")) {
      return <Users className="w-4 h-4" />;
    }
    if (value.includes("call")) {
      return <Phone className="w-4 h-4" />;
    }
    return <Calendar className="w-4 h-4" />;
  };

  const getMethodColor = (method?: string | null) => {
    const value = (method || "").toLowerCase();
    if (value.includes("whatsapp")) {
      return "bg-green-100 text-green-700";
    }
    if (value.includes("meeting")) {
      return "bg-purple-100 text-purple-700";
    }
    if (value.includes("call")) {
      return "bg-orange-100 text-orange-700";
    }
    return "bg-gray-100 text-gray-700";
  };

  const parseDate = (value?: string | null) => {
    if (!value) return 0;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? 0 : d.getTime();
  };

  const latestCommunications = useMemo(() => {
    const latestBySchedule = new Map<number, StatusKomunikasiItem>();

    const sortedCommunications = [...communications].sort((a, b) => {
      const dateDiff = parseDate(b.follow_up_at) - parseDate(a.follow_up_at);
      if (dateDiff !== 0) return dateDiff;
      return b.id - a.id;
    });

    sortedCommunications.forEach((item) => {
      if (!latestBySchedule.has(item.jadwal_follow_up_id)) {
        latestBySchedule.set(item.jadwal_follow_up_id, item);
      }
    });

    return Array.from(latestBySchedule.values());
  }, [communications]);

  type TimelineEntry = {
    id: number;
    method: string;
    status: string;
    note: string;
    staff: string;
    at: string;
    timeValue: number;
  };

  const timelineForSelected: TimelineEntry[] = selectedComm
    ? (() => {
        const selectedPersonEntries = communications.filter((item) => item.calon_jemaah === selectedComm.calon_jemaah && (item.kontak || "") === (selectedComm.kontak || ""));

        return selectedPersonEntries
          .map<TimelineEntry>((item) => {
            const method = item.metode || "Follow Up";
            return {
              id: item.id,
              method,
              status: item.status,
              note: item.catatan || "Tidak ada catatan follow up.",
              staff: item.staff || "-",
              at: item.follow_up_at || "Waktu tidak tersedia",
              timeValue: parseDate(item.follow_up_at),
            };
          })
          .sort((a, b) => a.timeValue - b.timeValue);
      })()
    : [];

  const filteredData = latestCommunications.filter((comm) => {
    const matchesSearch = comm.calon_jemaah?.toLowerCase().includes(searchQuery.toLowerCase()) || comm.kontak?.includes(searchQuery);
    const matchesStatus = statusFilter === "Semua" || comm.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const totalCommunicationPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalCommunicationPages);

  const paginatedData = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;
    return filteredData.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredData, safeCurrentPage]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-gray-600">Memuat status komunikasi...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Status Komunikasi</h1>
        <p className="text-gray-500 mt-1">Pantau status komunikasi dan timeline follow up dengan jemaah</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama atau nomor HP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
          </div>

          {/* Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="pl-9 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white appearance-none">
              <option>Semua</option>
              <option>Prospek Baru</option>
              <option>Dihubungi</option>
              <option>Tertarik</option>
              <option>Closing</option>
              <option>Tidak Jadi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Communication Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredData.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500">Tidak ada data status komunikasi</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Jemaah</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kontak</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metode Komunikasi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Follow Up</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {paginatedData.map((comm) => {
                  const method = comm.metode || "Follow Up";

                  return (
                    <tr key={comm.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-medium text-gray-900">{comm.calon_jemaah}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-gray-600">{comm.kontak}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(comm.status)}`}>{comm.status}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${getMethodColor(method)}`}>
                          {getMethodIcon(method)}
                          {method}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-gray-600">{comm.follow_up_at || "Belum ada"}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button onClick={() => setSelectedComm(comm)} className="px-3 py-1.5 text-sm font-medium text-white rounded-lg transition-colors" style={{ backgroundColor: "#1F6B7A" }}>
                          <Eye className="w-4 h-4 inline mr-1" />
                          Detail
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {filteredData.length > 0 ? <TablePagination currentPage={safeCurrentPage} totalItems={filteredData.length} pageSize={PAGE_SIZE} itemLabel="data" onPageChange={setCurrentPage} className="border-gray-100" /> : null}
      </div>

      {/* Detail Modal */}
      {selectedComm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-white border-b border-gray-100 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-4xl font-semibold text-gray-900">Detail Komunikasi</h2>
                <p className="text-gray-500 mt-1">Informasi lengkap status jemaah</p>
              </div>
              <button onClick={() => setSelectedComm(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Informasi Jemaah</h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="text-gray-500">Nama:</span> <span className="font-medium text-gray-900">{selectedComm.calon_jemaah || "-"}</span>
                    </p>
                    <p>
                      <span className="text-gray-500">Kontak:</span> <span className="font-medium text-gray-900">{selectedComm.kontak || "-"}</span>
                    </p>
                    <p>
                      <span className="text-gray-500">PIC:</span> <span className="font-medium text-gray-900">{selectedComm.staff || "-"}</span>
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Current Status</h3>
                  <div className="space-y-2 text-sm">
                    <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-semibold ${getStatusColor(selectedComm.status)}`}>{selectedComm.status}</span>
                    <p>
                      <span className="text-gray-500">Last Follow Up:</span> <span className="font-medium text-gray-900">{selectedComm.follow_up_at || "Belum ada"}</span>
                    </p>
                    {selectedComm.catatan && <p className="text-gray-700 leading-relaxed">{selectedComm.catatan}</p>}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">TIMELINE FOLLOW UP</h3>
                {timelineForSelected.length === 0 ? (
                  <div className="rounded-xl border border-gray-200 p-8 text-center text-gray-500">Belum ada log follow up.</div>
                ) : (
                  <div className="relative space-y-6">
                    <div className="absolute left-5 top-2 bottom-2 w-px bg-gray-200" />
                    {timelineForSelected.map((item) => {
                      const method = item.method;
                      return (
                        <div key={item.id} className="relative pl-14">
                          <div className={`absolute left-0 top-3 w-10 h-10 rounded-full border-4 border-white shadow flex items-center justify-center ${getMethodColor(method)}`}>{getMethodIcon(method)}</div>
                          <div className="border border-gray-200 rounded-2xl p-4 bg-white">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-md text-sm font-medium ${getMethodColor(method)}`}>
                                {getMethodIcon(method)}
                                {method}
                              </span>
                              <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${getStatusColor(item.status)}`}>{item.status}</span>
                            </div>
                            <p className="text-sm text-gray-500 mb-2">{item.at || "Waktu tidak tersedia"}</p>
                            <p className="text-gray-800 leading-relaxed">{item.note || "Tidak ada catatan follow up."}</p>
                            <p className="text-sm text-gray-500 mt-3">PIC: {item.staff || "-"}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-white">
              <button onClick={() => setSelectedComm(null)} className="w-full py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
