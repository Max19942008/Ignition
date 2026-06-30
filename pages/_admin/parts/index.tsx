import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { Box, List, ListItem, Stack } from '@mui/material';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { TabContext } from '@mui/lab';
import TablePagination from '@mui/material/TablePagination';
import { PartPanelList } from '../../../libs/components/admin/parts/PartList';
import { AllPartsInquiry } from '../../../libs/types/part/part.input';
import { Part } from '../../../libs/types/part/part';
import { PartCategory, PartStatus } from '../../../libs/enums/part.enum';
import { sweetConfirmAlert, sweetErrorHandling } from '../../../libs/sweetAlert';
import { PartUpdate } from '../../../libs/types/part/part.update';
import { useMutation, useQuery } from '@apollo/client';
import { REMOVE_PART_BY_ADMIN, UPDATE_PART_BY_ADMIN } from '../../../apollo/admin/mutation';
import { GET_ALL_PARTS_BY_ADMIN } from '../../../apollo/admin/query';
import { T } from '../../../libs/types/common';

const AdminParts: NextPage = ({ initialInquiry, ...props }: any) => {
	const [anchorEl, setAnchorEl] = useState<[] | HTMLElement[]>([]);
	const [partsInquiry, setPartsInquiry] = useState<AllPartsInquiry>(initialInquiry);
	const [parts, setParts] = useState<Part[]>([]);
	const [partsTotal, setPartsTotal] = useState<number>(0);
	const [value, setValue] = useState(partsInquiry?.search?.partStatus ? partsInquiry?.search?.partStatus : 'ALL');
	const [searchType, setSearchType] = useState('ALL');

	/** APOLLO REQUESTS **/
	const [updatePartByAdmin] = useMutation(UPDATE_PART_BY_ADMIN);
	const [removePartByAdmin] = useMutation(REMOVE_PART_BY_ADMIN);

	const { refetch: getAllPartsByAdminRefetch } = useQuery(GET_ALL_PARTS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: partsInquiry },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setParts(data?.getAllPartsByAdmin?.list);
			setPartsTotal(data?.getAllPartsByAdmin?.metaCounter[0]?.total ?? 0);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		getAllPartsByAdminRefetch({ input: partsInquiry }).then();
	}, [partsInquiry]);

	/** HANDLERS **/
	const changePageHandler = async (event: unknown, newPage: number) => {
		partsInquiry.page = newPage + 1;
		getAllPartsByAdminRefetch({ input: partsInquiry });
		setPartsInquiry({ ...partsInquiry });
	};

	const changeRowsPerPageHandler = async (event: React.ChangeEvent<HTMLInputElement>) => {
		partsInquiry.limit = parseInt(event.target.value, 10);
		partsInquiry.page = 1;
		getAllPartsByAdminRefetch({ input: partsInquiry });
		setPartsInquiry({ ...partsInquiry });
	};

	const menuIconClickHandler = (e: any, index: number) => {
		const tempAnchor = anchorEl.slice();
		tempAnchor[index] = e.currentTarget;
		setAnchorEl(tempAnchor);
	};

	const menuIconCloseHandler = () => {
		setAnchorEl([]);
	};

	const tabChangeHandler = async (event: any, newValue: string) => {
		setValue(newValue);
		setPartsInquiry({ ...partsInquiry, page: 1, sort: 'createdAt' });

		switch (newValue) {
			case 'ACTIVE':
				setPartsInquiry({ ...partsInquiry, search: { partStatus: PartStatus.ACTIVE } });
				break;
			case 'SOLD':
				setPartsInquiry({ ...partsInquiry, search: { partStatus: PartStatus.SOLD } });
				break;
			case 'DELETE':
				setPartsInquiry({ ...partsInquiry, search: { partStatus: PartStatus.DELETE } });
				break;
			default:
				delete partsInquiry?.search?.partStatus;
				setPartsInquiry({ ...partsInquiry });
				break;
		}
	};

	const removePartHandler = async (id: string) => {
		try {
			if (await sweetConfirmAlert('Are you sure to remove?')) {
				await removePartByAdmin({ variables: { input: id } });
				getAllPartsByAdminRefetch({ input: partsInquiry });
			}
			menuIconCloseHandler();
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const searchTypeHandler = async (newValue: string) => {
		try {
			setSearchType(newValue);
			if (newValue !== 'ALL') {
				setPartsInquiry({
					...partsInquiry,
					page: 1,
					sort: 'createdAt',
					search: {
						...partsInquiry.search,
						partCategoryList: [newValue as PartCategory],
					},
				});
			} else {
				delete partsInquiry?.search?.partCategoryList;
				setPartsInquiry({ ...partsInquiry });
			}
		} catch (err: any) {
			console.log('searchTypeHandler: ', err.message);
		}
	};

	const updatePartHandler = async (updateData: PartUpdate) => {
		try {
			await updatePartByAdmin({ variables: { input: updateData } });
			menuIconCloseHandler();
		} catch (err: any) {
			menuIconCloseHandler();
			sweetErrorHandling(err).then();
		}
	};

	return (
		<Box component={'div'} className={'content'}>
			<Typography variant={'h2'} className={'tit'} sx={{ mb: '24px' }}>
				Parts & Accessories List
			</Typography>
			<Box component={'div'} className={'table-wrap'}>
				<Box component={'div'} sx={{ width: '100%', typography: 'body1' }}>
					<TabContext value={value}>
						<Box component={'div'}>
							<List className={'tab-menu'}>
								<ListItem onClick={(e: any) => tabChangeHandler(e, 'ALL')} value="ALL" className={value === 'ALL' ? 'li on' : 'li'}>
									All
								</ListItem>
								<ListItem
									onClick={(e: any) => tabChangeHandler(e, 'ACTIVE')}
									value="ACTIVE"
									className={value === 'ACTIVE' ? 'li on' : 'li'}
								>
									Active
								</ListItem>
								<ListItem
									onClick={(e: any) => tabChangeHandler(e, 'SOLD')}
									value="SOLD"
									className={value === 'SOLD' ? 'li on' : 'li'}
								>
									Sold
								</ListItem>
								<ListItem
									onClick={(e: any) => tabChangeHandler(e, 'DELETE')}
									value="DELETE"
									className={value === 'DELETE' ? 'li on' : 'li'}
								>
									Delete
								</ListItem>
							</List>
							<Divider />
							<Stack className={'search-area'} sx={{ m: '24px' }}>
								<Select sx={{ width: '160px', mr: '20px' }} value={searchType}>
									<MenuItem value={'ALL'} onClick={() => searchTypeHandler('ALL')}>
										ALL
									</MenuItem>
									{Object.values(PartCategory).map((category: string) => (
										<MenuItem value={category} onClick={() => searchTypeHandler(category)} key={category}>
											{category.replace('_', ' ')}
										</MenuItem>
									))}
								</Select>
							</Stack>
							<Divider />
						</Box>
						<PartPanelList
							parts={parts}
							anchorEl={anchorEl}
							menuIconClickHandler={menuIconClickHandler}
							menuIconCloseHandler={menuIconCloseHandler}
							updatePartHandler={updatePartHandler}
							removePartHandler={removePartHandler}
						/>

						<TablePagination
							rowsPerPageOptions={[10, 20, 40, 60]}
							component="div"
							count={partsTotal}
							rowsPerPage={partsInquiry?.limit}
							page={partsInquiry?.page - 1}
							onPageChange={changePageHandler}
							onRowsPerPageChange={changeRowsPerPageHandler}
						/>
					</TabContext>
				</Box>
			</Box>
		</Box>
	);
};

AdminParts.defaultProps = {
	initialInquiry: {
		page: 1,
		limit: 10,
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	},
};

export default withAdminLayout(AdminParts);
