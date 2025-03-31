import React, { useState } from "react";
import { Card, Button, Typography, Alert } from "antd";
import DiffurInputs from "./DiffurInputs";
import DiffurChart from "./DiffurChart";
import { solveEuler, EulerResult } from "./euler";
import { MathJax, MathJaxContext } from "better-react-mathjax";

const { Paragraph } = Typography;

const EulerMethod: React.FC = () => {
  const [equation, setEquation] = useState<string>("-2*y");
  const [y0, setY0] = useState<number>(1);
  const [t0, setT0] = useState<number>(0);
  const [tEnd, setTEnd] = useState<number>(5);
  const [step, setStep] = useState<number>(0.1);
  const [result, setResult] = useState<EulerResult>({ t: [], y: [] });
  const [error, setError] = useState<string | null>(null);

  const handleSolve = () => {
    setError(null);
    try {
      const solution = solveEuler(equation, y0, t0, tEnd, step);
      setResult(solution);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <MathJaxContext>
      <Card
        title="Метод Эйлера"
        style={{ maxWidth: "800px", margin: "20px auto" }}
      >
        <Typography>
          <Paragraph>
            Метод Эйлера — численный метод для решения дифференциальных
            уравнений первого порядка. Он аппроксимирует решение шаг за шагом:
          </Paragraph>
          <MathJax>{`\\[ y_{n+1} = y_n + h \\cdot f(t_n, y_n) \\]`}</MathJax>
        </Typography>

        <DiffurInputs
          equation={equation}
          setEquation={setEquation}
          y0={y0}
          setY0={setY0}
          t0={t0}
          setT0={setT0}
          tEnd={tEnd}
          setTEnd={setTEnd}
          step={step}
          setStep={setStep}
        />

        <Button type="primary" onClick={handleSolve} style={{ margin: "10px" }}>
          Решить
        </Button>

        {error && (
          <Alert message={error} type="error" style={{ margin: "10px 0" }} />
        )}

        {result.t.length > 0 && <DiffurChart t={result.t} y={result.y} />}
      </Card>
    </MathJaxContext>
  );
};

export default EulerMethod;