const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api").replace(/\/$/, "");

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  // Get token from localStorage
  const token = localStorage.getItem("api_token");

  const isFormDataBody = typeof FormData !== "undefined" && init?.body instanceof FormData;

  const headers = new Headers(init?.headers ?? undefined);
  headers.set("Accept", "application/json");

  if (!isFormDataBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // Add Authorization header if token exists
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  const payload = await response.json().catch(() => null);

  // Handle unauthorized - token might be invalid
  if (response.status === 401) {
    // Clear auth from localStorage
    localStorage.removeItem("api_token");
    localStorage.removeItem("user");
    // Optionally redirect to login
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }

  if (!response.ok) {
    throw new Error(payload?.message ?? `Request failed with status ${response.status}`);
  }

  return payload as T;
}

export type DashboardSummary = {
  data: {
    stats: {
      total_jemaah: number;
      follow_up_hari_ini: number;
      total_closing: number;
      conversion_rate: number;
    };
    follow_up_activity: Array<{ month: string; count: number }>;
    closing_per_month: Array<{ month: string; closing: number }>;
    recent_follow_ups: Array<{
      id: number;
      nama: string | null;
      kontak: string | null;
      tanggal: string | null;
      metode: string | null;
      status_komunikasi: string | null;
      status_jadwal: string | null;
      staff: string | null;
    }>;
  };
};

export type CalonJemaah = {
  id: number;
  nama: string;
  kontak: string;
  alamat: string | null;
  sumber: string | null;
  paket: string | null;
  status_komunikasi: string;
  last_follow_up_at: string | null;
  notes: string | null;
  staff: string | null;
};

export type CalonJemaahList = {
  data: CalonJemaah[];
};

export type ImportCalonJemaahPreviewRow = {
  row_number: number;
  nama: string;
  kontak: string;
  alamat: string | null;
  sumber: string | null;
  paket: string | null;
  status_komunikasi: string;
  notes: string | null;
  staff_email: string | null;
  action: "create" | "update";
  errors: string[];
};

export type ImportCalonJemaahPreviewResponse = {
  message: string;
  data: {
    token: string;
    summary: {
      total_rows: number;
      valid_rows: number;
      error_rows: number;
      create_rows: number;
      update_rows: number;
    };
    rows: ImportCalonJemaahPreviewRow[];
  };
};

export type ImportCalonJemaahCommitResponse = {
  message: string;
  data: {
    created: number;
    updated: number;
    skipped: number;
    failed: number;
    errors: Array<{
      row_number: number;
      kontak: string | null;
      error: string;
    }>;
    error_report_csv: string | null;
  };
};

export type UserItem = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: "admin" | "staff";
  is_active: boolean;
  last_login_at: string | null;
};

export type UserList = {
  data: UserItem[];
};

export type ProfileResponse = {
  data: UserItem;
};

export type UpdateProfilePayload = {
  name: string;
  email: string;
  phone?: string;
};

export type ChangePasswordPayload = {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
};

export type JadwalFollowUpItem = {
  id: number;
  calon_jemaah_id: number;
  calon_jemaah: string | null;
  kontak: string | null;
  staff_id: number | null;
  staff: string | null;
  tanggal: string | null;
  metode: string | null;
  status: string | null;
  catatan: string | null;
  status_komunikasi: string | null;
};

export type JadwalFollowUpList = {
  data: JadwalFollowUpItem[];
};

export type StatusKomunikasiItem = {
  id: number;
  jadwal_follow_up_id: number;
  metode: string | null;
  calon_jemaah: string | null;
  kontak: string | null;
  staff: string | null;
  status: string;
  catatan: string | null;
  follow_up_at: string | null;
  nilai_pembayaran?: number | null;
  tipe_pembayaran?: "DP" | "Lunas" | null;
};

export type StatusKomunikasiList = {
  data: StatusKomunikasiItem[];
};

export type ActivityLogItem = {
  id: number;
  user: string | null;
  aktivitas: string;
  subject_type: string | null;
  subject_id: number | null;
  metadata: Record<string, unknown> | null;
  created_at: string | null;
};

export type ActivityLogList = {
  data: ActivityLogItem[];
};

export type LaporanClosingItem = {
  id: number;
  calon_jemaah_id: number;
  calon_jemaah: string | null;
  kontak: string | null;
  staff: string | null;
  tanggal_closing: string | null;
  nilai: number | null;
  status_pembayaran: string | null;
  catatan: string | null;
};

export type LaporanClosingList = {
  data: LaporanClosingItem[];
};

export async function getDashboardSummary(): Promise<DashboardSummary> {
  return request<DashboardSummary>("/dashboard");
}

export async function getCalonJemaah(params?: Record<string, string | number | undefined>): Promise<CalonJemaahList> {
  const searchParams = new URLSearchParams();

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const suffix = searchParams.toString() ? `?${searchParams.toString()}` : "";
  return request<CalonJemaahList>(`/calon-jemaah${suffix}`);
}

export type CreateCalonJemaahPayload = {
  nama: string;
  kontak: string;
  alamat?: string;
  sumber?: string;
  paket?: string;
  umur?: number;
  email?: string;
  staff_id?: number;
  status_komunikasi?: string;
  notes?: string;
};

export async function createCalonJemaah(payload: CreateCalonJemaahPayload): Promise<{ message: string; data: CalonJemaah }> {
  return request("/calon-jemaah", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function previewImportCalonJemaah(file: File): Promise<ImportCalonJemaahPreviewResponse> {
  const formData = new FormData();
  formData.append("file", file);

  return request<ImportCalonJemaahPreviewResponse>("/calon-jemaah/import/preview", {
    method: "POST",
    body: formData,
  });
}

export async function commitImportCalonJemaah(payload: { token: string; mode?: "upsert" | "insert_only" | "update_only" }): Promise<ImportCalonJemaahCommitResponse> {
  return request<ImportCalonJemaahCommitResponse>("/calon-jemaah/import/commit", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getJadwalFollowUp(params?: Record<string, string | number | undefined>): Promise<JadwalFollowUpList> {
  const searchParams = new URLSearchParams();

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const suffix = searchParams.toString() ? `?${searchParams.toString()}` : "";
  return request<JadwalFollowUpList>(`/jadwal-follow-up${suffix}`);
}

export async function getStatusKomunikasi(params?: Record<string, string | number | undefined>): Promise<StatusKomunikasiList> {
  const searchParams = new URLSearchParams();

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const suffix = searchParams.toString() ? `?${searchParams.toString()}` : "";
  return request<StatusKomunikasiList>(`/status-komunikasi${suffix}`);
}

export async function getActivityLog(params?: Record<string, string | number | undefined>): Promise<ActivityLogList> {
  const searchParams = new URLSearchParams();

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const suffix = searchParams.toString() ? `?${searchParams.toString()}` : "";
  return request<ActivityLogList>(`/activity-log${suffix}`);
}

export async function getLaporanClosing(params?: Record<string, string | number | undefined>): Promise<LaporanClosingList> {
  const searchParams = new URLSearchParams();

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const suffix = searchParams.toString() ? `?${searchParams.toString()}` : "";
  return request<LaporanClosingList>(`/laporan-closing${suffix}`);
}

export async function getUsers(params?: Record<string, string | number | undefined>): Promise<UserList> {
  const searchParams = new URLSearchParams();

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const suffix = searchParams.toString() ? `?${searchParams.toString()}` : "";
  return request<UserList>(`/users${suffix}`);
}

export async function getProfile(): Promise<ProfileResponse> {
  return request<ProfileResponse>("/profile");
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<{ message: string; data: UserItem }> {
  return request("/profile", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function changePassword(payload: ChangePasswordPayload): Promise<{ message: string }> {
  return request("/change-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ============ CALON JEMAAH CRUD ============
export async function getCalonJemaahById(id: number): Promise<{ data: CalonJemaah }> {
  return request(`/calon-jemaah/${id}`);
}

export type UpdateCalonJemaahPayload = Partial<CreateCalonJemaahPayload>;

export async function updateCalonJemaah(id: number, payload: UpdateCalonJemaahPayload): Promise<{ message: string; data: CalonJemaah }> {
  return request(`/calon-jemaah/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteCalonJemaah(id: number): Promise<{ message: string }> {
  return request(`/calon-jemaah/${id}`, {
    method: "DELETE",
  });
}

// ============ JADWAL FOLLOW UP CRUD ============
export type CreateJadwalFollowUpPayload = {
  calon_jemaah_id: number;
  staff_id?: number;
  tanggal: string;
  metode: string;
  status?: string;
  catatan?: string;
};

export async function getJadwalFollowUpById(id: number): Promise<{ data: JadwalFollowUpItem }> {
  return request(`/jadwal-follow-up/${id}`);
}

export async function createJadwalFollowUp(payload: CreateJadwalFollowUpPayload): Promise<{ message: string; data: JadwalFollowUpItem }> {
  return request("/jadwal-follow-up", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type UpdateJadwalFollowUpPayload = Partial<CreateJadwalFollowUpPayload>;

export async function updateJadwalFollowUp(id: number, payload: UpdateJadwalFollowUpPayload): Promise<{ message: string; data: JadwalFollowUpItem }> {
  return request(`/jadwal-follow-up/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteJadwalFollowUp(id: number): Promise<{ message: string }> {
  return request(`/jadwal-follow-up/${id}`, {
    method: "DELETE",
  });
}

// ============ STATUS KOMUNIKASI CRUD ============
export type CreateStatusKomunikasiPayload = {
  jadwal_follow_up_id: number;
  metode?: string;
  status: string;
  catatan?: string;
  follow_up_at?: string;
  nilai_pembayaran?: number;
  tipe_pembayaran?: "DP" | "Lunas";
};

export async function getStatusKomunikasiById(id: number): Promise<{ data: StatusKomunikasiItem }> {
  return request(`/status-komunikasi/${id}`);
}

export async function createStatusKomunikasi(payload: CreateStatusKomunikasiPayload): Promise<{ message: string; data: StatusKomunikasiItem }> {
  return request("/status-komunikasi", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type UpdateStatusKomunikasiPayload = Partial<CreateStatusKomunikasiPayload>;

export async function updateStatusKomunikasi(id: number, payload: UpdateStatusKomunikasiPayload): Promise<{ message: string; data: StatusKomunikasiItem }> {
  return request(`/status-komunikasi/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteStatusKomunikasi(id: number): Promise<{ message: string }> {
  return request(`/status-komunikasi/${id}`, {
    method: "DELETE",
  });
}

// ============ LAPORAN CLOSING CRUD ============
export type CreateLaporanClosingPayload = {
  calon_jemaah_id: number;
  tanggal_closing: string;
  nilai?: number;
  status_pembayaran?: string;
  catatan?: string;
};

export async function getLaporanClosingById(id: number): Promise<{ data: LaporanClosingItem }> {
  return request(`/laporan-closing/${id}`);
}

export async function createLaporanClosing(payload: CreateLaporanClosingPayload): Promise<{ message: string; data: LaporanClosingItem }> {
  return request("/laporan-closing", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type UpdateLaporanClosingPayload = Partial<CreateLaporanClosingPayload>;

export async function updateLaporanClosing(id: number, payload: UpdateLaporanClosingPayload): Promise<{ message: string; data: LaporanClosingItem }> {
  return request(`/laporan-closing/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteLaporanClosing(id: number): Promise<{ message: string }> {
  return request(`/laporan-closing/${id}`, {
    method: "DELETE",
  });
}

// ============ USER CRUD ============
export type CreateUserPayload = {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: "admin" | "staff";
};

export type UserDetail = UserItem & {
  phone: string | null;
};

export async function getUserById(id: number): Promise<{ data: UserDetail }> {
  return request(`/users/${id}`);
}

export async function createUser(payload: CreateUserPayload): Promise<{ message: string; data: UserDetail }> {
  return request("/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type UpdateUserPayload = {
  name?: string;
  email?: string;
  phone?: string;
  role?: "admin" | "staff";
  is_active?: boolean;
};

export async function updateUser(id: number, payload: UpdateUserPayload): Promise<{ message: string; data: UserDetail }> {
  return request(`/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteUser(id: number): Promise<{ message: string }> {
  return request(`/users/${id}`, {
    method: "DELETE",
  });
}

// Convenience method for deactivating a user
export async function deactivateUser(id: number): Promise<{ message: string; data: UserDetail }> {
  return updateUser(id, { is_active: false });
}

// ============ ACTIVITY LOG - Additional methods ============
export async function getActivityLogById(id: number): Promise<{ data: ActivityLogItem }> {
  return request(`/activity-log/${id}`);
}

export async function deleteActivityLog(id: number): Promise<{ message: string }> {
  return request(`/activity-log/${id}`, {
    method: "DELETE",
  });
}
