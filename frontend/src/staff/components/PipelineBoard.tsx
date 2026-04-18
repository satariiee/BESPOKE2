import { useState, useEffect } from "react";
import { Phone, Calendar, Loader, AlertCircle } from "lucide-react";
import { getCalonJemaah } from "../../app/lib/api";

interface JemaahCard {
  id: number;
  nama: string | null;
  kontak: string | null;
  paket: string | null;
  status_komunikasi: string;
}

interface PipelineColumn {
  title: string;
  color: string;
  cards: JemaahCard[];
}

export function PipelineBoard() {
  const [pipelineData, setPipelineData] = useState<PipelineColumn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPipeline = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getCalonJemaah();
        const jemaahList = response.data || [];

        // Group by status
        const grouped: Record<string, JemaahCard[]> = {
          "Prospek Baru": [],
          "Dihubungi": [],
          "Tertarik": [],
          "Closing": [],
        };

        jemaahList.forEach((jemaah) => {
          const status = jemaah.status_komunikasi || "Prospek Baru";
          if (grouped[status]) {
            grouped[status].push(jemaah);
          }
        });

        const pipeline: PipelineColumn[] = [
          {
            title: "Prospek Baru",
            color: "#94A3B8",
            cards: grouped["Prospek Baru"],
          },
          {
            title: "Dihubungi",
            color: "#60A5FA",
            cards: grouped["Dihubungi"],
          },
          {
            title: "Tertarik",
            color: "#FBBF24",
            cards: grouped["Tertarik"],
          },
          {
            title: "Closing",
            color: "#10B981",
            cards: grouped["Closing"],
          },
        ];

        setPipelineData(pipeline);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal mengambil data pipeline");
      } finally {
        setLoading(false);
      }
    };

    fetchPipeline();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-center h-64">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Memuat pipeline...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

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
              style={{ backgroundColor: column.color + "20" }}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">{column.title}</h3>
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: column.color + "40", color: column.color }}
                >
                  {column.cards.length}
                </span>
              </div>
            </div>

            {/* Cards */}
            <div className="space-y-3 flex-1">
              {column.cards.length === 0 ? (
                <div className="text-center py-4 text-gray-400 text-sm">
                  Kosong
                </div>
              ) : (
                column.cards.map((card) => (
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
                          {card.paket || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
