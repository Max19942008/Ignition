import React, { useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Pagination, Stack, Typography } from '@mui/material';
import PartCard from '../part/PartCard';
import { Part } from '../../types/part/part';
import { T } from '../../types/common';
import { GET_VISITED_PARTS } from '../../../apollo/user/query';
import { useQuery } from '@apollo/client';
import { useTranslation } from 'next-i18next';

const RecentlyVisitedParts: NextPage = () => {
	const device = useDeviceDetect();
	const { t } = useTranslation('common');
	const [recentlyVisited, setRecentlyVisited] = useState<Part[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [searchVisited, setSearchVisited] = useState<T>({ page: 1, limit: 6 });

	/** APOLLO REQUESTS **/
	const { refetch: getVisitedPartsRefetch } = useQuery(GET_VISITED_PARTS, {
		fetchPolicy: 'network-only',
		variables: { input: searchVisited },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setRecentlyVisited(data?.getVisitedParts?.list);
			setTotal(data?.getVisitedParts?.metaCounter[0]?.total || 0);
		},
	});

	/** HANDLERS **/
	const paginationHandler = (e: T, value: number) => {
		setSearchVisited({ ...searchVisited, page: value });
	};

	if (device === 'mobile') {
		return <div>MOTOPRESTO RECENTLY VISITED PARTS MOBILE</div>;
	} else {
		return (
			<div id="my-favorites-page">
				<Stack className="main-title-box">
					<Stack className="left-header">
						<Typography className="section-label">{t('HISTORY')}</Typography>
						<Stack className="right-box">
							<Typography className="main-title">{t('Recently Visited Parts')}</Typography>
							<Typography className="sub-title">{t("Revisit parts & accessories you've explored")}</Typography>
						</Stack>
					</Stack>
					<Stack className="header-right">
						<Typography className="bikes-count">{total} items</Typography>
					</Stack>
				</Stack>
				<Stack className="favorites-list-box">
					{recentlyVisited?.length ? (
						recentlyVisited?.map((part: Part) => {
							return <PartCard key={part._id} part={part} recentlyVisited={true} />;
						})
					) : (
						<div className={'no-data'}>
							<img src="/img/icons/icoAlert.svg" alt="" />
							<p>{t('No Recently Visited parts found!')}</p>
						</div>
					)}
				</Stack>
				{recentlyVisited?.length ? (
					<Stack className="pagination-config">
						<Stack className="pagination-box">
							<Pagination
								count={Math.ceil(total / searchVisited.limit)}
								page={searchVisited.page}
								shape="circular"
								color="primary"
								onChange={paginationHandler}
							/>
						</Stack>
						<Stack className="total-result">
							<Typography>{total} items available</Typography>
						</Stack>
					</Stack>
				) : null}
			</div>
		);
	}
};

export default RecentlyVisitedParts;
