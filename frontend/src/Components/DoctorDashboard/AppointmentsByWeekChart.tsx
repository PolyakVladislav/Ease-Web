import React from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { AppointmentsByWeek } from "../../Services/statsService";
import { setISOWeek, startOfISOWeek, format } from "date-fns";   

type Props = { data: AppointmentsByWeek[] };

const isoLabel = (period: string) => {
  const [year, wk] = period.split("-W");
  const date = startOfISOWeek(setISOWeek(new Date(Number(year), 0, 4), +wk));
  return format(date, "MMM d");              
};

const AppointmentsByWeekChart: React.FC<Props> = ({ data }) => {
  if (!data.length) return <p>No data yet</p>;

  return (
    <ResponsiveContainer height={250}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="period" tickFormatter={isoLabel} />
        <YAxis allowDecimals={false} />
        <Tooltip labelFormatter={isoLabel} />
        <Line type="monotone" dataKey="count" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default AppointmentsByWeekChart;