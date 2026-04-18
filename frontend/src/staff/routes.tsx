import { createBrowserRouter } from "react-router-dom";
import { Layout as StaffLayout } from "./components/Layout";
import { Dashboard as StaffDashboard } from "./pages/Dashboard";
import { JemaahSaya } from "./pages/JemaahSaya";
import { JadwalFollowUp as JadwalFollowUpStaff } from "./pages/JadwalFollowUp";
import { StatusKomunikasi as StatusKomunikasiStaff } from "./pages/StatusKomunikasi";
import { AktivitasSaya } from "./pages/AktivitasSaya";
import ErrorPage from "./components/ErrorPage";

export const staffRouter = createBrowserRouter([
  {
    path: "/staff",
    element: <StaffLayout />, // Use element for react-router-dom v6+
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <StaffDashboard /> },
      { path: "jemaah-saya", element: <JemaahSaya /> },
      { path: "jadwal-followup", element: <JadwalFollowUpStaff /> },
      { path: "status-komunikasi", element: <StatusKomunikasiStaff /> },
      { path: "aktivitas-saya", element: <AktivitasSaya /> },
    ],
  },
]);
