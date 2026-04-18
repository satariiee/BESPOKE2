import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "./ui/card";

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  bgColor?: string;
  iconColor?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  trendUp = true,
  bgColor = "bg-gray-50",
  iconColor = "text-gray-600",
}: StatsCardProps) {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
            {trend && (
              <p
                className={`text-sm mt-2 ${
                  trendUp ? "text-green-600" : "text-red-600"
                }`}
              >
                {trend} dari bulan lalu
              </p>
            )}
          </div>
          <div className={`${bgColor} p-4 rounded-xl`}>
            <Icon className={`w-8 h-8 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
