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
	memberData?: Member;
}

export interface Parts {
	list: Part[];
	metaCounter: TotalCounter[];
}
