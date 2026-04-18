import { useEffect, useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Phone, Calendar, User } from "lucide-react";
import { getCalonJemaah } from "../lib/api";

interface JemaahCard {
  id: number;
  nama: string;
  kontak: string;
  paket: string;
  lastFollowUp: string;
  staff: string;
  status: string;
}

const initialData: JemaahCard[] = [];

const columns = [
  { id: "Prospek Baru", title: "Prospek Baru", color: "bg-purple-500" },
  { id: "Dihubungi", title: "Dihubungi", color: "bg-blue-500" },
  { id: "Tertarik", title: "Tertarik", color: "bg-yellow-500" },
  {
    id: "Menunggu Keputusan",
    title: "Menunggu Keputusan",
    color: "bg-orange-500",
  },
  { id: "Closing", title: "Closing", color: "bg-green-500" },
  { id: "Tidak Jadi", title: "Tidak Jadi", color: "bg-gray-500" },
];

interface DraggableCardProps {
  jemaah: JemaahCard;
}

function DraggableCard({ jemaah }: DraggableCardProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "JEMAAH",
    item: jemaah,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div ref={drag} className={`bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-3 cursor-move hover:shadow-md transition-shadow ${isDragging ? "opacity-50" : "opacity-100"}`}>
      <h4 className="font-semibold text-gray-900 mb-2">{jemaah.nama}</h4>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <Phone className="w-3 h-3" />
          <span>{jemaah.kontak}</span>
        </div>

        <div className="bg-[#E8E0D4] text-[#1F6B7A] px-2 py-1 rounded text-xs font-medium inline-block">{jemaah.paket}</div>

        <div className="flex items-center gap-2 text-gray-500 text-xs">
          <Calendar className="w-3 h-3" />
          <span>Last: {jemaah.lastFollowUp}</span>
        </div>

        <div className="flex items-center gap-2 text-gray-500 text-xs">
          <User className="w-3 h-3" />
          <span>{jemaah.staff}</span>
        </div>
      </div>
    </div>
  );
}

interface ColumnProps {
  column: { id: string; title: string; color: string };
  jemaahList: JemaahCard[];
  onDrop: (jemaah: JemaahCard, newStatus: string) => void;
}

function Column({ column, jemaahList, onDrop }: ColumnProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "JEMAAH",
    drop: (item: JemaahCard) => onDrop(item, column.id),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const count = jemaahList.length;

  return (
    <div className="flex-shrink-0 w-80">
      <Card className={`shadow-sm h-full ${isOver ? "ring-2 ring-[#1F6B7A]" : ""}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${column.color}`}></div>
              <CardTitle className="text-base">{column.title}</CardTitle>
            </div>
            <Badge variant="secondary" className="bg-gray-100 text-gray-700">
              {count}
            </Badge>
          </div>
        </CardHeader>
        <CardContent ref={drop} className="min-h-[600px]">
          {jemaahList.map((jemaah) => (
            <DraggableCard key={jemaah.id} jemaah={jemaah} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function StatusKomunikasi() {
  const [jemaahData, setJemaahData] = useState<JemaahCard[]>(initialData);

  useEffect(() => {
    let active = true;

    getCalonJemaah()
      .then((response) => {
        if (!active) return;

        setJemaahData(
          response.data.map((item) => ({
            id: item.id,
            nama: item.nama,
            kontak: item.kontak,
            paket: item.paket ?? "-",
            lastFollowUp: item.last_follow_up_at ?? "-",
            staff: item.staff ?? "-",
            status: item.status_komunikasi,
          })),
        );
      })
      .catch(() => {
        if (!active) return;
        setJemaahData([]);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleDrop = (jemaah: JemaahCard, newStatus: string) => {
    setJemaahData((prevData) => prevData.map((item) => (item.id === jemaah.id ? { ...item, status: newStatus } : item)));
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Status Komunikasi Jemaah</h1>
          <p className="text-gray-500 mt-1">Kelola pipeline komunikasi dengan calon jemaah</p>
        </div>

        {/* Kanban Board */}
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {columns.map((column) => {
              const columnJemaah = jemaahData.filter((jemaah) => jemaah.status === column.id);
              return <Column key={column.id} column={column} jemaahList={columnJemaah} onDrop={handleDrop} />;
            })}
          </div>
        </div>
      </div>
    </DndProvider>
  );
}
