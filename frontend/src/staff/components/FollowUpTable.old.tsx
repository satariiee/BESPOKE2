import { Phone, MessageCircle, Edit } from "lucide-react";

interface FollowUp {
  id: number;
  nama: string;
  jadwal: string;
  waktu: string;
  metode: "Call" | "WhatsApp";
  status: "Pending" | "Completed" | "Reschedule";
}

const followUps: FollowUp[] = [
  {
    id: 1,
    nama: "Hj. Siti Aminah",
    jadwal: "17 Mar 2026",
    waktu: "09:00",
    metode: "WhatsApp",
    status: "Pending",
  },
  {
    id: 2,
    nama: "H. Abdul Rahman",
    jadwal: "17 Mar 2026",
    waktu: "10:30",
    metode: "Call",
    status: "Pending",
  },
  {
    id: 3,
    nama: "Ibu Fatimah",
    jadwal: "17 Mar 2026",
    waktu: "13:00",
    metode: "WhatsApp",
    status: "Completed",
  },
  {
    id: 4,
    nama: "Bapak Usman",
    jadwal: "17 Mar 2026",
    waktu: "14:30",
    metode: "Call",
    status: "Pending",
  },
  {
    id: 5,
    nama: "Ibu Khadijah",
    jadwal: "17 Mar 2026",
    waktu: "16:00",
    metode: "WhatsApp",
    status: "Reschedule",
  },
];

export function FollowUpTable() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Reschedule":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">Follow Up Hari Ini</h2>
        <p className="text-sm text-gray-500 mt-1">Jadwal follow up untuk hari ini</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nama Jemaah
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Jadwal
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Metode
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {followUps.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <p className="text-sm font-medium text-gray-900">{item.nama}</p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <p className="text-sm text-gray-900">{item.jadwal}</p>
                  <p className="text-xs text-gray-500">{item.waktu}</p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {item.metode === "Call" ? (
                      <Phone className="w-3 h-3" />
                    ) : (
                      <MessageCircle className="w-3 h-3" />
                    )}
                    {item.metode}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <button 
                      className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                      title="Call"
                    >
                      <Phone className="w-4 h-4 text-green-600" />
                    </button>
                    <button 
                      className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                      title="WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4 text-blue-600" />
                    </button>
                    <button 
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Update"
                    >
                      <Edit className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
