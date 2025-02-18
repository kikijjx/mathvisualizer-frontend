import React, { useState } from 'react';
import { Card, Button } from 'antd';
import IntegrationInputs from './IntegrationInputs';
import IntegrationChart from './IntegrationChart';
import { replaceMathFunctions } from './mathUtils';

const MidpointRectanglesIntegration: React.FC = () => {
  const [latex, setLatex] = useState<string>('sin(x)');
  const [a, setA] = useState<number>(0);
  const [b, setB] = useState<number>(10);
  const [n, setN] = useState<number>(10);
  const [result, setResult] = useState<number | null>(null);
  const [functionData, setFunctionData] = useState<{ x: number; y: number }[]>([]);
  const [rectanglesData, setRectanglesData] = useState<{ x: number; y: number }[]>([]);

  const integrate = () => {
    const processedLatex = replaceMathFunctions(latex);
    const func = (x: number) => eval(processedLatex.replace(/x/g, `(${x})`));
    let sum = 0;
    const step = (b - a) / n;

    // Генерация данных для точного графика функции
    const numPoints = 500;
    const newFunctionData = [];
    for (let i = 0; i <= numPoints; i++) {
      const x = a + (i / numPoints) * (b - a);
      const y = func(x);
      newFunctionData.push({ x, y });
    }
    setFunctionData(newFunctionData);

    // Генерация данных для средних прямоугольников
    const newRectanglesData = [];
    for (let i = 0; i < n; i++) {
      const x = a + (i + 0.5) * step;
      const y = func(x);
      newRectanglesData.push(
        { x: a + i * step, y: 0 },
        { x: a + i * step, y },
        { x: a + (i + 1) * step, y },
        { x: a + (i + 1) * step, y: 0 }
      );
      sum += y;
    }
    setRectanglesData(newRectanglesData);

    // Вычисление результата интегрирования
    setResult(sum * step);
  };

  return (
    <Card title="Метод средних прямоугольников">
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
        trapezoidData={rectanglesData}
        result={result}
      />
    </Card>
  );
};

export default MidpointRectanglesIntegration;