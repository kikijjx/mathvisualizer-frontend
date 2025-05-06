import React, { useState } from 'react';
import { Card, Button, Typography, Collapse } from 'antd';
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
  const [tableData, setTableData] = useState<{ method: string; approx: number; error: number; theoreticalError: number; n?: number }[]>([]);
  const [exactIntegral, setExactIntegral] = useState<number | null>(null);

  const integrate = () => {
    console.time('Integration Time');

    const processedLatex = replaceMathFunctions(latex);
    const func = (x: number) => eval(processedLatex.replace(/x/g, `(${x})`));
    const exact = calculateExactIntegral(a, b);
    setExactIntegral(exact);

    let currentN = n;
    if (mode === 'precision') {
      currentN = calculateNForPrecision(func, a, b, precision, 'Средних прямоугольников');
      setN(currentN);
    }
    const step = (b - a) / currentN;

    const numPoints = 500;
    const newFunctionData = [];
    for (let i = 0; i <= numPoints; i++) {
      const x = a + (i / numPoints) * (b - a);
      const y = func(x);
      newFunctionData.push({ x, y });
    }
    setFunctionData(newFunctionData);

    const newRectanglesData = [];
    for (let i = 0; i < currentN; i++) {
      const x = a + (i + 0.5) * step;
      const y = func(x);
      newRectanglesData.push({ x: x - step / 2, y: 0 }, { x: x - step / 2, y }, { x: x + step / 2, y }, { x: x + step / 2, y: 0 });
    }
    setRectanglesData(newRectanglesData);

    const methods = [
      { name: 'Левых прямоугольников', func: leftRectangles },
      { name: 'Правых прямоугольников', func: rightRectangles },
      { name: 'Средних прямоугольников', func: midpointRectangles },
      { name: 'Трапеций', func: trapezoidal },
      { name: 'Симпсона', func: simpson },
    ];

    const newTableData = methods.map((method) => {
      const usedN = mode === 'precision' ? calculateNForPrecision(func, a, b, precision, method.name) : currentN;
      const approx = method.func(func, a, b, usedN);
      const error = Math.abs(exact - approx);
      const theoreticalError = calculateTheoreticalError(method.name, func, a, b, usedN);
      return {
        method: method.name,
        approx,
        error,
        theoreticalError,
        n: mode === 'precision' ? usedN : undefined,
      };
    });

    setTableData(newTableData);

    const midpointRectanglesResult = midpointRectangles(func, a, b, currentN);
    setResult(midpointRectanglesResult);

    console.log(`Число разбиений (n): ${currentN}`);
    console.log(`Найденное значение интеграла: ${midpointRectanglesResult}`);
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
          borderRadius: '8px'
        }}
      >
        <Collapse defaultActiveKey={[]} style={{ marginBottom: '20px' }}>
          <Panel header="Теория" key="1">
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
                  <li><MathJax inline dynamic>{`\\( S_i \\)`}</MathJax> — площадь <MathJax inline dynamic>{`\\( i \\)`}</MathJax>-го прямоугольника</li>
                  <li><MathJax inline dynamic>{`\\( f\\left(x_i + \\frac{h}{2}\\right) \\)`}</MathJax> — значение функции в средней точке отрезка</li>
                  <li><MathJax inline dynamic>{`\\( h = \\frac{b - a}{n} \\)`}</MathJax> — шаг разбиения (ширина прямоугольника)</li>
                  <li><MathJax inline dynamic>{`\\( n \\)`}</MathJax> — количество разбиений</li>
                </ul>
              </Paragraph>
              <Paragraph>
                Общая площадь под кривой аппроксимируется суммой площадей всех прямоугольников:
                <MathJax>{`\\[ I \\approx \\sum_{i=0}^{n-1} S_i = h \\left( f\\left(x_0 + \\frac{h}{2}\\right) + f\\left(x_1 + \\frac{h}{2}\\right) + \\dots + f\\left(x_{n-1} + \\frac{h}{2}\\right) \\right) \\]`}</MathJax>
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
                borderRadius: '6px'
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