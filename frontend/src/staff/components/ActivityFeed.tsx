import { useState, useEffect } from "react";
import { CheckCircle, Calendar, RefreshCw, Phone, MessageCircle, Loader, AlertCircle } from "lucide-react";
import { getActivityLog, type ActivityLogItem } from "../../app/lib/api";

export function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getActivityLog();
        setActivities((response.data || []).slice(0, 6)); // Show only first 6
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal mengambil data aktivitas");
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const getActivityIcon = (title: string | undefined) => {
    const lowerTitle = (title || "").toLowerCase();

    if (lowerTitle.includes("follow up") || lowerTitle.includes("selesai")) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
    if (lowerTitle.includes("status") || lowerTitle.includes("update")) {
      return <RefreshCw className="w-5 h-5 text-blue-600" />;
    }
    if (lowerTitle.includes("jadwal") || lowerTitle.includes("schedule")) {
      return <Calendar className="w-5 h-5 text-purple-600" />;
    }
    if (lowerTitle.includes("panggilan") || lowerTitle.includes("call")) {
      return <Phone className="w-5 h-5 text-orange-600" />;
    }
    if (lowerTitle.includes("whatsapp")) {
      return <MessageCircle className="w-5 h-5 text-green-600" />;
    }

    return <CheckCircle className="w-5 h-5 text-gray-600" />;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-center h-64">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Memuat aktivitas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Aktivitas Terbaru</h2>
        <p className="text-sm text-gray-500 mt-1">Riwayat aktivitas marketing</p>
      </div>

      {error ? (
        <div className="flex items-center gap-3 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm">{error}</p>
        </div>
      ) : activities.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Tidak ada aktivitas</p>
      ) : (
        <>
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex gap-4">
                {/* Icon */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                  {getActivityIcon(activity.aktivitas)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.aktivitas}</p>
                  {activity.user && (
                    <p className="text-sm text-gray-500 mt-0.5">by {activity.user}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">{activity.created_at}</p>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-6 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors">
            Lihat Semua Aktivitas
          </button>
        </>
      )}
    </div>
  );
}
