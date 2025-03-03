import React from 'react';
import { Input, Button, Flex, Typography } from 'antd';

const { Text } = Typography;

interface InterpolationInputsProps {
  points: { x: number; y: number }[];
  setPoints: (points: { x: number; y: number }[]) => void;
}

const InterpolationInputs: React.FC<InterpolationInputsProps> = ({ points, setPoints }) => {
  const handlePointChange = (index: number, field: 'x' | 'y', value: string) => {
    const newPoints = [...points];
    newPoints[index][field] = Number(value);
    setPoints(newPoints);
  };

  const addPoint = () => {
    setPoints([...points, { x: 0, y: 0 }]);
  };

  const removePoint = (index: number) => {
    const newPoints = points.filter((_, i) => i !== index);
    setPoints(newPoints);
  };

  return (
    <>
      {points.map((point, index) => (
        <Flex key={index} gap="small" align="center" style={{ marginBottom: '10px' }}>
          <Input
            addonBefore="x ="
            value={point.x}
            onChange={(e) => handlePointChange(index, 'x', e.target.value)}
            type="number"
            style={{ width: '200px' }}
          />
          <Input
            addonBefore="y ="
            value={point.y}
            onChange={(e) => handlePointChange(index, 'y', e.target.value)}
            type="number"
            style={{ width: '200px' }}
          />
          <Button onClick={() => removePoint(index)} danger>
            Удалить
          </Button>
        </Flex>
      ))}
      <Button onClick={addPoint} style={{ marginTop: '10px' }}>
        Добавить точку
      </Button>
    </>
  );
};

export default InterpolationInputs;