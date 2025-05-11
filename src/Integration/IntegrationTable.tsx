import React from 'react';
import { Table } from 'antd';
import { MathJax } from 'better-react-mathjax';

interface TableData {
  method: string;
  approx: number;
  rungeError: number; // Оценка погрешности по правилу Рунге: |I_n - I_{2n}|
  theoreticalError: number;
  n?: number;
}

interface IntegrationTableProps {
  data: TableData[];
  highlightedMethod: string;
  showN: boolean;
}

const IntegrationTable: React.FC<IntegrationTableProps> = ({ data, highlightedMethod, showN }) => {
  const columns = [
    {
      title: 'Метод',
      dataIndex: 'method',
      key: 'method',
      render: (text: string) => (
        <span style={{ fontWeight: text === highlightedMethod ? 'bold' : 'normal' }}>
          {text}
        </span>
      ),
    },
    {
      title: <MathJax inline dynamic>{`\\( I_{\\text{приближённое}} \\)`}</MathJax>,
      dataIndex: 'approx',
      key: 'approx',
      render: (value: number) => (isNaN(value) ? 'NaN' : value.toFixed(6)),
    },
    {
      title: <MathJax inline dynamic>{`\\( |I_n - I_{2n}| \\)`}</MathJax>,
      dataIndex: 'rungeError',
      key: 'rungeError',
      render: (value: number) => (isNaN(value) ? 'NaN' : value.toFixed(6)),
    },
    {
      title: 'Теоретическая погрешность',
      dataIndex: 'theoreticalError',
      key: 'theoreticalError',
      render: (value: number) => (isNaN(value) ? 'NaN' : value.toFixed(6)),
    },
    ...(showN
      ? [
          {
            title: 'n',
            dataIndex: 'n',
            key: 'n',
            render: (value: number) => (value !== undefined ? value : '-'),
          },
        ]
      : []),
  ];

  return (
    <Table
      dataSource={data}
      columns={columns}
      pagination={false}
      style={{ marginTop: '20px' }}
    />
  );
};

export default IntegrationTable;