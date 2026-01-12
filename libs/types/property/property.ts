import { PropertyBrand, PropertyCondition, PropertyLocation, PropertyStatus, PropertyType } from '../../enums/property.enum';
import { Member } from '../member/member';

export interface MeLiked {
	memberId: string;
	likeRefId: string;
	myFavorite: boolean;
}

export interface TotalCounter {
	total: number;
}

export interface Property {
	_id: string;
	propertyType: PropertyType;
	propertyStatus: PropertyStatus;
	propertyLocation: PropertyLocation;
	propertyCondition: PropertyCondition;
	propertyBrand: PropertyBrand;
	propertyAddress: string;
	propertyTitle: string;
	propertyPrice: number;
	propertyMileAge: number;
	propertyEngineCc: number;
	propertyBeds: number;
	propertyRooms: number;
	propertySquare: number;
	propertyYear: number;
	propertyViews: number;
	propertyLikes: number;
	propertyComments: number;
	propertyRank: number;
	propertyImages: string[];
	propertyDesc?: string;
	propertyBarter: boolean;
	propertyRent: boolean;
	memberId: string;
	soldAt?: Date;
	deletedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
	/** from aggregation **/
	meLiked?: MeLiked[];
	memberData?: Member;
}

export interface Properties {
	list: Property[];
	metaCounter: TotalCounter[];
}
