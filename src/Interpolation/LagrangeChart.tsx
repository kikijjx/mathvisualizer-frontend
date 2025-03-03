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

interface LagrangeChartProps {
  functionData: { x: number; y: number }[];
  pointsData: { x: number; y: number }[];
}

const LagrangeChart: React.FC<LagrangeChartProps> = ({
  functionData,
  pointsData,
}) => {
  // Данные для графика интерполяционного полинома
  const functionDataset = {
    label: 'Интерполяционный полином',
    data: functionData.map((point) => ({ x: point.x, y: point.y })),
    borderColor: 'rgba(75, 192, 192, 1)',
    fill: false,
    pointRadius: 0,
  };

  // Данные для точек интерполяции
  const pointsDataset = {
    label: 'Узлы интерполяции',
    data: pointsData.map((point) => ({ x: point.x, y: point.y })),
    borderColor: 'rgba(255, 99, 132, 1)',
    backgroundColor: 'rgba(255, 99, 132, 1)',
    pointRadius: 5,
  };

  const chartData = {
    datasets: [functionDataset, pointsDataset],
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
          text: 'f(x)',
        },
      },
    },
  };

  return (
    <div style={{ marginTop: '20px', height: '400px', width: '500px' }}> {/* Увеличиваем высоту графика */}
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};

export default LagrangeChart;