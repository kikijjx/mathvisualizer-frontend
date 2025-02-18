export const replaceMathFunctions = (expression: string): string => {
    const mathFunctions = ['cos', 'sin', 'tan', 'acos', 'asin', 'atan', 'sqrt', 'log', 'exp', 'abs'];
    let result = expression;
    mathFunctions.forEach((func) => {
      result = result.replace(new RegExp(`\\b${func}\\b`, 'g'), `Math.${func}`);
    });
    return result;
  };