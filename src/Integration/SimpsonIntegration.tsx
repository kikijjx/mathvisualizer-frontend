import React, { useState } from 'react';
import { Card, Button, Typography } from 'antd';
import IntegrationInputs from './IntegrationInputs';
import IntegrationChart from './IntegrationChart';
import IntegrationTable from './IntegrationTable';
import { replaceMathFunctions } from '../mathUtils';
import { MathJax } from 'better-react-mathjax';
import {
  leftRectangles,
  rightRectangles,
  midpointRectangles,
  trapezoidal,
  simpson,
  calculateTheoreticalError,
  calculateExactIntegral,
} from '../mathUtils';

const { Paragraph } = Typography;

const SimpsonIntegration: React.FC = () => {
  const [latex, setLatex] = useState<string>('sin(x)');
  const [a, setA] = useState<number>(0);
  const [b, setB] = useState<number>(10);
  const [n, setN] = useState<number>(12); // Start with an even number
  const [result, setResult] = useState<number | null>(null);
  const [functionData, setFunctionData] = useState<{ x: number; y: number }[]>([]);
  const [parabolaData, setParabolaData] = useState<{ x: number; y: number }[]>([]);
  const [tableData, setTableData] = useState<{ method: string; approx: number; error: number; theoreticalError: number }[]>([]);
  const [exactIntegral, setExactIntegral] = useState<number | null>(null);

  const integrate = () => {
    console.time('Integration Time');

    const processedLatex = replaceMathFunctions(latex);
    const func = (x: number) => eval(processedLatex.replace(/x/g, `(${x})`));
    const step = (b - a) / n;

    // Exact integral value
    const exact = calculateExactIntegral(a, b);
    setExactIntegral(exact);

    // Generate function data for the exact graph
    const numPoints = 500;
    const newFunctionData = [];
    for (let i = 0; i <= numPoints; i++) {
      const x = a + (i / numPoints) * (b - a);
      const y = func(x);
      newFunctionData.push({ x, y });
    }
    setFunctionData(newFunctionData);

    // Generate data for parabolic segments (Simpson's rule uses pairs of intervals)
    const newParabolaData = [];
    for (let i = 0; i < n; i += 2) {
      const x0 = a + i * step;
      const x1 = a + (i + 1) * step;
      const x2 = a + (i + 2) * step;
      newParabolaData.push({ x: x0, y: func(x0) });
      newParabolaData.push({ x: x1, y: func(x1) });
      newParabolaData.push({ x: x2, y: func(x2) });
    }
    setParabolaData(newParabolaData);

    // Calculate results for all methods
    const methods = [
      { name: 'Левых прямоугольников', func: leftRectangles },
      { name: 'Правых прямоугольников', func: rightRectangles },
      { name: 'Средних прямоугольников', func: midpointRectangles },
      { name: 'Трапеций', func: trapezoidal },
      { name: 'Симпсона', func: simpson },
    ];

    const newTableData = methods.map((method) => {
      let approx: number;
      try {
        approx = method.func(func, a, b, n);
      } catch (e) {
        approx = NaN; // Handle the case where Simpson's rule fails due to odd n
      }
      const error = Math.abs(exact - approx);
      const theoreticalError = calculateTheoreticalError(method.name, func, a, b, n);
      return { method: method.name, approx, error, theoreticalError };
    });

    setTableData(newTableData);

    // Result for Simpson's method
    const simpsonResult = simpson(func, a, b, n);
    setResult(simpsonResult);

    console.log(`Число разбиений (n): ${n}`);
    console.log(`Найденное значение интеграла: ${simpsonResult}`);
    console.timeEnd('Integration Time');
  };

  return (
    <Card title="Метод Симпсона" style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
      {/* Theory */}
      <Typography style={{ textAlign: 'left', padding: '0 20px' }}>
        <Paragraph>
          Пусть требуется вычислить определённый интеграл:
          <MathJax>{`\\[ I = \\int_{a}^{b} f(x) \\, dx \\]`}</MathJax>
          Определённый интеграл представляет собой площадь под кривой, ограниченной подынтегральной функцией <MathJax inline dynamic>\( f(x) \)</MathJax>.
        </Paragraph>
        <Paragraph>
          Для вычисления определённого интеграла площадь под кривой аппроксимируется параболами. Метод Симпсона использует квадратичную интерполяцию на каждом отрезке:
          <MathJax>{`\\[ S_i = \\frac{h}{3} \\left( f(x_i) + 4f\\left(x_i + \\frac{h}{2}\\right) + f(x_{i+1}) \\right) \\]`}</MathJax>
          где:
          <ul>
            <li>
              <span> <MathJax inline dynamic>{`\\( S_i \\)`}</MathJax> — площадь <MathJax inline dynamic>{`\\( i \\)`}</MathJax>-го сегмента </span>
            </li>
            <li>
              <span> <MathJax inline dynamic>{`\\( f(x_i) \\)`}</MathJax>, <MathJax inline dynamic>{`\\( f\\left(x_i + \\frac{h}{2}\\right) \\)`}</MathJax>, <MathJax inline dynamic>{`\\( f(x_{i+1}) \\)`}</MathJax> — значения функции в точках отрезка </span>
            </li>
            <li>
              <span> <MathJax inline dynamic>{`\\( h = \\frac{b - a}{n} \\)`}</MathJax> — шаг разбиения (ширина сегмента) </span>
            </li>
            <li>
              <span> <MathJax inline dynamic>{`\\( n \\)`}</MathJax> — количество разбиений (должно быть чётным) </span>
            </li>
          </ul>
        </Paragraph>
        <Paragraph>
          Общая площадь под кривой аппроксимируется суммой площадей всех сегментов:
          <MathJax>{`\\[ I \\approx \\sum_{i=0}^{n-1} S_i = \\frac{h}{3} \\left( f(x_0) + 4f(x_1) + 2f(x_2) + 4f(x_3) + \\dots + 2f(x_{n-2}) + 4f(x_{n-1}) + f(x_n) \\right) \\]`}</MathJax>
        </Paragraph>
      </Typography>

      {/* Inputs */}
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

      {/* Integrate Button */}
      <Button onClick={integrate} style={{ marginTop: '10px' }}>
        Интегрировать
      </Button>

      {/* Chart and Result */}
      <IntegrationChart
        functionData={functionData}
        segmentData={parabolaData}
        result={result}
        method="Симпсона"
      />

      {/* Exact Integral */}
      {exactIntegral !== null && (
        <Typography style={{ marginTop: '20px' }}>
          <Paragraph>
            Точное значение интеграла: <MathJax inline dynamic>{`\\( I_{\\text{точное}} = ${exactIntegral.toFixed(6)} \\)`}</MathJax>
          </Paragraph>
        </Typography>
      )}

      {/* Table */}
      <IntegrationTable
        data={tableData}
        highlightedMethod="Симпсона"
      />
    </Card>
  );
};

export default SimpsonIntegration;