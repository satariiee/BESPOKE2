import { useState, useEffect, useMemo } from "react";
import { Search, Filter, Eye, Calendar, X, Phone, MessageCircle, MapPin, Package, Loader, AlertCircle } from "lucide-react";
import { getCalonJemaah, type CalonJemaah } from "../../app/lib/api";
import { TablePagination } from "../../app/components/TablePagination";

const PAGE_SIZE = 10;

export function JemaahSaya() {
  const [jemaahList, setJemaahList] = useState<CalonJemaah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("Semua");
  const [paketFilter, setPaketFilter] = useState<string>("Semua");
  const [selectedJemaah, setSelectedJemaah] = useState<CalonJemaah | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchJemaah = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getCalonJemaah();
        setJemaahList(response.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal mengambil data jemaah");
      } finally {
        setLoading(false);
      }
    };

    fetchJemaah();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Prospek Baru":
      case "Prospek":
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

  const filteredData = jemaahList.filter((jemaah) => {
    const matchesSearch = jemaah.nama?.toLowerCase().includes(searchQuery.toLowerCase()) || jemaah.kontak?.includes(searchQuery);
    const matchesStatus = statusFilter === "Semua" || jemaah.status_komunikasi === statusFilter;
    const matchesPaket = paketFilter === "Semua" || jemaah.paket === paketFilter;
    return matchesSearch && matchesStatus && matchesPaket;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, paketFilter]);

  const totalJemaahPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalJemaahPages);

  const paginatedJemaah = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;
    return filteredData.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredData, safeCurrentPage]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-gray-600">Memuat data jemaah...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Jemaah Saya</h1>
        <p className="text-gray-500 mt-1">Kelola dan pantau semua jemaah yang ditugaskan</p>
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

          {/* Filters */}
          <div className="flex gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="pl-9 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white appearance-none">
                <option>Semua</option>
                <option>Prospek</option>
                <option>Prospek Baru</option>
                <option>Dihubungi</option>
                <option>Tertarik</option>
                <option>Closing</option>
                <option>Tidak Jadi</option>
              </select>
            </div>

            <div className="relative">
              <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select value={paketFilter} onChange={(e) => setPaketFilter(e.target.value)} className="pl-9 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white appearance-none">
                <option>Semua</option>
                <option>Paket Reguler</option>
                <option>Paket Premium</option>
                <option>Paket VIP</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Jemaah Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredData.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500">Tidak ada data jemaah yang sesuai dengan filter</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Jemaah</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kontak</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paket</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Follow Up</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {paginatedJemaah.map((jemaah) => (
                  <tr key={jemaah.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-medium text-gray-900">{jemaah.nama}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-600">{jemaah.kontak}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">{jemaah.paket || "N/A"}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(jemaah.status_komunikasi)}`}>{jemaah.status_komunikasi}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-600">{jemaah.last_follow_up_at || "Belum ada"}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button onClick={() => setSelectedJemaah(jemaah)} className="px-3 py-1.5 text-sm font-medium text-white rounded-lg transition-colors" style={{ backgroundColor: "#1F6B7A" }}>
                        <Eye className="w-4 h-4 inline mr-1" />
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredData.length > 0 ? <TablePagination currentPage={safeCurrentPage} totalItems={filteredData.length} pageSize={PAGE_SIZE} itemLabel="jemaah" onPageChange={setCurrentPage} className="border-gray-100" /> : null}
      </div>

      {/* Detail Modal */}
      {selectedJemaah && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
            {/* Modal Header */}
            <div className="bg-white border-b border-gray-100 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{selectedJemaah.nama}</h2>
                <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedJemaah.status_komunikasi)}`}>{selectedJemaah.status_komunikasi}</span>
              </div>
              <button onClick={() => setSelectedJemaah(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Informasi Jemaah */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Informasi Jemaah</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Kontak</p>
                      <p className="text-sm font-medium text-gray-900">{selectedJemaah.kontak}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Package className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Paket</p>
                      <p className="text-sm font-medium text-gray-900">{selectedJemaah.paket || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Alamat</p>
                      <p className="text-sm font-medium text-gray-900">{selectedJemaah.alamat || "N/A"}</p>
                    </div>
                  </div>
                  {selectedJemaah.notes && (
                    <div className="flex items-start gap-3">
                      <MessageCircle className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Catatan</p>
                        <p className="text-sm font-medium text-gray-900">{selectedJemaah.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
