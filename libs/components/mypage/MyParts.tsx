import React, { useState } from 'react';
import { NextPage } from 'next';
import { Button, Pagination, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import PartCard from '../part/PartCard';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Part } from '../../types/part/part';
import { AgentPartsInquiry } from '../../types/part/part.input';
import { T } from '../../types/common';
import { PartStatus } from '../../enums/part.enum';
import { userVar } from '../../../apollo/store';
import { useRouter } from 'next/router';
import { UPDATE_PART } from '../../../apollo/user/mutation';
import { GET_AGENT_PARTS } from '../../../apollo/user/query';
import { useTranslation } from 'next-i18next';
import { sweetConfirmAlert, sweetErrorHandling } from '../../sweetAlert';

const MyParts: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const { t } = useTranslation('common');
	const [searchFilter, setSearchFilter] = useState<AgentPartsInquiry>(initialInput);
	const [agentParts, setAgentParts] = useState<Part[]>([]);
	const [total, setTotal] = useState<number>(0);
	const user = useReactiveVar(userVar);
	const router = useRouter();

	/** APOLLO REQUESTS **/
	const [updatePart] = useMutation(UPDATE_PART);

	const { refetch: getAgentPartsRefetch } = useQuery(GET_AGENT_PARTS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setAgentParts(data?.getAgentParts?.list);
			setTotal(data?.getAgentParts?.metaCounter[0]?.total ?? 0);
		},
	});

	/** HANDLERS **/
	const paginationHandler = (e: T, value: number) => {
		setSearchFilter({ ...searchFilter, page: value });
	};

	const changeStatusHandler = (value: PartStatus) => {
		setSearchFilter({ ...searchFilter, search: { partStatus: value } });
	};

	const deletePartHandler = async (id: string) => {
		try {
			if (await sweetConfirmAlert('Are you sure to delete this part?')) {
				await updatePart({ variables: { input: { _id: id, partStatus: 'DELETE' } } });
				await getAgentPartsRefetch({ input: searchFilter });
			}
		} catch (err: any) {
			await sweetErrorHandling(err);
		}
	};

	if (user?.memberType !== 'AGENT') {
		router.back();
	}

	if (device === 'mobile') {
		return <div>MOTOPRESTO PARTS MOBILE</div>;
	} else {
		return (
			<div id="my-property-page">
				<Stack className="main-title-box">
					<Stack className="left-header">
						<Typography className="section-label">{t('INVENTORY')}</Typography>
						<Stack className="right-box">
							<Typography className="main-title">{t('My Parts')}</Typography>
							<Typography className="sub-title">{t('Manage your spare parts & accessories listings.')}</Typography>
						</Stack>
					</Stack>
					<Stack className="header-right">
						<Typography className="bikes-count">{total} items</Typography>
						<Button className="add-bike-button" onClick={() => router.push('/mypage?category=addPart')}>
							{t('Add Part')}
						</Button>
					</Stack>
				</Stack>
				<Stack className="property-list-box">
					<Stack className="tab-name-box">
						<Typography
							onClick={() => changeStatusHandler(PartStatus.ACTIVE)}
							className={searchFilter.search.partStatus === 'ACTIVE' ? 'active-tab-name' : 'tab-name'}
						>
							Active
						</Typography>
						<Typography
							onClick={() => changeStatusHandler(PartStatus.HOLD)}
							className={searchFilter.search.partStatus === 'HOLD' ? 'active-tab-name' : 'tab-name'}
						>
							Blocked
						</Typography>
						<Typography
							onClick={() => changeStatusHandler(PartStatus.SOLD)}
							className={searchFilter.search.partStatus === 'SOLD' ? 'active-tab-name' : 'tab-name'}
						>
							Sold
						</Typography>
					</Stack>
					<Stack className="list-box">
						{agentParts?.length === 0 ? (
							<div className={'no-data'}>
								<img src="/img/icons/icoAlert.svg" alt="" />
								<p>{t('No parts found!')}</p>
							</div>
						) : (
							agentParts.map((part: Part) => {
								return <PartCard key={part._id} part={part} recentlyVisited={true} deletePartHandler={deletePartHandler} />;
							})
						)}

						{agentParts.length !== 0 && (
							<Stack className="pagination-config">
								<Stack className="pagination-box">
									<Pagination
										count={Math.ceil(total / searchFilter.limit)}
										page={searchFilter.page}
										shape="circular"
										color="primary"
										onChange={paginationHandler}
									/>
								</Stack>
								<Stack className="total-result">
									<Typography>{total} items available</Typography>
								</Stack>
							</Stack>
						)}
					</Stack>
				</Stack>
			</div>
		);
	}
};

MyParts.defaultProps = {
	initialInput: {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		search: {
			partStatus: 'ACTIVE',
		},
	},
};

export default MyParts;
