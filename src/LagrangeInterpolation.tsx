import React, { useState } from 'react';
import { Card, Button } from 'antd';
import InterpolationInputs from './InterpolationInputs';
import InterpolationChart from './InterpolationChart';
import { MathJax } from 'better-react-mathjax';

const LagrangeInterpolation: React.FC = () => {
  const [points, setPoints] = useState<{ x: number; y: number }[]>([
    { x: 1, y: 2 },
    { x: 2, y: 3 },
    { x: 3, y: 5 },
    { x: 4, y: 2 },
  ]);
  const [interpolatedData, setInterpolatedData] = useState<{ x: number; y: number }[]>([]);
  const [latexFormula, setLatexFormula] = useState<string>('');
  const [simplifiedFormula, setSimplifiedFormula] = useState<string>('');

  // Функция для вычисления коэффициентов полинома
  const getPolynomialCoefficients = (points: { x: number; y: number }[]) => {
    const n = points.length;
    const coefficients = new Array(n).fill(0);

    for (let i = 0; i < n; i++) {
      let term = new Array(n).fill(0);
      term[0] = points[i].y;

      let denominator = 1;

      for (let j = 0; j < n; j++) {
        if (i !== j) {
          denominator *= (points[i].x - points[j].x);
          const newTerm = new Array(n).fill(0);
          for (let k = 0; k < n; k++) {
            newTerm[k + 1] += term[k];
            newTerm[k] -= points[j].x * term[k];
          }
          term = newTerm;
        }
      }

      for (let j = 0; j < n; j++) {
        coefficients[j] += term[j] / denominator;
      }
    }

    return coefficients;
  };

  const interpolate = () => {
    // Генерация данных для графика
    const lagrangePolynomial = (x: number) => {
      let result = 0;
      for (let i = 0; i < points.length; i++) {
        let term = points[i].y;
        for (let j = 0; j < points.length; j++) {
          if (i !== j) {
            term *= (x - points[j].x) / (points[i].x - points[j].x);
          }
        }
        result += term;
      }
      return result;
    };

    const numPoints = 500;
    const newInterpolatedData = [];
    const minX = Math.min(...points.map((p) => p.x));
    const maxX = Math.max(...points.map((p) => p.x));
    for (let i = 0; i <= numPoints; i++) {
      const x = minX + (i / numPoints) * (maxX - minX);
      const y = lagrangePolynomial(x);
      newInterpolatedData.push({ x, y });
    }
    setInterpolatedData(newInterpolatedData);

    // Генерация LaTeX-формулы
    let formula = 'L(x) = ';
    points.forEach((point, i) => {
      let term = `${point.y}`;
      points.forEach((p, j) => {
        if (i !== j) {
          term += ` \\cdot \\frac{(x - ${p.x})}{(${point.x} - ${p.x})}`;
        }
      });
      formula += (i === 0 ? '' : ' + ') + term;
    });
    setLatexFormula(formula);

    // Упрощение многочлена
    const coefficients = getPolynomialCoefficients(points);
    let simplified = '';
    for (let i = coefficients.length - 1; i >= 0; i--) {
      if (coefficients[i] !== 0) {
        if (simplified !== '') {
          simplified += ' + ';
        }
        if (i === 0) {
          simplified += `${coefficients[i].toFixed(2)}`;
        } else if (i === 1) {
          simplified += `${coefficients[i].toFixed(2)}x`;
        } else {
          simplified += `${coefficients[i].toFixed(2)}x^${i}`;
        }
      }
    }
    setSimplifiedFormula(simplified);
  };

  return (
    <Card title="Интерполяционный многочлен Лагранжа" style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
      <InterpolationInputs points={points} setPoints={setPoints} />
      <Button onClick={interpolate} style={{ marginTop: '10px' }}>
        Интерполировать
      </Button>
      {latexFormula && (
        <div style={{ display: 'none', marginTop: '10px' }}>
          <MathJax>{`\\[ ${latexFormula} \\]`}</MathJax>
        </div>
      )}
      {simplifiedFormula && (
        <div style={{ marginTop: '10px' }}>
          <strong></strong>
          <MathJax>{`\\[ L(x) = ${simplifiedFormula} \\]`}</MathJax>
        </div>
      )}
      <InterpolationChart points={points} interpolatedData={interpolatedData} />
    </Card>
  );
};

export default LagrangeInterpolation;