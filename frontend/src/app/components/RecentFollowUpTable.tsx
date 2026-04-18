import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Eye, Phone } from "lucide-react";

type FollowUpItem = {
  id: number;
  nama: string | null;
  kontak: string | null;
  status_komunikasi: string | null;
  tanggal: string | null;
  staff: string | null;
};

type RecentFollowUpTableProps = {
  items: FollowUpItem[];
};

const statusColor: Record<string, string> = {
  "Prospek Baru": "bg-purple-100 text-purple-800",
  Dihubungi: "bg-blue-100 text-blue-800",
  Tertarik: "bg-yellow-100 text-yellow-800",
  Closing: "bg-green-100 text-green-800",
  "Tidak Jadi": "bg-red-100 text-red-800",
  "Menunggu Keputusan": "bg-orange-100 text-orange-800",
  Pending: "bg-gray-100 text-gray-700",
  "In Progress": "bg-sky-100 text-sky-800",
  Done: "bg-emerald-100 text-emerald-800",
};

export function RecentFollowUpTable({ items }: RecentFollowUpTableProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Follow Up Terbaru</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Jemaah</TableHead>
                <TableHead>Kontak</TableHead>
                <TableHead>Status Komunikasi</TableHead>
                <TableHead>Jadwal Follow Up</TableHead>
                <TableHead>Staff Marketing</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.nama}</TableCell>
                  <TableCell>{item.kontak}</TableCell>
                  <TableCell>
                    <Badge className={statusColor[item.status_komunikasi ?? ""] ?? "bg-gray-100 text-gray-700"} variant="secondary">
                      {item.status_komunikasi}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.tanggal}</TableCell>
                  <TableCell>{item.staff}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
