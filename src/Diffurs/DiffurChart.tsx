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
  eulerData: { x: number; y: number }[];
  exactData: { x: number; y: number }[];
}

const DiffurChart: React.FC<DiffurChartProps> = ({ eulerData, exactData }) => {
  // Данные для графика метода Эйлера
  const eulerDataset = {
    label: 'Метод Эйлера',
    data: eulerData.map((point) => ({ x: point.x, y: point.y })),
    borderColor: 'rgba(255, 99, 132, 1)',
    fill: false,
    pointRadius: 3,
  };

  // Данные для точного решения (если есть)
  const exactDataset = exactData.length > 0
    ? {
        label: 'Точное решение',
        data: exactData.map((point) => ({ x: point.x, y: point.y })),
        borderColor: 'rgba(75, 192, 192, 1)',
        fill: false,
        pointRadius: 0,
      }
    : null;

  const chartData = {
    datasets: exactDataset ? [eulerDataset, exactDataset] : [eulerDataset],
  };

  const chartOptions = {
    scales: {
      x: {
        type: 'linear' as const,
        title: {
          display: true,
          text: 'x',
        },
      },
      y: {
        type: 'linear' as const,
        title: {
          display: true,
          text: 'y',
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const datasetIndex = context.datasetIndex;
            const dataIndex = context.dataIndex;
            const point = datasetIndex === 0 ? eulerData[dataIndex] : exactData[dataIndex];
            return `x: ${point.x.toFixed(4)}, y: ${point.y.toFixed(4)}`;
          },
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