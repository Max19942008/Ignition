import numeral from 'numeral';
import { sweetMixinErrorAlert } from './sweetAlert';
import { Currency, CURRENCY_META } from './enums/currency.enum';

export const formatterStr = (value: number | undefined): string => {
	return numeral(value).format('0,0') != '0' ? numeral(value).format('0,0') : '';
};

/**
 * Renders a price in the currency the seller entered it in. Falls back to USD
 * for listings created before currencies existed.
 */
export const formatPrice = (value: number | undefined | null, currency?: Currency | string | null): string => {
	const amount = numeral(value ?? 0).format('0,0');
	const meta = CURRENCY_META[(currency as Currency) ?? Currency.USD] ?? CURRENCY_META[Currency.USD];
	return meta.suffix ? `${amount} ${meta.symbol}` : `${meta.symbol}${amount}`;
};

export const likeTargetPropertyHandler = async (likeTargetProperty: any, id: string) => {
	try {
		await likeTargetProperty({
			variables: {
				input: id,
			},
		});
	} catch (err: any) {
		console.log('ERROR, likeTargetPropertyHandler:', err.message);
		sweetMixinErrorAlert(err.message).then();
	}
};

export const likeTargetBoardArticleHandler = async (likeTargetBoardArticle: any, id: string) => {
	try {
		await likeTargetBoardArticle({
			variables: {
				input: id,
			},
		});
	} catch (err: any) {
		console.log('ERROR, likeTargetBoardArticleHandler:', err.message);
		sweetMixinErrorAlert(err.message).then();
	}
};

export const likeTargetMemberHandler = async (likeTargetMember: any, id: string) => {
	try {
		await likeTargetMember({
			variables: {
				input: id,
			},
		});
	} catch (err: any) {
		console.log('ERROR, likeTargetMemberHandler:', err.message);
		sweetMixinErrorAlert(err.message).then();
	}
};
