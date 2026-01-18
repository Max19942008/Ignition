import React, { useCallback, useEffect, useState } from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { Box, InputAdornment, Stack } from '@mui/material';
import { List, ListItem } from '@mui/material';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { TabContext } from '@mui/lab';
import OutlinedInput from '@mui/material/OutlinedInput';
import TablePagination from '@mui/material/TablePagination';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import { InquiryList } from '../../../libs/components/admin/cs/InquiryList';
import { NoticeStatus } from '../../../libs/enums/notice.enum';
import { sweetErrorHandling } from '../../../libs/sweetAlert';

const InquiryArticles: NextPage = (props: any) => {
	const [anchorEl, setAnchorEl] = useState<[] | HTMLElement[]>([]);
	const [value, setValue] = useState('ALL');
	const [searchText, setSearchText] = useState('');
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [totalCount, setTotalCount] = useState(0);
	const [inquiryList, setInquiryList] = useState<any[]>([]);

	/** APOLLO REQUESTS **/
	// TODO: Add GraphQL queries when backend is ready

	/** LIFECYCLES **/
	useEffect(() => {
		// Mock data for now - replace with actual GraphQL query
		const mockData = [
			{
				_id: '1',
				category: 'Account',
				title: 'How to change password?',
				writer: 'User123',
				date: '2024-01-15',
				qna_case_status: 'PENDING',
			},
			{
				_id: '2',
				category: 'Payment',
				title: 'Refund request',
				writer: 'User456',
				date: '2024-01-14',
				qna_case_status: 'RESPONDED',
			},
			{
				_id: '3',
				category: 'Technical',
				title: 'App not working',
				writer: 'User789',
				date: '2024-01-13',
				qna_case_status: 'RESOLVED',
			},
			{
				_id: '4',
				category: 'General',
				title: 'Question about service',
				writer: 'User012',
				date: '2024-01-12',
				qna_case_status: 'CLOSED',
			},
		];
		setInquiryList(mockData);
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

	const updateInquiryHandler = async (updateData: any) => {
		try {
			// TODO: Implement update mutation when backend is ready
			menuIconCloseHandler();
			// await refetchInquiry();
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
		return inquiryList.filter((item) => item.qna_case_status === status).length;
	};

	const filteredList = value === 'ALL' ? inquiryList : inquiryList.filter((item) => item.qna_case_status === value);

	return (
		<Box component={'div'} className={'content'}>
			<Typography variant={'h2'} className={'tit'} sx={{ mb: '24px' }}>
				1:1 Inquiry Management
			</Typography>
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
									onClick={(e: any) => tabChangeHandler(e, 'PENDING')}
									value="PENDING"
									className={value === 'PENDING' ? 'li on pending-tab' : 'li pending-tab'}
								>
									Pending ({getFilteredCount('PENDING')})
								</ListItem>
								<ListItem
									onClick={(e: any) => tabChangeHandler(e, 'RESPONDED')}
									value="RESPONDED"
									className={value === 'RESPONDED' ? 'li on responded-tab' : 'li responded-tab'}
								>
									Responded ({getFilteredCount('RESPONDED')})
								</ListItem>
								<ListItem
									onClick={(e: any) => tabChangeHandler(e, 'RESOLVED')}
									value="RESOLVED"
									className={value === 'RESOLVED' ? 'li on resolved-tab' : 'li resolved-tab'}
								>
									Resolved ({getFilteredCount('RESOLVED')})
								</ListItem>
								<ListItem
									onClick={(e: any) => tabChangeHandler(e, 'CLOSED')}
									value="CLOSED"
									className={value === 'CLOSED' ? 'li on closed-tab' : 'li closed-tab'}
								>
									Closed ({getFilteredCount('CLOSED')})
								</ListItem>
							</List>
							<Divider />
							<Stack className={'search-area'} sx={{ m: '24px' }}>
								<OutlinedInput
									value={searchText}
									onChange={(e: any) => textHandler(e.target.value)}
									sx={{ width: '100%' }}
									className={'search'}
									placeholder="Search inquiry title, writer, or content"
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
						<InquiryList
							inquiryList={filteredList}
							anchorEl={anchorEl}
							menuIconClickHandler={menuIconClickHandler}
							menuIconCloseHandler={menuIconCloseHandler}
							updateInquiryHandler={updateInquiryHandler}
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

export default withAdminLayout(InquiryArticles);
