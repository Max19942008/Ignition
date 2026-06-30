import { PartBrand, PartCategory, PartCondition, PartLocation, PartStatus, PartType } from '../../enums/part.enum';
import { Direction } from '../../enums/common.enum';

export interface PartInput {
	partCategory: PartCategory;
	partType: PartType;
	partLocation: PartLocation;
	partBrand: PartBrand;
	partCondition: PartCondition;
	partTitle: string;
	partPrice: number;
	partStockCount?: number;
	partCompatibleBrands?: PartBrand[];
	partImages: string[];
	partDesc?: string;
	partBarter?: boolean;
	memberId?: string;
	createdAt?: Date;
}

interface PartISearch {
	memberId?: string;
	categoryList?: PartCategory[];
	typeList?: PartType[];
	locationList?: PartLocation[];
	brandList?: PartBrand[];
	conditionList?: PartCondition[];
	options?: string[];
	pricesRange?: Range;
	periodsRange?: PeriodsRange;
	stockRange?: Range;
	text?: string;
}

export interface PartsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: PartISearch;
}

interface APartISearch {
	partStatus?: PartStatus;
}

export interface AgentPartsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: APartISearch;
}

interface ALPartISearch {
	partStatus?: PartStatus;
	partLocationList?: PartLocation[];
	partCategoryList?: PartCategory[];
}

export interface AllPartsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: ALPartISearch;
}

interface Range {
	start: number;
	end: number;
}

interface PeriodsRange {
	start: Date | number;
	end: Date | number;
}
