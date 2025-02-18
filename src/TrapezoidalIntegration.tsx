import React, { useState } from 'react';
import { Card, Button } from 'antd';
import IntegrationInputs from './IntegrationInputs';
import IntegrationChart from './IntegrationChart';
import { replaceMathFunctions } from './mathUtils'; // Вынесем функцию замены в отдельный файл

const TrapezoidalIntegration: React.FC = () => {
  const [latex, setLatex] = useState<string>('sin(x)');
  const [a, setA] = useState<number>(0);
  const [b, setB] = useState<number>(10);
  const [n, setN] = useState<number>(10);
  const [result, setResult] = useState<number | null>(null);
  const [functionData, setFunctionData] = useState<{ x: number; y: number }[]>([]);
  const [trapezoidData, setTrapezoidData] = useState<{ x: number; y: number }[]>([]);

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

    // Генерация данных для трапеций
    const newTrapezoidData = [];
    for (let i = 0; i <= n; i++) {
      const x = a + i * step;
      const y = func(x);
      newTrapezoidData.push({ x, y });
      if (i === 0 || i === n) {
        sum += y;
      } else {
        sum += 2 * y;
      }
    }
    setTrapezoidData(newTrapezoidData);

    // Вычисление результата интегрирования
    setResult((sum * step) / 2);
  };

  return (
    <Card title="Метод трапеций" style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
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
        trapezoidData={trapezoidData}
        result={result}
      />
    </Card>
  );
};

export default TrapezoidalIntegration;