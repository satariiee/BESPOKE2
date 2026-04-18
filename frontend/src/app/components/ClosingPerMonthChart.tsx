import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

type ChartPoint = {
  name: string;
  closing: number;
};

type ClosingPerMonthChartProps = {
  data: ChartPoint[];
};

export function ClosingPerMonthChart({ data }: ClosingPerMonthChartProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Closing per Month</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" stroke="#888888" />
            <YAxis stroke="#888888" />
            <Tooltip />
            <Legend />
            <Bar dataKey="closing" fill="#1F6B7A" name="Jemaah Closing" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
