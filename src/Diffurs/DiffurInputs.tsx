import React, { useCallback } from 'react';
import { Input, Typography } from 'antd';
import { MathJax } from 'better-react-mathjax';
import { debounce } from 'lodash';

const { Text } = Typography;

interface DiffurInputsProps {
  latex: string;
  setLatex: (value: string) => void;
  x0: number;
  setX0: (value: number) => void;
  y0: number;
  setY0: (value: number) => void;
  b: number;
  setB: (value: number) => void;
  n: number;
  setN: (value: number) => void;
  methodName?: string;
}

// Компонент для отображения постановки задачи
const DiffurTaskStatement = ({
  latex,
  x0,
  y0,
  b,
  n,
}: {
  latex: string;
  x0: number;
  y0: number;
  b: number;
  n: number;
}) => {
  const safeLatex = latex && latex.trim() ? latex : 'x';
  const equation = `y' = ${safeLatex}`;
  const condition = `y(${x0}) = ${y0}`;
  const segment = `${x0} \\le x \\le ${b}`;

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
  Решить&nbsp;
  <MathJax inline>{`\\( y' = f(x, y) \\)`}</MathJax>&nbsp;на интервале&nbsp;
  <MathJax inline>{`\\( ${segment} \\)`}</MathJax>,<br />
  с начальным условием&nbsp;
  <MathJax inline>{`\\( y(${x0}) = ${y0} \\)`}</MathJax>,<br />
  при&nbsp;
  <MathJax inline>{`\\( n = ${n} \\)`}</MathJax>.
</p>

    </div>
  );
};

const DiffurInputs: React.FC<DiffurInputsProps> = React.memo(
  ({ latex, setLatex, x0, setX0, y0, setY0, b, setB, n, setN, methodName }) => {
    const debouncedSetLatex = useCallback(
      debounce((value: string) => setLatex(value), 100),
      [setLatex]
    );
    const debouncedSetX0 = useCallback(
      debounce((value: number) => setX0(value), 100),
      [setX0]
    );
    const debouncedSetY0 = useCallback(
      debounce((value: number) => setY0(value), 100),
      [setY0]
    );
    const debouncedSetB = useCallback(
      debounce((value: number) => setB(value), 100),
      [setB]
    );
    const debouncedSetN = useCallback(
      debounce((value: number) => setN(value), 100),
      [setN]
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
          addonBefore="f(x,y) ="
          value={latex}
          onChange={(e) => debouncedSetLatex(e.target.value)}
          placeholder="Например, -2*x*y или sin(x)"
          style={{ marginBottom: '16px', borderRadius: '6px' }}
        />
          <Input
          addonBefore="x₀ ="
          value={x0}
          onChange={(e) => debouncedSetX0(Number(e.target.value))}
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
        <Input
          addonBefore="y₀ ="
          value={y0}
          onChange={(e) => debouncedSetY0(Number(e.target.value))}
          type="number"
          style={{ marginBottom: '16px', borderRadius: '6px' }}
        />

        <Input
          addonBefore="n ="
          value={n}
          onChange={(e) => debouncedSetN(Number(e.target.value))}
          type="number"
          min={1}
          step={1}
          style={{ marginBottom: '16px', borderRadius: '6px' }}
        />
        {n > 1000 && (
          <Text type="danger" style={{ display: 'block', marginTop: '8px', fontSize: '12px' }}>
            Количество разбиений n слишком велико ({n}). Это может замедлить вычисления. Рекомендуется n ≤ 1000.
          </Text>
        )}
        <DiffurTaskStatement
          latex={latex}
          x0={x0}
          y0={y0}
          b={b}
          n={n}
        />
      </div>
    );
  }
);

export default DiffurInputs;
