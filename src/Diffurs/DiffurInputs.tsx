import React from "react";
import { Input, Slider, Typography } from "antd";
import { MathJax } from "better-react-mathjax";

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
    <div style={{ padding: "20px" }}>
      <Input
        addonBefore="y' ="
        value={equation}
        onChange={(e) => setEquation(e.target.value)}
        placeholder="Например: -2*y или sin(t)"
        style={{ marginBottom: "10px" }}
      />
      <MathJax dynamic>{`\\( y' = ${equation || "..."}\\) `}</MathJax>

      <Input
        addonBefore="y₀ ="
        value={y0}
        onChange={(e) => setY0(parseFloat(e.target.value) || 0)}
        type="number"
        step="0.1"
        style={{ marginTop: "10px" }}
      />
      <Input
        addonBefore="t₀ ="
        value={t0}
        onChange={(e) => setT0(parseFloat(e.target.value) || 0)}
        type="number"
        step="0.1"
        style={{ marginTop: "10px" }}
      />
      <Input
        addonBefore="tₑₙd ="
        value={tEnd}
        onChange={(e) => setTEnd(parseFloat(e.target.value) || 0)}
        type="number"
        step="0.1"
        style={{ marginTop: "10px" }}
      />
      <div style={{ marginTop: "10px" }}>
        <Text>Шаг: {step.toFixed(2)}</Text>
        <Slider
          min={0.01}
          max={1}
          step={0.01}
          value={step}
          onChange={setStep}
        />
      </div>
    </div>
  );
};

export default DiffurInputs;