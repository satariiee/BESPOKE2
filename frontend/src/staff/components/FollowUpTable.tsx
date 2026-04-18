import { Phone, MessageCircle, Edit } from "lucide-react";

interface FollowUpItem {
  id: number;
  nama: string | null;
  kontak: string | null;
  tanggal: string | null;
  metode: string | null;
  status_komunikasi: string | null;
  status_jadwal: string | null;
  staff: string | null;
}

interface FollowUpTableProps {
  data?: FollowUpItem[];
}

const defaultData: FollowUpItem[] = [];

export function FollowUpTable({ data = defaultData }: FollowUpTableProps) {
  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Completed":
      case "Done":
        return "bg-green-100 text-green-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getMetodeIcon = (metode: string | null) => {
    if (!metode) return <Phone className="w-3 h-3" />;
    if (metode.toLowerCase().includes("whatsapp")) {
      return <MessageCircle className="w-3 h-3" />;
    }
    return <Phone className="w-3 h-3" />;
  };

  const displayData = data && data.length > 0 ? data : defaultData;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">Follow Up Hari Ini</h2>
        <p className="text-sm text-gray-500 mt-1">Jadwal follow up untuk hari ini</p>
      </div>

      {displayData.length === 0 ? (
        <div className="p-12 text-center">
          <p className="text-gray-500">Tidak ada jadwal follow up untuk hari ini</p>
        </div>
      ) : (
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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {displayData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm font-medium text-gray-900">{item.nama}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm text-gray-900">{item.tanggal}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {getMetodeIcon(item.metode)}
                      {item.metode || "N/A"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status_jadwal)}`}>
                      {item.status_jadwal || "Pending"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
