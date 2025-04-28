import React from 'react';
import { Input, Slider, Typography } from 'antd';
import { MathJax } from 'better-react-mathjax';

const { Text } = Typography;

interface DiffurInputsProps {
  latex: string;
  setLatex: (value: string) => void;
  x0: number;
  setX0: (value: number) => void;
  y0: number;
  setY0: (value: number) => void;
  xEnd: number;
  setXEnd: (value: number) => void;
  h: number;
  setH: (value: number) => void;
}

const DiffurInputs: React.FC<DiffurInputsProps> = ({
  latex,
  setLatex,
  x0,
  setX0,
  y0,
  setY0,
  xEnd,
  setXEnd,
  h,
  setH,
}) => {
  return (
    <>
      <Input
        addonBefore="y' ="
        value={latex}
        onChange={(e) => setLatex(e.target.value)}
        placeholder="Введите функцию, например, -2*x*y или x^2"
      />
      <div style={{ margin: '10px 0' }}>
        <MathJax inline dynamic>
          {`\\( y' = ${latex} \\)`}
        </MathJax>
      </div>
      <Input
        addonBefore="x₀ ="
        value={x0}
        onChange={(e) => setX0(Number(e.target.value))}
        type="number"
      />
      <Input
        addonBefore="y₀ ="
        value={y0}
        onChange={(e) => setY0(Number(e.target.value))}
        type="number"
      />
      <Input
        addonBefore="x_end ="
        value={xEnd}
        onChange={(e) => setXEnd(Number(e.target.value))}
        type="number"
      />
      <Input
        addonBefore="h ="
        value={h}
        onChange={(e) => setH(Number(e.target.value))}
        type="number"
        step="0.01"
      />
      <Slider
        min={0.01}
        max={1}
        step={0.01}
        value={h}
        onChange={(value) => setH(value)}
      />
    </>
  );
};

export default DiffurInputs;