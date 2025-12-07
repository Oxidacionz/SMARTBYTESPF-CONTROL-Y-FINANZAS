export const formatMoney = (amount: number, currency: string) => {
    if (currency === 'USD') return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    if (currency === 'EUR') return `€${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    return `Bs. ${amount.toLocaleString('es-VE', { minimumFractionDigits: 2 })}`;
};
