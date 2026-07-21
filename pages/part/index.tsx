import React, { ChangeEvent, MouseEvent, useEffect, useState, useCallback } from 'react';
import { NextPage } from 'next';
import { Box, Button, Menu, MenuItem, Pagination, Stack, Typography } from '@mui/material';
import PartCard from '../../libs/components/part/PartCard';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { useRouter } from 'next/router';
import { PartsInquiry } from '../../libs/types/part/part.input';
import { Part } from '../../libs/types/part/part';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Direction, Message } from '../../libs/enums/common.enum';
import { PartBrand, PartCategory, PartCondition, PartLocation, PartType, getPartTypesByCategory } from '../../libs/enums/part.enum';
import { partPriceRange } from '../../libs/config';
import { GET_PARTS } from '../../apollo/user/query';
import { useMutation, useQuery } from '@apollo/client';
import { T } from '../../libs/types/common';
import { LIKE_TARGET_PART } from '../../apollo/user/mutation';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { useTranslation } from 'next-i18next';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const PartList: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const { t } = useTranslation('common');
	const [searchFilter, setSearchFilter] = useState<PartsInquiry>(
		router?.query?.input ? JSON.parse(router?.query?.input as string) : initialInput,
	);
	const [parts, setParts] = useState<Part[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [filterSortName, setFilterSortName] = useState('New');
	const [categoryAnchor, setCategoryAnchor] = useState<null | HTMLElement>(null);
	const [brandAnchor, setBrandAnchor] = useState<null | HTMLElement>(null);
	const [typeAnchor, setTypeAnchor] = useState<null | HTMLElement>(null);
	const [conditionAnchor, setConditionAnchor] = useState<null | HTMLElement>(null);
	const [locationAnchor, setLocationAnchor] = useState<null | HTMLElement>(null);
	const [priceAnchor, setPriceAnchor] = useState<null | HTMLElement>(null);
	const [likesAnchor, setLikesAnchor] = useState<null | HTMLElement>(null);

	/** APOLLO REQUESTS **/
	const [likeTargetPart] = useMutation(LIKE_TARGET_PART);

	const {
		loading: getPartsLoading,
		data: getPartsData,
		error: getPartsError,
		refetch: getPartsRefetch,
	} = useQuery(GET_PARTS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setParts(data?.getParts?.list || []);
			setTotal(data?.getParts?.metaCounter?.[0]?.total || 0);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (router.query.input) {
			try {
				const inputObj = JSON.parse(router?.query?.input as string);
				if (JSON.stringify(inputObj) !== JSON.stringify(searchFilter)) {
					setSearchFilter(inputObj);
					setCurrentPage(inputObj.page === undefined ? 1 : inputObj.page);
				}
			} catch (err) {
				console.error('Error parsing router query:', err);
			}
		} else if (router.query.category) {
			// Deep-link: /part?category=SPARE_PART | ACCESSORY
			const cat = router.query.category as string;
			const next: PartsInquiry = {
				...initialInput,
				search: cat === 'ALL' ? {} : { categoryList: [cat] },
			};
			if (JSON.stringify(next) !== JSON.stringify(searchFilter)) {
				setSearchFilter(next);
				setCurrentPage(1);
			}
		} else {
			if (JSON.stringify(initialInput) !== JSON.stringify(searchFilter)) {
				setSearchFilter(initialInput);
				setCurrentPage(initialInput.page === undefined ? 1 : initialInput.page);
			}
		}
	}, [router.query.input, router.query.category]);

	useEffect(() => {
		if (searchFilter) getPartsRefetch({ input: searchFilter });
	}, [searchFilter, getPartsRefetch]);

	/** HANDLERS **/
	const likePartHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
			await likeTargetPart({ variables: { input: id } });
			await getPartsRefetch({ input: searchFilter });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			console.log('ERROR likePartHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const handlePaginationChange = useCallback(
		async (event: ChangeEvent<unknown>, value: number) => {
			const newFilter = { ...searchFilter, page: value };
			setSearchFilter(newFilter);
			await router.push(`/part?input=${JSON.stringify(newFilter)}`, `/part?input=${JSON.stringify(newFilter)}`, {
				scroll: false,
			});
			setCurrentPage(value);
		},
		[searchFilter, router],
	);

	const pushNewFilter = async (newSearch: PartsInquiry) => {
		await router.push(`/part?input=${JSON.stringify(newSearch)}`, `/part?input=${JSON.stringify(newSearch)}`, {
			scroll: false,
		});
	};

	const handleReset = useCallback(async () => {
		setSearchFilter(initialInput);
		setCurrentPage(initialInput.page === undefined ? 1 : initialInput.page);
		await pushNewFilter(initialInput);
	}, [initialInput, router]);

	const toggleInList = (list: any[] = [], value: any) =>
		list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

	const handleCategorySelect = async (category: PartCategory) => {
		const next = toggleInList(searchFilter?.search?.categoryList || [], category);
		const newSearch = { ...searchFilter };
		if (next.length === 0) delete newSearch.search.categoryList;
		else newSearch.search = { ...newSearch.search, categoryList: next };
		await pushNewFilter(newSearch);
		setCategoryAnchor(null);
	};

	const handleTypeSelect = async (type: PartType) => {
		const next = toggleInList(searchFilter?.search?.typeList || [], type);
		const newSearch = { ...searchFilter };
		if (next.length === 0) delete newSearch.search.typeList;
		else newSearch.search = { ...newSearch.search, typeList: next };
		await pushNewFilter(newSearch);
		setTypeAnchor(null);
	};

	const handleBrandSelect = async (brand: PartBrand) => {
		const next = toggleInList(searchFilter?.search?.brandList || [], brand);
		const newSearch = { ...searchFilter };
		if (next.length === 0) delete newSearch.search.brandList;
		else newSearch.search = { ...newSearch.search, brandList: next };
		await pushNewFilter(newSearch);
		setBrandAnchor(null);
	};

	const handleConditionSelect = async (condition: PartCondition) => {
		const next = toggleInList(searchFilter?.search?.conditionList || [], condition);
		const newSearch = { ...searchFilter };
		if (next.length === 0) delete newSearch.search.conditionList;
		else newSearch.search = { ...newSearch.search, conditionList: next };
		await pushNewFilter(newSearch);
		setConditionAnchor(null);
	};

	const handleLocationSelect = async (location: PartLocation) => {
		const next = toggleInList(searchFilter?.search?.locationList || [], location);
		const newSearch = { ...searchFilter };
		if (next.length === 0) delete newSearch.search.locationList;
		else newSearch.search = { ...newSearch.search, locationList: next };
		await pushNewFilter(newSearch);
		setLocationAnchor(null);
	};

	const handlePriceRangeSelect = async (price: string, type: 'start' | 'end') => {
		const currentRange = searchFilter?.search?.pricesRange || { start: 0, end: 20000 };
		const priceNum = parseInt(price);
		const newRange = { ...currentRange, [type]: priceNum };
		if (type === 'start' && newRange.end < priceNum) newRange.end = priceNum;
		else if (type === 'end' && newRange.start > priceNum) newRange.start = priceNum;
		const newSearch = { ...searchFilter, search: { ...searchFilter.search, pricesRange: newRange } };
		await pushNewFilter(newSearch);
		setPriceAnchor(null);
	};

	const sortHandler = async (sort: string, direction: Direction, name: string) => {
		setFilterSortName(name);
		await pushNewFilter({ ...searchFilter, sort, direction });
		setLikesAnchor(null);
	};

	const partCategories = Object.values(PartCategory);
	const partBrands = Object.values(PartBrand);
	const partConditions = Object.values(PartCondition);
	const partLocations = Object.values(PartLocation);

	const sel = (arr: any[] = [], label: string) =>
		arr.length > 0 ? `${arr.length} ${t('selected')}` : t(label);
	const selectedCategory = sel(searchFilter?.search?.categoryList || [], 'Category');
	const selectedType = sel(searchFilter?.search?.typeList || [], 'Type');
	const selectedBrand = sel(searchFilter?.search?.brandList || [], 'Brand');
	const selectedCondition = sel(searchFilter?.search?.conditionList || [], 'Condition');
	const selectedLocation = sel(searchFilter?.search?.locationList || [], 'Location');
	const selectedPrice = searchFilter?.search?.pricesRange
		? `$${(searchFilter?.search?.pricesRange?.start || 0).toLocaleString()} - $${(searchFilter?.search?.pricesRange?.end || 0).toLocaleString()}`
		: t('Price');

	/** CATEGORY SECTION TABS (Spare Parts / Accessories) **/
	const activeCat: 'ALL' | PartCategory =
		searchFilter?.search?.categoryList?.length === 1 ? (searchFilter.search.categoryList[0] as PartCategory) : 'ALL';

	// Type options depend on the active category — spare-part types vs accessory types
	const partTypes = getPartTypesByCategory(activeCat === 'ALL' ? undefined : activeCat);

	const handleCategoryTab = async (cat: 'ALL' | PartCategory) => {
		const newSearch: PartsInquiry = { ...searchFilter, page: 1, search: { ...searchFilter.search } };
		if (cat === 'ALL') delete newSearch.search.categoryList;
		else newSearch.search.categoryList = [cat];
		delete newSearch.search.typeList; // reset type filter — valid types differ per category
		setSearchFilter(newSearch);
		setCurrentPage(1);
		await pushNewFilter(newSearch);
	};

	const sectionTabs: { key: 'ALL' | PartCategory; label: string }[] = [
		{ key: 'ALL', label: t('All') },
		{ key: PartCategory.SPARE_PART, label: t('Spare Parts') },
		{ key: PartCategory.ACCESSORY, label: t('Accessories') },
	];
	const sectionTitle =
		activeCat === PartCategory.SPARE_PART
			? t('Spare Parts')
			: activeCat === PartCategory.ACCESSORY
			? t('Accessories')
			: t('Parts & Accessories');

	return (
		<div id="property-list-page" style={{ position: 'relative' }}>
			<div className="container">
				{/* SECTION TABS — Spare Parts vs Accessories */}
				<Stack
					direction="row"
					spacing={1.5}
					sx={{ mb: '20px', mt: '8px', flexWrap: 'wrap' }}
					className={'part-category-tabs'}
				>
					{sectionTabs.map((tab) => {
						const isActive = activeCat === tab.key;
						return (
							<Button
								key={tab.key}
								onClick={() => handleCategoryTab(tab.key)}
								sx={{
									px: '22px',
									py: '10px',
									borderRadius: '999px',
									fontWeight: 700,
									fontSize: '15px',
									textTransform: 'none',
									border: isActive ? '1px solid #25b44b' : '1px solid #e0e0e0',
									background: isActive ? '#25b44b' : '#fff',
									color: isActive ? '#fff' : '#181a20',
									boxShadow: isActive ? '0 4px 12px rgba(37,180,75,0.25)' : 'none',
									'&:hover': { background: isActive ? '#1ea043' : '#f5f5f5' },
								}}
							>
								{tab.label}
							</Button>
						);
					})}
				</Stack>

				<Stack className={'filter-header-section'}>
					<Stack className={'filter-header-top'}>
						<Box component="div" className={'filter-header-left'}>
							<Typography className={'filter-header-title'}>{sectionTitle}</Typography>
							<Typography className={'filter-header-count'}>
								{total} {t('available')}
							</Typography>
						</Box>
						<Box component="div" className={'filter-header-right'}>
							<Button className={'filter-reset-button'} startIcon={<FilterListIcon />} onClick={handleReset}>
								{t('Reset')}
							</Button>
							<Button
								className={'filter-sort-button'}
								endIcon={<KeyboardArrowDownRoundedIcon />}
								onClick={(e: React.MouseEvent<HTMLButtonElement>) => setLikesAnchor(e.currentTarget)}
							>
								{t(filterSortName)}
							</Button>
							<Menu anchorEl={likesAnchor} open={Boolean(likesAnchor)} onClose={() => setLikesAnchor(null)}>
								<MenuItem onClick={() => sortHandler('createdAt', Direction.DESC, 'New')}>{t('Recent')}</MenuItem>
								<MenuItem onClick={() => sortHandler('createdAt', Direction.ASC, 'Oldest')}>{t('Oldest')}</MenuItem>
								<MenuItem onClick={() => sortHandler('partLikes', Direction.DESC, 'Likes')}>{t('Likes')}</MenuItem>
								<MenuItem onClick={() => sortHandler('partViews', Direction.DESC, 'Views')}>{t('Views')}</MenuItem>
								<MenuItem onClick={() => sortHandler('partPrice', Direction.ASC, 'Lowest Price')}>
									{t('Lowest Price')}
								</MenuItem>
								<MenuItem onClick={() => sortHandler('partPrice', Direction.DESC, 'Highest Price')}>
									{t('Highest Price')}
								</MenuItem>
							</Menu>
						</Box>
					</Stack>

					<Stack className={'filter-header-row'}>
						{/* Category Filter (Spare part / Accessory) */}
						<Button
							className={'filter-dropdown-button'}
							endIcon={<KeyboardArrowDownRoundedIcon />}
							onClick={(e: React.MouseEvent<HTMLButtonElement>) => setCategoryAnchor(e.currentTarget)}
						>
							{selectedCategory}
						</Button>
						<Menu
							anchorEl={categoryAnchor}
							open={Boolean(categoryAnchor)}
							onClose={() => setCategoryAnchor(null)}
							PaperProps={{ style: { maxHeight: 300, width: 200 } }}
						>
							{partCategories.map((category) => (
								<MenuItem
									key={category}
									onClick={() => handleCategorySelect(category)}
									selected={(searchFilter?.search?.categoryList || []).includes(category)}
								>
									{t(category)}
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
							{partTypes.map((type) => (
								<MenuItem
									key={type}
									onClick={() => handleTypeSelect(type)}
									selected={(searchFilter?.search?.typeList || []).includes(type)}
								>
									{t(type)}
								</MenuItem>
							))}
						</Menu>

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
							{partBrands.map((brand) => (
								<MenuItem
									key={brand}
									onClick={() => handleBrandSelect(brand)}
									selected={(searchFilter?.search?.brandList || []).includes(brand)}
								>
									{t(brand)}
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
							{partConditions.map((condition) => (
								<MenuItem
									key={condition}
									onClick={() => handleConditionSelect(condition)}
									selected={(searchFilter?.search?.conditionList || []).includes(condition)}
								>
									{t(condition)}
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
							{partLocations.map((location) => (
								<MenuItem
									key={location}
									onClick={() => handleLocationSelect(location)}
									selected={(searchFilter?.search?.locationList || []).includes(location)}
								>
									{t(location)}
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
								{t('Min Price ($)')}
							</Typography>
							{partPriceRange.map((price) => (
								<MenuItem
									key={`start-${price}`}
									onClick={() => handlePriceRangeSelect(price.toString(), 'start')}
									selected={searchFilter?.search?.pricesRange?.start === price}
								>
									${price.toLocaleString()}
								</MenuItem>
							))}
							<Typography
								sx={{ px: 2, py: 1, fontWeight: 600, fontSize: '12px', color: '#717171', mt: 1, borderTop: '1px solid #eee' }}
							>
								{t('Max Price ($)')}
							</Typography>
							{partPriceRange
								.slice(1)
								.concat([50000])
								.map((price) => (
									<MenuItem
										key={`end-${price}`}
										onClick={() => handlePriceRangeSelect(price.toString(), 'end')}
										selected={searchFilter?.search?.pricesRange?.end === price}
									>
										${price.toLocaleString()}
									</MenuItem>
								))}
						</Menu>

						<Button className={'filter-reset-row-button'} startIcon={<RefreshIcon />} onClick={handleReset}>
							{t('Reset')}
						</Button>
					</Stack>
				</Stack>

				<Stack className={'property-page'}>
					<Stack className="main-config" mb={'76px'}>
						<Stack className={'list-config'}>
							{parts?.length === 0 ? (
								<div className={'no-data'}>
									<img src="/img/icons/icoAlert.svg" alt="" />
									<p>{t('No parts found!')}</p>
								</div>
							) : (
								parts.map((part: Part) => {
									return <PartCard part={part} key={part?._id} likePartHandler={likePartHandler} />;
								})
							)}
						</Stack>
						<Stack className="pagination-config">
							{parts.length !== 0 && (
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
											{total} item{total > 1 ? 's' : ''} available
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
};

PartList.defaultProps = {
	initialInput: {
		page: 1,
		limit: 9,
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	},
};

export default withLayoutBasic(PartList);
