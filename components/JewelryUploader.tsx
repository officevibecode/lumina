
import React, { useState } from 'react';
import { JewelryItem, JewelryType } from '../types';

interface Props {
  items: JewelryItem[];
  setItems: (items: JewelryItem[]) => void;
  language: 'pt' | 'en';
}

const JewelryUploader: React.FC<Props> = ({ items, setItems, language }) => {
  const [isDragging, setIsDragging] = useState(false);

  const t = {
    title: language === 'pt' ? '1. Joias para Publicidade' : '1. Jewelry for Advertising',
    limit: language === 'pt' ? 'No máximo 4 joias.' : 'Maximum 4 pieces.',
    add: language === 'pt' ? 'Adicionar Joia' : 'Add Jewelry',
    typePlaceholder: language === 'pt' ? 'Tipo de Joia' : 'Jewelry Type',
    types: {
      Anel: language === 'pt' ? 'Anel' : 'Ring',
      Pulseira: language === 'pt' ? 'Pulseira' : 'Bracelet',
      Colar: language === 'pt' ? 'Colar' : 'Necklace',
      Brincos: language === 'pt' ? 'Brincos' : 'Earrings'
    }
  };

  const processFiles = async (files: File[]) => {
    if (items.length + files.length > 4) {
      alert(t.limit);
      return;
    }

    const newItems: JewelryItem[] = await Promise.all(
      files.map(async (file) => {
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result?.toString().split(',')[1] || "");
          reader.readAsDataURL(file);
        });
        return {
          id: Math.random().toString(36).slice(2, 11),
          file,
          previewUrl: URL.createObjectURL(file),
          base64,
          type: ''
        };
      })
    );
    setItems([...items, ...newItems]);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    processFiles(files);
  };

  // Fix: Explicitly cast e.dataTransfer.files to File[] to avoid unknown type errors
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!e.dataTransfer.files) return;
    const files = (Array.from(e.dataTransfer.files) as File[]).filter(f => f.type.startsWith('image/'));
    processFiles(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeImage = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const setType = (id: string, type: JewelryType) => {
    setItems(items.map(i => i.id === id ? { ...i, type } : i));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold gold-gradient">{t.title}</h3>
        <span className="text-xs opacity-50">{items.length}/4 {language === 'pt' ? 'Peças' : 'Pieces'}</span>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {items.map((item) => (
          <div key={item.id} className="glass-panel rounded-xl overflow-hidden p-3 flex flex-col space-y-3 shadow-sm">
            <div className="relative aspect-square rounded-lg overflow-hidden bg-neutral-200 dark:bg-black">
              <img src={item.previewUrl} className="w-full h-full object-contain" alt="Preview" />
              <button 
                onClick={() => removeImage(item.id)}
                className="absolute top-1 right-1 bg-black/20 hover:bg-red-500 text-white p-1.5 rounded-full transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <select 
              value={item.type}
              onChange={(e) => setType(item.id, e.target.value as JewelryType)}
              className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-gold shadow-sm"
            >
              <option value="">{t.typePlaceholder}</option>
              <option value="Anel">{t.types.Anel}</option>
              <option value="Pulseira">{t.types.Pulseira}</option>
              <option value="Colar">{t.types.Colar}</option>
              <option value="Brincos">{t.types.Brincos}</option>
            </select>
          </div>
        ))}

        {items.length < 4 && (
          <label 
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-xl aspect-square flex flex-col items-center justify-center cursor-pointer transition-all ${
              isDragging 
                ? 'border-gold bg-gold/10 scale-[1.02] shadow-lg' 
                : 'border-neutral-300 dark:border-neutral-800 hover:border-gold hover:bg-gold/5'
            }`}
          >
            <svg className={`w-8 h-8 mb-2 transition-colors ${isDragging ? 'text-gold' : 'text-neutral-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
            </svg>
            <span className={`text-xs font-medium transition-colors ${isDragging ? 'text-gold' : 'text-neutral-400'}`}>
              {t.add}
            </span>
            <input type="file" multiple className="hidden" accept="image/*" onChange={handleUpload} />
          </label>
        )}
      </div>
    </div>
  );
};

export default JewelryUploader;
