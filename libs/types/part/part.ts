import { Currency } from '../../enums/currency.enum';
import { PartBrand, PartCategory, PartCondition, PartLocation, PartStatus, PartType } from '../../enums/part.enum';
import { Member } from '../member/member';
import { MeLiked, TotalCounter } from '../property/property';

export interface Part {
	_id: string;
	partCategory: PartCategory;
	partType: PartType;
	partStatus: PartStatus;
	partLocation: PartLocation;
	partBrand: PartBrand;
	partCondition: PartCondition;
	partTitle: string;
	partPrice: number;
	partCurrency: Currency;
	partStockCount: number;
	partCompatibleBrands?: PartBrand[];
	partViews: number;
	partLikes: number;
	partComments: number;
	partRank: number;
	partImages: string[];
	partDesc?: string;
	partBarter: boolean;
	memberId: string;
	soldAt?: Date;
	deletedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
	/** from aggregation **/
	meLiked?: MeLiked[];
	meInterested?: MePartInterested[];
	memberData?: Member;
}

/** Carries one entry once this member has told the seller they want the part. */
export interface MePartInterested {
	memberId: string;
	partId: string;
	myInterest: boolean;
}

export interface Parts {
	list: Part[];
	metaCounter: TotalCounter[];
}
