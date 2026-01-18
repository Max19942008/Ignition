import React, { useCallback, useEffect, useState } from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { Box, Button, InputAdornment, Stack } from '@mui/material';
import { List, ListItem } from '@mui/material';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { TabContext } from '@mui/lab';
import OutlinedInput from '@mui/material/OutlinedInput';
import TablePagination from '@mui/material/TablePagination';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import { FaqArticlesPanelList } from '../../../libs/components/admin/cs/FaqList';
import { useRouter } from 'next/router';
import { NoticeStatus } from '../../../libs/enums/notice.enum';
import { sweetErrorHandling } from '../../../libs/sweetAlert';

const FaqArticles: NextPage = (props: any) => {
	const router = useRouter();
	const [anchorEl, setAnchorEl] = useState<[] | HTMLElement[]>([]);
	const [value, setValue] = useState('ALL');
	const [searchText, setSearchText] = useState('');
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [totalCount, setTotalCount] = useState(0);
	const [faqList, setFaqList] = useState<any[]>([]);

	/** APOLLO REQUESTS **/
	// TODO: Add GraphQL queries when backend is ready
	// const { data: faqData, refetch: refetchFaq } = useQuery(GET_ALL_FAQ_BY_ADMIN, {...});

	/** LIFECYCLES **/
	useEffect(() => {
		// Mock data for now - replace with actual GraphQL query
		const mockData = [
			{ _id: '1', category: 'FAQ', title: 'How to register?', writer: 'Admin', date: '2024-01-15', status: NoticeStatus.ACTIVE },
			{ _id: '2', category: 'FAQ', title: 'How to post a bike?', writer: 'Admin', date: '2024-01-14', status: NoticeStatus.ACTIVE },
			{ _id: '3', category: 'FAQ', title: 'Payment methods', writer: 'Admin', date: '2024-01-13', status: NoticeStatus.HOLD },
			{ _id: '4', category: 'FAQ', title: 'Account settings', writer: 'Admin', date: '2024-01-12', status: NoticeStatus.DELETE },
		];
		setFaqList(mockData);
		setTotalCount(mockData.length);
	}, []);

	/** HANDLERS **/
	const tabChangeHandler = async (event: any, newValue: string) => {
		setValue(newValue);
		setSearchText('');
		setPage(0);
		// TODO: Filter by status when backend is ready
	};

	const textHandler = useCallback((value: string) => {
		try {
			setSearchText(value);
		} catch (err: any) {
			console.log('textHandler: ', err.message);
		}
	}, []);

	const searchTextHandler = () => {
		try {
			// TODO: Implement search when backend is ready
			console.log('Searching for:', searchText);
		} catch (err: any) {
			console.log('searchTextHandler: ', err.message);
		}
	};

	const menuIconClickHandler = (e: any, index: number) => {
		const tempAnchor = anchorEl.slice();
		tempAnchor[index] = e.currentTarget;
		setAnchorEl(tempAnchor);
	};

	const menuIconCloseHandler = () => {
		setAnchorEl([]);
	};

	const updateFaqHandler = async (updateData: any) => {
		try {
			// TODO: Implement update mutation when backend is ready
			menuIconCloseHandler();
			// await refetchFaq();
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const changePageHandler = async (event: unknown, newPage: number) => {
		setPage(newPage);
		// TODO: Refetch data when backend is ready
	};

	const changeRowsPerPageHandler = async (event: React.ChangeEvent<HTMLInputElement>) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
		// TODO: Refetch data when backend is ready
	};

	const getFilteredCount = (status: string) => {
		if (status === 'ALL') return totalCount;
		return faqList.filter((item) => item.status === status).length;
	};

	return (
		<Box component={'div'} className={'content'}>
			<Box component={'div'} className={'title flex_space'}>
				<Typography variant={'h2'} className={'tit'}>
					FAQ Management
				</Typography>
				<Button
					className="btn_add"
					variant={'contained'}
					size={'medium'}
					onClick={() => router.push(`/_admin/cs/faq_create`)}
					sx={{
						background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
						'&:hover': {
							background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
							transform: 'translateY(-2px)',
							boxShadow: '0 8px 16px rgba(16, 185, 129, 0.3)',
						},
						transition: 'all 0.3s ease',
					}}
				>
					<AddRoundedIcon sx={{ mr: '8px' }} />
					ADD
				</Button>
			</Box>
			<Box component={'div'} className={'table-wrap'}>
				<Box component={'div'} sx={{ width: '100%', typography: 'body1' }}>
					<TabContext value={value}>
						<Box component={'div'}>
							<List className={'tab-menu'}>
								<ListItem
									onClick={(e: any) => tabChangeHandler(e, 'ALL')}
									value="ALL"
									className={value === 'ALL' ? 'li on' : 'li'}
								>
									All ({getFilteredCount('ALL')})
								</ListItem>
								<ListItem
									onClick={(e: any) => tabChangeHandler(e, NoticeStatus.ACTIVE)}
									value={NoticeStatus.ACTIVE}
									className={value === NoticeStatus.ACTIVE ? 'li on active-tab' : 'li active-tab'}
								>
									Active ({getFilteredCount(NoticeStatus.ACTIVE)})
								</ListItem>
								<ListItem
									onClick={(e: any) => tabChangeHandler(e, NoticeStatus.HOLD)}
									value={NoticeStatus.HOLD}
									className={value === NoticeStatus.HOLD ? 'li on hold-tab' : 'li hold-tab'}
								>
									Hold ({getFilteredCount(NoticeStatus.HOLD)})
								</ListItem>
								<ListItem
									onClick={(e: any) => tabChangeHandler(e, NoticeStatus.DELETE)}
									value={NoticeStatus.DELETE}
									className={value === NoticeStatus.DELETE ? 'li on delete-tab' : 'li delete-tab'}
								>
									Deleted ({getFilteredCount(NoticeStatus.DELETE)})
								</ListItem>
							</List>
							<Divider />
							<Stack className={'search-area'} sx={{ m: '24px' }}>
								<OutlinedInput
									value={searchText}
									onChange={(e: any) => textHandler(e.target.value)}
									sx={{ width: '100%' }}
									className={'search'}
									placeholder="Search FAQ title or content"
									onKeyDown={(event) => {
										if (event.key == 'Enter') searchTextHandler();
									}}
									endAdornment={
										<>
											{searchText && (
												<CancelRoundedIcon
													style={{ cursor: 'pointer', marginRight: '8px' }}
													onClick={() => {
														setSearchText('');
														searchTextHandler();
													}}
												/>
											)}
											<InputAdornment position="end" onClick={() => searchTextHandler()}>
												<img src="/img/icons/search_icon.png" alt={'searchIcon'} />
											</InputAdornment>
										</>
									}
								/>
							</Stack>
							<Divider />
						</Box>
						<FaqArticlesPanelList
							faqList={faqList}
							anchorEl={anchorEl}
							menuIconClickHandler={menuIconClickHandler}
							menuIconCloseHandler={menuIconCloseHandler}
							updateFaqHandler={updateFaqHandler}
							value={value}
						/>

						<TablePagination
							rowsPerPageOptions={[10, 20, 40, 60]}
							component="div"
							count={totalCount}
							rowsPerPage={rowsPerPage}
							page={page}
							onPageChange={changePageHandler}
							onRowsPerPageChange={changeRowsPerPageHandler}
						/>
					</TabContext>
				</Box>
			</Box>
		</Box>
	);
};

export default withAdminLayout(FaqArticles);
