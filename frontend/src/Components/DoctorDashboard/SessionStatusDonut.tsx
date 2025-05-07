import React from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from "recharts";
import { SessionStatus } from "../../Services/statsService";
import styles from "../../css/DoctorDashboard/SessionStatusDonut.module.css";  // 🔹

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#dd6b66"];

type Props = { data: SessionStatus };

const SessionStatusDonut: React.FC<Props> = ({ data }) => {
  const chartData = Object.entries(data)
    .map(([name, value]) => ({ name, value }))
    .filter((d) => d.value > 0);

  if (!chartData.length) return <p>No data yet</p>;

  return (
    <div>
      <ResponsiveContainer height={250}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            innerRadius={60}
            outerRadius={90}
            label
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>

      <div className={styles.legend}>
        {chartData.map((d, i) => (
          <div key={d.name} className={styles.legendItem}>
            <span
              className={styles.swatch}
              style={{ background: COLORS[i % COLORS.length] }}
            />
            {d.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SessionStatusDonut;