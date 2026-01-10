import React, { ChangeEvent, MouseEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import { Box, Button, Menu, MenuItem, Pagination, Stack, Typography } from '@mui/material';
import PropertyCard from '../../libs/components/property/PropertyCard';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { useRouter } from 'next/router';
import { PropertiesInquiry } from '../../libs/types/property/property.input';
import { Property } from '../../libs/types/property/property';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Direction } from '../../libs/enums/common.enum';
import { PropertyLocation, PropertyType, PropertyBrand, PropertyCondition } from '../../libs/enums/property.enum';
import { propertyYears } from '../../libs/config';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const PropertyList: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const [searchFilter, setSearchFilter] = useState<PropertiesInquiry>(
		router?.query?.input ? JSON.parse(router?.query?.input as string) : initialInput,
	);
	const [properties, setProperties] = useState<Property[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [sortingOpen, setSortingOpen] = useState(false);
	const [filterSortName, setFilterSortName] = useState('New');
	const [brandAnchor, setBrandAnchor] = useState<null | HTMLElement>(null);
	const [locationAnchor, setLocationAnchor] = useState<null | HTMLElement>(null);
	const [typeAnchor, setTypeAnchor] = useState<null | HTMLElement>(null);
	const [conditionAnchor, setConditionAnchor] = useState<null | HTMLElement>(null);
	const [yearAnchor, setYearAnchor] = useState<null | HTMLElement>(null);
	const [priceAnchor, setPriceAnchor] = useState<null | HTMLElement>(null);
	const [likesAnchor, setLikesAnchor] = useState<null | HTMLElement>(null);

	/** APOLLO REQUESTS **/

	/** LIFECYCLES **/
	useEffect(() => {
		if (router.query.input) {
			try {
				const inputObj = JSON.parse(router?.query?.input as string);
				// Faqat agar o'zgarish bo'lsa yangilash
				if (JSON.stringify(inputObj) !== JSON.stringify(searchFilter)) {
					setSearchFilter(inputObj);
					setCurrentPage(inputObj.page === undefined ? 1 : inputObj.page);
				}
			} catch (err) {
				console.error('Error parsing router query:', err);
			}
		} else {
			// Agar query bo'lmasa, initialInput'ni ishlat
			if (JSON.stringify(initialInput) !== JSON.stringify(searchFilter)) {
				setSearchFilter(initialInput);
				setCurrentPage(initialInput.page === undefined ? 1 : initialInput.page);
			}
		}
	}, [router.query.input]);

	/** HANDLERS **/
	const handlePaginationChange = async (event: ChangeEvent<unknown>, value: number) => {
		searchFilter.page = value;
		await router.push(
			`/property?input=${JSON.stringify(searchFilter)}`,
			`/property?input=${JSON.stringify(searchFilter)}`,
			{
				scroll: false,
			},
		);
		setCurrentPage(value);
	};

	const sortingClickHandler = (e: MouseEvent<HTMLElement>) => {
		setAnchorEl(e.currentTarget);
		setSortingOpen(true);
	};

	const sortingCloseHandler = () => {
		setSortingOpen(false);
		setAnchorEl(null);
	};

	const sortingHandler = async (e: React.MouseEvent<HTMLLIElement>) => {
		let newFilter = { ...searchFilter };
		switch (e.currentTarget.id) {
			case 'new':
				newFilter = { ...searchFilter, sort: 'createdAt', direction: Direction.DESC };
				setFilterSortName('New');
				break;
			case 'lowest':
				newFilter = { ...searchFilter, sort: 'propertyPrice', direction: Direction.ASC };
				setFilterSortName('Lowest Price');
				break;
			case 'highest':
				newFilter = { ...searchFilter, sort: 'propertyPrice', direction: Direction.DESC };
				setFilterSortName('Highest Price');
				break;
		}
		setSearchFilter(newFilter);
		setSortingOpen(false);
		setAnchorEl(null);
		
		// Router query'ni yangilash
		await router.push(
			`/property?input=${JSON.stringify(newFilter)}`,
			`/property?input=${JSON.stringify(newFilter)}`,
			{ scroll: false },
		);
	};

	const handleReset = async () => {
		await router.push(
			`/property?input=${JSON.stringify(initialInput)}`,
			`/property?input=${JSON.stringify(initialInput)}`,
			{ scroll: false },
		);
	};

	const handleLocationSelect = async (location: PropertyLocation) => {
		const currentLocations = searchFilter?.search?.locationList || [];
		const newLocations = currentLocations.includes(location)
			? currentLocations.filter((l) => l !== location)
			: [...currentLocations, location];

		const newSearch = { ...searchFilter };
		if (newLocations.length === 0) {
			delete newSearch.search.locationList;
		} else {
			newSearch.search = { ...newSearch.search, locationList: newLocations };
		}

		await router.push(
			`/property?input=${JSON.stringify(newSearch)}`,
			`/property?input=${JSON.stringify(newSearch)}`,
			{ scroll: false },
		);
		setLocationAnchor(null);
	};

	const handleTypeSelect = async (type: PropertyType) => {
		const currentTypes = searchFilter?.search?.typeList || [];
		const newTypes = currentTypes.includes(type)
			? currentTypes.filter((t) => t !== type)
			: [...currentTypes, type];

		const newSearch = { ...searchFilter };
		if (newTypes.length === 0) {
			delete newSearch.search.typeList;
		} else {
			newSearch.search = { ...newSearch.search, typeList: newTypes };
		}

		await router.push(
			`/property?input=${JSON.stringify(newSearch)}`,
			`/property?input=${JSON.stringify(newSearch)}`,
			{ scroll: false },
		);
		setTypeAnchor(null);
	};

	const handleLikesSort = async (direction: Direction) => {
		const newSearch = {
			...searchFilter,
			sort: 'propertyLikes',
			direction: direction,
		};

		await router.push(
			`/property?input=${JSON.stringify(newSearch)}`,
			`/property?input=${JSON.stringify(newSearch)}`,
			{ scroll: false },
		);
		setLikesAnchor(null);
	};

	const handleBrandSelect = async (brand: PropertyBrand) => {
		const currentBrands = searchFilter?.search?.brandList || [];
		const newBrands = currentBrands.includes(brand)
			? currentBrands.filter((b) => b !== brand)
			: [...currentBrands, brand];

		const newSearch = { ...searchFilter };
		if (newBrands.length === 0) {
			delete newSearch.search.brandList;
		} else {
			newSearch.search = { ...newSearch.search, brandList: newBrands };
		}

		await router.push(
			`/property?input=${JSON.stringify(newSearch)}`,
			`/property?input=${JSON.stringify(newSearch)}`,
			{ scroll: false },
		);
		setBrandAnchor(null);
	};

	const handleConditionSelect = async (condition: PropertyCondition) => {
		const currentConditions = searchFilter?.search?.conditionList || [];
		const newConditions = currentConditions.includes(condition)
			? currentConditions.filter((c) => c !== condition)
			: [...currentConditions, condition];

		const newSearch = { ...searchFilter };
		if (newConditions.length === 0) {
			delete newSearch.search.conditionList;
		} else {
			newSearch.search = { ...newSearch.search, conditionList: newConditions };
		}

		await router.push(
			`/property?input=${JSON.stringify(newSearch)}`,
			`/property?input=${JSON.stringify(newSearch)}`,
			{ scroll: false },
		);
		setConditionAnchor(null);
	};

	const handleYearSelect = async (year: string, type: 'start' | 'end') => {
		const currentRange = searchFilter?.search?.yearRange || { start: 1970, end: new Date().getFullYear() };
		const yearNum = parseInt(year);

		const newRange = {
			...currentRange,
			[type]: yearNum,
		};

		// Ensure start <= end
		if (type === 'start' && newRange.end < yearNum) {
			newRange.end = yearNum;
		} else if (type === 'end' && newRange.start > yearNum) {
			newRange.start = yearNum;
		}

		const newSearch = {
			...searchFilter,
			search: {
				...searchFilter.search,
				yearRange: newRange,
			},
		};

		await router.push(
			`/property?input=${JSON.stringify(newSearch)}`,
			`/property?input=${JSON.stringify(newSearch)}`,
			{ scroll: false },
		);
		setYearAnchor(null);
	};

	const handlePriceRangeSelect = async (price: string, type: 'start' | 'end') => {
		const currentRange = searchFilter?.search?.pricesRange || { start: 0, end: 2000000 };
		const priceNum = parseInt(price);

		const newRange = {
			...currentRange,
			[type]: priceNum,
		};

		// Ensure start <= end
		if (type === 'start' && newRange.end < priceNum) {
			newRange.end = priceNum;
		} else if (type === 'end' && newRange.start > priceNum) {
			newRange.start = priceNum;
		}

		const newSearch = {
			...searchFilter,
			search: {
				...searchFilter.search,
				pricesRange: newRange,
			},
		};

		await router.push(
			`/property?input=${JSON.stringify(newSearch)}`,
			`/property?input=${JSON.stringify(newSearch)}`,
			{ scroll: false },
		);
		setPriceAnchor(null);
	};

	if (device === 'mobile') {
		return <h1>PROPERTIES MOBILE</h1>;
	} else {
		const propertyLocations = Object.values(PropertyLocation);
		const propertyTypes = Object.values(PropertyType);
		const propertyBrands = Object.values(PropertyBrand);
		const propertyConditions = Object.values(PropertyCondition);
		
		const selectedBrand = (searchFilter?.search?.brandList || []).length > 0 
			? `${(searchFilter.search.brandList || []).length} selected` 
			: 'Brand';
		const selectedType = (searchFilter?.search?.typeList || []).length > 0 
			? `${(searchFilter.search.typeList || []).length} selected` 
			: 'Type';
		const selectedCondition = (searchFilter?.search?.conditionList || []).length > 0 
			? `${(searchFilter.search.conditionList || []).length} selected` 
			: 'Condition';
		const selectedLocation = (searchFilter?.search?.locationList || []).length > 0 
			? `${(searchFilter.search.locationList || []).length} selected` 
			: 'Location';
		const selectedYear = searchFilter?.search?.yearRange
			? `${searchFilter.search.yearRange.start || 1970} - ${searchFilter.search.yearRange.end || new Date().getFullYear()}`
			: 'Year';
		const selectedPrice = searchFilter?.search?.pricesRange
			? `$${(searchFilter.search.pricesRange.start || 0).toLocaleString()} - $${(searchFilter.search.pricesRange.end || 0).toLocaleString()}`
			: 'Price/day';

		return (
			<div id="property-list-page" style={{ position: 'relative' }}>
				<div className="container">
					{/* Filter Header Section */}
					<Stack className={'filter-header-section'}>
						{/* Top Row - Title, Count, Reset, Likes */}
						<Stack className={'filter-header-top'}>
							<Box className={'filter-header-left'}>
								<Typography className={'filter-header-title'}>Bikes</Typography>
								<Typography className={'filter-header-count'}>{total} available</Typography>
							</Box>
							<Box className={'filter-header-right'}>
								<Button
									className={'filter-reset-button'}
									startIcon={<FilterListIcon />}
									onClick={handleReset}
								>
									Reset
								</Button>
								<Button
									className={'filter-likes-button'}
									endIcon={<KeyboardArrowDownRoundedIcon />}
									onClick={(e) => setLikesAnchor(e.currentTarget)}
								>
									Likes
								</Button>
								<Menu
									anchorEl={likesAnchor}
									open={Boolean(likesAnchor)}
									onClose={() => setLikesAnchor(null)}
								>
									<MenuItem onClick={() => handleLikesSort(Direction.DESC)}>Most Liked</MenuItem>
									<MenuItem onClick={() => handleLikesSort(Direction.ASC)}>Least Liked</MenuItem>
								</Menu>
							</Box>
						</Stack>

						{/* Filter Row */}
						<Stack className={'filter-header-row'}>
							{/* Brand Filter */}
							<Button
								className={'filter-dropdown-button'}
								endIcon={<KeyboardArrowDownRoundedIcon />}
								onClick={(e) => setBrandAnchor(e.currentTarget)}
							>
								{selectedBrand}
							</Button>
							<Menu
								anchorEl={brandAnchor}
								open={Boolean(brandAnchor)}
								onClose={() => setBrandAnchor(null)}
								PaperProps={{ style: { maxHeight: 300, width: 200 } }}
							>
								{propertyBrands.map((brand) => (
									<MenuItem
										key={brand}
										onClick={() => handleBrandSelect(brand)}
										selected={(searchFilter?.search?.brandList || []).includes(brand)}
									>
										{brand}
									</MenuItem>
								))}
							</Menu>

							{/* Type Filter */}
							<Button
								className={'filter-dropdown-button'}
								endIcon={<KeyboardArrowDownRoundedIcon />}
								onClick={(e) => setTypeAnchor(e.currentTarget)}
							>
								{selectedType}
							</Button>
							<Menu
								anchorEl={typeAnchor}
								open={Boolean(typeAnchor)}
								onClose={() => setTypeAnchor(null)}
								PaperProps={{ style: { maxHeight: 300, width: 200 } }}
							>
								{propertyTypes.map((type) => (
									<MenuItem
										key={type}
										onClick={() => handleTypeSelect(type)}
										selected={(searchFilter?.search?.typeList || []).includes(type)}
									>
										{type}
									</MenuItem>
								))}
							</Menu>

							{/* Condition Filter */}
							<Button
								className={'filter-dropdown-button'}
								endIcon={<KeyboardArrowDownRoundedIcon />}
								onClick={(e) => setConditionAnchor(e.currentTarget)}
							>
								{selectedCondition}
							</Button>
							<Menu
								anchorEl={conditionAnchor}
								open={Boolean(conditionAnchor)}
								onClose={() => setConditionAnchor(null)}
								PaperProps={{ style: { maxHeight: 300, width: 200 } }}
							>
								{propertyConditions.map((condition) => (
									<MenuItem
										key={condition}
										onClick={() => handleConditionSelect(condition)}
										selected={(searchFilter?.search?.conditionList || []).includes(condition)}
									>
										{condition}
									</MenuItem>
								))}
							</Menu>

							{/* Location Filter */}
							<Button
								className={'filter-dropdown-button'}
								endIcon={<KeyboardArrowDownRoundedIcon />}
								onClick={(e) => setLocationAnchor(e.currentTarget)}
							>
								{selectedLocation}
							</Button>
							<Menu
								anchorEl={locationAnchor}
								open={Boolean(locationAnchor)}
								onClose={() => setLocationAnchor(null)}
								PaperProps={{ style: { maxHeight: 300, width: 200 } }}
							>
								{propertyLocations.map((location) => (
									<MenuItem
										key={location}
										onClick={() => handleLocationSelect(location)}
										selected={(searchFilter?.search?.locationList || []).includes(location)}
									>
										{location}
									</MenuItem>
								))}
							</Menu>

							{/* Year Filter */}
							<Button
								className={'filter-dropdown-button'}
								endIcon={<KeyboardArrowDownRoundedIcon />}
								onClick={(e) => setYearAnchor(e.currentTarget)}
							>
								{selectedYear}
							</Button>
							<Menu
								anchorEl={yearAnchor}
								open={Boolean(yearAnchor)}
								onClose={() => setYearAnchor(null)}
								PaperProps={{ style: { maxHeight: 400, width: 200 } }}
							>
								<Typography sx={{ px: 2, py: 1, fontWeight: 600, fontSize: '12px', color: '#717171' }}>
									From Year
								</Typography>
								{propertyYears.slice().reverse().map((year) => (
									<MenuItem
										key={`start-${year}`}
										onClick={() => handleYearSelect(year, 'start')}
										selected={searchFilter?.search?.yearRange?.start === parseInt(year)}
									>
										{year}
									</MenuItem>
								))}
								<Typography sx={{ px: 2, py: 1, fontWeight: 600, fontSize: '12px', color: '#717171', mt: 1, borderTop: '1px solid #eee' }}>
									To Year
								</Typography>
								{propertyYears.slice().reverse().map((year) => (
									<MenuItem
										key={`end-${year}`}
										onClick={() => handleYearSelect(year, 'end')}
										selected={searchFilter?.search?.yearRange?.end === parseInt(year)}
									>
										{year}
									</MenuItem>
								))}
							</Menu>

							{/* Price Filter */}
							<Button
								className={'filter-dropdown-button'}
								endIcon={<KeyboardArrowDownRoundedIcon />}
								onClick={(e) => setPriceAnchor(e.currentTarget)}
							>
								{selectedPrice}
							</Button>
							<Menu
								anchorEl={priceAnchor}
								open={Boolean(priceAnchor)}
								onClose={() => setPriceAnchor(null)}
								PaperProps={{ style: { maxHeight: 400, width: 200 } }}
							>
								<Typography sx={{ px: 2, py: 1, fontWeight: 600, fontSize: '12px', color: '#717171' }}>
									Min Price ($)
								</Typography>
								{[0, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000].map((price) => (
									<MenuItem
										key={`start-${price}`}
										onClick={() => handlePriceRangeSelect(price.toString(), 'start')}
										selected={searchFilter?.search?.pricesRange?.start === price}
									>
										${price.toLocaleString()}
									</MenuItem>
								))}
								<Typography sx={{ px: 2, py: 1, fontWeight: 600, fontSize: '12px', color: '#717171', mt: 1, borderTop: '1px solid #eee' }}>
									Max Price ($)
								</Typography>
								{[500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000, 500000].map((price) => (
									<MenuItem
										key={`end-${price}`}
										onClick={() => handlePriceRangeSelect(price.toString(), 'end')}
										selected={searchFilter?.search?.pricesRange?.end === price}
									>
										${price.toLocaleString()}
									</MenuItem>
								))}
							</Menu>

							{/* Reset Button */}
							<Button
								className={'filter-reset-row-button'}
								startIcon={<RefreshIcon />}
								onClick={handleReset}
							>
								Reset
							</Button>
						</Stack>
					</Stack>

					<Stack className={'property-page'}>
						<Stack className="main-config" mb={'76px'}>
							<Stack className={'list-config'}>
								{properties.map((property: Property) => {
									return <PropertyCard property={property} key={property?._id} />;
								})}
							</Stack>
							<Stack className="pagination-config">
								{properties.length !== 0 && (
									<Stack className="pagination-box">
										<Pagination
											page={currentPage}
											count={Math.ceil(total / searchFilter.limit)}
											onChange={handlePaginationChange}
											shape="circular"
											color="primary"
										/>
									</Stack>
								)}

								{properties.length !== 0 && (
									<Stack className="total-result">
										<Typography>
											Total {total} propert{total > 1 ? 'ies' : 'y'} available
										</Typography>
									</Stack>
								)}
							</Stack>
							{properties?.length === 0 && (
								<Stack className={'no-data'}>
									<img src="/img/icons/icoAlert.svg" alt="" />
									<p>No Properties found!</p>
								</Stack>
							)}
						</Stack>
					</Stack>
				</div>
			</div>
		);
	}
};

PropertyList.defaultProps = {
	initialInput: {
		page: 1,
		limit: 9,
		sort: 'createdAt',
		direction: 'DESC',
		search: {
			squaresRange: {
				start: 0,
				end: 500,
			},
			pricesRange: {
				start: 0,
				end: 2000000,
			},
		},
	},
};

export default withLayoutBasic(PropertyList);
