import React, { useState } from 'react';
import { Card, Button, Typography } from 'antd';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import IntegrationInputs from './IntegrationInputs';
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

Chart.register(...registerables);

const { Paragraph } = Typography;

const SimpsonIntegration: React.FC = () => {
  const [latex, setLatex] = useState<string>('sin(x)');
  const [a, setA] = useState<number>(0);
  const [b, setB] = useState<number>(10);
  const [n, setN] = useState<number>(10);
  const [result, setResult] = useState<number | null>(null);
  const [tableData, setTableData] = useState<{ method: string; approx: number; error: number; theoreticalError: number }[]>([]);
  const [exactIntegral, setExactIntegral] = useState<number | null>(null);
  const [functionData, setFunctionData] = useState<{ x: number; y: number }[]>([]);
  const [simpsonData, setSimpsonData] = useState<{ x: number; y: number }[]>([]);

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

    // Генерация данных для метода Симпсона
    const newSimpsonData = [];
    for (let i = 0; i < n; i += 2) {
      const x0 = a + i * step;
      const x1 = x0 + step;
      const x2 = x1 + step;
      const y0 = func(x0);
      const y1 = func(x1);
      const y2 = func(x2);

      for (let j = 0; j <= 10; j++) {
        const t = j / 10;
        const x = x0 * (1 - t) * (1 - t) + 2 * x1 * t * (1 - t) + x2 * t * t;
        const y = y0 * (1 - t) * (1 - t) + 2 * y1 * t * (1 - t) + y2 * t * t;
        newSimpsonData.push({ x, y });
      }
    }
    setSimpsonData(newSimpsonData);

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

    // Результат для выбранного метода (Симпсона)
    setResult(simpson(func, a, b, n));
  };

  const chartData = {
    datasets: [
      {
        label: 'Функция',
        data: functionData.map((p) => ({ x: p.x, y: p.y })),
        borderColor: 'rgba(75, 192, 192, 1)', // Цвет функции
        borderWidth: 3, // Толщина линии функции
        fill: false,
        pointRadius: 0,
      },
      {
        label: 'Параболы Симпсона',
        data: simpsonData.map((p) => ({ x: p.x, y: p.y })),
        borderColor: 'rgba(255, 99, 132, 1)', // Цвет парабол
        borderWidth: 3, // Увеличиваем толщину линий парабол
        fill: {
          target: 'origin', // Заливка до оси X (начала координат)
          above: 'rgba(255, 99, 132, 0.1)', // Цвет заливки
          
        },
        pointRadius: 0,
      },
    ],
  };

  return (
    <Card title="Метод Симпсона" style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
      {/* Теория */}
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

      {/* Точное значение интеграла */}
      {exactIntegral !== null && (
        <Typography style={{ marginTop: '20px' }}>
          <Paragraph>
            Точное значение интеграла: <MathJax inline dynamic>{`\\( I_{\\text{точное}} = ${exactIntegral.toFixed(6)} \\)`}</MathJax>
          </Paragraph>
        </Typography>
      )}

      {/* График */}
      <div style={{ height: '400px', marginTop: '20px' }}>
        <Line
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: { x: { type: 'linear' } },
          }}
        />
      </div>

      {/* Таблица с результатами */}
      <IntegrationTable
        data={tableData}
        highlightedMethod="Симпсона"
      />
    </Card>
  );
};

export default SimpsonIntegration;