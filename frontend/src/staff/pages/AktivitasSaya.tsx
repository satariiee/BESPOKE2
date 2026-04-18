import { useState, useEffect, useMemo } from "react";
import { Phone, MessageCircle, Users, RefreshCw, Calendar, Loader, AlertCircle } from "lucide-react";
import { getStatusKomunikasi, type StatusKomunikasiItem } from "../../app/lib/api";
import { TablePagination } from "../../app/components/TablePagination";

type TimelineItem = {
  id: number;
  time: string;
  method: string;
  methodClass: string;
  methodIconClass: string;
  icon: "call" | "whatsapp" | "meeting" | "status";
  jemaahName: string;
  note: string;
  status: string;
  statusChange: string | null;
  occurredAt: number;
};

const PAGE_SIZE = 10;

export function AktivitasSaya() {
  const [statusLogs, setStatusLogs] = useState<StatusKomunikasiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<"Semua" | "Hari Ini" | "Minggu Ini" | "Bulan Ini">("Semua");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        setError(null);
        const statusResponse = await getStatusKomunikasi();
        setStatusLogs(statusResponse.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal mengambil data aktivitas");
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const parseDate = (value?: string | null): number => {
    if (!value) return 0;
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed.getTime();

    const match = value.match(/^(\d{1,2})\s([A-Za-z]{3})\s(\d{4})\s(\d{2}):(\d{2})$/);
    if (!match) return 0;

    const monthMap: Record<string, number> = {
      Jan: 0,
      Feb: 1,
      Mar: 2,
      Apr: 3,
      May: 4,
      Jun: 5,
      Jul: 6,
      Aug: 7,
      Sep: 8,
      Oct: 9,
      Nov: 10,
      Dec: 11,
    };

    const [, dd, mon, yyyy, hh, mm] = match;
    const d = new Date(Number(yyyy), monthMap[mon] ?? 0, Number(dd), Number(hh), Number(mm));
    return Number.isNaN(d.getTime()) ? 0 : d.getTime();
  };

  const formatTime = (value?: string | null): string => {
    const t = parseDate(value);
    if (!t) return "-";
    return new Date(t).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false });
  };

  const startOfToday = (() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now.getTime();
  })();

  const startOfWeek = (() => {
    const now = new Date();
    const day = now.getDay();
    const diff = day === 0 ? 6 : day - 1;
    now.setDate(now.getDate() - diff);
    now.setHours(0, 0, 0, 0);
    return now.getTime();
  })();

  const startOfMonth = (() => {
    const now = new Date();
    now.setDate(1);
    now.setHours(0, 0, 0, 0);
    return now.getTime();
  })();

  const timelineItems = useMemo(() => {
    const logsSorted = [...statusLogs].sort((a, b) => parseDate(a.follow_up_at) - parseDate(b.follow_up_at));

    const previousStatusMap = new Map<string, string>();

    const fromStatusLogs = logsSorted.map<TimelineItem>((item) => {
      const method = item.metode || "Status Update";
      const methodLower = method.toLowerCase();

      let icon: TimelineItem["icon"] = "status";
      let methodClass = "bg-blue-100 text-blue-700";
      let methodIconClass = "text-blue-600";

      if (methodLower.includes("call")) {
        icon = "call";
        methodClass = "bg-orange-100 text-orange-700";
        methodIconClass = "text-orange-600";
      } else if (methodLower.includes("whatsapp")) {
        icon = "whatsapp";
        methodClass = "bg-green-100 text-green-700";
        methodIconClass = "text-green-600";
      } else if (methodLower.includes("meeting")) {
        icon = "meeting";
        methodClass = "bg-purple-100 text-purple-700";
        methodIconClass = "text-purple-600";
      }

      const key = `${item.calon_jemaah || "-"}|${item.kontak || "-"}`;
      const previousStatus = previousStatusMap.get(key);
      previousStatusMap.set(key, item.status);

      return {
        id: item.id,
        time: formatTime(item.follow_up_at),
        method,
        methodClass,
        methodIconClass,
        icon,
        jemaahName: item.calon_jemaah || "-",
        note: item.catatan || "Update status",
        status: item.status,
        statusChange: previousStatus && previousStatus !== item.status ? `${previousStatus} → ${item.status}` : null,
        occurredAt: parseDate(item.follow_up_at),
      };
    });

    return fromStatusLogs
      .sort((a, b) => b.occurredAt - a.occurredAt)
      .filter((item, index, arr) => {
        const dup = arr.findIndex((x) => x.occurredAt === item.occurredAt && x.note === item.note && x.jemaahName === item.jemaahName);
        return dup === index;
      })
      .filter((item) => {
        if (!item.occurredAt) return true;
        if (filterTab === "Semua") return true;
        if (filterTab === "Hari Ini") return item.occurredAt >= startOfToday;
        if (filterTab === "Minggu Ini") return item.occurredAt >= startOfWeek;
        return item.occurredAt >= startOfMonth;
      })
      .sort((a, b) => b.occurredAt - a.occurredAt);
  }, [statusLogs, filterTab, startOfToday, startOfWeek, startOfMonth]);

  const stats = {
    followUpHariIni: statusLogs.filter((item) => parseDate(item.follow_up_at) >= startOfToday).length,
    totalAktivitas: statusLogs.length,
    closingBulanIni: statusLogs.filter((item) => item.status === "Closing" && parseDate(item.follow_up_at) >= startOfMonth).length,
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [filterTab]);

  const totalActivityPages = Math.max(1, Math.ceil(timelineItems.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalActivityPages);

  const paginatedTimelineItems = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;
    return timelineItems.slice(startIndex, startIndex + PAGE_SIZE);
  }, [timelineItems, safeCurrentPage]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-gray-600">Memuat aktivitas...</p>
        </div>
      </div>
    );
  }

  const renderTimelineIcon = (item: TimelineItem) => {
    if (item.icon === "call") {
      return <Phone className={`w-5 h-5 ${item.methodIconClass}`} />;
    }
    if (item.icon === "whatsapp") {
      return <MessageCircle className={`w-5 h-5 ${item.methodIconClass}`} />;
    }
    if (item.icon === "meeting") {
      return <Users className={`w-5 h-5 ${item.methodIconClass}`} />;
    }
    return <RefreshCw className={`w-5 h-5 ${item.methodIconClass}`} />;
  };

  return (
    <>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Aktivitas Saya</h1>
        <p className="text-gray-500 mt-1">Lihat semua aktivitas dan riwayat kerja</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 mb-6 inline-flex gap-2">
        {(["Semua", "Hari Ini", "Minggu Ini", "Bulan Ini"] as const).map((tab) => (
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Follow Up Hari Ini</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.followUpHariIni}</p>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "#1F6B7A20" }}>
              <Calendar className="w-6 h-6" style={{ color: "#1F6B7A" }} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Aktivitas</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalAktivitas}</p>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "#1F6B7A20" }}>
              <RefreshCw className="w-6 h-6" style={{ color: "#1F6B7A" }} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Closing Bulan Ini</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.closingBulanIni}</p>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "#1F6B7A20" }}>
              <Phone className="w-6 h-6" style={{ color: "#1F6B7A" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-cyan-50 text-cyan-700">
            <Calendar className="w-5 h-5" />
          </span>
          Timeline Aktivitas
        </h2>

        {timelineItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Tidak ada aktivitas</p>
          </div>
        ) : (
          <>
            <div className="relative space-y-8">
              <div className="absolute left-7 top-2 bottom-2 w-px bg-gray-200" />
              {paginatedTimelineItems.map((activity) => (
                <div key={activity.id} className="relative flex gap-4 pl-16">
                  <div className={`absolute left-0 top-1 z-10 w-14 h-14 rounded-full border-4 border-white shadow flex items-center justify-center ${activity.methodClass}`}>{renderTimelineIcon(activity)}</div>
                  <div className="flex-1 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <div className="flex flex-wrap items-center gap-3 mb-1">
                      <p className="text-base font-semibold text-gray-900">{activity.time}</p>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${activity.methodClass}`}>
                        {renderTimelineIcon(activity)}
                        {activity.method}
                      </span>
                    </div>
                    <p className="text-base font-medium text-gray-900">{activity.jemaahName}</p>
                    <p className="text-sm text-gray-700 mt-1">{activity.note}</p>
                    {activity.statusChange && <span className="inline-block mt-3 px-3 py-1 rounded-full border border-gray-300 bg-white text-xs font-medium text-gray-700">{activity.statusChange}</span>}
                  </div>
                </div>
              ))}
            </div>

            <TablePagination currentPage={safeCurrentPage} totalItems={timelineItems.length} pageSize={PAGE_SIZE} itemLabel="aktivitas" onPageChange={setCurrentPage} className="mt-6 border-gray-100 px-0 pb-0" />
          </>
        )}
      </div>
    </>
  );
}
