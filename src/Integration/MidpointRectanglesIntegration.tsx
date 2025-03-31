import React, { useState } from 'react';
import { Card, Button, Typography } from 'antd';
import IntegrationInputs from './IntegrationInputs';
import IntegrationChart from './IntegrationChart';
import IntegrationTable from './IntegrationTable'; // Импортируем компонент таблицы
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

const MidpointRectanglesIntegration: React.FC = () => {
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
    console.time('Integration Time');

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
      const x = a + (i + 0.5) * step; // Средняя точка отрезка
      const y = func(x);
      newRectanglesData.push({ x: x - step / 2, y: 0 }, { x: x - step / 2, y }, { x: x + step / 2, y }, { x: x + step / 2, y: 0 });
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

    // Результат для выбранного метода (средних прямоугольников)
        const trapezoidalResult = midpointRectangles(func, a, b, n);
        setResult(trapezoidalResult);
    
        // Вывод данных в консоль текстом
        console.log(`Число разбиений (n): ${n}`);
        console.log(`Найденное значение интеграла: ${trapezoidalResult}`);
        
        // Конец измерения времени (время автоматически выводится в консоль)
        console.timeEnd('Integration Time');
  };

  return (
    <Card title="Метод средних прямоугольников" style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
      {/* Теория */}
      <Typography style={{ textAlign: 'left', padding: '0 20px' }}>
        <Paragraph>
          Пусть требуется вычислить определённый интеграл:
          <MathJax>{`\\[ I = \\int_{a}^{b} f(x) \\, dx \\]`}</MathJax>
          Определённый интеграл представляет собой площадь под кривой, ограниченной подынтегральной функцией <MathJax inline dynamic>\( f(x) \)</MathJax>.
        </Paragraph>
        <Paragraph>
          Для вычисления определённого интеграла площадь под кривой аппроксимируется прямоугольниками. Площадь каждого прямоугольника можно определить как:
          <MathJax>{`\\[ S_i = f\\left(x_i + \\frac{h}{2}\\right) \\cdot h \\]`}</MathJax>
          где:
          <ul>
            <li>
              <span> <MathJax inline dynamic>{`\\( S_i \\)`}</MathJax> — площадь <MathJax inline dynamic>{`\\( i \\)`}</MathJax>-го прямоугольника </span>
            </li>
            <li>
              <span> <MathJax inline dynamic>{`\\( f\\left(x_i + \\frac{h}{2}\\right) \\)`}</MathJax> — значение функции в средней точке отрезка </span>
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
          <MathJax>{`\\[ I \\approx \\sum_{i=0}^{n-1} S_i = h \\left( f\\left(x_0 + \\frac{h}{2}\\right) + f\\left(x_1 + \\frac{h}{2}\\right) + \\dots + f\\left(x_{n-1} + \\frac{h}{2}\\right) \\right) \\]`}</MathJax>
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
        highlightedMethod="Средних прямоугольников"
      />
    </Card>
  );
};

export default MidpointRectanglesIntegration;