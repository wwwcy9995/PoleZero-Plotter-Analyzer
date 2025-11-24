import React, { useState } from 'react';
import { ComplexNumber } from '../types';
import { Plus, Trash2, MousePointer2 } from 'lucide-react';

interface ComplexListProps {
  title: string;
  items: ComplexNumber[];
  onChange: (items: ComplexNumber[]) => void;
  colorClass: string;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export const ComplexList: React.FC<ComplexListProps> = ({ 
  title, 
  items, 
  onChange, 
  colorClass,
  selectedId,
  onSelect
}) => {
  const [newReal, setNewReal] = useState('0');
  const [newImag, setNewImag] = useState('0');
  const [conjugate, setConjugate] = useState(true);

  const addItem = () => {
    const r = parseFloat(newReal);
    const i = parseFloat(newImag);
    
    if (isNaN(r) || isNaN(i)) return;

    const newItems = [...items];
    const id = Date.now().toString();

    newItems.push({ id: id + '_1', real: r, imag: i });
    
    if (conjugate && i !== 0) {
      newItems.push({ id: id + '_2', real: r, imag: -i });
    }

    onChange(newItems);
  };

  const removeItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent selection when deleting
    onChange(items.filter(item => item.id !== id));
    if (selectedId === id) {
      onSelect(''); // Deselect if deleted
    }
  };

  return (
    <div className={`p-4 rounded-xl border bg-white shadow-sm ${colorClass}`}>
      <h3 className="font-semibold text-lg mb-3 flex items-center justify-between">
        {title}
        <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
          {items.length} active
        </span>
      </h3>
      
      {/* Add New Section */}
      <div className="flex flex-col gap-2 mb-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Add New</div>
        <div className="flex gap-2">
          <div className="flex-1">
            <input
              type="number"
              step="0.1"
              value={newReal}
              onChange={(e) => setNewReal(e.target.value)}
              className="w-full px-2 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-slate-400 text-sm text-slate-900 bg-white"
              placeholder="Real"
            />
          </div>
          <div className="flex-1">
            <input
              type="number"
              step="0.1"
              value={newImag}
              onChange={(e) => setNewImag(e.target.value)}
              className="w-full px-2 py-1.5 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-slate-400 text-sm text-slate-900 bg-white"
              placeholder="Imag"
            />
          </div>
          <button
            onClick={addItem}
            className="flex items-center justify-center bg-slate-800 text-white w-8 h-8 rounded hover:bg-slate-700 transition-colors"
            title="Add"
          >
            <Plus size={16} />
          </button>
        </div>
        
        <label className="flex items-center text-xs text-slate-600 cursor-pointer select-none mt-1">
            <input 
              type="checkbox" 
              checked={conjugate} 
              onChange={(e) => setConjugate(e.target.checked)}
              className="mr-2 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            Add Conjugate pair
        </label>
      </div>

      {/* List Section */}
      <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {items.length === 0 && (
          <p className="text-center text-xs text-slate-400 py-4 italic">No {title.toLowerCase()} added.</p>
        )}
        {items.map((item) => {
          const isSelected = item.id === selectedId;
          return (
            <div 
              key={item.id} 
              onClick={() => onSelect(item.id)}
              className={`
                flex items-center justify-between px-3 py-2 rounded-lg border cursor-pointer transition-all
                ${isSelected 
                  ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500' 
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }
              `}
            >
              <div className="flex items-center gap-2">
                {isSelected && <MousePointer2 size={12} className="text-indigo-600" />}
                <span className={`font-mono text-sm ${isSelected ? 'text-indigo-900 font-semibold' : 'text-slate-700'}`}>
                  {item.real} {item.imag >= 0 ? '+' : ''} {item.imag}j
                </span>
              </div>
              <button
                onClick={(e) => removeItem(e, item.id)}
                className="text-slate-400 hover:text-red-500 transition-colors p-1"
              >
                <Trash2 size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};