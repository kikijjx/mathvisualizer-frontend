import React, { useCallback } from 'react';
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
}

const IntegrationInputs: React.FC<IntegrationInputsProps> = React.memo(
  ({ latex, setLatex, a, setA, b, setB, n, setN, precision, setPrecision, mode, setMode }) => {
    // Debounce для обработки ввода
    const debouncedSetLatex = useCallback(
      debounce((value: string) => setLatex(value), 300),
      [setLatex]
    );
    const debouncedSetA = useCallback(
      debounce((value: number) => setA(value), 300),
      [setA]
    );
    const debouncedSetB = useCallback(
      debounce((value: number) => setB(value), 300),
      [setB]
    );
    const debouncedSetN = useCallback(
      debounce((value: number) => setN(value), 300),
      [setN]
    );
    const debouncedSetPrecision = useCallback(
      debounce((value: number) => setPrecision(value), 300),
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
        <div style={{ marginBottom: '16px', textAlign: 'center' }}>
          <MathJax inline dynamic>{`\\( f(x) = ${latex || 'x'} \\)`}</MathJax>
        </div>
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
      </div>
    );
  }
);

export default IntegrationInputs;