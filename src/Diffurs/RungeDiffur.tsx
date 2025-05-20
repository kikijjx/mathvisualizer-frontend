import React, { useState } from 'react';
import { Card, Button, Typography, Collapse, message } from 'antd';
import DiffurInputs from './DiffurInputs';
import DiffurChart from './DiffurChart';
import DiffurTable from './DiffurTable';
import { MathJax } from 'better-react-mathjax';
import { replaceMathFunctions, eulerMethod, koshiMethod, koshiHalfMethod, rungeKutta4Method, calculateExactSolution, isIndependentOfY } from '../mathUtils';

const { Paragraph } = Typography;
const { Panel } = Collapse;

const RungeDiffur: React.FC = () => {
  const [latex, setLatex] = useState<string>('sin(x)');
  const [x0, setX0] = useState<number>(0);
  const [y0, setY0] = useState<number>(1);
  const [b, setB] = useState<number>(10);
  const [n, setN] = useState<number>(20);
  const [rungeKuttaData, setRungeKuttaData] = useState<{ x: number; y: number }[]>([]);
  const [eulerData, setEulerData] = useState<{ x: number; y: number }[]>([]);
  const [koshiData, setKoshiData] = useState<{ x: number; y: number }[]>([]);
  const [koshiHalfData, setKoshiHalfData] = useState<{ x: number; y: number }[]>([]);
  const [exactData, setExactData] = useState<{ x: number; y: number }[]>([]);

  const solve = () => {
    console.time('Runge-Kutta 4 Method Time');

    if (b <= x0) {
      message.error('Ошибка: b должно быть больше x0');
      return;
    }
    if (n <= 0) {
      message.error('Ошибка: n должно быть положительным');
      return;
    }

    try {
      const h = (b - x0) / n;
      const processedLatex = replaceMathFunctions(latex);
      const func = (x: number, y: number) => {
        const result = eval(processedLatex.replace(/x/g, `(${x})`).replace(/y/g, `(${y})`));
        if (isNaN(result) || !isFinite(result)) throw new Error('Недопустимое значение функции');
        return result;
      };

      // Вычисление результатов для всех методов
      const rungeKuttaResult = rungeKutta4Method(func, x0, y0, b, h);
      const eulerResult = eulerMethod(func, x0, y0, b, h);
      const koshiResult = koshiMethod(func, x0, y0, b, h);            
      const koshiHalfResult = koshiHalfMethod(func, x0, y0, b, h);

      setRungeKuttaData(rungeKuttaResult);
      setEulerData(eulerResult);
      setKoshiData(koshiResult);
      setKoshiHalfData(koshiHalfResult);
      // Вычисление точного решения, если уравнение не зависит от y
      if (isIndependentOfY(func, x0, y0)) {
        console.log('Уравнение не зависит от y, вычисляем точное решение.');
        const numPoints = 200;
        const exactResult = [];
        for (let i = 0; i <= numPoints; i++) {
          const x = x0 + (i / numPoints) * (b - x0);
          const y = calculateExactSolution(func, x0, y0, x);
          exactResult.push({ x, y });
        }
        setExactData(exactResult);
      } else {
        console.log('Точное решение неизвестно.');
        setExactData([]);
      }

      console.log(`Число разбиений: ${n}, Шаг h: ${h}`);
    } catch (error) {
      console.error('Ошибка при вычислении:', error);
      message.error('Ошибка при решении уравнения. Проверьте введённую функцию.');
      setRungeKuttaData([]);
      setEulerData([]);
      setKoshiData([]);
      setExactData([]);
    }

    console.timeEnd('Runge-Kutta 4 Method Time');
  };

  return (
    <>
      <style>
        {`
          .integration-container {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            margin-bottom: 20px;
          }
          .inputs-block {
            flex: 1;
            min-width: 300px;
            max-width: 400px;
          }
          .chart-block {
            flex: 2;
            min-width: 300px;
            max-width: 800px;
          }
          @media (max-width: 768px) {
            .integration-container {
              flex-direction: column;
            }
            .inputs-block, .chart-block {
              max-width: 100%;
            }
          }
        `}
      </style>
      <Card
        title="Метод Рунге-Кутта 4-го порядка"
        style={{
          width: '100%',
          maxWidth: 1200,
          margin: '20px auto',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          borderRadius: '8px',
        }}
      >
        <Collapse defaultActiveKey={[]} style={{ marginBottom: '20px' }}>
          <Panel header="Теория" key="1">
            <Typography style={{ textAlign: 'left', padding: '0 20px' }}>
              <Paragraph>
                Для дифференциального уравнения первого порядка:
                <MathJax>{`\\[ \\frac{dy}{dx} = f(x, y) \\]`}</MathJax>
                с начальными условиями <MathJax inline dynamic>{`\\( y(x_0) = y_0 \\)`}</MathJax>, метод Рунге-Кутта 4-го порядка аппроксимирует решение, используя формулу:
                <MathJax>{`\\[ k_1 = f(x_n, y_n), \\]`}</MathJax>
                <MathJax>{`\\[ k_2 = f\\left(x_n + \\frac{h}{2}, y_n + \\frac{h}{2} \\cdot k_1\\right), \\]`}</MathJax>
                <MathJax>{`\\[ k_3 = f\\left(x_n + \\frac{h}{2}, y_n + \\frac{h}{2} \\cdot k_2\\right), \\]`}</MathJax>
                <MathJax>{`\\[ k_4 = f(x_n + h, y_n + h \\cdot k_3), \\]`}</MathJax>
                <MathJax>{`\\[ y_{n+1} = y_n + \\frac{h}{6} \\cdot (k_1 + 2k_2 + 2k_3 + k_4) \\]`}</MathJax>
                где <MathJax inline dynamic>{`\\( h \\)`}</MathJax> — шаг, <MathJax inline dynamic>{`\\( x_{n+1} = x_n + h \\)`}</MathJax>.
              </Paragraph>
              <Paragraph>
                Если уравнение имеет вид <MathJax inline dynamic>{`\\( y' = f(x) \\)`}</MathJax> (не зависит от <MathJax inline dynamic>{`\\( y \\)`}</MathJax>), точное решение можно найти как:
                <MathJax>{`\\[ y(x) = y_0 + \\int_{x_0}^{x} f(t) \\, dt \\]`}</MathJax>
              </Paragraph>
              <Paragraph>
                Метод Рунге-Кутты 4-го порядка имеет погрешность <MathJax inline dynamic>{`\\( O(h^4) \\)`}</MathJax>, что делает его одним из самых точных одностадийных методов.
              </Paragraph>
            </Typography>
          </Panel>
        </Collapse>

        <div className="integration-container">
          <div className="inputs-block">
            <DiffurInputs
              latex={latex}
              setLatex={setLatex}
              x0={x0}
              setX0={setX0}
              y0={y0}
              setY0={setY0}
              b={b}
              setB={setB}
              n={n}
              setN={setN}
            />
            {b <= x0 && (
              <Typography.Text type="danger" style={{ display: 'block', marginTop: '8px', fontSize: '12px' }}>
                Ошибка: b должно быть больше x₀.
              </Typography.Text>
            )}
            <Button
              onClick={solve}
              type="primary"
              style={{
                marginTop: '16px',
                width: '100%',
                padding: '8px 0',
                borderRadius: '6px',
              }}
            >
              Решить
            </Button>
          </div>
          <div className="chart-block">
            <DiffurChart eulerData={rungeKuttaData} exactData={exactData} methodLabel='Метод Рунге-Кутта'/>
          </div>
        </div>

        {rungeKuttaData.length > 0 && (
          <DiffurTable
            eulerData={eulerData}
            koshiData={koshiData}
            koshiHalfData={koshiHalfData}
            rungeKuttaData={rungeKuttaData}
            exactData={exactData}
            step={(b - x0) / n}
            showExact={exactData.length > 0}
            highlightedMethod="Рунге-Кутта"

          />
        )}
      </Card>
    </>
  );
};

export default RungeDiffur;