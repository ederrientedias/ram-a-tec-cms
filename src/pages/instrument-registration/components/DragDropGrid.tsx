import { GripVertical, Plus, Trash2, RotateCcw } from 'lucide-react';
import React, { useState, useRef } from 'react';

const DragDropGrid = () => {
  const [items, setItems] = useState([
    { id: '01', span: 4, content: '01' },
    { id: '02', span: 4, content: '02' },
    { id: '03', span: 2, content: '03' },
    { id: '04', span: 2, content: '04' },
    { id: '05', span: 2, content: '05' },
    { id: '06', span: 2, content: '06' },
    { id: '07', span: 2, content: '07' },
    { id: '08', span: 2, content: '08' },
    { id: '09', span: 2, content: '09' },
    { id: '10', span: 2, content: '10' },
    { id: '11', span: 2, content: '11' },
    { id: '12', span: 2, content: '12' },
  ]);

  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedOver, setDraggedOver] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  const dragRef = useRef(null);

  // Função para determinar a classe de span baseada no tamanho
  const getSpanClass = (span) => {
    switch (span) {
      case 1:
        return 'col-span-1';
      case 2:
        return 'col-span-2';
      case 3:
        return 'col-span-3';
      case 4:
        return 'col-span-4';
      default:
        return 'col-span-2';
    }
  };

  // Função para determinar cor baseada no span
  const getColorClass = (span) => {
    switch (span) {
      case 1:
        return 'bg-purple-400';
      case 2:
        return 'bg-purple-500';
      case 3:
        return 'bg-purple-600';
      case 4:
        return 'bg-purple-700';
      default:
        return 'bg-purple-500';
    }
  };

  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
    e.target.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedItem(null);
    setDraggedOver(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e, targetItem) => {
    e.preventDefault();
    setDraggedOver(targetItem.id);
  };

  const handleDrop = (e, targetItem) => {
    e.preventDefault();

    if (!draggedItem || draggedItem.id === targetItem.id) return;

    const newItems = [...items];
    const draggedIndex = newItems.findIndex((item) => item.id === draggedItem.id);
    const targetIndex = newItems.findIndex((item) => item.id === targetItem.id);

    // Remove o item arrastado e insere na nova posição
    const [removed] = newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, removed);

    setItems(newItems);
    setDraggedOver(null);
  };

  const changeItemSpan = (itemId, newSpan) => {
    setItems(items.map((item) => (item.id === itemId ? { ...item, span: newSpan } : item)));
    setEditingItem(null);
  };

  const addNewItem = () => {
    const newId = (Math.max(...items.map((item) => parseInt(item.id))) + 1)
      .toString()
      .padStart(2, '0');
    const newItem = {
      id: newId,
      span: 2,
      content: newId,
    };
    setItems([...items, newItem]);
  };

  const removeItem = (itemId) => {
    setItems(items.filter((item) => item.id !== itemId));
  };

  const resetGrid = () => {
    setItems([
      { id: '01', span: 4, content: '01' },
      { id: '02', span: 4, content: '02' },
      { id: '03', span: 2, content: '03' },
      { id: '04', span: 2, content: '04' },
      { id: '05', span: 2, content: '05' },
      { id: '06', span: 2, content: '06' },
      { id: '07', span: 2, content: '07' },
      { id: '08', span: 2, content: '08' },
      { id: '09', span: 2, content: '09' },
      { id: '10', span: 2, content: '10' },
      { id: '11', span: 2, content: '11' },
      { id: '12', span: 2, content: '12' },
    ]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Prévia</h1>
          <div className="flex gap-3">
            <button
              onClick={addNewItem}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus size={18} />
              Adicionar Item
            </button>
            <button
              onClick={resetGrid}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <RotateCcw size={18} />
              Reset
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Instruções:</strong> Arraste os itens para reordená-los. Clique em um item para
            alterar seu tamanho (1-4 colunas).
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-4 gap-4 auto-rows-fr">
          {items.map((item) => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => handleDragStart(e, item)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDragEnter={(e) => handleDragEnter(e, item)}
              onDrop={(e) => handleDrop(e, item)}
              onClick={() => setEditingItem(editingItem === item.id ? null : item.id)}
              className={`
                ${getSpanClass(item.span)}
                ${getColorClass(item.span)}
                relative min-h-[100px] rounded-lg cursor-move
                flex items-center justify-center text-white font-semibold text-lg
                transition-all duration-200 hover:scale-[1.02] hover:shadow-lg
                ${draggedOver === item.id ? 'ring-4 ring-yellow-400 ring-opacity-50' : ''}
                ${editingItem === item.id ? 'ring-4 ring-blue-400' : ''}
                group select-none
              `}
            >
              {/* Drag Handle */}
              <div className="absolute top-2 left-2 text-white/70 group-hover:text-white transition-colors">
                <GripVertical size={16} />
              </div>

              {/* Delete Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeItem(item.id);
                }}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 
                         hover:bg-red-500 hover:text-white p-1 rounded transition-all"
              >
                <Trash2 size={14} />
              </button>

              {/* Content */}
              <span className="text-xl font-bold">{item.content}</span>

              {/* Size indicator */}
              <div className="absolute bottom-2 right-2 text-xs bg-black/20 px-2 py-1 rounded">
                {item.span} col{item.span !== 1 ? 's' : ''}
              </div>

              {/* Size Selector */}
              {editingItem === item.id && (
                <div className="absolute -bottom-14 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg border p-2 flex gap-1 z-10">
                  {[1, 2, 3, 4].map((size) => (
                    <button
                      key={size}
                      onClick={(e) => {
                        e.stopPropagation();
                        changeItemSpan(item.id, size);
                      }}
                      className={`
                        w-8 h-8 rounded text-sm font-medium transition-colors
                        ${
                          item.span === size
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }
                      `}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Grid Info */}
        <div className="mt-8 p-4 bg-white rounded-lg border">
          <h3 className="font-semibold mb-2">Informações do Grid:</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• Total de itens: {items.length}</p>
            <p>• Grid de 4 colunas com gaps responsivos</p>
            <p>• Cores indicam o tamanho: mais escuro = maior span</p>
            <p>• Drag and drop nativo do HTML5</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DragDropGrid;
