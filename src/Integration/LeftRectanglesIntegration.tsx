import React, { useState } from 'react';
import { Card, Button, Typography } from 'antd';
import IntegrationInputs from './IntegrationInputs';
import IntegrationChart from './IntegrationChart';
import IntegrationTable from './IntegrationTable'; // Импортируем новый компонент
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

const LeftRectanglesIntegration: React.FC = () => {
  const [latex, setLatex] = useState<string>('sin(x)');
  const [a, setA] = useState<number>(0);
  const [b, setB] = useState<number>(10);
  const [n, setN] = useState<number>(10);
  const [result, setResult] = useState<number | null>(null);
  const [functionData, setFunctionData] = useState<{ x: number; y: number }[]>([]);
  const [rectanglesData, setRectanglesData] = useState<{ x: number; y: number }[]>([]);
  const [tableData, setTableData] = useState<{ method: string; approx: number; error: number; theoreticalError: number }[]>([]);
  const [exactIntegral, setExactIntegral] = useState<number | null>(null);

  const integrate = () => {
    const processedLatex = replaceMathFunctions(latex);
    const func = (x: number) => eval(processedLatex.replace(/x/g, `(${x})`));
    const step = (b - a) / n;

    // Точное значение интеграла
    const exact = calculateExactIntegral(a, b);
    setExactIntegral(exact);

    // Генерация данных для точного графика функции
    const numPoints = 500;
    const newFunctionData = [];
    for (let i = 0; i <= numPoints; i++) {
      const x = a + (i / numPoints) * (b - a);
      const y = func(x);
      newFunctionData.push({ x, y });
    }
    setFunctionData(newFunctionData);

    // Генерация данных для прямоугольников
    const newRectanglesData = [];
    for (let i = 0; i < n; i++) {
      const x = a + i * step;
      const y = func(x);
      newRectanglesData.push({ x, y: 0 }, { x, y }, { x: x + step, y }, { x: x + step, y: 0 });
    }
    setRectanglesData(newRectanglesData);

    // Вычисление результатов для всех методов
    const methods = [
      { name: 'Левых прямоугольников', func: leftRectangles },
      { name: 'Правых прямоугольников', func: rightRectangles },
      { name: 'Средних прямоугольников', func: midpointRectangles },
      { name: 'Трапеций', func: trapezoidal },
      { name: 'Симпсона', func: simpson },
    ];

    const newTableData = methods.map((method) => {
      const approx = method.func(func, a, b, n);
      const error = Math.abs(exact - approx);
      const theoreticalError = calculateTheoreticalError(method.name, func, a, b, n);
      return {
        method: method.name,
        approx,
        error,
        theoreticalError,
      };
    });

    setTableData(newTableData);

    // Результат для выбранного метода (левых прямоугольников)
    setResult(leftRectangles(func, a, b, n));
  };

  return (
    <Card title="Метод левых прямоугольников" style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
      {/* Теория */}
      <Typography style={{ textAlign: 'left', padding: '0 20px' }}>
        <Paragraph>
          Пусть требуется вычислить определённый интеграл:
          <MathJax>{`\\[ I = \\int_{a}^{b} f(x) \\, dx \\]`}</MathJax>
          Определённый интеграл представляет собой площадь под кривой, ограниченной подынтегральной функцией <MathJax inline dynamic>\( f(x) \)</MathJax>.
        </Paragraph>
        <Paragraph>
          Для вычисления определённого интеграла площадь под кривой аппроксимируется прямоугольниками. Площадь каждого прямоугольника можно определить как:
          <MathJax>{`\\[ S_i = f(x_i) \\cdot h \\]`}</MathJax>
          где:
          <ul>
            <li>
              <span> <MathJax inline dynamic>{`\\( S_i \\)`}</MathJax> — площадь <MathJax inline dynamic>{`\\( i \\)`}</MathJax>-го прямоугольника </span>
            </li>
            <li>
              <span> <MathJax inline dynamic>{`\\( f(x_i) \\)`}</MathJax> — значение функции в левой точке отрезка </span>
            </li>
            <li>
              <span> <MathJax inline dynamic>{`\\( h = \\frac{b - a}{n} \\)`}</MathJax> — шаг разбиения (ширина прямоугольника) </span>
            </li>
            <li>
              <span> <MathJax inline dynamic>{`\\( n \\)`}</MathJax> — количество разбиений </span>
            </li>
          </ul>
        </Paragraph>
        <Paragraph>
          Общая площадь под кривой аппроксимируется суммой площадей всех прямоугольников:
          <MathJax>{`\\[ I \\approx \\sum_{i=0}^{n-1} S_i = h \\left( f(x_0) + f(x_1) + \\dots + f(x_{n-1}) \\right) \\]`}</MathJax>
        </Paragraph>
      </Typography>

      {/* Ввод данных */}
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

      {/* Кнопка для интегрирования */}
      <Button onClick={integrate} style={{ marginTop: '10px' }}>
        Интегрировать
      </Button>

      {/* График и результат */}
      <IntegrationChart
        functionData={functionData}
        segmentData={rectanglesData}
        result={result}
      />

      {/* Точное значение интеграла */}
      {exactIntegral !== null && (
        <Typography style={{ marginTop: '20px' }}>
          <Paragraph>
            Точное значение интеграла: <MathJax inline dynamic>{`\\( I_{\\text{точное}} = ${exactIntegral.toFixed(6)} \\)`}</MathJax>
          </Paragraph>
        </Typography>
      )}

      {/* Таблица с результатами */}
      <IntegrationTable
        data={tableData}
        highlightedMethod="Левых прямоугольников"
      />
    </Card>
  );
};

export default LeftRectanglesIntegration;