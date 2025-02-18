import React, { useState } from 'react';
import { Card, Button } from 'antd';
import IntegrationInputs from './IntegrationInputs';
import IntegrationChart from './IntegrationChart';
import { replaceMathFunctions } from './mathUtils';

const SimpsonIntegration: React.FC = () => {
  const [latex, setLatex] = useState<string>('sin(x)');
  const [a, setA] = useState<number>(0);
  const [b, setB] = useState<number>(10);
  const [n, setN] = useState<number>(10);
  const [result, setResult] = useState<number | null>(null);
  const [functionData, setFunctionData] = useState<{ x: number; y: number }[]>([]);
  const [parabolaData, setParabolaData] = useState<{ x: number; y: number }[]>([]);

  // Функция для вычисления коэффициентов параболы
  const calculateParabola = (x0: number, x1: number, x2: number, y0: number, y1: number, y2: number) => {
    const A = [
      [x0 * x0, x0, 1],
      [x1 * x1, x1, 1],
      [x2 * x2, x2, 1],
    ];
    const B = [y0, y1, y2];

    // Вычисляем определитель матрицы A
    const det = A[0][0] * (A[1][1] * A[2][2] - A[1][2] * A[2][1]) -
                A[0][1] * (A[1][0] * A[2][2] - A[1][2] * A[2][0]) +
                A[0][2] * (A[1][0] * A[2][1] - A[1][1] * A[2][0]);

    // Вычисляем определители для коэффициентов
    const detA = B[0] * (A[1][1] * A[2][2] - A[1][2] * A[2][1]) -
                 B[1] * (A[0][1] * A[2][2] - A[0][2] * A[2][1]) +
                 B[2] * (A[0][1] * A[1][2] - A[0][2] * A[1][1]);

    const detB = A[0][0] * (B[1] * A[2][2] - B[2] * A[1][2]) -
                 A[1][0] * (B[0] * A[2][2] - B[2] * A[0][2]) +
                 A[2][0] * (B[0] * A[1][2] - B[1] * A[0][2]);

    const detC = A[0][0] * (A[1][1] * B[2] - A[1][2] * B[1]) -
                 A[0][1] * (A[1][0] * B[2] - A[1][2] * B[0]) +
                 A[0][2] * (A[1][0] * B[1] - A[1][1] * B[0]);

    const a = detA / det;
    const b = detB / det;
    const c = detC / det;

    return { a, b, c };
  };

  const integrate = () => {
    const processedLatex = replaceMathFunctions(latex);
    const func = (x: number) => eval(processedLatex.replace(/x/g, `(${x})`));
    const step = (b - a) / n;
    let sum = func(a) + func(b);

    // Генерация данных для точного графика функции
    const numPoints = 500;
    const newFunctionData = [];
    for (let i = 0; i <= numPoints; i++) {
      const x = a + (i / numPoints) * (b - a);
      const y = func(x);
      newFunctionData.push({ x, y });
    }
    setFunctionData(newFunctionData);

    // Генерация данных для парабол
    const newParabolaData: { x: number; y: number }[] = [];
    for (let i = 0; i < n; i += 2) {
      const x0 = a + i * step;
      const x1 = a + (i + 1) * step;
      const x2 = a + (i + 2) * step;
      const y0 = func(x0);
      const y1 = func(x1);
      const y2 = func(x2);

      const { a: A, b: B, c: C } = calculateParabola(x0, x1, x2, y0, y1, y2);

      // Генерация точек для параболы
      for (let j = 0; j <= 100; j++) {
        const x = x0 + (j / 100) * (x2 - x0);
        const y = A * x * x + B * x + C;
        newParabolaData.push({ x, y });
      }

      // Вычисление суммы для метода Симпсона
      if (i === 0) {
        sum += 4 * y1;
      } else if (i === n - 2) {
        sum += 4 * y1 + y2;
      } else {
        sum += 2 * y0 + 4 * y1;
      }
    }
    setParabolaData(newParabolaData);

    // Вычисление результата интегрирования
    setResult((sum * step) / 3);
  };

  return (
    <Card title="Метод Симпсона">
      <IntegrationInputs
        latex={latex}
        setLatex={setLatex}
        a={a}
        setA={setA}
        b={b}
        setB={setB}
        n={n}
        setN={setN}
      />
      <Button onClick={integrate} style={{ marginTop: '10px' }}>
        Интегрировать
      </Button>
      <IntegrationChart
        functionData={functionData}
        trapezoidData={parabolaData}
        result={result}
      />
    </Card>
  );
};

export default SimpsonIntegration;