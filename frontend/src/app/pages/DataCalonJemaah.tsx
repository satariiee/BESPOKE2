import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../components/ui/alert-dialog";
import { Plus, Upload, Filter, Search, Edit, Download, FileUp, CheckCircle2, AlertCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { commitImportCalonJemaah, deleteCalonJemaah, getCalonJemaah, previewImportCalonJemaah, type CalonJemaah, type ImportCalonJemaahCommitResponse, type ImportCalonJemaahPreviewResponse } from "../lib/api";
import { TablePagination } from "../components/TablePagination";

const statusColor: Record<string, string> = {
  "Prospek Baru": "bg-purple-100 text-purple-800",
  Dihubungi: "bg-blue-100 text-blue-800",
  Tertarik: "bg-yellow-100 text-yellow-800",
  Closing: "bg-green-100 text-green-800",
  "Tidak Jadi": "bg-red-100 text-red-800",
  "Menunggu Keputusan": "bg-orange-100 text-orange-800",
};

const PAGE_SIZE = 10;

export function DataCalonJemaah() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [rows, setRows] = useState<CalonJemaah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importStep, setImportStep] = useState<1 | 2 | 3>(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<ImportCalonJemaahPreviewResponse["data"] | null>(null);
  const [importMode, setImportMode] = useState<"upsert" | "insert_only" | "update_only">("upsert");
  const [previewing, setPreviewing] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [importResult, setImportResult] = useState<ImportCalonJemaahCommitResponse["data"] | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const resetImportState = () => {
    setImportStep(1);
    setSelectedFile(null);
    setPreviewData(null);
    setImportMode("upsert");
    setImportResult(null);
    setPreviewing(false);
    setCommitting(false);
  };

  const refreshRows = async () => {
    const params: Record<string, string | undefined> = {};
    if (searchTerm.trim()) {
      params.search = searchTerm.trim();
    }
    if (filterStatus !== "all") {
      params.status = filterStatus;
    }

    const response = await getCalonJemaah(params);
    setRows(response.data);
  };

  const handleTemplateDownload = () => {
    const anchor = document.createElement("a");
    anchor.href = "/templates/template-import-calon-jemaah.csv";
    anchor.download = "template-import-calon-jemaah.csv";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  const handlePreviewImport = async () => {
    if (!selectedFile) {
      toast.error("Pilih file CSV/XLSX terlebih dahulu.");
      return;
    }

    try {
      setPreviewing(true);
      const response = await previewImportCalonJemaah(selectedFile);
      setPreviewData(response.data);
      setImportStep(2);
      toast.success("Preview import berhasil dibuat.");
    } catch (previewError: unknown) {
      toast.error(previewError instanceof Error ? previewError.message : "Gagal membuat preview import");
    } finally {
      setPreviewing(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setDeletingId(id);
      await deleteCalonJemaah(id);
      toast.success("Data calon jemaah berhasil dihapus!");
      await refreshRows();
    } catch (deleteError) {
      toast.error(deleteError instanceof Error ? deleteError.message : "Gagal menghapus data");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCommitImport = async () => {
    if (!previewData?.token) {
      toast.error("Token preview tidak tersedia. Lakukan preview ulang.");
      return;
    }

    try {
      setCommitting(true);
      const response = await commitImportCalonJemaah({ token: previewData.token, mode: importMode });
      setImportResult(response.data);
      setImportStep(3);
      toast.success("Proses import selesai.");
      await refreshRows();
    } catch (commitError: unknown) {
      toast.error(commitError instanceof Error ? commitError.message : "Gagal memproses import");
    } finally {
      setCommitting(false);
    }
  };

  const handleDownloadErrorReport = () => {
    if (!importResult?.error_report_csv) {
      return;
    }

    const blob = new Blob([importResult.error_report_csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "import-error-report.csv";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    let active = true;

    const params: Record<string, string | undefined> = {};
    if (searchTerm.trim()) {
      params.search = searchTerm.trim();
    }
    if (filterStatus !== "all") {
      params.status = filterStatus;
    }

    setLoading(true);
    getCalonJemaah(params)
      .then((response) => {
        if (active) {
          setRows(response.data);
        }
      })
      .catch((fetchError: unknown) => {
        if (active) {
          setError(fetchError instanceof Error ? fetchError.message : "Gagal memuat data jemaah");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [searchTerm, filterStatus]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedRows = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;
    return rows.slice(startIndex, startIndex + PAGE_SIZE);
  }, [rows, safeCurrentPage]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Data Calon Jemaah</h1>
          <p className="text-gray-500 mt-1">Kelola data calon jemaah umrah</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" onClick={() => setImportOpen(true)}>
            <Upload className="w-4 h-4" />
            Import Data
          </Button>
          <Button className="gap-2 bg-[#1F6B7A] hover:bg-[#176059]" onClick={() => navigate("/data-calon-jemaah/tambah")}>
            <Plus className="w-4 h-4" />
            Tambah Jemaah
          </Button>
        </div>
      </div>

      {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      {/* Filters and Search */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Cari nama atau kontak..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="Prospek Baru">Prospek Baru</SelectItem>
                <SelectItem value="Dihubungi">Dihubungi</SelectItem>
                <SelectItem value="Tertarik">Tertarik</SelectItem>
                <SelectItem value="Menunggu Keputusan">Menunggu Keputusan</SelectItem>
                <SelectItem value="Closing">Closing</SelectItem>
                <SelectItem value="Tidak Jadi">Tidak Jadi</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Jemaah</TableHead>
                  <TableHead>Kontak</TableHead>
                  <TableHead>Alamat</TableHead>
                  <TableHead>Status Komunikasi</TableHead>
                  <TableHead>Paket</TableHead>
                  <TableHead>Last Follow Up</TableHead>
                  <TableHead>Staff Marketing</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center text-gray-500">
                      Memuat data jemaah...
                    </TableCell>
                  </TableRow>
                ) : null}

                {!loading && rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center text-gray-500">
                      Tidak ada data jemaah yang cocok.
                    </TableCell>
                  </TableRow>
                ) : null}

                {!loading
                  ? paginatedRows.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.nama}</TableCell>
                        <TableCell>{item.kontak}</TableCell>
                        <TableCell>{item.alamat ?? "-"}</TableCell>
                        <TableCell>
                          <Badge className={statusColor[item.status_komunikasi] ?? "bg-gray-100 text-gray-700"} variant="secondary">
                            {item.status_komunikasi}
                          </Badge>
                        </TableCell>
                        <TableCell>{item.paket ?? "-"}</TableCell>
                        <TableCell>{item.last_follow_up_at ?? "-"}</TableCell>
                        <TableCell>{item.staff ?? "-"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {/* <Button variant="outline" size="sm" onClick={() => navigate(`/data-calon-jemaah/${item.id}/detail`)}>
                              <Eye className="w-4 h-4 mr-1" /> Detail
                            </Button> */}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50" disabled={deletingId === item.id}>
                                  <Trash2 className="w-4 h-4" />
                                  Hapus
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                                  <AlertDialogDescription>Apakah Anda yakin ingin menghapus data calon jemaah ini? Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="flex gap-3 justify-end">
                                  <AlertDialogCancel>Batal</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-red-600 hover:bg-red-700">
                                    Hapus
                                  </AlertDialogAction>
                                </div>
                              </AlertDialogContent>
                            </AlertDialog>
                            <Button variant="outline" size="sm" onClick={() => navigate(`/data-calon-jemaah/${item.id}/edit`)}>
                              <Edit className="w-4 h-4 mr-1" /> Edit
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  : null}
              </TableBody>
            </Table>
          </div>

          <TablePagination currentPage={safeCurrentPage} totalItems={rows.length} pageSize={PAGE_SIZE} itemLabel="data" onPageChange={setCurrentPage} />
        </CardContent>
      </Card>

      <Dialog
        open={importOpen}
        onOpenChange={(open) => {
          setImportOpen(open);
          if (!open) {
            resetImportState();
          }
        }}
      >
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Import Data Calon Jemaah</DialogTitle>
            <DialogDescription>Upload file CSV atau XLSX, cek preview validasi, lalu proses import ke database.</DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-3">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${importStep === step ? "bg-[#1F6B7A] text-white" : "bg-gray-100 text-gray-600"}`}>{step}</div>
                {step < 3 ? <div className="h-px w-10 bg-gray-200" /> : null}
              </div>
            ))}
          </div>

          {importStep === 1 ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-dashed border-gray-300 p-6">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm text-gray-600">Gunakan template resmi agar kolom sesuai validasi sistem.</p>
                  <Button variant="outline" className="gap-2" onClick={handleTemplateDownload}>
                    <Download className="w-4 h-4" /> Download Template
                  </Button>
                </div>

                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-gray-50 px-4 py-6 text-sm text-gray-700 hover:bg-gray-100">
                  <FileUp className="h-4 w-4" />
                  <span>{selectedFile ? selectedFile.name : "Pilih file CSV/XLSX untuk import"}</span>
                  <input
                    type="file"
                    accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null;
                      setSelectedFile(file);
                    }}
                  />
                </label>

                <p className="mt-2 text-xs text-gray-500">Format didukung: CSV, XLSX. Maksimal ukuran file: 4MB.</p>
              </div>

              <div className="flex justify-end">
                <Button className="bg-[#1F6B7A] hover:bg-[#176059]" onClick={handlePreviewImport} disabled={previewing || !selectedFile}>
                  {previewing ? "Memproses Preview..." : "Lanjutkan ke Preview"}
                </Button>
              </div>
            </div>
          ) : null}

          {importStep === 2 && previewData ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                <div className="rounded-lg bg-gray-50 p-3 text-sm">
                  <p className="text-gray-500">Total Baris</p>
                  <p className="text-lg font-semibold text-gray-900">{previewData.summary.total_rows}</p>
                </div>
                <div className="rounded-lg bg-green-50 p-3 text-sm">
                  <p className="text-green-700">Valid</p>
                  <p className="text-lg font-semibold text-green-800">{previewData.summary.valid_rows}</p>
                </div>
                <div className="rounded-lg bg-red-50 p-3 text-sm">
                  <p className="text-red-700">Error</p>
                  <p className="text-lg font-semibold text-red-800">{previewData.summary.error_rows}</p>
                </div>
                <div className="rounded-lg bg-blue-50 p-3 text-sm">
                  <p className="text-blue-700">Create</p>
                  <p className="text-lg font-semibold text-blue-800">{previewData.summary.create_rows}</p>
                </div>
                <div className="rounded-lg bg-amber-50 p-3 text-sm">
                  <p className="text-amber-700">Update</p>
                  <p className="text-lg font-semibold text-amber-800">{previewData.summary.update_rows}</p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="w-64">
                  <Select value={importMode} onValueChange={(value: "upsert" | "insert_only" | "update_only") => setImportMode(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih mode import" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upsert">Upsert (create + update)</SelectItem>
                      <SelectItem value="insert_only">Insert only</SelectItem>
                      <SelectItem value="update_only">Update only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-gray-500">Baris dengan error tidak akan diimport.</p>
              </div>

              <div className="max-h-72 overflow-auto rounded-xl border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Baris</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>Kontak</TableHead>
                      <TableHead>Aksi</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.rows.slice(0, 15).map((item) => (
                      <TableRow key={item.row_number}>
                        <TableCell>{item.row_number}</TableCell>
                        <TableCell>{item.nama}</TableCell>
                        <TableCell>{item.kontak}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={item.action === "create" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}>
                            {item.action}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {item.errors.length === 0 ? (
                            <span className="inline-flex items-center gap-1 text-xs text-green-700">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Valid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-red-700" title={item.errors.join("; ")}>
                              <AlertCircle className="h-3.5 w-3.5" /> {item.errors[0]}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setImportStep(1)}>
                  Kembali
                </Button>
                <Button className="bg-[#1F6B7A] hover:bg-[#176059]" onClick={handleCommitImport} disabled={committing || previewData.summary.valid_rows === 0}>
                  {committing ? "Memproses Import..." : "Proses Import"}
                </Button>
              </div>
            </div>
          ) : null}

          {importStep === 3 && importResult ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="rounded-lg bg-green-50 p-3 text-sm">
                  <p className="text-green-700">Created</p>
                  <p className="text-lg font-semibold text-green-800">{importResult.created}</p>
                </div>
                <div className="rounded-lg bg-blue-50 p-3 text-sm">
                  <p className="text-blue-700">Updated</p>
                  <p className="text-lg font-semibold text-blue-800">{importResult.updated}</p>
                </div>
                <div className="rounded-lg bg-amber-50 p-3 text-sm">
                  <p className="text-amber-700">Skipped</p>
                  <p className="text-lg font-semibold text-amber-800">{importResult.skipped}</p>
                </div>
                <div className="rounded-lg bg-red-50 p-3 text-sm">
                  <p className="text-red-700">Failed</p>
                  <p className="text-lg font-semibold text-red-800">{importResult.failed}</p>
                </div>
              </div>

              {importResult.failed > 0 ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                  <p className="mb-2 text-sm font-medium text-red-800">Masih ada baris gagal diproses.</p>
                  <Button variant="outline" className="gap-2" onClick={handleDownloadErrorReport}>
                    <Download className="h-4 w-4" /> Download Error Report
                  </Button>
                </div>
              ) : (
                <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">Semua data valid berhasil diimport.</div>
              )}

              <div className="flex justify-end">
                <Button
                  className="bg-[#1F6B7A] hover:bg-[#176059]"
                  onClick={() => {
                    setImportOpen(false);
                    resetImportState();
                  }}
                >
                  Selesai
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
