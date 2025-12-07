import React from 'react';
import { FinancialItem, Currency } from '../../types';
import { Card } from '../atoms/Card';
import { Button } from '../atoms/Button';
import { Clock, TrendingUp, Edit, Trash2 } from 'lucide-react';
import { formatMoney } from '../../utils/formatters';

interface FinancialItemListProps {
    items: FinancialItem[];
    type: 'asset' | 'liability';
    toUSD: (item: { amount: number; currency: Currency; customExchangeRate?: number }) => number;
    onSettlingDebt?: (item: FinancialItem) => void;
    onEdit: (item: FinancialItem) => void;
    onDelete: (id: string) => void;
}

export const FinancialItemList: React.FC<FinancialItemListProps> = ({
    items,
    type,
    toUSD,
    onSettlingDebt,
    onEdit,
    onDelete
}) => {
    const filteredItems = items.filter(i => i.type === type);

    return (
        <Card className="overflow-hidden">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200">
                    <tr>
                        <th className="p-3">Concepto / Entidad</th>
                        <th className="p-3 text-right">Monto</th>
                        <th className="p-3 text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {filteredItems.map(item => (
                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="p-3 font-medium text-gray-900 dark:text-white">
                                <div className="flex flex-col">
                                    <span>{item.name}</span>
                                    <div className="flex flex-wrap gap-1 mt-0.5">
                                        <span className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-500 px-1 rounded">{item.category}</span>
                                        {item.target_date && (
                                            <span className="text-[10px] bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 px-1 rounded flex items-center gap-0.5">
                                                <Clock size={8} /> {item.target_date}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </td>
                            <td className="p-3 text-right">
                                <div className="font-mono font-bold text-gray-800 dark:text-gray-200">{formatMoney(item.amount, item.currency)}</div>
                                <div className="text-[10px] text-gray-400">~${toUSD(item).toFixed(2)}</div>
                            </td>
                            <td className="p-3 flex justify-end gap-1">
                                {(item.category === 'Debt' || item.category === 'Receivable') && onSettlingDebt && (
                                    <Button size="sm" variant="secondary" className="px-2" onClick={() => onSettlingDebt(item)} icon={<TrendingUp size={14} />} />
                                )}
                                <Button size="sm" variant="ghost" className="px-2" onClick={() => onEdit(item)} icon={<Edit size={14} />} />
                                <Button size="sm" variant="ghost" className="px-2 hover:text-red-500" onClick={() => onDelete(item.id)} icon={<Trash2 size={14} />} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Card>
    );
};
