import { useState, useEffect } from "react";
import { Users, Calendar, CheckCircle, Target, Loader, AlertCircle } from "lucide-react";
import { getDashboardSummary, getCalonJemaah, getActivityLog, type DashboardSummary } from "../../app/lib/api";
import { StatsCard } from "../components/StatsCard";
import { FollowUpTable } from "../components/FollowUpTable";
import { PipelineBoard } from "../components/PipelineBoard";
import { ActivityFeed } from "../components/ActivityFeed";

export function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardSummary["data"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [staffName, setStaffName] = useState("Staff");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);

        const dashResponse = await getDashboardSummary();
        setDashboardData(dashResponse.data || null);

        // Get user name from profile or localStorage
        const userStr = localStorage.getItem("user");
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            setStaffName(user.name || "Staff");
          } catch {
            setStaffName("Staff");
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal mengambil data dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-gray-600">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  const stats = dashboardData?.stats || {
    total_jemaah: 0,
    follow_up_hari_ini: 0,
    total_closing: 0,
    conversion_rate: 0,
  };

  const recentFollowUps = dashboardData?.recent_follow_ups || [];

  return (
    <>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Selamat datang kembali, {staffName}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Jemaah Saya"
          value={String(stats.total_jemaah)}
          icon={Users}
        />
        <StatsCard
          title="Follow Up Hari Ini"
          value={String(stats.follow_up_hari_ini)}
          icon={Calendar}
        />
        <StatsCard
          title="Closing Bulan Ini"
          value={String(stats.total_closing)}
          icon={CheckCircle}
        />
        <StatsCard
          title="Conversion Rate"
          value={`${Math.round(stats.conversion_rate || 0)}%`}
          icon={Target}
        />
      </div>

      {/* Follow Up Table */}
      <div className="mb-8">
        <FollowUpTable data={recentFollowUps} />
      </div>

      {/* Pipeline Board */}
      <div className="mb-8">
        <PipelineBoard />
      </div>

      {/* Activity Feed */}
      <div className="mb-8">
        <ActivityFeed />
      </div>
    </>
  );
}
