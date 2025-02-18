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

interface IntegrationChartProps {
  functionData: { x: number; y: number }[];
  trapezoidData?: { x: number; y: number }[];
  result: number | null;
}

const IntegrationChart: React.FC<IntegrationChartProps> = ({
  functionData,
  trapezoidData = [],
  result,
}) => {
  // Формируем данные для графика функции
  const functionDataset = {
    label: 'f(x)',
    data: functionData.map((point) => ({ x: point.x, y: point.y })),
    borderColor: 'rgba(75, 192, 192, 1)',
    fill: false,
    pointRadius: 0,
  };

  // Формируем данные для трапеций
  const trapezoidDataset = {
    label: 'Трапеции',
    data: trapezoidData.flatMap((point, i, arr) => {
      if (i === arr.length - 1) return [];
      const nextPoint = arr[i + 1];
      return [
        { x: point.x, y: 0 }, // Нижняя левая точка
        { x: point.x, y: point.y }, // Верхняя левая точка
        { x: nextPoint.x, y: nextPoint.y }, // Верхняя правая точка
        { x: nextPoint.x, y: 0 }, // Нижняя правая точка
        { x: point.x, y: 0 }, // Замыкаем контур
      ];
    }),
    borderColor: 'rgba(255, 99, 132, 0.5)',
    backgroundColor: 'rgba(255, 99, 132, 0.2)',
    fill: '+1', // Заливка между текущим и следующим dataset
    pointRadius: 0,
  };

  const chartData = {
    datasets: [functionDataset, trapezoidDataset],
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
    plugins: {
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const datasetIndex = context.datasetIndex;
            const dataIndex = context.dataIndex;

            if (datasetIndex === 1) {
              const points = trapezoidData.slice(Math.floor(dataIndex / 5), Math.floor(dataIndex / 5) + 2);
              if (points.length === 2) {
                const [point1, point2] = points;
                const area = ((point1.y + point2.y) / 2) * (point2.x - point1.x);
                return `Площадь: ${area.toFixed(4)}`;
              }
            }
            return null;
          },
        },
      },
    },
  };

  return (
    <>
      {result !== null && (
        <div style={{ marginTop: '10px' }}>
          Результат: {result.toFixed(4)}
        </div>
      )}
      <div style={{ marginTop: '20px', height: '400px', width: '500px' }}>
        <Line data={chartData} options={chartOptions} />
      </div>
    </>
  );
};

export default IntegrationChart;