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
  const [n, setN] = useState<number>(12);
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

    const exact = calculateExactIntegral(a, b);
    setExactIntegral(exact);

    const numPoints = 500;
    const newFunctionData = [];
    for (let i = 0; i <= numPoints; i++) {
      const x = a + (i / numPoints) * (b - a);
      const y = func(x);
      newFunctionData.push({ x, y });
    }
    setFunctionData(newFunctionData);

    // Генерация данных для парабол с большим количеством точек
    const newParabolaData: { x: number; y: number }[] = [];
    const pointsPerParabola = 20; // Количество точек для каждой параболы
    for (let i = 0; i < n; i += 2) {
      const x0 = a + i * step;
      const x1 = a + (i + 1) * step;
      const x2 = a + (i + 2) * step;
      const y0 = func(x0);
      const y1 = func(x1);
      const y2 = func(x2);

      // Вычисляем коэффициенты параболы ax² + bx + c через три точки
      const a_parabola = (y2 - 2 * y1 + y0) / (2 * step * step);
      const b_parabola = (y1 - y0 - a_parabola * (x1 * x1 - x0 * x0)) / (x1 - x0);
      const c_parabola = y0 - a_parabola * x0 * x0 - b_parabola * x0;

      // Генерируем точки для параболы
      for (let j = 0; j <= pointsPerParabola; j++) {
        const x = x0 + (j / pointsPerParabola) * 2 * step; // От x0 до x2
        const y = a_parabola * x * x + b_parabola * x + c_parabola;
        newParabolaData.push({ x, y });
      }
    }
    setParabolaData(newParabolaData);

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
        approx = NaN;
      }
      const error = Math.abs(exact - approx);
      const theoreticalError = calculateTheoreticalError(method.name, func, a, b, n);
      return { method: method.name, approx, error, theoreticalError };
    });

    setTableData(newTableData);

    const simpsonResult = simpson(func, a, b, n);
    setResult(simpsonResult);

    console.log(`Число разбиений (n): ${n}`);
    console.log(`Найденное значение интеграла: ${simpsonResult}`);
    console.timeEnd('Integration Time');
  };

  return (
    <Card title="Метод Симпсона" style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
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
        segmentData={parabolaData}
        result={result}
        method="Симпсона"
      />

      {exactIntegral !== null && (
        <Typography style={{ marginTop: '20px' }}>
          <Paragraph>
            Точное значение интеграла: <MathJax inline dynamic>{`\\( I_{\\text{точное}} = ${exactIntegral.toFixed(6)} \\)`}</MathJax>
          </Paragraph>
        </Typography>
      )}

      <IntegrationTable
        data={tableData}
        highlightedMethod="Симпсона"
      />
    </Card>
  );
};

export default SimpsonIntegration;