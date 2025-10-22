import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { draggable, dropTargetForElements, } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { useSelectOptions } from '@/hooks/firestore-intranet/use-select-options';
import { IFieldRef } from '@/models/instruments-registration.model';
import { useFields } from '@/hooks/firestore-intranet/use-fields';
import { useCallback, useEffect, useRef, useState } from 'react';
import { GripVertical, Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import invariant from 'tiny-invariant';


export const FormPreview = ({ data }) => {
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

  const [forms, setForms] = useState([]);
  const { data: fieldsCollection, isLoading: fieldsLoading } = useFields();
  const { data: selectOptins } = useSelectOptions();

  const loadFields = useCallback(
    (fields: IFieldRef[]) => {
      return fields
        .map((field) => {
          const f = fieldsCollection.find((fd) => fd.id === field.id);
          return f ? { ...f, span: 1 } : null;
        })
        .filter(Boolean);
    },
    [fieldsCollection]
  );

  useEffect(() => {
    if (!data) return;
    const updatedForms = data?.map((f) => ({ ...f, fields: loadFields(f.fields) }));
    console.log('Forms', updatedForms);
    setForms(updatedForms);
  }, [data, loadFields]);

  /* Drag and Drop */

  const fecthSelectOptions = (optionRef: string) => {
    return selectOptins?.find((option) => option.id === optionRef)?.options ?? [];
  };

  //  Função para determinar a classe de span baseada no tamanho
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

  const changeItemSpan = (formIndex: number, fieldId: string, newSpan: any) => {
    setForms((prev) => {
      prev[formIndex].fields?.map((field: any) => {
        if (field.id === fieldId) {
          field.span = newSpan;
        }
        return field;
      });
      return prev;
    });
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
    <section className="w-full flex flex-col items-start gap-4">
      <h2 className="text-2xl font-medium text-slate-950">Prévia</h2>
      <div className="w-full flex flex-col items-start gap-3">
        {data &&
          data.length > 0 &&
          forms.map((item, formIndex) => {
            return (
              <div key={item.id} className="w-full flex flex-col items-start gap-2">
                <h3 className="w-full text-lg font-normal">{item.name}</h3>
                <div className="w-full grid grid-cols-4 gap-4 auto-rows-fr">
                  {item.fields.map((field: any) => {
                    return (
                      <div
                        key={field.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, field)}
                        onDragEnd={handleDragEnd}
                        onDragOver={handleDragOver}
                        onDragEnter={(e) => handleDragEnter(e, field)}
                        onDrop={(e) => handleDrop(e, field)}
                        onClick={() => setEditingItem(editingItem === field.id ? null : field.id)}
                        className={`
                            ${getSpanClass(field.span)}
                            border
                            relative min-h-[100px] rounded-lg cursor-move
                            flex items-center justify-center text-white font-semibold text-lg
                            transition-all duration-200
                            ${
                              draggedOver === field.id ? 'ring-2 ring-blue-400 ring-opacity-50' : ''
                            }
                            ${editingItem === field.id ? 'ring-2  ring-slate-900' : ''}
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
                            removeItem(field.id);
                          }}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100
                         hover:bg-red-500 hover:text-white p-1 rounded transition-all"
                        >
                          <Trash2 size={14} />
                        </button>

                        {/* Content */}
                        <>
                          {field.type === 'text' && (
                            <div key={field.id} className="flex flex-col gap-2">
                              <label
                                className={`text-xs font-medium ${
                                  !field.label ? 'text-transparent' : ''
                                }`}
                              >
                                {field.label || 'Campo texto'}
                              </label>
                              <Input
                                className="h-8 text-xs p-1 placeholder-shown:text-xs"
                                type="text"
                                placeholder={field.placeholder || `Digite ${field.label}`}
                              />
                            </div>
                          )}
                          {field.type === 'number' && (
                            <div key={field.id} className="flex flex-col gap-2">
                              <label
                                className={`text-xs font-medium ${
                                  !field.label ? 'text-transparent' : ''
                                }`}
                              >
                                {field.label || 'Campo texto'}
                              </label>
                              <Input
                                className="h-8 text-xs px-3 py-2 placeholder-shown:text-xs"
                                type="number"
                                placeholder={field.placeholder || `Digite ${field.label}`}
                              />
                            </div>
                          )}
                          {(field.type === 'select' || field.type === 'custom-list') && (
                            <div key={field.id} className="flex flex-col gap-2">
                              <label
                                className={`text-xs font-medium ${
                                  !field.label ? 'text-transparent' : ''
                                }`}
                              >
                                {field.label || 'Campo texto'}
                              </label>
                              <Select value={field.value ?? ''} onValueChange={field.onChange}>
                                <SelectTrigger className="w-full text-sm h-8 has-[span]:text-xs">
                                  <SelectValue
                                    className="text-sm"
                                    placeholder={field.placeholder || 'Selecione uma opção'}
                                  />
                                </SelectTrigger>
                                <SelectContent>
                                  {fecthSelectOptions(field.optionsRef).map((option) => (
                                    <SelectItem
                                      key={option['ID'].toString()}
                                      value={option['ID'].toString() ?? ''}
                                    >
                                      {option['NOME'] ??
                                        option['CLASSE'] ??
                                        option['COD'] ??
                                        option['name']}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                          {field.type === 'checkbox' && <div>checkbox</div>}
                        </>

                        {/* Size indicator */}
                        <div className="absolute bottom-2 right-2 text-xs bg-black/20 px-2 py-1 rounded">
                          {field.span} col{field.span !== 1 ? 's' : ''}
                        </div>

                        {/* Size Selector */}
                        {editingItem === field.id && (
                          <div className="absolute -bottom-14 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg border p-2 flex gap-1 z-10">
                            {[1, 2, 3, 4].map((size) => (
                              <button
                                key={size}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  changeItemSpan(formIndex, field.id, size);
                                }}
                                className={` w-8 h-8 rounded text-sm font-medium transition-colors
                                  ${
                                    field.span === size
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
                    );
                  })}
                </div>
              </div>
            );
          })}
      </div>
    </section>
  );
};
