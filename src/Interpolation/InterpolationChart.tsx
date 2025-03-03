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
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface InterpolationChartProps {
  points: { x: number; y: number }[];
  interpolatedData: { x: number; y: number }[];
}

const InterpolationChart: React.FC<InterpolationChartProps> = ({ points, interpolatedData }) => {
  const pointsDataset = {
    label: 'Точки',
    data: points,
    borderColor: 'rgba(255, 99, 132, 1)',
    backgroundColor: 'rgba(255, 99, 132, 1)',
    pointRadius: 5,
    fill: false,
  };

  const interpolatedDataset = {
    label: 'Интерполяция',
    data: interpolatedData,
    borderColor: 'rgba(75, 192, 192, 1)',
    backgroundColor: 'rgba(75, 192, 192, 0.2)',
    pointRadius: 0,
    fill: false,
  };

  const chartData = {
    datasets: [pointsDataset, interpolatedDataset],
  };

  const chartOptions = {
    scales: {
      x: {
        type: 'linear',
        title: {
          display: true,
          text: 'x',
        },
      },
      y: {
        type: 'linear',
        title: {
          display: true,
          text: 'y',
        },
      },
    },
  };

  return (
    <div style={{ marginTop: '20px', height: '400px', width: '500px' }}>
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};

export default InterpolationChart;