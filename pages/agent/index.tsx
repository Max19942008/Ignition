import React, { ChangeEvent, MouseEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Stack, Box, Button, Pagination, Typography, InputAdornment, OutlinedInput } from '@mui/material';
import { Menu, MenuItem } from '@mui/material';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import AgentCard from '../../libs/components/common/AgentCard';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Member } from '../../libs/types/member/member';
import { GET_AGENTS } from '../../apollo/user/query';
import { useMutation, useQuery } from '@apollo/client';
import { T } from '../../libs/types/common';
import { LIKE_TARGET_MEMBER } from '../../apollo/user/mutation';
import { Message } from '../../libs/enums/common.enum';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { CircularProgress } from '@mui/material';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const AgentList: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const [anchorEl2, setAnchorEl2] = useState<null | HTMLElement>(null);
	const [filterSortName, setFilterSortName] = useState('Recent');
	const [sortingOpen, setSortingOpen] = useState(false);
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [searchFilter, setSearchFilter] = useState<any>(
		router?.query?.input ? JSON.parse(router?.query?.input as string) : initialInput,
	);
	const [agents, setAgents] = useState<Member[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [searchText, setSearchText] = useState<string>('');

	/** APOLLO REQUESTS **/

		const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);
	
		const {
				loading: getAgentsLoading, 
				data: getAgentsData, 
				error: getAgentsError,
				refetch: getAgentsRefetch,
				 } = useQuery(GET_AGENTS, {
				fetchPolicy: "network-only",
				variables: {input: searchFilter},
				notifyOnNetworkStatusChange: true,
				onCompleted: (data: T) => {
						setAgents(data?.getAgents?.list);
						setTotal(data?.getAgents?.metaCounter[0]?.total)
				},
				 });
	/** LIFECYCLES **/
	useEffect(() => {
		if (router.query.input) {
			const input_obj = JSON.parse(router?.query?.input as string);
			setSearchFilter(input_obj);
		} else
			router.replace(`/agent?input=${JSON.stringify(searchFilter)}`, `/agent?input=${JSON.stringify(searchFilter)}`);

		setCurrentPage(searchFilter.page === undefined ? 1 : searchFilter.page);
	}, [router]);

	/** HANDLERS **/
	const sortingClickHandler = (e: MouseEvent<HTMLElement>) => {
		setAnchorEl(e.currentTarget);
		setSortingOpen(true);
	};

	const sortingCloseHandler = () => {
		setSortingOpen(false);
		setAnchorEl(null);
	};

	const sortingHandler = (e: React.MouseEvent<HTMLLIElement>) => {
		switch (e.currentTarget.id) {
			case 'recent':
				setSearchFilter({ ...searchFilter, sort: 'createdAt', direction: 'DESC' });
				setFilterSortName('Recent');
				break;
			case 'old':
				setSearchFilter({ ...searchFilter, sort: 'createdAt', direction: 'ASC' });
				setFilterSortName('Oldest order');
				break;
			case 'likes':
				setSearchFilter({ ...searchFilter, sort: 'memberLikes', direction: 'DESC' });
				setFilterSortName('Likes');
				break;
			case 'views':
				setSearchFilter({ ...searchFilter, sort: 'memberViews', direction: 'DESC' });
				setFilterSortName('Views');
				break;
		}
		setSortingOpen(false);
		setAnchorEl2(null);
	};

	const paginationChangeHandler = async (event: ChangeEvent<unknown>, value: number) => {
		searchFilter.page = value;
		await router.push(`/agent?input=${JSON.stringify(searchFilter)}`, `/agent?input=${JSON.stringify(searchFilter)}`, {
			scroll: false,
		});
		setCurrentPage(value);
	};

	const likeMemberHandler = async (user: T, id:string) => {
				try {
					if(!id) return;
					if(!user._id) throw new Error(Message.NOT_AUTHENTICATED)
				await likeTargetMember({
					variables: {input:id}, 
				});
				 await getAgentsRefetch({input: searchFilter});
		
				 await sweetTopSmallSuccessAlert("success", 800);
		
				} catch(err: any) {
				console.log("ERROR likePropertyHandler:", err.message);
				sweetMixinErrorAlert(err.message).then();
				}
			};

	if (getAgentsLoading && agents.length === 0) {
		return (
			<Stack sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', minHeight: '80vh' }}>
				<CircularProgress size={'4rem'} />
			</Stack>
		);
	}

	if (device === 'mobile') {
		return <h1>AGENTS PAGE MOBILE</h1>;
	} else {
		return (
			<Stack className={'agent-list-page'}>
				<Stack className={'container'}>
					{/* Header Section */}
					<Stack className={'page-header'}>
						<Typography className={'main-title'}>Find Your Perfect Agent</Typography>
						<Typography className={'sub-title'}>Connect with trusted bike agents and get expert advice on your next ride</Typography>
					</Stack>

					{/* Filter Section */}
					<Stack className={'filter'}>
						<Box component={'div'} className={'left'}>
							<OutlinedInput
								className={'search-input'}
								placeholder={'Search agents by name, location...'}
								value={searchText}
								onChange={(e: any) => setSearchText(e.target.value)}
								onKeyDown={(event: any) => {
									if (event.key == 'Enter') {
										setSearchFilter({
											...searchFilter,
											search: { ...searchFilter.search, text: searchText },
										});
									}
								}}
								startAdornment={
									<InputAdornment position="start">
										<SearchIcon sx={{ color: '#4caf50' }} />
									</InputAdornment>
								}
								sx={{
									'& .MuiOutlinedInput-notchedOutline': {
										borderColor: '#e0e0e0',
									},
									'&:hover .MuiOutlinedInput-notchedOutline': {
										borderColor: '#4caf50',
									},
									'&.Mui-focused .MuiOutlinedInput-notchedOutline': {
										borderColor: '#4caf50',
										borderWidth: '2px',
									},
								}}
							/>
						</Box>
						<Box component={'div'} className={'right'}>
							<Stack className={'sort-wrapper'}>
								<FilterListIcon className={'filter-icon'} />
								<Typography className={'sort-label'}>Sort by</Typography>
								<Button 
									className={'sort-button'}
									onClick={sortingClickHandler} 
									endIcon={<KeyboardArrowDownRoundedIcon />}
								>
									{filterSortName}
								</Button>
								<Menu 
									anchorEl={anchorEl} 
									open={sortingOpen} 
									onClose={sortingCloseHandler}
									className={'sort-menu'}
									PaperProps={{
										sx: {
											borderRadius: '12px',
											boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
											border: '1px solid #e0e0e0',
											marginTop: '8px',
										}
									}}
								>
									<MenuItem onClick={sortingHandler} id={'recent'} disableRipple className={'menu-item'}>
										Recent
									</MenuItem>
									<MenuItem onClick={sortingHandler} id={'old'} disableRipple className={'menu-item'}>
										Oldest
									</MenuItem>
									<MenuItem onClick={sortingHandler} id={'likes'} disableRipple className={'menu-item'}>
										Most Liked
									</MenuItem>
									<MenuItem onClick={sortingHandler} id={'views'} disableRipple className={'menu-item'}>
										Most Viewed
									</MenuItem>
								</Menu>
							</Stack>
						</Box>
					</Stack>

					{/* Cards Grid */}
					<Stack className={'card-wrap'}>
						{agents?.length === 0 ? (
							<Stack className={'no-data'}>
								<Box className={'no-data-icon'}>
									<TwoWheelerIcon sx={{ fontSize: 80, color: '#ddd' }} />
								</Box>
								<Typography className={'no-data-title'}>No Agents Found</Typography>
								<Typography className={'no-data-desc'}>Try adjusting your search or filters</Typography>
							</Stack>
						) : (
							agents.map((agent: Member) => {
								return <AgentCard agent={agent} key={agent._id} likeMemberHandler={likeMemberHandler} />;
							})
						)}
					</Stack>

					{/* Pagination Section */}
					<Stack className={'pagination'}>
						<Stack className="pagination-box">
							{agents.length !== 0 && Math.ceil(total / searchFilter.limit) > 1 && (
								<Pagination
									page={currentPage}
									count={Math.ceil(total / searchFilter.limit)}
									onChange={paginationChangeHandler}
									shape="circular"
									color="primary"
									size="large"
									sx={{
										'& .MuiPaginationItem-root': {
											fontSize: '16px',
											fontWeight: 600,
										},
										'& .Mui-selected': {
											background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%) !important',
											color: '#fff !important',
										},
									}}
								/>
							)}
						</Stack>

						{agents.length !== 0 && (
							<Typography className={'total-count'}>
								Showing <strong>{agents.length}</strong> of <strong>{total}</strong> agent{total > 1 ? 's' : ''}
							</Typography>
						)}
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

AgentList.defaultProps = {
	initialInput: {
		page: 1,
		limit: 10,
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	},
};

export default withLayoutBasic(AgentList);
