import { createBrowserRouter } from "react-router";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { DataCalonJemaah } from "./pages/DataCalonJemaah";
import { JadwalFollowUp } from "./pages/JadwalFollowUp";
import { StatusKomunikasi } from "./pages/StatusKomunikasi";
import { LaporanClosing } from "./pages/LaporanClosing";
import { Pengguna } from "./pages/Pengguna";
import { Settings } from "./pages/Settings";
import { TambahCalonJemaah } from "./pages/TambahCalonJemaah";
import { TambahJadwalFollowUp } from "./pages/TambahJadwalFollowUp";
import { TambahPengguna } from "./pages/TambahPengguna";
import Login from "./pages/Login";
import { Layout as StaffLayout } from "../staff/components/Layout";
import { Dashboard as StaffDashboard } from "../staff/pages/Dashboard";
import { JemaahSaya } from "../staff/pages/JemaahSaya";
import { JadwalFollowUp as JadwalFollowUpStaff } from "../staff/pages/JadwalFollowUp";
import { StatusKomunikasi as StatusKomunikasiStaff } from "../staff/pages/StatusKomunikasi";
import { AktivitasSaya } from "../staff/pages/AktivitasSaya";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/",
    Component: () => (
      <ProtectedRoute requiredRole="admin">
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, Component: Dashboard },
      { path: "data-calon-jemaah", Component: DataCalonJemaah },
      { path: "data-calon-jemaah/tambah", Component: TambahCalonJemaah },
      { path: "data-calon-jemaah/:id/edit", Component: TambahCalonJemaah },
      { path: "data-calon-jemaah/:id/detail", Component: TambahCalonJemaah },
      { path: "jadwal-follow-up", Component: JadwalFollowUp },
      { path: "jadwal-follow-up/tambah", Component: TambahJadwalFollowUp },
      { path: "jadwal-follow-up/:id/edit", Component: TambahJadwalFollowUp },
      { path: "status-komunikasi", Component: StatusKomunikasi },
      { path: "laporan-closing", Component: LaporanClosing },
      // Admin-only routes
      {
        path: "pengguna",
        Component: () => (
          <ProtectedRoute requiredRole="admin">
            <Pengguna />
          </ProtectedRoute>
        ),
      },
      {
        path: "pengguna/tambah",
        Component: () => (
          <ProtectedRoute requiredRole="admin">
            <TambahPengguna />
          </ProtectedRoute>
        ),
      },
      {
        path: "pengguna/:id/edit",
        Component: () => (
          <ProtectedRoute requiredRole="admin">
            <TambahPengguna />
          </ProtectedRoute>
        ),
      },
      // Settings accessible to all authenticated users
      { path: "settings", Component: Settings },
    ],
  },
  {
    path: "/staff",
    Component: () => (
      <ProtectedRoute requiredRole="staff">
        <StaffLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, Component: StaffDashboard },
      { path: "jemaah-saya", Component: JemaahSaya },
      { path: "jadwal-followup", Component: JadwalFollowUpStaff },
      { path: "status-komunikasi", Component: StatusKomunikasiStaff },
      { path: "aktivitas-saya", Component: AktivitasSaya },
    ],
  },
]);
