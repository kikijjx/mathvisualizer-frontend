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
  method?: string; // Метод интегрирования
}

const IntegrationChart: React.FC<IntegrationChartProps> = ({
  functionData,
  segmentData = [],
  result,
}) => {
  // Формируем данные для графика функции
  const functionDataset = {
    label: 'f(x)',
    data: functionData.map((point) => ({ x: point.x, y: point.y })),
    borderColor: 'rgba(75, 192, 192, 1)', // Цвет функции
    fill: false,
    pointRadius: 0,
  };

  // Формируем данные для сегментов (соединяем вершины с осью y=0)
  const segmentDataset = {
    label: 'Аппроксимация',
    data: segmentData.flatMap((point, index, array) => {
      // Если это не последняя точка, соединяем текущую вершину с осью y=0 и следующей вершиной
      if (index < array.length - 1) {
        return [
          { x: point.x, y: 0 }, // Точка на оси y=0
          { x: point.x, y: point.y }, // Вершина параболы
          { x: array[index + 1].x, y: array[index + 1].y }, // Следующая вершина
          { x: array[index + 1].x, y: 0 }, // Точка на оси y=0 для следующей вершины
        ];
      }
      // Для последней точки просто соединяем с осью y=0
      return [
        { x: point.x, y: 0 }, // Точка на оси y=0
        { x: point.x, y: point.y }, // Вершина параболы
      ];
    }),
    borderColor: 'rgba(255, 99, 132, 1)', // Цвет сегментов
    fill: {
      target: 'origin', // Заливка до оси X (начала координат)
      above: 'rgba(255, 99, 132, 0.1)', // Цвет заливки
      
    }, // Без заливки
    pointRadius: 0,
  };

  const chartData = {
    datasets: [functionDataset, segmentDataset],
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