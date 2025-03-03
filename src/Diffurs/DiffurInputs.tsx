import React from 'react';
import { Input, Slider, Typography } from 'antd';
import { MathJax } from 'better-react-mathjax';

const { Text } = Typography;

interface DiffurInputsProps {
  equation: string;
  setEquation: (value: string) => void;
  y0: number;
  setY0: (value: number) => void;
  t0: number;
  setT0: (value: number) => void;
  tEnd: number;
  setTEnd: (value: number) => void;
  step: number;
  setStep: (value: number) => void;
}

const DiffurInputs: React.FC<DiffurInputsProps> = ({
  equation,
  setEquation,
  y0,
  setY0,
  t0,
  setT0,
  tEnd,
  setTEnd,
  step,
  setStep,
}) => {
  return (
    <>
      <Input
        addonBefore="y' ="
        value={equation}
        onChange={(e) => setEquation(e.target.value)}
        placeholder="Введите уравнение, например, -2*y"
      />
      <div style={{ margin: '10px 0' }}>
        <MathJax inline dynamic>
          \\( y' = ${equation} \\)
        </MathJax>
      </div>
      <Input
        addonBefore="y0 ="
        value={y0}
        onChange={(e) => setY0(Number(e.target.value))}
        type="number"
      />
      <Input
        addonBefore="t0 ="
        value={t0}
        onChange={(e) => setT0(Number(e.target.value))}
        type="number"
      />
      <Input
        addonBefore="tEnd ="
        value={tEnd}
        onChange={(e) => setTEnd(Number(e.target.value))}
        type="number"
      />
      <Slider
        min={0.01}
        max={1}
        step={0.01}
        value={step}
        onChange={(value) => setStep(value)}
      />
      <Text>Шаг: {step}</Text>
    </>
  );
};

export default DiffurInputs;