import React from 'react';
import { Input, Slider, Typography } from 'antd';
import { MathJax } from 'better-react-mathjax';

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
}

const IntegrationInputs: React.FC<IntegrationInputsProps> = ({
  latex,
  setLatex,
  a,
  setA,
  b,
  setB,
  n,
  setN,
}) => {
  return (
    <>
      <Input
        addonBefore="f(x) ="
        value={latex}
        onChange={(e) => setLatex(e.target.value)}
        placeholder="Введите функцию, например, x^2 или cos(x)"
      />
      <div style={{ margin: '10px 0' }}>
        <MathJax inline dynamic>
          {`\\( f(x) = ${latex} \\)`}
        </MathJax>
      </div>
      <Input
        addonBefore="a ="
        value={a}
        onChange={(e) => setA(Number(e.target.value))}
        type="number"
      />
      <Input
        addonBefore="b ="
        value={b}
        onChange={(e) => setB(Number(e.target.value))}
        type="number"
      />
      <Input
        addonBefore="n ="
        value={n}
        onChange={(e) => setN(Number(e.target.value))}
        type="number"
      />
      <Slider
        min={1}
        max={100}
        value={n}
        onChange={(value) => setN(value)}
      />
    </>
  );
};

export default IntegrationInputs;