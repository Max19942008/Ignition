import { PartBrand, PartCategory, PartCondition, PartLocation, PartStatus, PartType } from '../../enums/part.enum';

export interface PartUpdate {
	_id: string;
	partCategory?: PartCategory;
	partType?: PartType;
	partStatus?: PartStatus;
	partLocation?: PartLocation;
	partBrand?: PartBrand;
	partCondition?: PartCondition;
	partTitle?: string;
	partPrice?: number;
	partStockCount?: number;
	partCompatibleBrands?: PartBrand[];
	partImages?: string[];
	partDesc?: string;
	partBarter?: boolean;
	soldAt?: Date;
	deletedAt?: Date;
}
