import React, { useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Pagination, Stack, Typography } from '@mui/material';
import PropertyCard from '../property/PropertyCard';
import { Property } from '../../types/property/property';
import { T } from '../../types/common';
import { GET_VISITED } from '../../../apollo/user/query';
import { useQuery } from '@apollo/client';
import { useTranslation } from 'next-i18next';

const RecentlyVisited: NextPage = () => {
	const device = useDeviceDetect();
	const { t } = useTranslation('common');
	const [recentlyVisited, setRecentlyVisited] = useState<Property[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [searchVisited, setSearchVisited] = useState<T>({ page: 1, limit: 6 });


	/** APOLLO REQUESTS **/

		const {
			loading: getVisitedLoading, 
			data: getVisitedData, 
			error: getVisitedError,
			refetch: getVisitedRefetch,
			 } = useQuery(GET_VISITED, {
			fetchPolicy: "network-only",
			variables: {input: searchVisited},
			notifyOnNetworkStatusChange: true,
			onCompleted: (data: T) => {
					setRecentlyVisited(data?.getVisited?.list);
					setTotal(data?.getVisited?.metaCounter[0]?.total || 0)
			},
			 });

	/** HANDLERS **/
	const paginationHandler = (e: T, value: number) => {
		setSearchVisited({ ...searchVisited, page: value });
	};

	if (device === 'mobile') {
		return <div>NESTAR MY FAVORITES MOBILE</div>;
	} else {
		return (
			<div id="my-favorites-page">
				<Stack className="main-title-box">
					<Stack className="left-header">
						<Typography className="section-label">{t('HISTORY')}</Typography>
						<Stack className="right-box">
							<Typography className="main-title">{t('Recently Visited')}</Typography>
							<Typography className="sub-title">{t("Browse your viewing history • Revisit bikes you've explored")}</Typography>
						</Stack>
					</Stack>
					<Stack className="header-right">
						<Typography className="bikes-count">{total} bikes</Typography>
						<Typography className="showing-text">Showing {((searchVisited.page - 1) * searchVisited.limit) + 1}-{Math.min(searchVisited.page * searchVisited.limit, total)} of {total}</Typography>
					</Stack>
				</Stack>
				<Stack className="favorites-list-box">
					{recentlyVisited?.length ? (
						recentlyVisited?.map((property: Property) => {
							return <PropertyCard key={property._id} property={property} recentlyVisited={true}  />;
						})
					) : (
						<div className={'no-data'}>
							<img src="/img/icons/icoAlert.svg" alt="" />
							<p>{t('No Recently Visited Properties found!')}</p>
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
							<Typography>
								{total} Bikes available
							</Typography>
						</Stack>
					</Stack>
				) : null}
			</div>
		);
	}
};

export default RecentlyVisited;
