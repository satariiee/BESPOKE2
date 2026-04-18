import { StatsCard } from "../components/StatsCard";
import { FollowUpTable } from "../components/FollowUpTable";
import { PipelineBoard } from "../components/PipelineBoard";
import { ActivityFeed } from "../components/ActivityFeed";
import { Users, Calendar, CheckCircle, Target } from "lucide-react";

export function Dashboard() {
  return (
    <>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Selamat datang kembali, Ahmad Fauzi</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Jemaah Saya"
          value="42"
          icon={Users}
          trend="+5 dari bulan lalu"
          trendUp={true}
        />
        <StatsCard
          title="Follow Up Hari Ini"
          value="8"
          icon={Calendar}
        />
        <StatsCard
          title="Closing Bulan Ini"
          value="12"
          icon={CheckCircle}
          trend="+3 dari target"
          trendUp={true}
        />
        <StatsCard
          title="Target Bulanan"
          value="75%"
          icon={Target}
          trend="9 dari 12"
          trendUp={true}
        />
      </div>

      {/* Follow Up Table */}
      <div className="mb-8">
        <FollowUpTable />
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
