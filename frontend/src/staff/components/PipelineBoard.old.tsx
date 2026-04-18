import { Phone, Calendar } from "lucide-react";

interface JemaahCard {
  id: number;
  nama: string;
  kontak: string;
  paket: string;
  lastFollowUp: string;
}

interface PipelineColumn {
  title: string;
  color: string;
  cards: JemaahCard[];
}

const pipelineData: PipelineColumn[] = [
  {
    title: "Prospek",
    color: "#94A3B8",
    cards: [
      {
        id: 1,
        nama: "Ahmad Hidayat",
        kontak: "081234567890",
        paket: "Paket Reguler",
        lastFollowUp: "2 hari lalu",
      },
      {
        id: 2,
        nama: "Nurul Huda",
        kontak: "081234567891",
        paket: "Paket VIP",
        lastFollowUp: "3 hari lalu",
      },
    ],
  },
  {
    title: "Dihubungi",
    color: "#60A5FA",
    cards: [
      {
        id: 3,
        nama: "Hj. Aminah",
        kontak: "081234567892",
        paket: "Paket Reguler",
        lastFollowUp: "1 hari lalu",
      },
      {
        id: 4,
        nama: "Ibrahim Ali",
        kontak: "081234567893",
        paket: "Paket Premium",
        lastFollowUp: "Hari ini",
      },
      {
        id: 5,
        nama: "Siti Maryam",
        kontak: "081234567894",
        paket: "Paket VIP",
        lastFollowUp: "Hari ini",
      },
    ],
  },
  {
    title: "Tertarik",
    color: "#FBBF24",
    cards: [
      {
        id: 6,
        nama: "H. Abdullah",
        kontak: "081234567895",
        paket: "Paket Premium",
        lastFollowUp: "Hari ini",
      },
      {
        id: 7,
        nama: "Fatimah Zahra",
        kontak: "081234567896",
        paket: "Paket Reguler",
        lastFollowUp: "2 hari lalu",
      },
    ],
  },
  {
    title: "Closing",
    color: "#10B981",
    cards: [
      {
        id: 8,
        nama: "H. Muhammad",
        kontak: "081234567897",
        paket: "Paket VIP",
        lastFollowUp: "Hari ini",
      },
    ],
  },
];

export function PipelineBoard() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Pipeline</h2>
        <p className="text-sm text-gray-500 mt-1">Status perjalanan jemaah</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {pipelineData.map((column, columnIndex) => (
          <div key={columnIndex} className="flex flex-col">
            {/* Column Header */}
            <div 
              className="rounded-lg p-3 mb-3"
              style={{ backgroundColor: column.color + '20' }}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">{column.title}</h3>
                <span 
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: column.color + '40', color: column.color }}
                >
                  {column.cards.length}
                </span>
              </div>
            </div>

            {/* Cards */}
            <div className="space-y-3 flex-1">
              {column.cards.map((card) => (
                <div
                  key={card.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <h4 className="font-medium text-gray-900 mb-2">{card.nama}</h4>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-3.5 h-3.5" />
                      <span className="text-xs">{card.kontak}</span>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {card.paket}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-500 pt-2 border-t border-gray-100">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="text-xs">{card.lastFollowUp}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
