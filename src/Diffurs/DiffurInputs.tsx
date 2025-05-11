import React, { useCallback } from 'react';
import { Input, Typography } from 'antd';
import { MathJax } from 'better-react-mathjax';
import { debounce } from 'lodash';

const { Text, Title } = Typography;

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
}

const DiffurInputs: React.FC<DiffurInputsProps> = React.memo(
  ({ latex, setLatex, x0, setX0, y0, setY0, b, setB, n, setN }) => {
    // Debounce input changes
    const debouncedSetLatex = useCallback(
      debounce((value: string) => setLatex(value), 300),
      [setLatex]
    );
    const debouncedSetX0 = useCallback(
      debounce((value: number) => setX0(value), 300),
      [setX0]
    );
    const debouncedSetY0 = useCallback(
      debounce((value: number) => setY0(value), 300),
      [setY0]
    );
    const debouncedSetB = useCallback(
      debounce((value: number) => setB(value), 300),
      [setB]
    );
    const debouncedSetN = useCallback(
      debounce((value: number) => setN(value), 300),
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
          addonBefore="y' ="
          value={latex}
          onChange={(e) => debouncedSetLatex(e.target.value)}
          placeholder="Например, -2*x*y или sin(x)"
          style={{ marginBottom: '16px', borderRadius: '6px' }}
        />
        <div style={{ marginBottom: '16px', textAlign: 'center' }}>
          <MathJax inline dynamic>{`\\( y' = ${latex || 'x'} \\)`}</MathJax>
        </div>
        <Input
          addonBefore="y₀ ="
          value={y0}
          onChange={(e) => debouncedSetY0(Number(e.target.value))}
          type="number"
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
      </div>
    );
  }
);

export default DiffurInputs;