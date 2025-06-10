import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  fetchSessionsPerDoctor,
  fetchSessionsPerWeek,
} from "../../Services/adminService";
import styles from "../../css/AdminPanel.module.css";

const AdminCharts: React.FC = () => {
  const [doctorData, setDoctorData] = useState<
    { doctor: string; count: number }[]
  >([]);
  const [weeklyData, setWeeklyData] = useState<
    { week: string; count: number }[]
  >([]);

  useEffect(() => {
    fetchSessionsPerDoctor().then(setDoctorData).catch(console.error);
    fetchSessionsPerWeek().then(setWeeklyData).catch(console.error);
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

      <h3>📊 Weekly Sessions (Last 6 Weeks)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={weeklyData}>
          <XAxis dataKey="week" />
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
