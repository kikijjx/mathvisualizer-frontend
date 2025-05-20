import React from 'react';
import { Table } from 'antd';
import { MathJax } from 'better-react-mathjax';

interface TableData {
  x: number;
  exact?: number;
  euler: number;
  koshi: number;
  koshiHalf: number;
  rungeKutta: number;
  eulerError?: number;
  koshiError?: number;
  koshiHalfError?: number;
  rungeKuttaError?: number;
}

interface DiffurTableProps {
  eulerData: { x: number; y: number }[];
  koshiData: { x: number; y: number }[];
  koshiHalfData: { x: number; y: number }[];
  rungeKuttaData: { x: number; y: number }[];
  exactData: { x: number; y: number }[];
  step: number;
  showExact: boolean;
  highlightedMethod: string;
}

const DiffurTable: React.FC<DiffurTableProps> = ({
  eulerData,
  koshiData,
  koshiHalfData,
  rungeKuttaData,
  exactData,
  step,
  showExact,
  highlightedMethod,
}) => {
  // Prepare table data
  const dataSource: TableData[] = eulerData.map((eulerPoint, index) => {
    const x = eulerPoint.x;
    const exactPoint = exactData.find((p) => Math.abs(p.x - x) < 1e-6);
    const koshiPoint = koshiData[index] || { y: NaN };
    const koshiHalfPoint = koshiHalfData[index] || { y: NaN };
    const rungeKuttaPoint = rungeKuttaData[index] || { y: NaN };
    const row: TableData = {
      x,
      euler: eulerPoint.y,
      koshi: koshiPoint.y,
      koshiHalf: koshiHalfPoint.y,
      rungeKutta: rungeKuttaPoint.y,
    };
    if (showExact && exactPoint) {
      row.exact = exactPoint.y;
      row.eulerError = Math.abs(eulerPoint.y - exactPoint.y);
      row.koshiError = Math.abs(koshiPoint.y - exactPoint.y);
      row.koshiHalfError = Math.abs(koshiHalfPoint.y - exactPoint.y);
      row.rungeKuttaError = Math.abs(rungeKuttaPoint.y - exactPoint.y);
    }
    return row;
  });

  const columns = [
    {
      title: 'x',
      dataIndex: 'x',
      key: 'x',
      render: (value: number) => value.toFixed(6),
    },
    ...(showExact
      ? [
          {
            title: <MathJax inline dynamic>{`\\( y_{\\text{точное}} \\)`}</MathJax>,
            dataIndex: 'exact',
            key: 'exact',
            render: (value: number) => (value !== undefined ? value.toFixed(6) : '-'),
          },
        ]
      : []),
    {
      title: (
        <span style={{ fontWeight: highlightedMethod === 'Эйлера' ? 'bold' : 'normal' }}>
          Эйлера
        </span>
      ),
      dataIndex: 'euler',
      key: 'euler',
      render: (value: number, record: TableData) => (
        <div style={{ fontWeight: highlightedMethod === 'Эйлера' ? 'bold' : 'normal' }}>
          <span>{isNaN(value) ? 'NaN' : value.toFixed(6)}</span>
          {record.eulerError !== undefined && (
            <div style={{ fontSize: '12px', color: '#888' }}>
              Δ: {record.eulerError < 1e-3 ? record.eulerError.toExponential(2) : record.eulerError.toFixed(6)}
            </div>
          )}
        </div>
      ),
    },
    {
      title: (
        <span style={{ fontWeight: highlightedMethod === 'Эйлера-Коши' ? 'bold' : 'normal' }}>
          Эйлера-Коши
        </span>
      ),
      dataIndex: 'koshi',
      key: 'koshi',
      render: (value: number, record: TableData) => (
        <div style={{ fontWeight: highlightedMethod === 'Эйлера-Коши' ? 'bold' : 'normal' }}>
          <span>{isNaN(value) ? 'NaN' : value.toFixed(6)}</span>
          {record.koshiError !== undefined && (
            <div style={{ fontSize: '12px', color: '#888' }}>
              Δ: {record.koshiError < 1e-3 ? record.koshiError.toExponential(2) : record.koshiError.toFixed(6)}
            </div>
          )}
        </div>
      ),
    },
    {
      title: (
        <span style={{ fontWeight: highlightedMethod === 'Эйлера-Коши (полуцелая сетка)' ? 'bold' : 'normal' }}>
          Эйлера-Коши (полуцелая сетка)
        </span>
      ),
      dataIndex: 'koshiHalf',
      key: 'koshiHalf',
      render: (value: number, record: TableData) => (
        <div style={{ fontWeight: highlightedMethod === 'Эйлера-Коши (полуцелая сетка)' ? 'bold' : 'normal' }}>
          <span>{isNaN(value) ? 'NaN' : value.toFixed(6)}</span>
          {record.koshiHalfError !== undefined && (
            <div style={{ fontSize: '12px', color: '#888' }}>
              Δ: {record.koshiHalfError < 1e-3 ? record.koshiHalfError.toExponential(2) : record.koshiHalfError.toFixed(6)}
            </div>
          )}
        </div>
      ),
    },
    {
      title: (
        <span style={{ fontWeight: highlightedMethod === 'Рунге-Кутта' ? 'bold' : 'normal' }}>
          Рунге-Кутта
        </span>
      ),
      dataIndex: 'rungeKutta',
      key: 'rungeKutta',
      render: (value: number, record: TableData) => (
        <div style={{ fontWeight: highlightedMethod === 'Рунге-Кутта' ? 'bold' : 'normal' }}>
          <span>{isNaN(value) ? 'NaN' : value.toFixed(6)}</span>
          {record.rungeKuttaError !== undefined && (
            <div style={{ fontSize: '12px', color: '#888' }}>
              Δ: {record.rungeKuttaError < 1e-3 ? record.rungeKuttaError.toExponential(2) : record.rungeKuttaError.toFixed(6)}
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: '10px' }}>
        <MathJax inline dynamic>{`\\( h = ${step.toFixed(6)} \\)`}</MathJax>
      </div>
      <Table
        dataSource={dataSource}
        columns={columns}
        pagination={false}
        style={{ marginTop: '20px' }}
        rowKey={(record) => record.x.toString()}
      />
    </div>
  );
};

export default DiffurTable;