import React, { useState } from 'react';
import { Button, Input, Modal, Space, Table, InputRef } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { ReportContent } from './taskUtils';

interface ReportTemplateEditorProps {
  open: boolean;
  onOk: (content: ReportContent[]) => void;
  onCancel: () => void;
  initialContent?: ReportContent[];
}

interface TableData {
  columns: string[];
  rows: string[][];
}

interface ImageData {
  url: string;
  alt: string;
}

const ReportTemplateEditor: React.FC<ReportTemplateEditorProps> = ({
  open,
  onOk,
  onCancel,
  initialContent = [],
}) => {
  const [content, setContent] = useState<ReportContent[]>(initialContent);

  const addText = () => {
    setContent([...content, { type: 'text', value: '' }]);
  };

  const addTable = () => {
    setContent([...content, { type: 'table', value: { columns: ['Колонка 1'], rows: [['']] } }]);
  };

  const addImage = () => {
    setContent([...content, { type: 'image', value: { url: '', alt: '' } }]);
  };

  const updateContent = (index: number, updatedValue: any) => {
    const newContent = [...content];
    newContent[index].value = updatedValue;
    setContent(newContent);
  };

  const deleteContent = (index: number) => {
    setContent(content.filter((_, i) => i !== index));
  };

  const updateTableColumns = (index: number, newColumns: string[]) => {
    const tableData = content[index].value as TableData;
    const newRows = tableData.rows.map((row) => {
      const newRow = [...row];
      while (newRow.length < newColumns.length) newRow.push('');
      return newRow.slice(0, newColumns.length);
    });
    updateContent(index, { columns: newColumns, rows: newRows });
  };

  const updateTableRows = (index: number, newRows: string[][]) => {
    const tableData = content[index].value as TableData;
    updateContent(index, { columns: tableData.columns, rows: newRows });
  };

  const renderContentItem = (item: ReportContent, index: number) => {
    switch (item.type) {
      case 'text':
        return (
          <Input.TextArea
            value={item.value as string}
            onChange={(e) => updateContent(index, e.target.value)}
            placeholder="Введите текст"
          />
        );
      case 'table':
        const tableData = item.value as TableData;
        return (
          <Space direction="vertical">
            <Space>
              {tableData.columns.map((col, colIndex) => (
                <Input
                  key={colIndex}
                  value={col}
                  onChange={(e) => {
                    const newColumns = [...tableData.columns];
                    newColumns[colIndex] = e.target.value;
                    updateTableColumns(index, newColumns);
                  }}
                  placeholder={`Название столбца ${colIndex + 1}`}
                />
              ))}
              <Button
                onClick={() => updateTableColumns(index, [...tableData.columns, `Колонка ${tableData.columns.length + 1}`])}
                icon={<PlusOutlined />}
              >
                Добавить столбец
              </Button>
            </Space>
            <Table
              columns={tableData.columns.map((col, colIndex) => ({
                title: col,
                dataIndex: colIndex,
                render: (text: string, _: any, rowIndex: number) => (
                  <Input
                    value={text}
                    onChange={(e) => {
                      const newRows = [...tableData.rows];
                      newRows[rowIndex][colIndex] = e.target.value;
                      updateTableRows(index, newRows);
                    }}
                  />
                ),
              }))}
              dataSource={tableData.rows.map((row, rowIndex) => ({
                key: rowIndex,
                ...row.reduce((acc, val, idx) => ({ ...acc, [idx]: val }), {}),
              }))}
              pagination={false}
              size="small"
            />
            <Button
              onClick={() => {
                const newRow = new Array(tableData.columns.length).fill('');
                updateTableRows(index, [...tableData.rows, newRow]);
              }}
              icon={<PlusOutlined />}
            >
              Добавить строку
            </Button>
          </Space>
        );
      case 'image':
        const imageData = item.value as ImageData;
        return (
          <Space>
            <Input
              value={imageData.url}
              onChange={(e) => updateContent(index, { ...imageData, url: e.target.value })}
              placeholder="URL изображения"
            />
            <Input
              value={imageData.alt}
              onChange={(e) => updateContent(index, { ...imageData, alt: e.target.value })}
              placeholder="Альтернативный текст"
            />
          </Space>
        );
      default:
        return null;
    }
  };

  return (
    <Modal title="Редактировать шаблон отчёта" open={open} onOk={() => onOk(content)} onCancel={onCancel} width={800}>
      <Space direction="vertical" style={{ width: '100%' }}>
        {content.map((item, index) => (
          <Space key={index} direction="vertical" style={{ marginBottom: 16 }}>
            {renderContentItem(item, index)}
            <Button danger icon={<DeleteOutlined />} onClick={() => deleteContent(index)}>
              Удалить
            </Button>
          </Space>
        ))}
        <Space>
          <Button onClick={addText} icon={<PlusOutlined />}>
            Добавить текст
          </Button>
          <Button onClick={addTable} icon={<PlusOutlined />}>
            Добавить таблицу
          </Button>
          <Button onClick={addImage} icon={<PlusOutlined />}>
            Добавить изображение
          </Button>
        </Space>
      </Space>
    </Modal>
  );
};

export default ReportTemplateEditor;