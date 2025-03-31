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
  segmentData?: { x: number; y: number }[];
  result: number | null;
  method?: string; // Метод интегрирования: "Трапеций", "Симпсона" и т.д.
}

const IntegrationChart: React.FC<IntegrationChartProps> = ({
  functionData,
  segmentData = [],
  result,
  method,
}) => {
  // Формируем данные для графика функции
  const functionDataset = {
    label: 'f(x)',
    data: functionData.map((point) => ({ x: point.x, y: point.y })),
    borderColor: 'rgba(75, 192, 192, 1)',
    fill: false,
    pointRadius: 0,
  };

  // Формируем данные для аппроксимации в зависимости от метода
  let segmentDataset;
  if (method === 'Симпсона') {
    // Для Симпсона: рисуем параболы, соединяя точки плавно
    segmentDataset = {
      label: 'Аппроксимация (параболы)',
      data: segmentData.map((point) => ({ x: point.x, y: point.y })),
      borderColor: 'rgba(255, 99, 132, 1)',
      fill: {
        target: 'origin',
        above: 'rgba(255, 99, 132, 0.1)', // Закрашиваем область под параболами
      },
      tension: 0.4, // Добавляем сглаживание для имитации парабол
      pointRadius: 0,
    };
  } else {
    // Для трапеций и других методов: текущее поведение
    segmentDataset = {
      label: 'Аппроксимация',
      data: segmentData.flatMap((point, index, array) => {
        if (index < array.length - 1) {
          return [
            { x: point.x, y: 0 },
            { x: point.x, y: point.y },
            { x: array[index + 1].x, y: array[index + 1].y },
            { x: array[index + 1].x, y: 0 },
          ];
        }
        return [
          { x: point.x, y: 0 },
          { x: point.x, y: point.y },
        ];
      }),
      borderColor: 'rgba(255, 99, 132, 1)',
      fill: {
        target: 'origin',
        above: 'rgba(255, 99, 132, 0.1)',
      },
      pointRadius: 0,
    };
  }

  const chartData = {
    datasets: [functionDataset, segmentDataset],
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

            if (datasetIndex === 1 && method === 'Симпсона') {
              const point = segmentData[dataIndex];
              return `x: ${point.x.toFixed(4)}, y: ${point.y.toFixed(4)}`;
            } else if (datasetIndex === 1) {
              const point = segmentData[Math.floor(dataIndex / 4)];
              return `x: ${point.x.toFixed(4)}, y: ${point.y.toFixed(4)}`;
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
      <div style={{ marginTop: '20px', height: '400px' }}>
        <Line data={chartData} options={chartOptions} />
      </div>
    </>
  );
};

export default IntegrationChart;