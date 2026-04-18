import { Card, CardContent } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Target, Users, Award, FileDown, Plus, Edit, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { getLaporanClosing, LaporanClosingItem, deleteLaporanClosing } from "../lib/api";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../components/ui/alert-dialog";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { TablePagination } from "../components/TablePagination";

interface MonthlyData {
  month: string;
  closing: number;
}

interface ConversionData {
  month: string;
  rate: number;
}

interface StaffPerformance {
  name: string;
  closing: number;
  rate: string;
}

interface ClosingHistoryItem extends LaporanClosingItem {
  statusColor: string;
  harga?: string;
  paket?: string;
  tanggal?: string;
}

const PAGE_SIZE = 10;

export function LaporanClosing() {
  const navigate = useNavigate();
  const [closingData, setClosingData] = useState<LaporanClosingItem[]>([]);
  const [monthlyClosingData, setMonthlyClosingData] = useState<MonthlyData[]>([]);
  const [conversionTrendData, setConversionTrendData] = useState<ConversionData[]>([]);
  const [staffPerformance, setStaffPerformance] = useState<StaffPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalClosingThisMonth, setTotalClosingThisMonth] = useState(0);
  const [conversionRate, setConversionRate] = useState(0);
  const [bestPerformer, setBestPerformer] = useState({ name: "", closing: 0, rate: 0 });
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadLaporanClosing();
  }, []);

  async function loadLaporanClosing() {
    try {
      setLoading(true);
      const result = await getLaporanClosing();
      const data = result.data;
      setClosingData(data);

      // Process data for charts and statistics
      processClosingData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load laporan closing");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: number) => {
    try {
      setDeletingId(id);
      await deleteLaporanClosing(id);
      toast.success("Data laporan closing berhasil dihapus!");
      loadLaporanClosing();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menghapus data");
    } finally {
      setDeletingId(null);
    }
  };

  const handleExportPdf = () => {
    if (closingData.length === 0) {
      toast.error("Tidak ada data closing untuk diexport.");
      return;
    }

    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    const generatedAt = new Date();

    doc.setFontSize(16);
    doc.text("Laporan Closing", 40, 40);
    doc.setFontSize(10);
    doc.text(`Dibuat pada: ${generatedAt.toLocaleString("id-ID")}`, 40, 58);
    doc.text(`Total closing: ${closingData.length} | Conversion rate: ${conversionRate}%`, 40, 74);

    const body = closingData.map((item, index) => [
      String(index + 1),
      item.calon_jemaah ?? "-",
      item.kontak ?? "-",
      item.tanggal_closing ?? "-",
      item.staff ?? "-",
      item.nilai ? `Rp ${item.nilai.toLocaleString("id-ID")}` : "-",
      item.status_pembayaran ?? "-",
      item.catatan ?? "-",
    ]);

    autoTable(doc, {
      startY: 88,
      head: [["No", "Nama Jemaah", "Kontak", "Tanggal Closing", "Staff", "Nilai", "Tipe Pembayaran", "Catatan"]],
      body,
      styles: {
        fontSize: 9,
        cellPadding: 4,
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: [31, 107, 122],
      },
      columnStyles: {
        0: { cellWidth: 24 },
        1: { cellWidth: 100 },
        2: { cellWidth: 90 },
        3: { cellWidth: 90 },
        4: { cellWidth: 90 },
        5: { cellWidth: 90 },
        6: { cellWidth: 90 },
        7: { cellWidth: 160 },
      },
    });

    doc.save(`laporan-closing-${generatedAt.toISOString().slice(0, 10)}.pdf`);
    toast.success("PDF laporan closing berhasil diunduh.");
  };

  function processClosingData(data: LaporanClosingItem[]) {
    // Get current month
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    // Count closing this month
    const thisMonthClosing = data.filter((item) => {
      if (!item.tanggal_closing) return false;
      const itemDate = new Date(item.tanggal_closing);
      return itemDate.getFullYear() === currentYear && itemDate.getMonth() + 1 === currentMonth;
    }).length;
    setTotalClosingThisMonth(thisMonthClosing);

    // Group by month for monthly closing chart (last 6 months)
    const monthlyMap = new Map<string, number>();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - 1 - i, 1);
      const monthStr = monthNames[date.getMonth()];
      monthlyMap.set(monthStr, 0);
    }

    // Count closings by month
    data.forEach((item) => {
      if (!item.tanggal_closing) return;
      const itemDate = new Date(item.tanggal_closing);
      if (itemDate.getFullYear() === currentYear) {
        const monthStr = monthNames[itemDate.getMonth()];
        monthlyMap.set(monthStr, (monthlyMap.get(monthStr) || 0) + 1);
      }
    });

    setMonthlyClosingData(Array.from(monthlyMap, ([month, closing]) => ({ month, closing })));

    // Calculate staff performance
    const staffMap = new Map<string, { count: number; total: number; rate: number }>();

    data.forEach((item) => {
      if (!item.staff) return;
      const current = staffMap.get(item.staff) || { count: 0, total: 0, rate: 0 };
      current.count += 1;
      if (item.nilai) current.total += item.nilai;
      staffMap.set(item.staff, current);
    });

    const staffList = Array.from(staffMap, ([name, stats]) => ({
      name,
      closing: stats.count,
      rate: `${Math.round((stats.count / data.length) * 100)}%`,
    }))
      .sort((a, b) => b.closing - a.closing)
      .slice(0, 3);

    setStaffPerformance(staffList);

    if (staffList.length > 0) {
      setBestPerformer({
        name: staffList[0].name,
        closing: staffList[0].closing,
        rate: parseInt(staffList[0].rate),
      });
    }

    // Calculate conversion trend (simplified - using closing count as proxy)
    const conversionMap = new Map<string, number>();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - 1 - i, 1);
      const monthStr = monthNames[date.getMonth()];
      conversionMap.set(monthStr, 0);
    }

    data.forEach((item) => {
      if (!item.tanggal_closing) return;
      const itemDate = new Date(item.tanggal_closing);
      if (itemDate.getFullYear() === currentYear) {
        const monthStr = monthNames[itemDate.getMonth()];
        const current = conversionMap.get(monthStr) || 0;
        conversionMap.set(monthStr, current + (item.status_pembayaran === "Lunas" ? 1 : 0.5));
      }
    });

    setConversionTrendData(
      Array.from(conversionMap, ([month, rate]) => ({
        month,
        rate: Math.round(rate),
      })),
    );

    // Calculate overall conversion rate
    const totalLunas = data.filter((item) => item.status_pembayaran === "Lunas").length;
    const rate = data.length > 0 ? Math.round((totalLunas / data.length) * 100) : 0;
    setConversionRate(rate);
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "Lunas":
        return "bg-green-100 text-green-800";
      case "DP":
      case "DP 50%":
      case "DP 30%":
        return "bg-yellow-100 text-yellow-800";
      case "Cicilan":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  const totalClosingPages = Math.max(1, Math.ceil(closingData.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalClosingPages);

  const paginatedClosingData = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;
    return closingData.slice(startIndex, startIndex + PAGE_SIZE);
  }, [closingData, safeCurrentPage]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Laporan Closing</h1>
          <p className="text-gray-500 mt-1">Analisis performa closing dan konversi penjualan</p>
        </div>
        <div className="text-center py-12">
          <p className="text-gray-500">Loading data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Laporan Closing</h1>
          <p className="text-gray-500 mt-1">Analisis performa closing dan konversi penjualan</p>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <p className="text-red-600">Error: {error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Laporan Closing</h1>
          <p className="text-gray-500 mt-1">Analisis performa closing dan konversi penjualan</p>
        </div>
        <Button onClick={handleExportPdf} className="bg-[#1F6B7A] hover:bg-[#176059]">
          <FileDown className="w-4 h-4 mr-2" />
          Export PDF
        </Button>
      </div>

      {/* Top Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">Total Closing Bulan Ini</p>
                <h3 className="text-3xl font-bold text-gray-900">{totalClosingThisMonth}</h3>
                <p className="text-sm text-green-600 mt-2">↑ {((totalClosingThisMonth / Math.max(closingData.length, 1)) * 100).toFixed(0)}% dari total</p>
              </div>
              <div className="bg-green-50 p-4 rounded-xl">
                <Target className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">Conversion Rate</p>
                <h3 className="text-3xl font-bold text-gray-900">{conversionRate}%</h3>
                <p className="text-sm text-green-600 mt-2">↑ Status Pembayaran</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl">
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">Total Follow Up</p>
                <h3 className="text-3xl font-bold text-gray-900">{closingData.length}</h3>
                <p className="text-sm text-gray-500 mt-2">Data Aktual</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-xl">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">Best Performer</p>
                <h3 className="text-xl font-bold text-gray-900">{bestPerformer.name || "N/A"}</h3>
                <p className="text-sm text-[#1F6B7A] mt-2">
                  {bestPerformer.closing} closing ({bestPerformer.rate}%)
                </p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-xl">
                <Award className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Closing Chart */}
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Closing Bulanan</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyClosingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar dataKey="closing" fill="#1F6B7A" name="Total Closing" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Conversion Trend Chart */}
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tren Conversion Rate (%)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={conversionTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={3} name="Conversion Rate" dot={{ fill: "#10b981", r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Staff Performance */}
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Closing Rate per Staff</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {staffPerformance.map((staff, index) => (
              <div key={index} className="bg-gradient-to-br from-[#1F6B7A] to-[#176059] p-6 rounded-lg text-white">
                <p className="text-sm opacity-90 mb-2">{staff.name}</p>
                <p className="text-3xl font-bold mb-1">{staff.closing}</p>
                <p className="text-sm opacity-90">Closing Rate: {staff.rate}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Closing History Table */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Riwayat Closing</h3>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Jemaah</TableHead>
                  <TableHead>Kontak</TableHead>
                  <TableHead>Tanggal Closing</TableHead>
                  <TableHead>Staff Marketing</TableHead>
                  <TableHead>Nilai</TableHead>
                  <TableHead>Status Pembayaran</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedClosingData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.calon_jemaah || "N/A"}</TableCell>
                    <TableCell>{item.kontak || "N/A"}</TableCell>
                    <TableCell>{item.tanggal_closing || "N/A"}</TableCell>
                    <TableCell>{item.staff || "N/A"}</TableCell>
                    <TableCell>{item.nilai ? `Rp ${item.nilai.toLocaleString("id-ID")}` : "-"}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(item.status_pembayaran || "")} variant="secondary">
                        {item.status_pembayaran || "N/A"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <TablePagination currentPage={safeCurrentPage} totalItems={closingData.length} pageSize={PAGE_SIZE} itemLabel="closing" onPageChange={setCurrentPage} />
        </CardContent>
      </Card>
    </div>
  );
}
