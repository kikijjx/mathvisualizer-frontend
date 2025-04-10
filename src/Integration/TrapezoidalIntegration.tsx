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

const TrapezoidalIntegration: React.FC = () => {
  const [latex, setLatex] = useState<string>('sin(x)');
  const [a, setA] = useState<number>(0);
  const [b, setB] = useState<number>(10);
  const [n, setN] = useState<number>(12);
  const [result, setResult] = useState<number | null>(null);
  const [functionData, setFunctionData] = useState<{ x: number; y: number }[]>([]);
  const [trapezoidData, setTrapezoidData] = useState<{ x: number; y: number }[]>([]);
  const [tableData, setTableData] = useState<{ method: string; approx: number; error: number; theoreticalError: number }[]>([]);
  const [exactIntegral, setExactIntegral] = useState<number | null>(null);

  const integrate = () => {
    // Начало измерения времени
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

    // Генерация данных для трапеций
    const newTrapezoidData = [];
    for (let i = 0; i <= n; i++) {
      const x = a + i * step;
      const y = func(x);
      newTrapezoidData.push({ x, y });
    }
    setTrapezoidData(newTrapezoidData);

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

    // Результат для выбранного метода (трапеций)
    const trapezoidalResult = trapezoidal(func, a, b, n);
    setResult(trapezoidalResult);

    // Вывод данных в консоль текстом
    console.log(`Число разбиений (n): ${n}`);
    console.log(`Найденное значение интеграла: ${trapezoidalResult}`);
    
    // Конец измерения времени (время автоматически выводится в консоль)
    console.timeEnd('Integration Time');
  };

  return (
    <Card title="Метод трапеций" style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
      {/* Теория */}
      <Typography style={{ textAlign: 'left', padding: '0 20px' }}>
        <Paragraph>
          Пусть требуется вычислить определённый интеграл:
          <MathJax>{`\\[ I = \\int_{a}^{b} f(x) \\, dx \\]`}</MathJax>
          Определённый интеграл представляет собой площадь под кривой, ограниченной подынтегральной функцией <MathJax inline dynamic>\( f(x) \)</MathJax>.
        </Paragraph>
        <Paragraph>
          Для вычисления определённого интеграла площадь под кривой аппроксимируется трапециями. Площадь каждой трапеции можно определить как:
          <MathJax>{`\\[ S_i = \\frac{f(x_i) + f(x_{i+1})}{2} \\cdot h \\]`}</MathJax>
          где:
          <ul>
            <li>
              <span> <MathJax inline dynamic>{`\\( S_i \\)`}</MathJax> — площадь <MathJax inline dynamic>{`\\( i \\)`}</MathJax>-й трапеции </span>
            </li>
            <li>
              <span> <MathJax inline dynamic>{`\\( f(x_i) \\)`}</MathJax> и <MathJax inline dynamic>{`\\( f(x_{i+1}) \\)`}</MathJax> — значения функции на концах отрезка </span>
            </li>
            <li>
              <span> <MathJax inline dynamic>{`\\( h = \\frac{b - a}{n} \\)`}</MathJax> — шаг разбиения (высота трапеции) </span>
            </li>
            <li>
              <span> <MathJax inline dynamic>{`\\( n \\)`}</MathJax> — количество разбиений </span>
            </li>
          </ul>
        </Paragraph>
        <Paragraph>
          Общая площадь под кривой аппроксимируется суммой площадей всех трапеций:
          <MathJax>{`\\[ I \\approx \\sum_{i=0}^{n-1} S_i = \\frac{h}{2} \\left( f(x_0) + 2f(x_1) + 2f(x_2) + \\dots + 2f(x_{n-1}) + f(x_n) \\right) \\]`}</MathJax>
        </Paragraph>
        <Paragraph>
          <span>Высота трапеций <MathJax inline dynamic>\( h \)</MathJax> выбирается достаточно малой, чтобы на каждом отрезке <MathJax inline dynamic>\( [x_i, x_i+1] \)</MathJax> функцию <MathJax inline dynamic>\( f(x) \)</MathJax> можно было заменить линейной.</span>
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
        segmentData={trapezoidData}
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
        highlightedMethod="Трапеций"
      />
    </Card>
  );
};

export default TrapezoidalIntegration;