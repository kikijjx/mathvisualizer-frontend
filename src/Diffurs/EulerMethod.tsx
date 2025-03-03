import React, { useState } from 'react';
import { Card, Button, Typography } from 'antd';
import DiffurInputs from './DiffurInputs';
import DiffurChart from './DiffurChart';
import { replaceMathFunctions } from '../mathUtils';
import { MathJax } from 'better-react-mathjax';

const { Paragraph } = Typography;

const EulerMethod: React.FC = () => {
  const [equation, setEquation] = useState<string>('-2*y');
  const [y0, setY0] = useState<number>(1);
  const [t0, setT0] = useState<number>(0);
  const [tEnd, setTEnd] = useState<number>(5);
  const [step, setStep] = useState<number>(0.1);
  const [t, setT] = useState<number[]>([]);
  const [y, setY] = useState<number[]>([]);

  const solve = () => {
    const processedEquation = replaceMathFunctions(equation);

    // Функция, которая вычисляет значение производной
    const func = (y: number, t: number) => {
      // Подставляем значения y и t в уравнение
      const expression = processedEquation
        .replace(/y/g, y.toString())
        .replace(/t/g, t.toString());
      return eval(expression); // Вычисляем выражение
    };

    const tValues = [];
    const yValues = [];
    let currentY = y0;
    let currentT = t0;

    while (currentT <= tEnd) {
      tValues.push(currentT);
      yValues.push(currentY);

      // Вычисляем следующее значение y по методу Эйлера
      currentY = currentY + func(currentY, currentT) * step;
      currentT += step;
    }

    setT(tValues);
    setY(yValues);
  };

  return (
    <Card title="Метод Эйлера" style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
      {/* Теория */}
      <Typography style={{ textAlign: 'left', padding: '0 20px' }}>
        <Paragraph>
          Метод Эйлера — это численный метод решения обыкновенных дифференциальных уравнений. Он основан на аппроксимации решения с помощью линейной интерполяции.
        </Paragraph>
        <Paragraph>
          Формула метода Эйлера:
          <MathJax>\\[ y_n+1 = y_n + h \\cdot f(y_n, t_n) \\]</MathJax>
          где:
          <ul>
            <li>
              <span> <MathJax inline dynamic>\\( y_n+1 \\)</MathJax> — следующее значение функции </span>
            </li>
            <li>
              <span> <MathJax inline dynamic>\\( y_n \\)</MathJax> — текущее значение функции </span>
            </li>
            <li>
              <span> <MathJax inline dynamic>\\( h \\)</MathJax> — шаг </span>
            </li>
            <li>
              <span> <MathJax inline dynamic>\\( f(y_n, t_n) \\)</MathJax> — значение производной в точке <MathJax inline dynamic>\\( (y_n, t_n) \\)</MathJax> </span>
            </li>
          </ul>
        </Paragraph>
      </Typography>

      {/* Ввод данных */}
      <DiffurInputs
        equation={equation}
        setEquation={setEquation}
        y0={y0}
        setY0={setY0}
        t0={t0}
        setT0={setT0}
        tEnd={tEnd}
        setTEnd={setTEnd}
        step={step}
        setStep={setStep}
      />

      {/* Кнопка для решения */}
      <Button onClick={solve} style={{ marginTop: '10px' }}>
        Решить
      </Button>

      {/* График решения */}
      {t.length > 0 && y.length > 0 && (
        <DiffurChart t={t} y={y} />
      )}
    </Card>
  );
};

export default EulerMethod;