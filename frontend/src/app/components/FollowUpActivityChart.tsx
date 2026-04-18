import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

type ChartPoint = {
  name: string;
  followUp: number;
  closing: number;
};

type FollowUpActivityChartProps = {
  data: ChartPoint[];
};

export function FollowUpActivityChart({ data }: FollowUpActivityChartProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Follow Up Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" stroke="#888888" />
            <YAxis stroke="#888888" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="followUp" stroke="#1F6B7A" strokeWidth={2} name="Follow Up" dot={{ fill: "#1F6B7A" }} />
            <Line type="monotone" dataKey="closing" stroke="#2d8a9d" strokeWidth={2} name="Closing" dot={{ fill: "#2d8a9d" }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
