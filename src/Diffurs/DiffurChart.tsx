import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface DiffurChartProps {
  t: number[];
  y: number[];
}

const DiffurChart: React.FC<DiffurChartProps> = ({ t, y }) => {
  const data = {
    labels: t,
    datasets: [
      {
        label: "y(t)",
        data: y,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: false,
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { title: { display: true, text: "Время (t)" } },
      y: { title: { display: true, text: "y(t)" } },
    },
  };

  return (
    <div style={{ height: "400px", marginTop: "20px" }}>
      <Line data={data} options={options} />
    </div>
  );
};

export default DiffurChart;