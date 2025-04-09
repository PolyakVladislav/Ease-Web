import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { fetchSessionsPerDoctor, fetchSessionsPerMonth } from "../Services/adminService";
import styles from "../css/AdminPanel.module.css";

const AdminCharts: React.FC = () => {
  const [doctorData, setDoctorData] = useState<{ doctor: string; count: number }[]>([]);
  const [monthlyData, setMonthlyData] = useState<{ month: string; count: number }[]>([]);

  useEffect(() => {
    fetchSessionsPerDoctor().then(setDoctorData).catch(console.error);
    fetchSessionsPerMonth().then(setMonthlyData).catch(console.error);
  }, []);

  return (
    <div className={styles.chartContainer}>
      <h3>📊 Sessions per Doctor</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={doctorData}>
          <XAxis dataKey="doctor" />
          <YAxis />
          <Tooltip />
          <CartesianGrid strokeDasharray="3 3" />
          <Bar dataKey="count" fill="#5b53f7" />
        </BarChart>
      </ResponsiveContainer>

        <h3>📊 Monthly Sessions (Last 12 Months)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={monthlyData}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <CartesianGrid strokeDasharray="3 3" />
          <Bar dataKey="count" fill="#5b53f7" />
        </BarChart>
      </ResponsiveContainer>

    </div>
  );
};

export default AdminCharts;
