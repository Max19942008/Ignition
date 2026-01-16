import { PropertyLocation, PropertyStatus, PropertyType, PropertyBrand, PropertyCondition } from '../../enums/property.enum';
import { Direction } from '../../enums/common.enum';

export interface PropertyInput {
	propertyType: PropertyType;
	propertyLocation: PropertyLocation;
	 propertyBrand: PropertyBrand;
	 propertyCondition: PropertyCondition
	propertyAddress: string;
	propertyTitle: string;
	propertyPrice: number;
  propertyYear: number;
  propertyEngineCc: number;
	 propertyMileAge: number;
	propertyImages: string[];
	propertyDesc?: string;
	propertyBarter?: boolean;
	propertyRent?: boolean;
	memberId?: string;
	createdAt?: Date;
}

interface PISearch {
	memberId?: string;
	locationList?: PropertyLocation[];
	typeList?: PropertyType[];
	brandList?: PropertyBrand[];
	conditionList?: PropertyCondition[];
	roomsList?: number[];
	options?: string[];
	bedsList?: number[];
	pricesRange?: Range;
	periodsRange?: PeriodsRange;
	squaresRange?: Range;
	yearRange?: Range;
	text?: string;
}

export interface PropertiesInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: PISearch;
}

interface APISearch {
	propertyStatus?: PropertyStatus;
}

export interface AgentPropertiesInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: APISearch;
}

interface ALPISearch {
	propertyStatus?: PropertyStatus;
	propertyLocationList?: PropertyLocation[];
}

export interface AllPropertiesInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: ALPISearch;
}

interface Range {
	start: number;
	end: number;
}

interface PeriodsRange {
	start: Date | number;
	end: Date | number;
}
