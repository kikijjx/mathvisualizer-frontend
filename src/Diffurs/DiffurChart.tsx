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
import zoomPlugin from 'chartjs-plugin-zoom';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  zoomPlugin
);

interface DiffurChartProps {
  eulerData: { x: number; y: number }[];
  exactData: { x: number; y: number }[];
  methodLabel: string; // название текущего численного метода
}


const DiffurChart: React.FC<DiffurChartProps> = ({ eulerData, exactData, methodLabel }) => {
  const methodDataset = {
  label: methodLabel,
  data: eulerData.map((point) => ({ x: point.x, y: point.y })),
  borderColor: 'rgba(255, 99, 132, 1)',
  borderWidth: 3,
  fill: false,
  pointRadius: 3,
  hoverBorderWidth: 4,
};


  const exactDataset = exactData.length > 0
    ? {
        label: 'Точное решение',
        data: exactData.map((point) => ({ x: point.x, y: point.y })),
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 3,
        fill: false,
        pointRadius: 0,
        hoverBorderWidth: 4,
      }
    : null;

  const chartData = {
  datasets: exactDataset ? [methodDataset, exactDataset] : [methodDataset],
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
            const dataIndex = context.dataIndex;
            const point = datasetIndex === 0 ? eulerData[dataIndex] : exactData[dataIndex];
            return `x: ${point.x.toFixed(4)}, y: ${point.y.toFixed(4)}`;
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

export default DiffurChart;