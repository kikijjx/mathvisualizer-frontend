import React, { useState } from 'react';
import { Card, Button, Typography, Collapse, message } from 'antd';
import IntegrationInputs from './IntegrationInputs';
import IntegrationChart from './IntegrationChart';
import IntegrationTable from './IntegrationTable';
import { replaceMathFunctions, calculateExactIntegral, calculateNForPrecision } from '../mathUtils';
import { MathJax } from 'better-react-mathjax';
import {
  leftRectangles,
  rightRectangles,
  midpointRectangles,
  trapezoidal,
  simpson,
  calculateTheoreticalError,
} from '../mathUtils';

const { Paragraph } = Typography;
const { Panel } = Collapse;

const MidpointRectanglesIntegration: React.FC = () => {
  const [latex, setLatex] = useState<string>('sin(x)');
  const [a, setA] = useState<number>(0);
  const [b, setB] = useState<number>(10);
  const [n, setN] = useState<number>(10);
  const [precision, setPrecision] = useState<number>(0.001);
  const [mode, setMode] = useState<'n' | 'precision'>('n');
  const [result, setResult] = useState<number | null>(null);
  const [functionData, setFunctionData] = useState<{ x: number; y: number }[]>([]);
  const [rectanglesData, setRectanglesData] = useState<{ x: number; y: number }[]>([]);
 const [tableData, setTableData] = useState<
  { method: string; approx: number; rungeError: number; theoreticalError: number; n?: number }[]
>([]);
  const [exactIntegral, setExactIntegral] = useState<number | null>(null);

  const integrate = () => {
    console.time('Integration Time');

    // Проверка входных данных
    if (a >= b) {
      message.error('Нижний предел a должен быть меньше верхнего предела b');
      return;
    }
    if (mode === 'precision' && precision <= 0) {
      message.error('Точность должна быть положительным числом');
      return;
    }
    if (mode === 'n' && n <= 0) {
      message.error('Число разбиений n должно быть положительным');
      return;
    }

    try {
      const processedLatex = replaceMathFunctions(latex);
      const func = (x: number) => {
        const result = eval(processedLatex.replace(/x/g, `(${x})`));
        if (isNaN(result) || !isFinite(result)) throw new Error('Недопустимое значение функции');
        return result;
      };

      const exact = calculateExactIntegral(func, a, b);
      setExactIntegral(exact);

      let currentN = n;
      if (mode === 'precision') {
        currentN = calculateNForPrecision(func, a, b, precision, 'Средних прямоугольников');
        setN(currentN);
      }
      const step = (b - a) / currentN;

      // Генерация данных для графика функции
      const numPoints = 500;
      const newFunctionData: { x: number; y: number }[] = [];
      for (let i = 0; i <= numPoints; i++) {
        const x = a + (i / numPoints) * (b - a);
        try {
          const y = func(x);
          newFunctionData.push({ x, y });
        } catch {
          continue; // Пропускаем точки с ошибками
        }
      }
      setFunctionData(newFunctionData);

      // Генерация данных для прямоугольников
      const newRectanglesData: { x: number; y: number }[] = [];
      for (let i = 0; i < currentN; i++) {
        const xMid = a + (i + 0.5) * step;
        try {
          const y = func(xMid);
          newRectanglesData.push(
            { x: xMid - step / 2, y: 0 },
            { x: xMid - step / 2, y },
            { x: xMid + step / 2, y },
            { x: xMid + step / 2, y: 0 }
          );
        } catch {
          continue;
        }
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
  const usedN =
    mode === 'precision'
      ? calculateNForPrecision(func, a, b, precision, method.name)
      : currentN;
  const finalN = method.name === 'Симпсона' ? (usedN % 2 === 0 ? usedN : usedN + 1) : usedN;
  let approx: number;
  let rungeError: number;
  try {
    approx = method.func(func, a, b, finalN);
    const I_2n = method.func(func, a, b, 2 * finalN);
    rungeError = Math.abs(approx - I_2n);
  } catch {
    approx = NaN;
    rungeError = NaN;
  }
  const theoreticalError = calculateTheoreticalError(method.name, func, a, b, finalN);
  return {
    method: method.name,
    approx,
    rungeError,
    theoreticalError,
    n: mode === 'precision' ? finalN : undefined,
  };
});

      setTableData(newTableData);

      // Результат для метода средних прямоугольников
      const midpointRectanglesResult = midpointRectangles(func, a, b, currentN);
      setResult(midpointRectanglesResult);

      console.log(`Число разбиений (n): ${currentN}`);
      console.log(`Найденное значение интеграла: ${midpointRectanglesResult}`);
    } catch (error) {
      console.error('Ошибка при вычислении:', error);
      message.error('Ошибка при вычислении интеграла. Проверьте введённую функцию.');
      setResult(null);
      setTableData([]);
      setFunctionData([]);
      setRectanglesData([]);
    }

    console.timeEnd('Integration Time');
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
        title="Метод средних прямоугольников"
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
                Метод средних прямоугольников используется для приближённого вычисления определённого интеграла:
                <MathJax>{`\\[ I = \\int_{a}^{b} f(x) \\, dx \\]`}</MathJax>
                где <MathJax inline dynamic>{`\\( f(x) \\)`}</MathJax> — подынтегральная функция, непрерывная на отрезке{' '}
                <MathJax inline dynamic>{`\\( [a, b] \\)`}</MathJax>. Интеграл представляет площадь криволинейной трапеции под
                графиком функции.
              </Paragraph>
              <Paragraph>
                Интервал <MathJax inline dynamic>{`\\( [a, b] \\)`}</MathJax> разбивается на{' '}
                <MathJax inline dynamic>{`\\( n \\)`}</MathJax> равных подынтервалов с шагом{' '}
                <MathJax inline dynamic>{`\\( h = \\frac{b - a}{n} \\)`}</MathJax>. Узлы разбиения:{' '}
                <MathJax inline dynamic>{`\\( a_k = a + k h \\)`}</MathJax>, где{' '}
                <MathJax inline dynamic>{`\\( k = 0, 1, \\dots, n \\)`}</MathJax>. На каждом подынтервале{' '}
                <MathJax inline dynamic>{`\\( [a_{k-1}, a_k] \\)`}</MathJax> функция{' '}
                <MathJax inline dynamic>{`\\( f(x) \\)`}</MathJax> аппроксимируется полиномом Лагранжа нулевой степени, то
                есть значением{' '}
                <MathJax inline dynamic>{`\\( f\\left( \\frac{a_{k-1} + a_k}{2} \\right) \\)`}</MathJax>. Геометрически это
                прямоугольник с основанием <MathJax inline dynamic>{`\\( h \\)`}</MathJax> и высотой{' '}
                <MathJax inline dynamic>{`\\( f\\left( a_{k-1} + \\frac{h}{2} \\right) \\)`}</MathJax>, касающийся графика в
                середине подынтервала.
              </Paragraph>
              <Paragraph>
                Формула средних прямоугольников:
                <MathJax>{`\\[ I \\approx h \\sum_{k=0}^{n-1} f\\left( \\frac{a_{k-1} + a_k}{2} \\right) = h \\sum_{k=0}^{n-1} f\\left( a_{k-1} + \\frac{h}{2} \\right) \\]`}</MathJax>
                Это сумма площадей прямоугольников, составляющих ступенчатую фигуру, касающуюся графика функции в средних
                точках подынтервалов.
              </Paragraph>
              <Paragraph>
                Погрешность на одном подынтервале:
                <MathJax>{`\\[ \\left| \\int_{a_{k-1}}^{a_k} f(x) \\, dx - h f\\left( \\frac{a_{k-1} + a_k}{2} \\right) \\right| \\leq \\frac{M_2 h^3}{24} \\]`}</MathJax>
                где <MathJax inline dynamic>{`\\( M_2 = \\max_{[a, b]} |f''(x)| \\)`}</MathJax>. Суммарная погрешность:
                <MathJax>{`\\[ R \\leq \\frac{M_2 (b - a) h^2}{24} = O(h^2) \\]`}</MathJax>
                Погрешность метода средних прямоугольников имеет порядок \( h^2 \), что делает его более точным, чем методы
                левых и правых прямоугольников, благодаря центральному положению точки аппроксимации.
              </Paragraph>
            </Typography>
          </Panel>
        </Collapse>

        <div className="integration-container">
          <div className="inputs-block">
            <IntegrationInputs
              latex={latex}
              setLatex={setLatex}
              a={a}
              setA={setA}
              b={b}
              setB={setB}
              n={n}
              setN={setN}
              precision={precision}
              setPrecision={setPrecision}
              mode={mode}
              setMode={setMode}
            />
            <Button
              onClick={integrate}
              type="primary"
              style={{
                marginTop: '16px',
                width: '100%',
                padding: '8px 0',
                borderRadius: '6px',
              }}
            >
              Интегрировать
            </Button>
            {exactIntegral !== null && result !== null && (
              <Typography style={{ marginTop: '16px', textAlign: 'center' }}>
                <Paragraph>
                  <MathJax inline dynamic>{`\\( I_{\\text{точное}} = ${exactIntegral.toFixed(6)} \\)`}</MathJax>
                </Paragraph>
                <Paragraph>
                  <MathJax inline dynamic>{`\\( I_{\\text{приближённое}} = ${result.toFixed(6)} \\)`}</MathJax>
                </Paragraph>
              </Typography>
            )}
          </div>
          <div className="chart-block">
            <IntegrationChart
              functionData={functionData}
              segmentData={rectanglesData}
              method="средних прямоугольников"
            />
          </div>
        </div>

        <IntegrationTable
          data={tableData}
          highlightedMethod="Средних прямоугольников"
          showN={mode === 'precision'}
        />
      </Card>
    </>
  );
};

export default MidpointRectanglesIntegration;
