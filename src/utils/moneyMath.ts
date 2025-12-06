import Decimal from 'decimal.js';

export const MoneyMath = {
    /**
     * Safe addition
     */
    add: (a: number, b: number): number => {
        return new Decimal(a).plus(b).toNumber();
    },

    /**
     * Safe subtraction
     */
    subtract: (a: number, b: number): number => {
        return new Decimal(a).minus(b).toNumber();
    },

    /**
     * Safe multiplication
     */
    multiply: (a: number, b: number): number => {
        return new Decimal(a).times(b).toNumber();
    },

    /**
     * Safe division
     */
    divide: (a: number, b: number): number => {
        if (b === 0) return 0;
        return new Decimal(a).dividedBy(b).toNumber();
    },

    /**
     * Sum an array of numbers
     */
    sum: (numbers: number[]): number => {
        return numbers.reduce((acc, curr) => new Decimal(acc).plus(curr).toNumber(), 0);
    },

    /**
     * Convert currency with precise rate
     */
    convert: (amount: number, rate: number): number => {
        if (!rate || rate === 0) return 0;
        // amount / rate
        return new Decimal(amount).dividedBy(rate).toNumber();
    }
};
