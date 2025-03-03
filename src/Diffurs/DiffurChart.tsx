import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

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
  const chartData = {
    labels: t,
    datasets: [
      {
        label: 'y(t)',
        data: y,
        borderColor: 'rgba(75, 192, 192, 1)',
        fill: false,
      },
    ],
  };

  const chartOptions = {
    scales: {
      x: {
        title: {
          display: true,
          text: 'Time (t)',
        },
      },
      y: {
        title: {
          display: true,
          text: 'y(t)',
        },
      },
    },
  };

  return (
    <div style={{ marginTop: '20px', height: '400px' }}>
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};

export default DiffurChart;