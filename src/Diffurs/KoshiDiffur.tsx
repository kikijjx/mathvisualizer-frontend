import React, { useState } from 'react';
import { Card, Button, Typography } from 'antd';
import DiffurInputs from './DiffurInputs';
import DiffurChart from './DiffurChart';
import { MathJax } from 'better-react-mathjax';
import { replaceMathFunctions, koshiMethod, calculateExactSolution, isIndependentOfY } from '../mathUtils';

const { Paragraph } = Typography;

const KoshiDiffur: React.FC = () => {
  const [latex, setLatex] = useState<string>('sin(x)');
  const [x0, setX0] = useState<number>(0);
  const [y0, setY0] = useState<number>(1);
  const [xEnd, setXEnd] = useState<number>(10);
  const [h, setH] = useState<number>(0.5);
  const [koshiData, setKoshiData] = useState<{ x: number; y: number }[]>([]);
  const [exactData, setExactData] = useState<{ x: number; y: number }[]>([]);

  const solve = () => {
    console.time('Koshi Method Time');

    // Обработка введенной функции
    const processedLatex = replaceMathFunctions(latex);
    const func = (x: number, y: number) => eval(processedLatex.replace(/x/g, `(${x})`).replace(/y/g, `(${y})`));

    // Метод Эйлера-Коши
    const koshiResult = koshiMethod(func, x0, y0, xEnd, h);
    setKoshiData(koshiResult);

    // Проверка зависимости от y и вычисление точного решения
    if (isIndependentOfY(func, x0, y0)) {
      console.log('Уравнение не зависит от y, вычисляем точное решение.');
      const numPoints = 500;
      const exactResult = [];
      for (let i = 0; i <= numPoints; i++) {
        const x = x0 + (i / numPoints) * (xEnd - x0);
        const y = calculateExactSolution(func, x0, y0, x);
        exactResult.push({ x, y });
      }
      setExactData(exactResult);
    } else {
      console.log('Точное решение неизвестно.');
      setExactData([]);
    }

    console.log(`Число шагов: ${(xEnd - x0) / h}`);
    console.timeEnd('Koshi Method Time');
  };

  return (
    <Card title="Метод Эйлера-Коши" style={{ width: '80%', margin: '0 auto' }}>
      {/* Теория */}
      <Typography style={{ textAlign: 'left', padding: '0 20px' }}>
        <Paragraph>
          Для дифференциального уравнения первого порядка:
          <MathJax>{`\\[ \\frac{dy}{dx} = f(x, y) \\]`}</MathJax>
          с начальными условиями <MathJax inline dynamic>{`\\( y(x_0) = y_0 \\)`}</MathJax>, метод Эйлера-Коши (улучшенный метод Эйлера) аппроксимирует решение, используя формулу:
          <MathJax>{`\\[ y_{n+1} = y_n + h \\cdot f\\left(x_n + \\frac{h}{2}, y_n + \\frac{h}{2} \\cdot f(x_n, y_n)\\right) \\]`}</MathJax>
          где <MathJax inline dynamic>{`\\( h \\)`}</MathJax> — шаг, <MathJax inline dynamic>{`\\( x_{n+1} = x_n + h \\)`}</MathJax>.
        </Paragraph>
        <Paragraph>
          Если уравнение имеет вид <MathJax inline dynamic>{`\\( y' = f(x) \\)`}</MathJax> (не зависит от <MathJax inline dynamic>{`\\( y \\)`}</MathJax>), точное решение можно найти как:
          <MathJax>{`\\[ y(x) = y_0 + \\int_{x_0}^{x} f(t) \\, dt \\]`}</MathJax>
        </Paragraph>
        <Paragraph>
          Метод Эйлера-Коши имеет погрешность <MathJax inline dynamic>{`\\( O(h^2) \\)`}</MathJax>, что делает его точнее простого метода Эйлера.
        </Paragraph>
      </Typography>

      {/* Ввод данных */}
      <DiffurInputs
        latex={latex}
        setLatex={setLatex}
        x0={x0}
        setX0={setX0}
        y0={y0}
        setY0={setY0}
        xEnd={xEnd}
        setXEnd={setXEnd}
        h={h}
        setH={setH}
      />

      {/* Кнопка для решения */}
      <Button onClick={solve} style={{ marginTop: '10px' }}>
        Решить
      </Button>

      {/* График */}
      <DiffurChart eulerData={koshiData} exactData={exactData} />
    </Card>
  );
};

export default KoshiDiffur;