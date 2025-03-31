import { evaluate } from "mathjs";

export interface EulerResult {
  t: number[];
  y: number[];
}

export const solveEuler = (
  equation: string,
  y0: number,
  t0: number,
  tEnd: number,
  step: number
): EulerResult => {
  const tValues: number[] = [];
  const yValues: number[] = [];
  let currentT = t0;
  let currentY = y0;

  while (currentT <= tEnd) {
    tValues.push(currentT);
    yValues.push(currentY);

    try {
      // Безопасно вычисляем производную с помощью mathjs
      const derivative = evaluate(equation, { y: currentY, t: currentT });
      currentY += derivative * step;
      currentT += step;
    } catch (error) {
      throw new Error("Ошибка в уравнении: проверьте синтаксис.");
    }
  }

  return { t: tValues, y: yValues };
};