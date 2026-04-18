import { useState, useEffect } from "react";
import { Search, Filter, Eye, Calendar, X, Plus, RefreshCw, Phone, MessageCircle, MapPin, Package, Loader } from "lucide-react";
import { getCalonJemaah, type CalonJemaah } from "../../app/lib/api";

interface JemaahWithTimeline extends CalonJemaah {
  timeline?: unknown[];
}

const jemaahData: never[] = [
  {
    id: 1,
    nama: "Hj. Siti Aminah",
    nomorHp: "081234567890",
    paket: "Paket VIP",
    status: "Tertarik",
    lastFollowUp: "15 Mar 2026",
    alamat: "Jl. Sudirman No. 123, Jakarta Selatan",
    timeline: [
      { id: 1, type: "whatsapp", description: "Mengirim info paket VIP", timestamp: "15 Mar 2026, 14:30" },
      { id: 2, type: "call", description: "Diskusi detail paket", timestamp: "13 Mar 2026, 10:00" },
      { id: 3, type: "meeting", description: "Pertemuan pertama", timestamp: "10 Mar 2026, 09:00" },
    ],
  },
  {
    id: 2,
    nama: "H. Abdul Rahman",
    nomorHp: "081234567891",
    paket: "Paket Reguler",
    status: "Dihubungi",
    lastFollowUp: "16 Mar 2026",
    alamat: "Jl. Thamrin No. 45, Jakarta Pusat",
    timeline: [
      { id: 1, type: "call", description: "Follow up pertama", timestamp: "16 Mar 2026, 11:00" },
      { id: 2, type: "whatsapp", description: "Mengirim katalog", timestamp: "14 Mar 2026, 15:00" },
    ],
  },
  {
    id: 3,
    nama: "Ibu Fatimah",
    nomorHp: "081234567892",
    paket: "Paket Premium",
    status: "Closing",
    lastFollowUp: "17 Mar 2026",
    alamat: "Jl. Kuningan Raya No. 78, Jakarta Selatan",
    timeline: [
      { id: 1, type: "meeting", description: "Closing deal", timestamp: "17 Mar 2026, 13:00" },
      { id: 2, type: "call", description: "Konfirmasi pembayaran", timestamp: "16 Mar 2026, 10:30" },
      { id: 3, type: "whatsapp", description: "Mengirim invoice", timestamp: "15 Mar 2026, 14:00" },
    ],
  },
  {
    id: 4,
    nama: "Bapak Usman",
    nomorHp: "081234567893",
    paket: "Paket Reguler",
    status: "Prospek",
    lastFollowUp: "12 Mar 2026",
    alamat: "Jl. Gatot Subroto No. 234, Jakarta Selatan",
    timeline: [
      { id: 1, type: "whatsapp", description: "Kontak pertama", timestamp: "12 Mar 2026, 16:00" },
    ],
  },
  {
    id: 5,
    nama: "Ibu Khadijah",
    nomorHp: "081234567894",
    paket: "Paket VIP",
    status: "Tertarik",
    lastFollowUp: "16 Mar 2026",
    alamat: "Jl. Rasuna Said No. 56, Jakarta Selatan",
    timeline: [
      { id: 1, type: "call", description: "Diskusi paket VIP", timestamp: "16 Mar 2026, 14:00" },
      { id: 2, type: "whatsapp", description: "Mengirim detail paket", timestamp: "14 Mar 2026, 11:00" },
    ],
  },
];

export function JemaahSaya() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("Semua");
  const [paketFilter, setPaketFilter] = useState<string>("Semua");
  const [selectedJemaah, setSelectedJemaah] = useState<Jemaah | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Prospek":
        return "bg-gray-100 text-gray-800";
      case "Dihubungi":
        return "bg-blue-100 text-blue-800";
      case "Tertarik":
        return "bg-yellow-100 text-yellow-800";
      case "Closing":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTimelineIcon = (type: string) => {
    switch (type) {
      case "call":
        return <Phone className="w-4 h-4 text-orange-600" />;
      case "whatsapp":
        return <MessageCircle className="w-4 h-4 text-green-600" />;
      case "meeting":
        return <Calendar className="w-4 h-4 text-purple-600" />;
      default:
        return <Calendar className="w-4 h-4 text-gray-600" />;
    }
  };

  const filteredData = jemaahData.filter((jemaah) => {
    const matchesSearch = jemaah.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         jemaah.nomorHp.includes(searchQuery);
    const matchesStatus = statusFilter === "Semua" || jemaah.status === statusFilter;
    const matchesPaket = paketFilter === "Semua" || jemaah.paket === paketFilter;
    return matchesSearch && matchesStatus && matchesPaket;
  });

  return (
    <>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Jemaah Saya</h1>
        <p className="text-gray-500 mt-1">Kelola dan pantau semua jemaah yang ditugaskan</p>
      </div>

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
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-9 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white appearance-none"
              >
                <option>Semua</option>
                <option>Prospek</option>
                <option>Dihubungi</option>
                <option>Tertarik</option>
                <option>Closing</option>
              </select>
            </div>

            <div className="relative">
              <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={paketFilter}
                onChange={(e) => setPaketFilter(e.target.value)}
                className="pl-9 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white appearance-none"
              >
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama Jemaah
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nomor HP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paket
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Follow Up
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredData.map((jemaah) => (
                <tr key={jemaah.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm font-medium text-gray-900">{jemaah.nama}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm text-gray-600">{jemaah.nomorHp}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm text-gray-900">{jemaah.paket}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(jemaah.status)}`}>
                      {jemaah.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm text-gray-600">{jemaah.lastFollowUp}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedJemaah(jemaah)}
                        className="px-3 py-1.5 text-sm font-medium text-white rounded-lg transition-colors"
                        style={{ backgroundColor: '#1F6B7A' }}
                      >
                        <Eye className="w-4 h-4 inline mr-1" />
                        Detail
                      </button>
                      <button
                        className="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors"
                        style={{ backgroundColor: '#E8E0D4', color: '#1F6B7A' }}
                      >
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Follow Up
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedJemaah && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{selectedJemaah.nama}</h2>
                <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedJemaah.status)}`}>
                  {selectedJemaah.status}
                </span>
              </div>
              <button
                onClick={() => setSelectedJemaah(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Informasi Jemaah */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
                  Informasi Jemaah
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Kontak</p>
                      <p className="text-sm font-medium text-gray-900">{selectedJemaah.nomorHp}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Package className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Paket</p>
                      <p className="text-sm font-medium text-gray-900">{selectedJemaah.paket}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Alamat</p>
                      <p className="text-sm font-medium text-gray-900">{selectedJemaah.alamat}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline Follow Up */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
                  Timeline Follow Up
                </h3>
                <div className="space-y-4">
                  {selectedJemaah.timeline.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                        {getTimelineIcon(item.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{item.description}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{item.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#1F6B7A' }}
                >
                  <Plus className="w-4 h-4" />
                  Tambah Follow Up
                </button>
                <button
                  className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#E8E0D4', color: '#1F6B7A' }}
                >
                  <RefreshCw className="w-4 h-4" />
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
