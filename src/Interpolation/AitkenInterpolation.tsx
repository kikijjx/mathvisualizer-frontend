import React, { useState } from 'react';
import { Card, Button, Table, Input } from 'antd';
import InterpolationInputs from './InterpolationInputs';
import InterpolationChart from './InterpolationChart';
import { MathJax } from 'better-react-mathjax';
import { simplify, parse } from 'mathjs';

const AitkenInterpolation: React.FC = () => {
  const [points, setPoints] = useState<{ x: number; y: number }[]>([
    { x: 1, y: 2 },
    { x: 2, y: 3 },
    { x: 3, y: 5 },
    { x: 4, y: 2 },
  ]);
  const [xValue, setXValue] = useState<number>(2.5); // Точка, в которой вычисляем значение
  const [interpolatedData, setInterpolatedData] = useState<{ x: number; y: number }[]>([]);
  const [aitkenTable, setAitkenTable] = useState<any[]>([]); // Данные для таблицы
  const [simplifiedFormula, setSimplifiedFormula] = useState<string>(''); // Упрощённая формула

  // Рекурсивная функция для схемы Эйткена
  const aitken = (x: number, points: { x: number; y: number }[], i: number, j: number): number => {
    if (i === j) {
      return points[i].y;
    }
    return (
      ((x - points[i].x) * aitken(x, points, i + 1, j) -
      (x - points[j].x) * aitken(x, points, i, j - 1)
    ) / (points[j].x - points[i].x));
  };

  // Функция для построения таблицы Эйткена
  const buildAitkenTable = (x: number, points: { x: number; y: number }[]) => {
    const n = points.length;
    const table: any[] = [];

    // Инициализация таблицы
    for (let i = 0; i < n; i++) {
      const row: any = {
        key: i,
        xk: points[i].x,
        fxk: points[i].y,
        xkMinusX: points[i].x - x,
      };

      // Заполняем остальные колонки null
      for (let j = 1; j < n; j++) {
        row[`L${0},${j}`] = null;
      }

      table.push(row);
    }

    // Заполнение таблицы
    for (let j = 1; j < n; j++) {
      for (let i = 0; i < n - j; i++) {
        table[i][`L${0},${j}`] = aitken(x, points, 0, j);
      }
    }

    return table;
  };

  // Функция для упрощения многочлена
  const getSimplifiedFormula = (points: { x: number; y: number }[]) => {
    let polynomial = '0';
    points.forEach((point, i) => {
      let term = `${point.y}`;
      points.forEach((p, j) => {
        if (i !== j) {
          term += ` * (x - ${p.x}) / (${point.x} - ${p.x})`;
        }
      });
      polynomial += ` + (${term})`;
    });

    try {
      const expr = parse(polynomial);
      const simplified = simplify(expr).toString();
      return simplified;
    } catch (error) {
      console.error('Ошибка при упрощении:', error);
      return 'Не удалось упростить';
    }
  };

  const interpolate = () => {
    // Генерация данных для графика
    const numPoints = 500;
    const newInterpolatedData = [];
    const minX = Math.min(...points.map((p) => p.x));
    const maxX = Math.max(...points.map((p) => p.x));
    for (let i = 0; i <= numPoints; i++) {
      const x = minX + (i / numPoints) * (maxX - minX);
      const y = aitken(x, points, 0, points.length - 1);
      newInterpolatedData.push({ x, y });
    }
    setInterpolatedData(newInterpolatedData);

    // Построение таблицы Эйткена
    const table = buildAitkenTable(xValue, points);
    setAitkenTable(table);

    // Упрощение многочлена
    const simplified = getSimplifiedFormula(points);
    setSimplifiedFormula(simplified);
  };

  // Колонки для таблицы
  const columns = [
    {
      title: 'k',
      dataIndex: 'key',
      key: 'key',
    },
    {
      title: 'xk',
      dataIndex: 'xk',
      key: 'xk',
    },
    {
      title: 'f(xk)',
      dataIndex: 'fxk',
      key: 'fxk',
    },
    ...points.slice(0, -1).map((_, j) => ({
      title: `L${0},${j + 1}(x)`,
      dataIndex: `L${0},${j + 1}`,
      key: `L${0},${j + 1}`,
      render: (value: number | null) => (value !== null ? value.toFixed(4) : ''), // Проверка на null
    })),
    {
      title: 'xk - x',
      dataIndex: 'xkMinusX',
      key: 'xkMinusX',
      render: (value: number) => value.toFixed(4),
    },
  ];

  return (
    <Card title="Интерполяция по схеме Эйткена" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
      <InterpolationInputs points={points} setPoints={setPoints} />
      <div style={{ marginTop: '10px' }}>
        <Input
          addonBefore="x ="
          value={xValue}
          onChange={(e) => setXValue(Number(e.target.value))}
          type="number"
          style={{ width: '200px' }}
        />
        <Button onClick={interpolate} style={{ marginLeft: '10px' }}>
          Интерполировать
        </Button>
      </div>
      {aitkenTable.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <Table
            columns={columns}
            dataSource={aitkenTable}
            pagination={false}
            bordered
            size="small"
          />
        </div>
      )}
      {simplifiedFormula && (
        <div style={{ marginTop: '10px' }}>
          <strong>Упрощённый вид:</strong>
          <MathJax>{`\\[ L(x) = ${simplifiedFormula} \\]`}</MathJax>
        </div>
      )}
      <InterpolationChart points={points} interpolatedData={interpolatedData} />
    </Card>
  );
};

export default AitkenInterpolation;