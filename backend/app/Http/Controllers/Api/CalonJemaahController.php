<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CalonJemaah;
use App\Models\User;
use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class CalonJemaahController extends Controller
{
    private const IMPORT_ALLOWED_STATUSES = [
        'Prospek Baru',
        'Dihubungi',
        'Tertarik',
        'Closing',
        'Tidak Jadi',
        'Menunggu Keputusan',
    ];

    private const IMPORT_CACHE_TTL_SECONDS = 1800;

    public function index(Request $request): JsonResponse
    {
        $query = CalonJemaah::query()->with(['staff:id,name']);

        $user = $request->user();

        if ($user?->role === 'staff') {
            $query->where('staff_id', $user->id);
        }

        if ($search = $request->string('search')->trim()->toString()) {
            $query->where(function ($builder) use ($search) {
                $builder->where('nama', 'like', "%{$search}%")
                    ->orWhere('kontak', 'like', "%{$search}%")
                    ->orWhere('alamat', 'like', "%{$search}%");
            });
        }

        if ($status = $request->string('status')->trim()->toString()) {
            $query->where('status_komunikasi', $status);
        }

        if ($staffId = $request->integer('staff_id')) {
            $query->where('staff_id', $staffId);
        }

        return response()->json([
            'data' => $query->latest()->get()->map(fn (CalonJemaah $jemaah) => $this->toPayload($jemaah)),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nama' => ['required', 'string', 'max:100', 'regex:/^[\p{L}\s\'\-]+$/u'],
            'kontak' => ['required', 'string', 'max:20', 'regex:/^[0-9+]+$/'],
            'umur' => ['nullable', 'integer', 'min:1', 'max:100'],
            'email' => ['nullable', 'string', 'max:255', 'regex:/^[^@\s]+@[^@\s]+\.[^@\s]+$/'],
            'alamat' => ['nullable', 'string'],
            'sumber' => ['nullable', 'string', 'max:255'],
            'paket' => ['nullable', 'string', 'max:255'],
            'staff_id' => ['nullable', 'exists:users,id'],
            'status_komunikasi' => ['nullable', Rule::in(['Prospek Baru', 'Dihubungi', 'Tertarik', 'Closing', 'Tidak Jadi', 'Menunggu Keputusan'])],
            'last_follow_up_at' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
        ]);

        $jemaah = CalonJemaah::create([
            ...$validated,
            'status_komunikasi' => $validated['status_komunikasi'] ?? 'Prospek Baru',
        ]);

        ActivityLogService::record(null, 'Menambahkan calon jemaah baru', $jemaah, [
            'nama' => $jemaah->nama,
        ]);

        return response()->json([
            'message' => 'Calon jemaah berhasil ditambahkan.',
            'data' => $this->toPayload($jemaah->load('staff:id,name')),
        ], 201);
    }

    public function show(CalonJemaah $calonJemaah): JsonResponse
    {
        $calonJemaah->load([
            'staff:id,name,role',
            'jadwalFollowUps.staff:id,name',
            'jadwalFollowUps.statusKomunikasi',
            'closingReport.staff:id,name',
        ]);

        return response()->json([
            'data' => [
                ...$this->toPayload($calonJemaah),
                'jadwal_follow_ups' => $calonJemaah->jadwalFollowUps->map(fn ($item) => [
                    'id' => $item->id,
                    'tanggal' => $item->tanggal?->format('d M Y'),
                    'metode' => $item->metode,
                    'status' => $item->status,
                    'catatan' => $item->catatan,
                    'staff' => $item->staff?->name,
                    'status_komunikasi' => $item->statusKomunikasi?->status,
                ]),
                'closing_report' => $calonJemaah->closingReport ? [
                    'tanggal_closing' => $calonJemaah->closingReport->tanggal_closing?->format('d M Y'),
                    'nilai' => $calonJemaah->closingReport->nilai,
                    'status_pembayaran' => $calonJemaah->closingReport->status_pembayaran,
                    'staff' => $calonJemaah->closingReport->staff?->name,
                ] : null,
            ],
        ]);
    }

    public function update(Request $request, CalonJemaah $calonJemaah): JsonResponse
    {
        $validated = $request->validate([
            'nama' => ['sometimes', 'required', 'string', 'max:100', 'regex:/^[\p{L}\s\'\-]+$/u'],
            'kontak' => ['sometimes', 'required', 'string', 'max:20', 'regex:/^[0-9+]+$/'],
            'umur' => ['sometimes', 'nullable', 'integer', 'min:1', 'max:100'],
            'email' => ['sometimes', 'nullable', 'string', 'max:255', 'regex:/^[^@\s]+@[^@\s]+\.[^@\s]+$/'],
            'alamat' => ['sometimes', 'nullable', 'string'],
            'sumber' => ['sometimes', 'nullable', 'string', 'max:255'],
            'paket' => ['sometimes', 'nullable', 'string', 'max:255'],
            'staff_id' => ['sometimes', 'nullable', 'exists:users,id'],
            'status_komunikasi' => ['sometimes', 'nullable', Rule::in(['Prospek Baru', 'Dihubungi', 'Tertarik', 'Closing', 'Tidak Jadi', 'Menunggu Keputusan'])],
            'last_follow_up_at' => ['sometimes', 'nullable', 'date'],
            'notes' => ['sometimes', 'nullable', 'string'],
        ]);

        $calonJemaah->fill($validated)->save();

        ActivityLogService::record(null, 'Memperbarui data calon jemaah', $calonJemaah, [
            'nama' => $calonJemaah->nama,
        ]);

        return response()->json([
            'message' => 'Calon jemaah berhasil diperbarui.',
            'data' => $this->toPayload($calonJemaah->fresh('staff:id,name')),
        ]);
    }

    public function destroy(CalonJemaah $calonJemaah): JsonResponse
    {
        ActivityLogService::record(null, 'Menghapus calon jemaah', $calonJemaah, [
            'nama' => $calonJemaah->nama,
        ]);

        $calonJemaah->delete();

        return response()->json(['message' => 'Calon jemaah berhasil dihapus.']);
    }

    public function importPreview(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'max:4096'],
        ]);

        $file = $request->file('file');

        if (!$file) {
            return response()->json(['message' => 'File import tidak ditemukan.'], 422);
        }

        $extension = strtolower($file->getClientOriginalExtension() ?: '');

        if (!in_array($extension, ['csv', 'txt', 'tsv', 'xlsx'], true)) {
            return response()->json([
                'message' => 'Format file tidak didukung. Gunakan file TSV, CSV, atau XLSX.',
            ], 422);
        }

        try {
            [$rawHeader, $rawRows] = $this->extractImportRows($file->getRealPath(), $extension);
        } catch (\Throwable $exception) {
            return response()->json([
                'message' => $exception->getMessage() ?: 'Gagal membaca file import.',
            ], 422);
        }

        if (!$rawHeader || count(array_filter($rawHeader, fn ($column) => trim((string) $column) !== '')) === 0) {
            return response()->json(['message' => 'Header file import tidak valid atau kosong.'], 422);
        }

        $headerMap = $this->normalizeImportHeaders($rawHeader);
        $rows = [];
        $contactsInFile = [];

        foreach ($rawRows as $index => $rawRow) {
            if ($this->isEmptyCsvRow($rawRow['values'])) {
                continue;
            }

            $row = $this->mapImportRow($headerMap, $rawRow['values']);
            $row['row_number'] = $rawRow['row_number'] ?? ($index + 2);
            $row['errors'] = [];

            $validator = Validator::make($row, [
                'nama' => ['required', 'string', 'max:100', 'regex:/^[\p{L}\s\'\-]+$/u'],
                'kontak' => ['required', 'string', 'max:20', 'regex:/^[0-9+]+$/'],
                'umur' => ['nullable', 'integer', 'min:1', 'max:100'],
                'email' => ['nullable', 'string', 'max:255', 'regex:/^[^@\s]+@[^@\s]+\.[^@\s]+$/'],
                'alamat' => ['nullable', 'string'],
                'sumber' => ['nullable', 'string', 'max:255'],
                'paket' => ['nullable', 'string', 'max:255'],
                'status_komunikasi' => ['nullable', Rule::in(self::IMPORT_ALLOWED_STATUSES)],
                'notes' => ['nullable', 'string'],
                'staff_email' => ['nullable', 'email'],
            ]);

            if ($validator->fails()) {
                $row['errors'] = array_values($validator->errors()->all());
            }

            $contactKey = strtolower(trim((string) ($row['kontak'] ?? '')));

            if ($contactKey !== '') {
                if (isset($contactsInFile[$contactKey])) {
                    $row['errors'][] = 'Kontak duplikat di file import.';
                }

                $contactsInFile[$contactKey] = true;
            }

            $staffId = null;

            if (!empty($row['staff_email']) && empty($row['errors'])) {
                $staff = User::query()
                    ->where('email', $row['staff_email'])
                    ->where('role', 'staff')
                    ->first();

                if (!$staff) {
                    $row['errors'][] = 'Staff email tidak ditemukan atau bukan role staff.';
                } else {
                    $staffId = $staff->id;
                }
            }

            $existing = null;

            if (!empty($row['kontak']) && empty($row['errors'])) {
                $existing = CalonJemaah::query()->where('kontak', $row['kontak'])->first();
            }

            $payload = [
                'nama' => $row['nama'],
                'kontak' => $row['kontak'],
                'umur' => is_numeric($row['umur']) ? (int) $row['umur'] : null,
                'email' => $row['email'] ?: null,
                'alamat' => $row['alamat'] ?: null,
                'sumber' => $row['sumber'] ?: null,
                'paket' => $row['paket'] ?: null,
                'status_komunikasi' => $row['status_komunikasi'] ?: 'Prospek Baru',
                'notes' => $row['notes'] ?: null,
                'staff_id' => $staffId,
            ];

            $rows[] = [
                'row_number' => $row['row_number'],
                'nama' => $payload['nama'],
                'kontak' => $payload['kontak'],
                'alamat' => $payload['alamat'],
                'sumber' => $payload['sumber'],
                'paket' => $payload['paket'],
                'status_komunikasi' => $payload['status_komunikasi'],
                'notes' => $payload['notes'],
                'staff_email' => $row['staff_email'] ?: null,
                'action' => $existing ? 'update' : 'create',
                'existing_id' => $existing?->id,
                'errors' => array_values(array_unique($row['errors'])),
                'payload' => $payload,
            ];
        }

        if (count($rows) === 0) {
            return response()->json(['message' => 'File import tidak memiliki data untuk diproses.'], 422);
        }

        $validRows = array_values(array_filter($rows, fn ($item) => count($item['errors']) === 0));
        $errorRows = count($rows) - count($validRows);
        $token = (string) Str::uuid();

        Cache::put($this->importCacheKey($token), [
            'rows' => $rows,
            'created_at' => now()->toIso8601String(),
            'uploaded_by' => $request->user()?->id,
            'filename' => $file->getClientOriginalName(),
        ], self::IMPORT_CACHE_TTL_SECONDS);

        $previewRows = array_map(function (array $item): array {
            unset($item['payload'], $item['existing_id']);

            return $item;
        }, $rows);

        return response()->json([
            'message' => 'Preview import berhasil dibuat.',
            'data' => [
                'token' => $token,
                'summary' => [
                    'total_rows' => count($rows),
                    'valid_rows' => count($validRows),
                    'error_rows' => $errorRows,
                    'create_rows' => count(array_filter($rows, fn ($item) => $item['action'] === 'create' && count($item['errors']) === 0)),
                    'update_rows' => count(array_filter($rows, fn ($item) => $item['action'] === 'update' && count($item['errors']) === 0)),
                ],
                'rows' => $previewRows,
            ],
        ]);
    }

    public function importCommit(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'token' => ['required', 'string'],
            'mode' => ['nullable', Rule::in(['upsert', 'insert_only', 'update_only'])],
        ]);

        $mode = $validated['mode'] ?? 'upsert';
        $cacheKey = $this->importCacheKey($validated['token']);
        $cached = Cache::get($cacheKey);

        if (!$cached || !is_array($cached) || !isset($cached['rows'])) {
            return response()->json([
                'message' => 'Token import tidak valid atau sudah kedaluwarsa. Lakukan preview ulang.',
            ], 422);
        }

        $rows = $cached['rows'];
        $created = 0;
        $updated = 0;
        $skipped = 0;
        $failed = [];

        foreach ($rows as $row) {
            if (!empty($row['errors'])) {
                $failed[] = [
                    'row_number' => $row['row_number'],
                    'kontak' => $row['kontak'] ?? null,
                    'error' => implode('; ', $row['errors']),
                ];

                continue;
            }

            $existing = CalonJemaah::query()->where('kontak', $row['payload']['kontak'])->first();

            if ($mode === 'insert_only' && $existing) {
                $skipped++;
                continue;
            }

            if ($mode === 'update_only' && !$existing) {
                $skipped++;
                continue;
            }

            try {
                if ($existing) {
                    $existing->fill($row['payload'])->save();
                    $updated++;
                } else {
                    CalonJemaah::create($row['payload']);
                    $created++;
                }
            } catch (\Throwable $exception) {
                $failed[] = [
                    'row_number' => $row['row_number'],
                    'kontak' => $row['kontak'] ?? null,
                    'error' => $exception->getMessage(),
                ];
            }
        }

        Cache::forget($cacheKey);

        ActivityLogService::record($request->user(), 'Import data calon jemaah', null, [
            'created' => $created,
            'updated' => $updated,
            'skipped' => $skipped,
            'failed' => count($failed),
            'mode' => $mode,
        ]);

        return response()->json([
            'message' => 'Proses import selesai.',
            'data' => [
                'created' => $created,
                'updated' => $updated,
                'skipped' => $skipped,
                'failed' => count($failed),
                'errors' => $failed,
                'error_report_csv' => $this->buildErrorReportCsv($failed),
            ],
        ]);
    }

    private function toPayload(CalonJemaah $jemaah): array
    {
        return [
            'id' => $jemaah->id,
            'nama' => $jemaah->nama,
            'kontak' => $jemaah->kontak,
            'umur' => $jemaah->umur,
            'email' => $jemaah->email,
            'alamat' => $jemaah->alamat,
            'sumber' => $jemaah->sumber,
            'paket' => $jemaah->paket,
            'status_komunikasi' => $jemaah->status_komunikasi,
            'last_follow_up_at' => $jemaah->last_follow_up_at?->format('d M Y H:i'),
            'notes' => $jemaah->notes,
            'staff' => $jemaah->staff?->name,
        ];
    }

    private function normalizeImportHeaders(array $header): array
    {
        $normalized = [];

        foreach ($header as $index => $column) {
            $key = strtolower(trim((string) $column));
            $key = str_replace([' ', '-'], '_', $key);

            $normalized[$index] = match ($key) {
                'nama', 'name' => 'nama',
                'kontak', 'no_hp', 'no_wa', 'phone', 'nomor_whatsapp' => 'kontak',
                'alamat', 'address', 'kota' => 'alamat',
                'umur', 'age' => 'umur',
                'sumber', 'sumber_lead', 'lead_source' => 'sumber',
                'paket', 'paket_diminati' => 'paket',
                'status_komunikasi', 'status' => 'status_komunikasi',
                'notes', 'catatan' => 'notes',
                'email', 'e-mail' => 'email',
                'staff_email', 'email_staff' => 'staff_email',
                default => $key,
            };
        }

        return $normalized;
    }

    private function mapImportRow(array $headerMap, array $row): array
    {
        $mapped = [
            'nama' => '',
            'kontak' => '',
            'umur' => '',
            'email' => '',
            'alamat' => '',
            'sumber' => '',
            'paket' => '',
            'status_komunikasi' => '',
            'notes' => '',
            'staff_email' => '',
        ];

        foreach ($row as $index => $value) {
            $key = $headerMap[$index] ?? null;

            if (!$key || !array_key_exists($key, $mapped)) {
                continue;
            }

            $mapped[$key] = trim((string) $value);
        }

        return $mapped;
    }

    private function extractImportRows(string $path, string $extension): array
    {
        if (in_array($extension, ['csv', 'txt', 'tsv'], true)) {
            return $this->extractCsvRows($path);
        }

        if ($extension === 'xlsx') {
            return $this->extractXlsxRows($path);
        }

        throw new \RuntimeException('Format file import tidak didukung.');
    }

    private function extractCsvRows(string $path): array
    {
        $handle = fopen($path, 'r');

        if (!$handle) {
            throw new \RuntimeException('Gagal membaca file CSV.');
        }

        $firstLine = fgets($handle);

        if ($firstLine === false) {
            fclose($handle);
            throw new \RuntimeException('Header CSV tidak ditemukan.');
        }

        $delimiter = $this->detectDelimiter($firstLine);
        $header = str_getcsv(rtrim($firstLine, "\r\n"), $delimiter);

        $rows = [];
        $line = 1;

        while (($row = fgetcsv($handle, 0, $delimiter)) !== false) {
            $line++;
            $rows[] = [
                'row_number' => $line,
                'values' => $row,
            ];
        }

        fclose($handle);

        return [$header, $rows];
    }

    private function detectDelimiter(string $line): string
    {
        $candidates = ["\t", ';', '|', ','];
        $bestDelimiter = ',';
        $bestCount = 0;

        foreach ($candidates as $delimiter) {
            $count = substr_count($line, $delimiter);

            if ($count > $bestCount) {
                $bestCount = $count;
                $bestDelimiter = $delimiter;
            }
        }

        return $bestDelimiter;
    }

    private function extractXlsxRows(string $path): array
    {
        $zip = new \ZipArchive();

        if ($zip->open($path) !== true) {
            throw new \RuntimeException('Gagal membuka file XLSX.');
        }

        $sharedStrings = $this->readXlsxSharedStrings($zip);

        $workbookXml = $zip->getFromName('xl/workbook.xml');
        $workbookRelsXml = $zip->getFromName('xl/_rels/workbook.xml.rels');

        if ($workbookXml === false || $workbookRelsXml === false) {
            $zip->close();
            throw new \RuntimeException('Struktur XLSX tidak valid (workbook tidak ditemukan).');
        }

        $workbook = @simplexml_load_string($workbookXml);
        $workbookRels = @simplexml_load_string($workbookRelsXml);

        if (!$workbook || !$workbookRels) {
            $zip->close();
            throw new \RuntimeException('Gagal membaca metadata XLSX.');
        }

        $relationships = [];
        $relsNs = $workbookRels->getDocNamespaces(true);
        $relsNodes = isset($relsNs['']) ? $workbookRels->children($relsNs['']) : $workbookRels->children();

        foreach ($relsNodes->Relationship as $relationship) {
            $id = (string) $relationship['Id'];
            $target = (string) $relationship['Target'];

            if ($id !== '' && $target !== '') {
                $relationships[$id] = $target;
            }
        }

        $sheets = $workbook->sheets?->sheet;

        if (!$sheets || count($sheets) === 0) {
            $zip->close();
            throw new \RuntimeException('Sheet XLSX tidak ditemukan.');
        }

        $firstSheet = $sheets[0];
        $sheetNs = $firstSheet->getNamespaces(true);
        $relationId = isset($sheetNs['r']) ? (string) $firstSheet->attributes($sheetNs['r'])['id'] : '';

        if ($relationId === '' || !isset($relationships[$relationId])) {
            $zip->close();
            throw new \RuntimeException('Relasi sheet XLSX tidak valid.');
        }

        $sheetPath = 'xl/' . ltrim($relationships[$relationId], '/');
        $sheetXml = $zip->getFromName($sheetPath);

        if ($sheetXml === false) {
            $zip->close();
            throw new \RuntimeException('Gagal membaca sheet pertama dari file XLSX.');
        }

        $sheet = @simplexml_load_string($sheetXml);

        if (!$sheet) {
            $zip->close();
            throw new \RuntimeException('Konten sheet XLSX tidak valid.');
        }

        $sheetData = $sheet->sheetData;

        if (!$sheetData || !isset($sheetData->row)) {
            $zip->close();
            throw new \RuntimeException('Sheet XLSX kosong.');
        }

        $header = null;
        $rows = [];

        foreach ($sheetData->row as $row) {
            $rowNumber = (int) ($row['r'] ?: 0);
            $cells = [];

            foreach ($row->c as $cell) {
                $reference = (string) ($cell['r'] ?? '');
                $columnLetters = preg_replace('/\d+/', '', $reference);

                if (!$columnLetters) {
                    continue;
                }

                $index = $this->xlsxColumnToIndex($columnLetters);
                $type = (string) ($cell['t'] ?? '');
                $value = '';

                if ($type === 'inlineStr') {
                    $value = trim((string) ($cell->is->t ?? ''));
                } else {
                    $rawValue = trim((string) ($cell->v ?? ''));

                    if ($type === 's') {
                        $sharedIndex = (int) $rawValue;
                        $value = $sharedStrings[$sharedIndex] ?? '';
                    } else {
                        $value = $rawValue;
                    }
                }

                $cells[$index] = trim((string) $value);
            }

            if (count($cells) === 0) {
                continue;
            }

            ksort($cells);
            $maxIndex = (int) max(array_keys($cells));
            $values = [];

            for ($col = 0; $col <= $maxIndex; $col++) {
                $values[] = $cells[$col] ?? '';
            }

            if ($header === null) {
                $header = $values;
                continue;
            }

            $rows[] = [
                'row_number' => $rowNumber > 0 ? $rowNumber : (count($rows) + 2),
                'values' => $values,
            ];
        }

        $zip->close();

        if ($header === null) {
            throw new \RuntimeException('Header XLSX tidak ditemukan.');
        }

        return [$header, $rows];
    }

    private function readXlsxSharedStrings(\ZipArchive $zip): array
    {
        $sharedXml = $zip->getFromName('xl/sharedStrings.xml');

        if ($sharedXml === false) {
            return [];
        }

        $shared = @simplexml_load_string($sharedXml);

        if (!$shared || !isset($shared->si)) {
            return [];
        }

        $result = [];

        foreach ($shared->si as $item) {
            if (isset($item->t)) {
                $result[] = trim((string) $item->t);
                continue;
            }

            if (isset($item->r)) {
                $text = '';

                foreach ($item->r as $run) {
                    $text .= (string) ($run->t ?? '');
                }

                $result[] = trim($text);
                continue;
            }

            $result[] = '';
        }

        return $result;
    }

    private function xlsxColumnToIndex(string $column): int
    {
        $column = strtoupper($column);
        $index = 0;

        for ($i = 0; $i < strlen($column); $i++) {
            $index = $index * 26 + (ord($column[$i]) - ord('A') + 1);
        }

        return max(0, $index - 1);
    }

    private function isEmptyCsvRow(array $row): bool
    {
        foreach ($row as $value) {
            if (trim((string) $value) !== '') {
                return false;
            }
        }

        return true;
    }

    private function importCacheKey(string $token): string
    {
        return 'calon_jemaah_import:' . $token;
    }

    private function buildErrorReportCsv(array $errors): ?string
    {
        if (count($errors) === 0) {
            return null;
        }

        $lines = ['row_number,kontak,error'];

        foreach ($errors as $error) {
            $rowNumber = (string) ($error['row_number'] ?? '');
            $kontak = $this->csvEscape((string) ($error['kontak'] ?? ''));
            $message = $this->csvEscape((string) ($error['error'] ?? ''));
            $lines[] = $rowNumber . ',' . $kontak . ',' . $message;
        }

        return implode("\n", $lines);
    }

    private function csvEscape(string $value): string
    {
        if (str_contains($value, ',') || str_contains($value, '"') || str_contains($value, "\n") || str_contains($value, "\r")) {
            return '"' . str_replace('"', '""', $value) . '"';
        }

        return $value;
    }
}
