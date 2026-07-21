
export enum PartCategory {
	SPARE_PART = 'SPARE_PART',
	ACCESSORY = 'ACCESSORY',
}

export enum PartType {
	// --- SPARE PARTS ---
	ENGINE = 'ENGINE',
	EXHAUST = 'EXHAUST',
	BRAKE = 'BRAKE',
	SUSPENSION = 'SUSPENSION',
	TIRE = 'TIRE',
	BATTERY = 'BATTERY',
	FILTER = 'FILTER',
	CHAIN = 'CHAIN',
	ELECTRICAL = 'ELECTRICAL',
	BODY_PANEL = 'BODY_PANEL',
	// --- ACCESSORIES ---
	HELMET = 'HELMET',
	GLOVES = 'GLOVES',
	JACKET = 'JACKET',
	BOOTS = 'BOOTS',
	LUGGAGE = 'LUGGAGE',
	PHONE_MOUNT = 'PHONE_MOUNT',
	COVER = 'COVER',
	// --- FALLBACK ---
	OTHER = 'OTHER',
}

/** Types that belong to spare parts only */
export const SPARE_PART_TYPES: PartType[] = [
	PartType.ENGINE,
	PartType.EXHAUST,
	PartType.BRAKE,
	PartType.SUSPENSION,
	PartType.TIRE,
	PartType.BATTERY,
	PartType.FILTER,
	PartType.CHAIN,
	PartType.ELECTRICAL,
	PartType.BODY_PANEL,
	PartType.OTHER,
];

/** Types that belong to accessories only */
export const ACCESSORY_TYPES: PartType[] = [
	PartType.HELMET,
	PartType.GLOVES,
	PartType.JACKET,
	PartType.BOOTS,
	PartType.LUGGAGE,
	PartType.PHONE_MOUNT,
	PartType.COVER,
	PartType.OTHER,
];

/** Returns the type list valid for a given category (all types when none). */
export const getPartTypesByCategory = (category?: PartCategory | null): PartType[] => {
	if (category === PartCategory.ACCESSORY) return ACCESSORY_TYPES;
	if (category === PartCategory.SPARE_PART) return SPARE_PART_TYPES;
	return Object.values(PartType);
};

export enum PartCondition {
	NEW = 'NEW',
	USED = 'USED',
	REFURBISHED = 'REFURBISHED',
}

export enum PartBrand {
	SUZUKI = 'SUZUKI',
	HONDA = 'HONDA',
	YAMAHA = 'YAMAHA',
	KAWASAKI = 'KAWASAKI',
	DUCATI = 'DUCATI',
	BMW = 'BMW',
	HARLEY_DAVIDSON = 'HARLEY_DAVIDSON',
	UNIVERSAL = 'UNIVERSAL',
	OTHER = 'OTHER',
}

export enum PartStatus {
	HOLD = 'HOLD',
	ACTIVE = 'ACTIVE',
	SOLD = 'SOLD',
	DELETE = 'DELETE',
}

export enum PartLocation {
	TASHKENT = 'TASHKENT',
	ANDIJAN = 'ANDIJAN',
	BUKHARA = 'BUKHARA',
	FERGANA = 'FERGANA',
	JIZZAKH = 'JIZZAKH',
	KHOREZM = 'KHOREZM',
	NAMANGAN = 'NAMANGAN',
	NAVOI = 'NAVOI',
	KASHKADARYA = 'KASHKADARYA',
	SAMARKAND = 'SAMARKAND',
	SIRDARYA = 'SIRDARYA',
	SURKHANDARYA = 'SURKHANDARYA',
	KARAKALPAKSTAN = 'KARAKALPAKSTAN',
}
