import React, { useCallback, memo } from 'react';
import { Input, Typography, Radio } from 'antd';
import { MathJax } from 'better-react-mathjax';
import { debounce } from 'lodash';

const { Text } = Typography;

interface IntegrationInputsProps {
  latex: string;
  setLatex: (value: string) => void;
  a: number;
  setA: (value: number) => void;
  b: number;
  setB: (value: number) => void;
  n: number;
  setN: (value: number) => void;
  precision: number;
  setPrecision: (value: number) => void;
  mode: 'n' | 'precision';
  setMode: (value: 'n' | 'precision') => void;
  methodName?: string;
}

// Компонент для отображения постановки задачи в LaTeX
const TaskStatement = memo(
  ({ latex, a, b, n, precision, mode }: {
    latex: string;
    a: number;
    b: number;
    n: number;
    precision: number;
    mode: 'n' | 'precision';
    methodName?: string;
  }) => {
    const safeLatex = latex && latex.trim() ? latex : 'x';
    const integral = `\\int_{${a}}^{${b}} ${safeLatex} \\, dx`;
    const condition = mode === 'n'
      ? `n = ${n}`
      : `\\varepsilon = ${precision}`;

    return (
      <div style={{
        marginTop: '16px',
        textAlign: 'center',
        padding: '12px',
        background: '#f9f9f9',
        border: '1px solid #e8e8e8',
        borderRadius: '6px',
        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)',
        fontSize: '16px',
      }}>
        <p style={{ margin: 0 }}>
          Вычислить&nbsp;
          <MathJax inline>{`\\( ${integral} \\)`}</MathJax>
          &nbsp;, при&nbsp;
          <MathJax inline>{`\\( ${condition} \\)`}</MathJax>.
        </p>
      </div>
    );
  }
);



const IntegrationInputs: React.FC<IntegrationInputsProps> = React.memo(
  ({ latex, setLatex, a, setA, b, setB, n, setN, precision, setPrecision, mode, setMode, methodName }) => {
    // Debounce с задержкой 100 мс
    const debouncedSetLatex = useCallback(
      debounce((value: string) => setLatex(value), 100),
      [setLatex]
    );
    const debouncedSetA = useCallback(
      debounce((value: number) => setA(value), 100),
      [setA]
    );
    const debouncedSetB = useCallback(
      debounce((value: number) => setB(value), 100),
      [setB]
    );
    const debouncedSetN = useCallback(
      debounce((value: number) => setN(value), 100),
      [setN]
    );
    const debouncedSetPrecision = useCallback(
      debounce((value: number) => setPrecision(value), 100),
      [setPrecision]
    );

    return (
      <div
        style={{
          background: '#fff',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Input
          addonBefore="f(x) ="
          value={latex}
          onChange={(e) => debouncedSetLatex(e.target.value)}
          placeholder="Например, x^2 или cos(x)"
          style={{ marginBottom: '16px', borderRadius: '6px' }}
        />
        <Input
          addonBefore="a ="
          value={a}
          onChange={(e) => debouncedSetA(Number(e.target.value))}
          type="number"
          style={{ marginBottom: '16px', borderRadius: '6px' }}
        />
        <Input
          addonBefore="b ="
          value={b}
          onChange={(e) => debouncedSetB(Number(e.target.value))}
          type="number"
          style={{ marginBottom: '16px', borderRadius: '6px' }}
        />
        <Radio.Group
          onChange={(e) => setMode(e.target.value)}
          value={mode}
          style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}
        >
          <Radio value="n">Число разбиений</Radio>
          <Radio value="precision">Точность</Radio>
        </Radio.Group>
        {mode === 'n' ? (
          <Input
            addonBefore="n ="
            value={n}
            onChange={(e) => debouncedSetN(Number(e.target.value))}
            type="number"
            style={{ marginBottom: '16px', borderRadius: '6px' }}
          />
        ) : (
          <Input
            addonBefore="Точность ="
            value={precision}
            onChange={(e) => debouncedSetPrecision(Number(e.target.value))}
            type="number"
            step="0.0001"
            style={{ marginBottom: '16px', borderRadius: '6px' }}
          />
        )}
        <TaskStatement
          latex={latex}
          a={a}
          b={b}
          n={n}
          precision={precision}
          mode={mode}
          methodName={methodName}
        />
      </div>
    );
  }
);

export default IntegrationInputs;