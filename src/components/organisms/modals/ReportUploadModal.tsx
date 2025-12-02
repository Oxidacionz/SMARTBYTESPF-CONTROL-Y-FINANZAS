import React, { useState, useRef } from 'react';
import { FinancialItem, Currency, Category } from '../../../types';
import { UploadCloud, FileText, Image as ImageIcon, X, Check, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '../../atoms/Button';
import { parseFinancialDocument } from '../../../services/geminiService';

declare global {
  interface Window {
    XLSX: any;
    pdfjsLib: any;
  }
}

interface ReportUploadModalProps {
  onConfirm: (items: Omit<FinancialItem, 'id'>[]) => void;
  onClose: () => void;
}

// Helper para limpiar montos (soporta 1.200,50 y 1,200.50)
const cleanNumber = (val: any): number => {
    if (typeof val === 'number') return Math.abs(val);
    if (!val) return 0;
    let str = val.toString().trim();
    
    // Si tiene coma y punto, asumimos el último como decimal
    if (str.includes(',') && str.includes('.')) {
        const lastComma = str.lastIndexOf(',');
        const lastDot = str.lastIndexOf('.');
        if (lastComma > lastDot) { // Estilo Europeo/Venezolano: 1.500,00
             str = str.replace(/\./g, '').replace(',', '.');
        } else { // Estilo US: 1,500.00
             str = str.replace(/,/g, '');
        }
    } else if (str.includes(',')) {
        // Solo comas. Si hay más de una, son miles. Si hay una y está al final, es decimal.
        const parts = str.split(',');
        if (parts.length > 2 || (parts.length === 2 && parts[1].length === 3)) {
            str = str.replace(/,/g, ''); // Son miles
        } else {
            str = str.replace(',', '.'); // Es decimal
        }
    }
    
    return Math.abs(parseFloat(str.replace(/[^0-9.]/g, '')) || 0);
};

export const ReportUploadModal: React.FC<ReportUploadModalProps> = ({ onConfirm, onClose }) => {
  const [step, setStep] = useState<'upload' | 'processing' | 'review'>('upload');
  const [items, setItems] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setStep('processing');
    try {
      let rawContent = '';
      let mode: 'text' | 'image' = 'text';
      let imageData = '';

      // 1. Extracción de Texto según el archivo
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv')) {
        const data = await file.arrayBuffer();
        const workbook = window.XLSX.read(data);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        rawContent = JSON.stringify(window.XLSX.utils.sheet_to_json(worksheet));
      } else if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let text = '';
        for (let i = 1; i <= Math.min(pdf.numPages, 5); i++) { // Max 5 paginas por rendimiento
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map((item: any) => item.str).join(' ') + '\n';
        }
        rawContent = text;
      } else if (file.type.startsWith('image/')) {
        mode = 'image';
        imageData = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
            reader.readAsDataURL(file);
        });
      } else {
        throw new Error("Formato no soportado.");
      }

      // 2. Llamada a la IA
      const rawItems = await parseFinancialDocument(rawContent, mode, imageData);

      // 3. Normalización y Sanitización de Datos
      const normalizedItems = rawItems.map((raw: any) => {
          // Detectar moneda
          let currency: Currency = 'VES';
          const sym = (raw.original_currency_symbol || '').toUpperCase();
          if (sym.includes('$') || sym.includes('USD')) currency = 'USD';
          else if (sym.includes('EUR') || sym.includes('€')) currency = 'EUR';
          
          // Detectar tipo (Gasto vs Ingreso)
          const typeHint = (raw.type_hint || '').toLowerCase();
          const isAsset = typeHint.includes('deposit') || typeHint.includes('abono') || typeHint.includes('ingreso') || typeHint.includes('credit');
          const type = isAsset ? 'asset' : 'liability';

          // Detectar Categoría
          let category: Category = isAsset ? 'Bank' : 'Expense';
          const catHint = (raw.category_hint || raw.name || '').toLowerCase();
          
          if (isAsset) {
              if (catHint.includes('nomina') || catHint.includes('pago')) category = 'Income';
              else if (catHint.includes('binance') || catHint.includes('usdt')) category = 'Crypto';
          } else {
              if (catHint.includes('compra') || catHint.includes('supermercado')) category = 'Shopping';
              else if (catHint.includes('transferencia')) category = 'Expense';
          }

          return {
              name: raw.name || 'Movimiento sin nombre',
              amount: cleanNumber(raw.amount),
              currency,
              type,
              category,
              isMonthly: false
          };
      });

      setItems(normalizedItems);
      setStep('review');

    } catch (error) {
      console.error(error);
      alert("Hubo un error leyendo el archivo. Intenta con una imagen más clara o un excel más simple.");
      setStep('upload');
    }
  };

  const handleUpdateItem = (index: number, field: string, value: any) => {
      const newItems = [...items];
      newItems[index] = { ...newItems[index], [field]: value };
      
      // Auto-logic: Si cambio tipo a 'asset', categoria default a 'Bank'
      if (field === 'type') {
         if (value === 'asset') newItems[index].category = 'Bank';
         else newItems[index].category = 'Expense';
      }
      setItems(newItems);
  };

  const handleDeleteItem = (index: number) => {
      setItems(items.filter((_, i) => i !== index));
  };

  const handleConfirm = () => {
      onConfirm(items);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-blue-900 dark:bg-blue-950 p-4 flex justify-between items-center text-white shrink-0">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <UploadCloud size={20} />
            Importar Movimientos con IA
          </h3>
          <button onClick={onClose}><X size={24} /></button>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-6">
            
            {step === 'upload' && (
                <div 
                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-12 flex flex-col items-center justify-center text-center hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                        e.preventDefault();
                        if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
                    }}
                >
                    <input ref={fileInputRef} type="file" className="hidden" accept=".xlsx,.csv,.pdf,image/*" onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])} />
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full mb-4 text-blue-600 dark:text-blue-300">
                        <FileText size={48} />
                    </div>
                    <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Arrastra tu archivo aquí</h4>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
                        Soporta Excel, PDF (Estados de Cuenta) o Fotos de facturas.
                    </p>
                    <Button>Seleccionar Archivo</Button>
                </div>
            )}

            {step === 'processing' && (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <Loader2 size={48} className="text-blue-600 animate-spin" />
                    <p className="text-lg font-medium text-gray-700 dark:text-gray-200">Analizando documento...</p>
                    <p className="text-sm text-gray-500">Nuestra IA está detectando transacciones y limpiando los datos.</p>
                </div>
            )}

            {step === 'review' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <div>
                            <h4 className="font-bold text-blue-900 dark:text-blue-200">Revisión de Datos</h4>
                            <p className="text-xs text-blue-700 dark:text-blue-300">Verifica que los montos y categorías sean correctos antes de guardar.</p>
                        </div>
                        <div className="text-right">
                            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{items.length}</span>
                            <span className="text-xs text-gray-500 block uppercase font-bold">Items Detectados</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg max-h-[50vh]">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200 font-bold sticky top-0 z-10">
                                <tr>
                                    <th className="p-3">Descripción</th>
                                    <th className="p-3 w-32">Monto</th>
                                    <th className="p-3 w-24">Moneda</th>
                                    <th className="p-3 w-32">Tipo</th>
                                    <th className="p-3 w-40">Categoría</th>
                                    <th className="p-3 w-10 text-center"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
                                {items.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 group">
                                        <td className="p-2">
                                            <input 
                                                className="w-full bg-transparent border-none outline-none text-gray-800 dark:text-gray-200"
                                                value={item.name}
                                                onChange={(e) => handleUpdateItem(idx, 'name', e.target.value)}
                                            />
                                        </td>
                                        <td className="p-2">
                                            <input 
                                                type="number"
                                                className="w-full bg-transparent border-none outline-none font-mono text-right"
                                                value={item.amount}
                                                onChange={(e) => handleUpdateItem(idx, 'amount', parseFloat(e.target.value))}
                                            />
                                        </td>
                                        <td className="p-2">
                                            <select 
                                                className="w-full bg-transparent border-none outline-none text-xs font-bold"
                                                value={item.currency}
                                                onChange={(e) => handleUpdateItem(idx, 'currency', e.target.value)}
                                            >
                                                <option value="VES">Bs</option>
                                                <option value="USD">USD</option>
                                                <option value="EUR">EUR</option>
                                            </select>
                                        </td>
                                        <td className="p-2">
                                            <select 
                                                className={`w-full p-1 rounded text-xs font-bold border-none outline-none ${item.type === 'asset' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                                                value={item.type}
                                                onChange={(e) => handleUpdateItem(idx, 'type', e.target.value)}
                                            >
                                                <option value="asset">Ingreso (+)</option>
                                                <option value="liability">Gasto (-)</option>
                                            </select>
                                        </td>
                                        <td className="p-2">
                                            <select 
                                                className="w-full bg-transparent border-b border-gray-200 dark:border-gray-600 outline-none text-xs py-1"
                                                value={item.category}
                                                onChange={(e) => handleUpdateItem(idx, 'category', e.target.value)}
                                            >
                                                {item.type === 'asset' ? (
                                                    <>
                                                        <option value="Bank">Banco</option>
                                                        <option value="Income">Ingreso/Nómina</option>
                                                        <option value="Wallet">Billetera</option>
                                                        <option value="Crypto">Cripto</option>
                                                        <option value="Receivable">Cobranza</option>
                                                    </>
                                                ) : (
                                                    <>
                                                        <option value="Expense">Gasto General</option>
                                                        <option value="Shopping">Compra</option>
                                                        <option value="Debt">Pago Deuda</option>
                                                    </>
                                                )}
                                            </select>
                                        </td>
                                        <td className="p-2 text-center">
                                            <button 
                                                onClick={() => handleDeleteItem(idx)}
                                                className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <X size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>

        {/* Footer */}
        {step === 'review' && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-900/50">
                <Button variant="secondary" onClick={() => setStep('upload')}>Cancelar</Button>
                <Button onClick={handleConfirm} icon={<Check size={18} />}>
                    Guardar {items.length} Movimientos
                </Button>
            </div>
        )}
      </div>
    </div>
  );
};