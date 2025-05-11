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

const { Paragraph, Text } = Typography;
const { Panel } = Collapse;

const SimpsonIntegration: React.FC = () => {
  const [latex, setLatex] = useState<string>('sin(x)');
  const [a, setA] = useState<number>(0);
  const [b, setB] = useState<number>(10);
  const [n, setN] = useState<number>(12);
  const [precision, setPrecision] = useState<number>(0.001);
  const [mode, setMode] = useState<'n' | 'precision'>('n');
  const [result, setResult] = useState<number | null>(null);
  const [functionData, setFunctionData] = useState<{ x: number; y: number }[]>([]);
  const [parabolaData, setParabolaData] = useState<{ x: number; y: number }[]>([]);
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
        currentN = calculateNForPrecision(func, a, b, precision, 'Симпсона');
        currentN = currentN % 2 === 0 ? currentN : currentN + 1;
        setN(currentN);
      } else {
        currentN = n % 2 === 0 ? n : n + 1;
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

      // Генерация данных для парабол
      const newParabolaData: { x: number; y: number }[] = [];
      const pointsPerParabola = 20;
      for (let i = 0; i < currentN; i += 2) {
        const x0 = a + i * step;
        const x1 = a + (i + 1) * step;
        const x2 = Math.min(a + (i + 2) * step, b);
        try {
          const y0 = func(x0);
          const y1 = func(x1);
          const y2 = func(x2);

          // Вычисление коэффициентов параболы: y = a*x^2 + b*x + c
          const a_parabola =
            ((y2 - y1) / (x2 - x1) - (y1 - y0) / (x1 - x0)) / (x2 - x0);
          const b_parabola = (y1 - y0) / (x1 - x0) - a_parabola * (x1 + x0);
          const c_parabola = y0 - a_parabola * x0 * x0 - b_parabola * x0;

          for (let j = 0; j <= pointsPerParabola; j++) {
            const x = x0 + (j / pointsPerParabola) * 2 * step;
            if (x <= b) {
              const y = a_parabola * x * x + b_parabola * x + c_parabola;
              newParabolaData.push({ x, y });
            }
          }
        } catch {
          continue;
        }
      }
      setParabolaData(newParabolaData);

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

      // Результат для метода Симпсона
      const simpsonResult = simpson(func, a, b, currentN);
      setResult(simpsonResult);

      console.log(`Число разбиений (n): ${currentN}`);
      console.log(`Найденное значение интеграла: ${simpsonResult}`);
    } catch (error) {
      console.error('Ошибка при вычислении:', error);
      message.error('Ошибка при вычислении интеграла. Проверьте введённую функцию.');
      setResult(null);
      setTableData([]);
      setFunctionData([]);
      setParabolaData([]);
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
        title="Метод Симпсона"
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
        Метод Симпсона предназначен для приближённого вычисления определённого интеграла:
        <MathJax>{`\\[ I = \\int_{a}^{b} f(x) \\, dx \\]`}</MathJax>
        где <MathJax inline dynamic>{`\\( f(x) \\)`}</MathJax> — подынтегральная функция, непрерывная на отрезке <MathJax inline dynamic>{`\\( [a, b] \\)`}</MathJax>. Интеграл представляет площадь криволинейной трапеции под графиком функции.
      </Paragraph>
      <Paragraph>
        Интервал <MathJax inline dynamic>{`\\( [a, b] \\)`}</MathJax> разбивается на <MathJax inline dynamic>{`\\( n \\)`}</MathJax> равных подынтервалов, где <MathJax inline dynamic>{`\\( n = 2s \\)`}</MathJax> — чётное число, с шагом <MathJax inline dynamic>{`\\( h = \\frac{b - a}{n} \\)`}</MathJax>. Узлы: <MathJax inline dynamic>{`\\( a_k = a + k h \\)`}</MathJax>, где <MathJax inline dynamic>{`\\( k = 0, 1, \\dots, n \\)`}</MathJax>. На каждом двойном подынтервале <MathJax inline dynamic>{`\\( [a_{2k-2}, a_{2k}] \\)`}</MathJax> функция аппроксимируется полиномом Лагранжа второй степени (параболой) по трём узлам: <MathJax inline dynamic>{`\\( a_{2k-2}, a_{2k-1}, a_{2k} \\)`}</MathJax>. Формула для одного двойного подынтервала:
        <MathJax>{`\\[ \\int_{a_{2k-2}}^{a_{2k}} f(x) \\, dx \\approx \\frac{h}{3} \\left( f(a_{2k-2}) + 4 f(a_{2k-1}) + f(a_{2k}) \\right) \\]`}</MathJax>
      </Paragraph>
      <Paragraph>
        Суммируя по всем <MathJax inline dynamic>{`\\( s = n/2 \\)`}</MathJax> двойным подынтервалам, получаем формулу Симпсона:
        <MathJax>{`\\[ I \\approx \\frac{h}{3} \\left[ f(a_0) + 4 \\sum_{k=1}^{n/2} f(a_{2k-1}) + 2 \\sum_{k=1}^{n/2-1} f(a_{2k}) + f(a_n) \\right] \\]`}</MathJax>
        Формула использует параболическую аппроксимацию, что повышает точность для гладких функций.
      </Paragraph>
      <Paragraph>
        Погрешность на одном двойном подынтервале:
        <MathJax>{`\\[ \\left| \\int_{a_{2k-2}}^{a_{2k}} f(x) \\, dx - \\frac{h}{3} (f(a_{2k-2}) + 4 f(a_{2k-1}) + f(a_{2k})) \\right| \\leq \\frac{M_3 h^4}{96} \\]`}</MathJax>
        где <MathJax inline dynamic>{`\\( M_3 = \\max_{[a, b]} |f'''(x)| \\)`}</MathJax>. Суммарная погрешность:
        <MathJax>{`\\[ R_2 \\leq \\frac{M_3 h^3 (b - a)}{192} = O(h^3) \\]`}</MathJax>
        Погрешность порядка <MathJax inline dynamic>{`\\( h^3 \\)`}</MathJax> делает метод Симпсона значительно точнее методов прямоугольников и трапеций, но требует чётного числа подынтервалов.
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
            {mode === 'n' && n % 2 !== 0 && (
              <Text type="danger" style={{ display: 'block', marginTop: '8px', fontSize: '12px' }}>
                Метод Симпсона требует чётное число разбиений. При расчёте будет использоваться n = {n + 1}.
              </Text>
            )}
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
              segmentData={parabolaData}
              method="Симпсона"
            />
          </div>
        </div>

        <IntegrationTable
          data={tableData}
          highlightedMethod="Симпсона"
          showN={mode === 'precision'}
        />
      </Card>
    </>
  );
};

export default SimpsonIntegration;