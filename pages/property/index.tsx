import React, { ChangeEvent, MouseEvent, useEffect, useState, useCallback } from 'react';
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
import { Direction, Message } from '../../libs/enums/common.enum';
import { PropertyLocation, PropertyType, PropertyBrand, PropertyCondition } from '../../libs/enums/property.enum';
import { propertyYears } from '../../libs/config';
import { GET_PROPERTIES } from '../../apollo/user/query';
import { useMutation, useQuery } from '@apollo/client';
import { T } from '../../libs/types/common';
import { LIKE_TARGET_PROPERTY } from '../../apollo/user/mutation';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';

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
	// Backend schema'ga moslash uchun yearRange va pricesRange'ni olib tashlash
	const sanitizedSearchFilter = useCallback(() => {
		const sanitized = { ...searchFilter };
		if (sanitized.search) {
			const { yearRange, pricesRange, ...restSearch } = sanitized.search;
			sanitized.search = restSearch;
		}
		return sanitized;
	}, [searchFilter]);

	/** APOLLO REQUESTS **/
		const [likeTargetProperty] = useMutation(LIKE_TARGET_PROPERTY)

	const {
		loading: getPropertiesLoading,
		data: getPropertiesData,
		error: getPropertiesError,
		refetch: getPropertiesRefetch,
	} = useQuery(GET_PROPERTIES, {
		fetchPolicy: 'network-only',
		variables: { input: sanitizedSearchFilter() },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setProperties(data?.getProperties?.list || []);
			setTotal(data?.getProperties?.metaCounter?.[0]?.total || 0);
		},
	});

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

	useEffect(() => {
		if (searchFilter) {
			const sanitized = sanitizedSearchFilter();
			getPropertiesRefetch({ input: sanitized });
		}
	}, [searchFilter, sanitizedSearchFilter, getPropertiesRefetch]);

	/** HANDLERS **/

		const likePropertyHandler = async (user: T, id:string) => {
			try {
				if(!id) return;
				if(!user._id) throw new Error(Message.NOT_AUTHENTICATED)
			await likeTargetProperty({
				variables: {input:id}, 
			});
			 await getPropertiesRefetch({input: initialInput})
	
			 await sweetTopSmallSuccessAlert("success", 800);
	
			} catch(err: any) {
			console.log("ERROR likePropertyHandler:", err.message);
			sweetMixinErrorAlert(err.message).then();
			}
		};

	const handlePaginationChange = useCallback(
		async (event: ChangeEvent<unknown>, value: number) => {
			const newFilter = { ...searchFilter, page: value };
			setSearchFilter(newFilter);
			await router.push(
				`/property?input=${JSON.stringify(newFilter)}`,
				`/property?input=${JSON.stringify(newFilter)}`,
				{
					scroll: false,
				},
			);
			setCurrentPage(value);
		},
		[searchFilter, router],
	);

	const sortingClickHandler = (e: MouseEvent<HTMLElement>) => {
		setAnchorEl(e.currentTarget);
		setSortingOpen(true);
	};

	const sortingCloseHandler = () => {
		setSortingOpen(false);
		setAnchorEl(null);
	};

	const sortingHandler = useCallback(
		async (e: React.MouseEvent<HTMLLIElement>) => {
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
		},
		[searchFilter, router],
	);

	const handleReset = useCallback(
		async () => {
			setSearchFilter(initialInput);
			setCurrentPage(initialInput.page === undefined ? 1 : initialInput.page);
			await router.push(
				`/property?input=${JSON.stringify(initialInput)}`,
				`/property?input=${JSON.stringify(initialInput)}`,
				{ scroll: false },
			);
		},
		[initialInput, router],
	);

	const handleLocationSelect = useCallback(
		async (location: PropertyLocation) => {
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
		},
		[searchFilter, router],
	);

	const handleTypeSelect = useCallback(
		async (type: PropertyType) => {
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
		},
		[searchFilter, router],
	);

	const handleLikesSort = useCallback(
		async (direction: Direction) => {
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
		},
		[searchFilter, router],
	);

	// Filter.tsx dan sorting handlerlarni olish
	const recentSortHandler = useCallback(
		async () => {
			try {
				const newSearch = {
					...searchFilter,
					sort: 'createdAt',
					direction: Direction.DESC,
				};
				await router.push(
					`/property?input=${JSON.stringify(newSearch)}`,
					`/property?input=${JSON.stringify(newSearch)}`,
					{ scroll: false },
				);
			} catch (err: any) {
				console.log('ERROR, recentSortHandler:', err);
			}
		},
		[searchFilter, router],
	);

	const oldestSortHandler = useCallback(
		async () => {
			try {
				const newSearch = {
					...searchFilter,
					sort: 'createdAt',
					direction: Direction.ASC,
				};
				await router.push(
					`/property?input=${JSON.stringify(newSearch)}`,
					`/property?input=${JSON.stringify(newSearch)}`,
					{ scroll: false },
				);
			} catch (err: any) {
				console.log('ERROR, oldestSortHandler:', err);
			}
		},
		[searchFilter, router],
	);

	const viewsSortHandler = useCallback(
		async () => {
			try {
				const newSearch = {
					...searchFilter,
					sort: 'propertyViews',
					direction: Direction.DESC,
				};
				await router.push(
					`/property?input=${JSON.stringify(newSearch)}`,
					`/property?input=${JSON.stringify(newSearch)}`,
					{ scroll: false },
				);
			} catch (err: any) {
				console.log('ERROR, viewsSortHandler:', err);
			}
		},
		[searchFilter, router],
	);

	const handleBrandSelect = useCallback(
		async (brand: PropertyBrand) => {
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
		},
		[searchFilter, router],
	);

	const handleConditionSelect = useCallback(
		async (condition: PropertyCondition) => {
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
		},
		[searchFilter, router],
	);

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

	const handlePriceRangeSelect = useCallback(
		async (price: string, type: 'start' | 'end') => {
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
		},
		[searchFilter, router],
	);

	const propertyLocations = Object.values(PropertyLocation);
	const propertyTypes = Object.values(PropertyType);
	const propertyBrands = Object.values(PropertyBrand);
	const propertyConditions = Object.values(PropertyCondition);
	
	const selectedBrand = (searchFilter?.search?.brandList || []).length > 0 
		? `${(searchFilter?.search?.brandList || []).length} selected` 
		: 'Brand';
	const selectedType = (searchFilter?.search?.typeList || []).length > 0 
		? `${(searchFilter?.search?.typeList || []).length} selected` 
		: 'Type';
	const selectedCondition = (searchFilter?.search?.conditionList || []).length > 0 
		? `${(searchFilter?.search?.conditionList || []).length} selected` 
		: 'Condition';
	const selectedLocation = (searchFilter?.search?.locationList || []).length > 0 
		? `${(searchFilter?.search?.locationList || []).length} selected` 
		: 'Location';
	const selectedYear = searchFilter?.search?.yearRange
		? `${searchFilter?.search?.yearRange?.start} - ${searchFilter?.search?.yearRange?.end}`
		: 'Year';
	const selectedPrice = searchFilter?.search?.pricesRange
		? `$${(searchFilter?.search?.pricesRange?.start || 0).toLocaleString()} - $${(searchFilter?.search?.pricesRange?.end || 0).toLocaleString()}`
		: 'Price/day';
	
	if (device === 'mobile') {

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
									className={'filter-sort-button'}
									endIcon={<KeyboardArrowDownRoundedIcon />}
									onClick={(e: React.MouseEvent<HTMLButtonElement>) => setLikesAnchor(e.currentTarget)}
								>
									{filterSortName}
								</Button>
								<Menu
									anchorEl={likesAnchor}
									open={Boolean(likesAnchor)}
									onClose={() => setLikesAnchor(null)}
									PaperProps={{ 
										style: { 
											borderRadius: '10px',
											border: '1px solid #e5e5e5',
											boxShadow: '0px 4px 12px 0px rgba(0, 0, 0, 0.1)',
											marginTop: '8px',
											minWidth: '160px'
										} 
									}}
								>
									<MenuItem 
										onClick={async () => {
											const newSearch = {
												...searchFilter,
												sort: 'createdAt',
												direction: Direction.DESC,
											};
											await router.push(
												`/property?input=${JSON.stringify(newSearch)}`,
												`/property?input=${JSON.stringify(newSearch)}`,
												{ scroll: false },
											);
											setLikesAnchor(null);
										}}
										selected={searchFilter?.sort === 'createdAt' && searchFilter?.direction === Direction.DESC}
										sx={{ 
											fontSize: '14px',
											padding: '10px 18px',
											'&:hover': { background: '#f9f9f9' },
											'&.Mui-selected': { 
												background: '#f5f5f5',
												'&:hover': { background: '#f0f0f0' }
											}
										}}
									>
										Recent
									</MenuItem>
									<MenuItem 
										onClick={async () => {
											await oldestSortHandler();
											setLikesAnchor(null);
										}}
										selected={searchFilter?.sort === 'createdAt' && searchFilter?.direction === Direction.ASC}
										sx={{ 
											fontSize: '14px',
											padding: '10px 18px',
											'&:hover': { background: '#f9f9f9' },
											'&.Mui-selected': { 
												background: '#f5f5f5',
												'&:hover': { background: '#f0f0f0' }
											}
										}}
									>
										Oldest
									</MenuItem>
									<MenuItem 
										onClick={() => handleLikesSort(Direction.DESC)}
										selected={searchFilter?.sort === 'propertyLikes' && searchFilter?.direction === Direction.DESC}
										sx={{ 
											fontSize: '14px',
											padding: '10px 18px',
											'&:hover': { background: '#f9f9f9' },
											'&.Mui-selected': { 
												background: '#f5f5f5',
												'&:hover': { background: '#f0f0f0' }
											}
										}}
									>
										Likes
									</MenuItem>
									<MenuItem 
										onClick={async () => {
											await viewsSortHandler();
											setLikesAnchor(null);
										}}
										selected={searchFilter?.sort === 'propertyViews' && searchFilter?.direction === Direction.DESC}
										sx={{ 
											fontSize: '14px',
											padding: '10px 18px',
											'&:hover': { background: '#f9f9f9' },
											'&.Mui-selected': { 
												background: '#f5f5f5',
												'&:hover': { background: '#f0f0f0' }
											}
										}}
									>
										Views
									</MenuItem>
								</Menu>
							</Box>
						</Stack>

						{/* Filter Row */}
						<Stack className={'filter-header-row'}>
							{/* Brand Filter */}
							<Button
								className={'filter-dropdown-button'}
								endIcon={<KeyboardArrowDownRoundedIcon />}
								onClick={(e: React.MouseEvent<HTMLButtonElement>) => setBrandAnchor(e.currentTarget)}
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
								onClick={(e: React.MouseEvent<HTMLButtonElement>) => setTypeAnchor(e.currentTarget)}
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
								onClick={(e: React.MouseEvent<HTMLButtonElement>) => setConditionAnchor(e.currentTarget)}
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
								onClick={(e: React.MouseEvent<HTMLButtonElement>) => setLocationAnchor(e.currentTarget)}
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
								onClick={(e: React.MouseEvent<HTMLButtonElement>) => setYearAnchor(e.currentTarget)}
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
								{propertyYears.slice().reverse().map((year: string) => (
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
								{propertyYears.slice().reverse().map((year: string) => (
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
								onClick={(e: React.MouseEvent<HTMLButtonElement>) => setPriceAnchor(e.currentTarget)}
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
								{properties?.length === 0 ? (
									<div className={'no-data'}>
										<img src="/img/icons/icoAlert.svg" alt="" />
										<p>No bikes found!</p>
									</div>
								) : (
									properties.map((property: Property) => {
										return <PropertyCard property={property} key={property?._id} likePropertyHandler={likePropertyHandler} />;
									})
								)}
							</Stack>
							<Stack className="pagination-config">
								{properties.length !== 0 && (
									<>
										<Stack className="pagination-box">
											<Pagination
												page={currentPage}
												count={Math.ceil(total / searchFilter.limit)}
												onChange={handlePaginationChange}
												shape="circular"
												color="primary"
											/>
										</Stack>
										<Stack className="total-result">
											<Typography>
												{total} bike{total > 1 ? 's' : ''} available
											</Typography>
										</Stack>
									</>
								)}
							</Stack>
						</Stack>
					</Stack>
				</div>
			</div>
		);
	} else {
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
									className={'filter-sort-button'}
									endIcon={<KeyboardArrowDownRoundedIcon />}
									onClick={(e: React.MouseEvent<HTMLButtonElement>) => setLikesAnchor(e.currentTarget)}
								>
									{filterSortName}
								</Button>
								<Menu
									anchorEl={likesAnchor}
									open={Boolean(likesAnchor)}
									onClose={() => setLikesAnchor(null)}
									PaperProps={{ 
										style: { 
											borderRadius: '10px',
											border: '1px solid #e5e5e5',
											boxShadow: '0px 4px 12px 0px rgba(0, 0, 0, 0.1)',
											marginTop: '8px',
											minWidth: '160px'
										} 
									}}
								>
									<MenuItem 
										onClick={async () => {
											const newSearch = {
												...searchFilter,
												sort: 'createdAt',
												direction: Direction.DESC,
											};
											await router.push(
												`/property?input=${JSON.stringify(newSearch)}`,
												`/property?input=${JSON.stringify(newSearch)}`,
												{ scroll: false },
											);
											setLikesAnchor(null);
										}}
										selected={searchFilter?.sort === 'createdAt' && searchFilter?.direction === Direction.DESC}
										sx={{ 
											fontSize: '14px',
											padding: '10px 18px',
											'&:hover': { background: '#f9f9f9' },
											'&.Mui-selected': { 
												background: '#f5f5f5',
												'&:hover': { background: '#f0f0f0' }
											}
										}}
									>
										Recent
									</MenuItem>
									<MenuItem 
										onClick={async () => {
											await oldestSortHandler();
											setLikesAnchor(null);
										}}
										selected={searchFilter?.sort === 'createdAt' && searchFilter?.direction === Direction.ASC}
										sx={{ 
											fontSize: '14px',
											padding: '10px 18px',
											'&:hover': { background: '#f9f9f9' },
											'&.Mui-selected': { 
												background: '#f5f5f5',
												'&:hover': { background: '#f0f0f0' }
											}
										}}
									>
										Oldest
									</MenuItem>
									<MenuItem 
										onClick={() => handleLikesSort(Direction.DESC)}
										selected={searchFilter?.sort === 'propertyLikes' && searchFilter?.direction === Direction.DESC}
										sx={{ 
											fontSize: '14px',
											padding: '10px 18px',
											'&:hover': { background: '#f9f9f9' },
											'&.Mui-selected': { 
												background: '#f5f5f5',
												'&:hover': { background: '#f0f0f0' }
											}
										}}
									>
										Likes
									</MenuItem>
									<MenuItem 
										onClick={async () => {
											await viewsSortHandler();
											setLikesAnchor(null);
										}}
										selected={searchFilter?.sort === 'propertyViews' && searchFilter?.direction === Direction.DESC}
										sx={{ 
											fontSize: '14px',
											padding: '10px 18px',
											'&:hover': { background: '#f9f9f9' },
											'&.Mui-selected': { 
												background: '#f5f5f5',
												'&:hover': { background: '#f0f0f0' }
											}
										}}
									>
										Views
									</MenuItem>
								</Menu>
							</Box>
						</Stack>

						{/* Filter Row */}
						<Stack className={'filter-header-row'}>
							{/* Brand Filter */}
							<Button
								className={'filter-dropdown-button'}
								endIcon={<KeyboardArrowDownRoundedIcon />}
								onClick={(e: React.MouseEvent<HTMLButtonElement>) => setBrandAnchor(e.currentTarget)}
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
								onClick={(e: React.MouseEvent<HTMLButtonElement>) => setTypeAnchor(e.currentTarget)}
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
								onClick={(e: React.MouseEvent<HTMLButtonElement>) => setConditionAnchor(e.currentTarget)}
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
								onClick={(e: React.MouseEvent<HTMLButtonElement>) => setLocationAnchor(e.currentTarget)}
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
								onClick={(e: React.MouseEvent<HTMLButtonElement>) => setYearAnchor(e.currentTarget)}
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
								{propertyYears.slice().reverse().map((year: string) => (
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
								{propertyYears.slice().reverse().map((year: string) => (
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
								onClick={(e: React.MouseEvent<HTMLButtonElement>) => setPriceAnchor(e.currentTarget)}
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
								{properties?.length === 0 ? (
									<div className={'no-data'}>
										<img src="/img/icons/icoAlert.svg" alt="" />
										<p>No bikes found!</p>
									</div>
								) : (
									properties.map((property: Property) => {
										return <PropertyCard property={property} key={property?._id} likePropertyHandler={likePropertyHandler} />;
									})
								)}
							</Stack>
							<Stack className="pagination-config">
								{properties.length !== 0 && (
									<>
										<Stack className="pagination-box">
											<Pagination
												page={currentPage}
												count={Math.ceil(total / searchFilter.limit)}
												onChange={handlePaginationChange}
												shape="circular"
												color="primary"
											/>
										</Stack>
										<Stack className="total-result">
											<Typography>
												{total} bike{total > 1 ? 's' : ''} available
											</Typography>
										</Stack>
									</>
								)}
							</Stack>
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
			yearRange: {
				start: 2000,
				end: new Date().getFullYear(),
			},
			pricesRange: {
				start: 0,
				end: 2000000,
			},
		},
	},
};

export default withLayoutBasic(PropertyList);
