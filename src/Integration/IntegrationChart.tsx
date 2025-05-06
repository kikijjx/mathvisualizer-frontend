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
import zoomPlugin from 'chartjs-plugin-zoom';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  zoomPlugin
);

interface IntegrationChartProps {
  functionData: { x: number; y: number }[];
  segmentData?: { x: number; y: number }[];
  method?: string;
}

const IntegrationChart: React.FC<IntegrationChartProps> = ({
  functionData,
  segmentData = [],
  method,
}) => {
  const functionDataset = {
    label: 'f(x)',
    data: functionData.map((point) => ({ x: point.x, y: point.y })),
    borderColor: 'rgba(75, 192, 192, 1)',
    borderWidth: 3,
    fill: false,
    pointRadius: 0,
    hoverBorderWidth: 4,
  };

  let segmentDataset;
  if (method === 'Симпсона') {
    segmentDataset = {
      label: 'Метод Симпсона (параболы)',
      data: segmentData.map((point) => ({ x: point.x, y: point.y })),
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 3,
      fill: {
        target: 'origin',
        above: 'rgba(255, 99, 132, 0.1)',
        below: 'rgba(255, 99, 132, 0.1)', // Единый цвет под y=0
      },
      tension: 0.4,
      pointRadius: 0,
      hoverBorderWidth: 4,
    };
  } else {
    segmentDataset = {
      label: `Метод ${method || 'Сегменты'}`,
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
      borderWidth: 3,
      fill: {
        target: 'origin',
        above: 'rgba(255, 99, 132, 0.1)',
        below: 'rgba(255, 99, 132, 0.1)', // Единый цвет под y=0
      },
      pointRadius: 0,
      hoverBorderWidth: 4,
    };
  }

  const chartData = {
    datasets: [functionDataset, segmentDataset],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'linear' as const,
        title: {
          display: true,
          text: 'x',
          font: { size: 14 },
        },
        grid: {
          color: 'rgba(200, 200, 200, 0.2)',
        },
      },
      y: {
        type: 'linear' as const,
        title: {
          display: true,
          text: 'y',
          font: { size: 14 },
        },
        grid: {
          color: 'rgba(200, 200, 200, 0.2)',
        },
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: { size: 12 },
          padding: 20,
          usePointStyle: true,
        },
        onClick: (e: any, legendItem: any, legend: any) => {
          const index = legendItem.datasetIndex;
          const ci = legend.chart;
          ci.toggleDataVisibility(index);
          ci.update();
        },
      },
      tooltip: {
        enabled: true,
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: (context: any) => {
            const datasetIndex = context.datasetIndex;
            const xValue = context.parsed.x;

            if (datasetIndex === 0) {
              const point = functionData.find(
                (p) => Math.abs(p.x - xValue) < 0.01
              ) || { x: xValue, y: 0 };
              return `f(x): x=${point.x.toFixed(4)}, y=${point.y.toFixed(4)}`;
            }
            return ''; // Ничего не показываем для сегментов
          },
        },
      },
      zoom: {
        pan: {
          enabled: true,
          mode: 'xy' as const,
        },
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          mode: 'xy' as const,
        },
      },
    },
    animation: {
      duration: 500,
      easing: 'easeInOutQuad' as const,
    },
    hover: {
      mode: 'index' as const,
      intersect: false,
    },
  };

  return (
    <div style={{ height: '500px', width: '100%', position: 'relative' }}>
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};

export default IntegrationChart;