import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components/ui/dropdown-menu";
import { Plus, Calendar as CalendarIcon, Clock, AlertCircle, Phone, MessageCircle, Users as UsersIcon, MoreVertical, Edit, Trash2, CheckCircle } from "lucide-react";
import { getJadwalFollowUp, deleteJadwalFollowUp, updateJadwalFollowUp } from "../lib/api";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../components/ui/alert-dialog";
import { TablePagination } from "../components/TablePagination";

const todayLabel = new Date().toLocaleDateString("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const statusColor: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-800",
  "In Progress": "bg-blue-100 text-blue-800",
  Done: "bg-green-100 text-green-800",
};

const PAGE_SIZE = 10;

export function JadwalFollowUp() {
  const navigate = useNavigate();
  const [filterMetode, setFilterMetode] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [rows, setRows] = useState<
    Array<{
      id: number;
      calon_jemaah: string | null;
      kontak: string | null;
      tanggal: string | null;
      metode: string | null;
      staff: string | null;
      status: string | null;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let active = true;
    loadData();

    return () => {
      active = false;
    };
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const response = await getJadwalFollowUp();
      setRows(response.data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal memuat jadwal");
    } finally {
      setLoading(false);
    }
  }

  const getMetodeIcon = (metode: string) => {
    switch (metode) {
      case "Call":
        return <Phone className="w-4 h-4" />;
      case "WhatsApp":
        return <MessageCircle className="w-4 h-4" />;
      case "Meeting":
        return <UsersIcon className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const handleMarkComplete = async (id: number) => {
    try {
      await updateJadwalFollowUp(id, { status: "Done" });
      toast.success("Jadwal follow up ditandai selesai!");
      loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal memperbarui jadwal");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setDeletingId(id);
      await deleteJadwalFollowUp(id);
      toast.success("Jadwal follow up berhasil dihapus!");
      loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menghapus jadwal");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredRows = useMemo(() => {
    return rows.filter((item) => {
      const byMetode = filterMetode === "all" || (item.metode ?? "").toLowerCase() === filterMetode;
      const byStatus = filterStatus === "all" || (item.status ?? "") === filterStatus;
      return byMetode && byStatus;
    });
  }, [filterMetode, filterStatus, rows]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterMetode, filterStatus]);

  const totalFilteredPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalFilteredPages);

  const paginatedFilteredRows = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;
    return filteredRows.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredRows, safeCurrentPage]);

  const todayCount = rows.filter((item) => (item.tanggal ?? "").includes(todayLabel)).length;
  const weeklyCount = rows.length;
  const pendingCount = rows.filter((item) => item.status === "Pending").length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Jadwal Follow Up</h1>
          <p className="text-gray-500 mt-1">Kelola jadwal follow up calon jemaah</p>
        </div>
        <Button className="gap-2 bg-[#1F6B7A] hover:bg-[#176059]" onClick={() => navigate("/jadwal-follow-up/tambah")}>
          <Plus className="w-4 h-4" />
          Tambah Jadwal Follow Up
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">Follow Up Hari Ini</p>
                <h3 className="text-3xl font-bold text-gray-900">{loading ? "..." : todayCount}</h3>
                <p className="text-sm text-gray-500 mt-2">{todayLabel}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl">
                <CalendarIcon className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">Follow Up Minggu Ini</p>
                <h3 className="text-3xl font-bold text-gray-900">{loading ? "..." : weeklyCount}</h3>
                <p className="text-sm text-green-600 mt-2">Total jadwal terdaftar</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-xl">
                <Clock className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">Follow Up Terlewat</p>
                <h3 className="text-3xl font-bold text-gray-900">{loading ? "..." : pendingCount}</h3>
                <p className="text-sm text-red-600 mt-2">Status pending</p>
              </div>
              <div className="bg-red-50 p-4 rounded-xl">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={filterMetode} onValueChange={setFilterMetode}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter Metode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Metode</SelectItem>
                <SelectItem value="call">Call</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Done">Done</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="all" disabled>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter Staff" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Staff</SelectItem>
                <SelectItem value="ahmad">Ahmad Fauzi</SelectItem>
                <SelectItem value="fatimah">Fatimah Zahra</SelectItem>
                <SelectItem value="zainab">Zainab Rahman</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Table */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Jemaah</TableHead>
                  <TableHead>Kontak</TableHead>
                  <TableHead>Jadwal Follow Up</TableHead>
                  <TableHead>Metode</TableHead>
                  <TableHead>Staff Marketing</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-gray-500">
                      Memuat jadwal follow up...
                    </TableCell>
                  </TableRow>
                ) : null}
                {!loading
                  ? paginatedFilteredRows.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.calon_jemaah ?? "-"}</TableCell>
                        <TableCell>{item.kontak ?? "-"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 text-gray-400" />
                            {item.tanggal ?? "-"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getMetodeIcon(item.metode ?? "")}
                            {item.metode ?? "-"}
                          </div>
                        </TableCell>
                        <TableCell>{item.staff ?? "-"}</TableCell>
                        <TableCell>
                          <Badge className={statusColor[item.status ?? ""] ?? "bg-gray-100 text-gray-700"} variant="secondary">
                            {item.status ?? "-"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {item.status !== "Done" && (
                                <DropdownMenuItem onClick={() => handleMarkComplete(item.id)}>
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Mark as Complete
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => navigate(`/jadwal-follow-up/${item.id}/edit`)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Jadwal
                              </DropdownMenuItem>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                                    <AlertDialogDescription>Apakah Anda yakin ingin menghapus jadwal follow up ini? Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <div className="flex gap-3 justify-end">
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-red-600 hover:bg-red-700" disabled={deletingId === item.id}>
                                      {deletingId === item.id ? "Menghapus..." : "Hapus"}
                                    </AlertDialogAction>
                                  </div>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  : null}
                {!loading && filteredRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-gray-500">
                      Tidak ada jadwal yang cocok.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>

          <TablePagination currentPage={safeCurrentPage} totalItems={filteredRows.length} pageSize={PAGE_SIZE} itemLabel="jadwal" onPageChange={setCurrentPage} />
        </CardContent>
      </Card>
    </div>
  );
}
