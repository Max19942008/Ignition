import { PropertyLocation, PropertyStatus, PropertyType, PropertyBrand, PropertyCondition } from '../../enums/property.enum';

export interface PropertyUpdate {
	_id: string;
	propertyType?: PropertyType;
	propertyStatus?: PropertyStatus;
	propertyLocation?: PropertyLocation;
	propertyBrand?: PropertyBrand;
	propertyCondition?: PropertyCondition;
	propertyAddress?: string;
	propertyTitle?: string;
	propertyPrice?: number;
	propertyYear?: number;
	propertyEngineCc?: number;
	propertyMileAge?: number;
	propertySquare?: number;
	propertyBeds?: number;
	propertyRooms?: number;
	propertyImages?: string[];
	propertyDesc?: string;
	propertyBarter?: boolean;
	propertyRent?: boolean;
	soldAt?: Date;
	deletedAt?: Date;
	constructedAt?: Date;
}
