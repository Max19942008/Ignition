export enum Currency {
	USD = 'USD',
	KRW = 'KRW',
	UZS = 'UZS',
}

/**
 * How each currency is written. Dollar and won lead with the symbol; so'm
 * follows the amount, which is how prices are written in Uzbekistan.
 */
export const CURRENCY_META: Record<Currency, { symbol: string; suffix: boolean; label: string }> = {
	[Currency.USD]: { symbol: '$', suffix: false, label: 'USD ($)' },
	[Currency.KRW]: { symbol: '₩', suffix: false, label: 'KRW (₩)' },
	[Currency.UZS]: { symbol: "so'm", suffix: true, label: "UZS (so'm)" },
};
