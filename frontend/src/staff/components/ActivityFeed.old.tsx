import { CheckCircle, Calendar, RefreshCw, Phone, MessageCircle } from "lucide-react";

interface Activity {
  id: number;
  type: "follow_up" | "status_update" | "schedule" | "call" | "whatsapp";
  title: string;
  description: string;
  time: string;
}

const activities: Activity[] = [
  {
    id: 1,
    type: "follow_up",
    title: "Follow up selesai",
    description: "Follow up dengan Ibu Fatimah telah diselesaikan",
    time: "10 menit lalu",
  },
  {
    id: 2,
    type: "status_update",
    title: "Status updated",
    description: "H. Abdullah dipindahkan ke Tertarik",
    time: "30 menit lalu",
  },
  {
    id: 3,
    type: "call",
    title: "Panggilan dilakukan",
    description: "Panggilan dengan H. Abdul Rahman",
    time: "1 jam lalu",
  },
  {
    id: 4,
    type: "schedule",
    title: "Jadwal ditambahkan",
    description: "Follow up dengan Ibu Khadijah dijadwalkan untuk 18 Mar",
    time: "2 jam lalu",
  },
  {
    id: 5,
    type: "whatsapp",
    title: "Pesan WhatsApp terkirim",
    description: "Pesan dikirim ke Hj. Siti Aminah",
    time: "3 jam lalu",
  },
  {
    id: 6,
    type: "follow_up",
    title: "Follow up selesai",
    description: "Follow up dengan Bapak Usman telah diselesaikan",
    time: "4 jam lalu",
  },
];

export function ActivityFeed() {
  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "follow_up":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "status_update":
        return <RefreshCw className="w-5 h-5 text-blue-600" />;
      case "schedule":
        return <Calendar className="w-5 h-5 text-purple-600" />;
      case "call":
        return <Phone className="w-5 h-5 text-orange-600" />;
      case "whatsapp":
        return <MessageCircle className="w-5 h-5 text-green-600" />;
      default:
        return <CheckCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Aktivitas Terbaru</h2>
        <p className="text-sm text-gray-500 mt-1">Riwayat aktivitas marketing</p>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex gap-4">
            {/* Icon */}
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
              {getActivityIcon(activity.type)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{activity.title}</p>
              <p className="text-sm text-gray-500 mt-0.5">{activity.description}</p>
              <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-6 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors">
        Lihat Semua Aktivitas
      </button>
    </div>
  );
}
