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
import { NoticeList } from '../../../libs/components/admin/cs/NoticeList';
import { useRouter } from 'next/router';
import { NoticeStatus } from '../../../libs/enums/notice.enum';
import { sweetErrorHandling } from '../../../libs/sweetAlert';

const AdminNotice: NextPage = (props: any) => {
	const router = useRouter();
	const [anchorEl, setAnchorEl] = useState<[] | HTMLElement[]>([]);
	const [value, setValue] = useState('ALL');
	const [searchText, setSearchText] = useState('');
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [totalCount, setTotalCount] = useState(0);
	const [noticeList, setNoticeList] = useState<any[]>([]);
	const [selected, setSelected] = useState<string[]>([]);

	/** APOLLO REQUESTS **/
	// TODO: Add GraphQL queries when backend is ready

	/** LIFECYCLES **/
	useEffect(() => {
		// Mock data for now - replace with actual GraphQL query
		const mockData = [
			{
				_id: '1',
				category: 'Notice',
				title: 'New Feature Release',
				writer: 'Admin',
				date: '2024-01-15',
				view: 1250,
				status: NoticeStatus.ACTIVE,
			},
			{
				_id: '2',
				category: 'Notice',
				title: 'Maintenance Schedule',
				writer: 'Admin',
				date: '2024-01-14',
				view: 890,
				status: NoticeStatus.ACTIVE,
			},
			{
				_id: '3',
				category: 'Notice',
				title: 'System Update',
				writer: 'Admin',
				date: '2024-01-13',
				view: 567,
				status: NoticeStatus.HOLD,
			},
			{
				_id: '4',
				category: 'Notice',
				title: 'Old Notice',
				writer: 'Admin',
				date: '2024-01-12',
				view: 234,
				status: NoticeStatus.DELETE,
			},
		];
		setNoticeList(mockData);
		setTotalCount(mockData.length);
	}, []);

	/** HANDLERS **/
	const tabChangeHandler = async (event: any, newValue: string) => {
		setValue(newValue);
		setSearchText('');
		setPage(0);
		setSelected([]);
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

	const updateNoticeHandler = async (updateData: any) => {
		try {
			// TODO: Implement update mutation when backend is ready
			menuIconCloseHandler();
			// await refetchNotice();
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const deleteNoticeHandler = async (id: string) => {
		try {
			// TODO: Implement delete mutation when backend is ready
			console.log('Deleting notice:', id);
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

	const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.checked) {
			const newSelected = filteredList.map((n) => n._id);
			setSelected(newSelected);
			return;
		}
		setSelected([]);
	};

	const handleClick = (event: React.MouseEvent<unknown>, id: string) => {
		const selectedIndex = selected.indexOf(id);
		let newSelected: string[] = [];

		if (selectedIndex === -1) {
			newSelected = newSelected.concat(selected, id);
		} else if (selectedIndex === 0) {
			newSelected = newSelected.concat(selected.slice(1));
		} else if (selectedIndex === selected.length - 1) {
			newSelected = newSelected.concat(selected.slice(0, -1));
		} else if (selectedIndex > 0) {
			newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
		}

		setSelected(newSelected);
	};

	const isSelected = (id: string) => selected.indexOf(id) !== -1;

	const getFilteredCount = (status: string) => {
		if (status === 'ALL') return totalCount;
		return noticeList.filter((item) => item.status === status).length;
	};

	const filteredList = value === 'ALL' ? noticeList : noticeList.filter((item) => item.status === value);

	return (
		<Box component={'div'} className={'content'}>
			<Box component={'div'} className={'title flex_space'}>
				<Typography variant={'h2'} className={'tit'}>
					Notice Management
				</Typography>
				<Button
					className="btn_add"
					variant={'contained'}
					size={'medium'}
					onClick={() => router.push(`/_admin/cs/notice_create`)}
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
									placeholder="Search notice title or content"
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
						<NoticeList
							noticeList={filteredList}
							anchorEl={anchorEl}
							menuIconClickHandler={menuIconClickHandler}
							menuIconCloseHandler={menuIconCloseHandler}
							updateNoticeHandler={updateNoticeHandler}
							deleteNoticeHandler={deleteNoticeHandler}
							selected={selected}
							handleSelectAllClick={handleSelectAllClick}
							handleClick={handleClick}
							isSelected={isSelected}
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

export default withAdminLayout(AdminNotice);
