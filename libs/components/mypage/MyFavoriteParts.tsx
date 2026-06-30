import React, { useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Pagination, Stack, Typography } from '@mui/material';
import PartCard from '../part/PartCard';
import { Part } from '../../types/part/part';
import { T } from '../../types/common';
import { useMutation, useQuery } from '@apollo/client';
import { LIKE_TARGET_PART } from '../../../apollo/user/mutation';
import { GET_FAVORITE_PARTS } from '../../../apollo/user/query';
import { Messages } from '../../config';
import { sweetMixinErrorAlert } from '../../sweetAlert';
import { useTranslation } from 'next-i18next';

const MyFavoriteParts: NextPage = () => {
	const device = useDeviceDetect();
	const { t } = useTranslation('common');
	const [myFavorites, setMyFavorites] = useState<Part[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [searchFavorites, setSearchFavorites] = useState<T>({ page: 1, limit: 6 });

	/** APOLLO REQUESTS **/
	const [likeTargetPart] = useMutation(LIKE_TARGET_PART);

	const { refetch: getFavoritePartsRefetch } = useQuery(GET_FAVORITE_PARTS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFavorites },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setMyFavorites(data?.getFavoriteParts?.list);
			setTotal(data?.getFavoriteParts?.metaCounter[0]?.total || 0);
		},
	});

	/** HANDLERS **/
	const paginationHandler = (e: T, value: number) => {
		setSearchFavorites({ ...searchFavorites, page: value });
	};

	const likePartHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);
			await likeTargetPart({ variables: { input: id } });
			await getFavoritePartsRefetch({ input: searchFavorites });
		} catch (err: any) {
			console.log('ERROR likePartHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	if (device === 'mobile') {
		return <div>MOTOPRESTO MY FAVORITE PARTS MOBILE</div>;
	} else {
		return (
			<div id="my-favorites-page">
				<Stack className="main-title-box">
					<Stack className="left-header">
						<Typography className="section-label">{t('FAVORITES')}</Typography>
						<Stack className="right-box">
							<Typography className="main-title">{t('My Favorite Parts')}</Typography>
							<Typography className="sub-title">{t('Save and revisit your preferred parts & accessories')}</Typography>
						</Stack>
					</Stack>
					<Stack className="header-right">
						<Typography className="bikes-count">{total} items</Typography>
					</Stack>
				</Stack>
				<Stack className="favorites-list-box">
					{myFavorites?.length ? (
						myFavorites?.map((part: Part) => {
							return <PartCard key={part._id} part={part} myFavorites={true} likePartHandler={likePartHandler} />;
						})
					) : (
						<div className={'no-data'}>
							<img src="/img/icons/icoAlert.svg" alt="" />
							<p>{t('No Favorites found!')}</p>
						</div>
					)}
				</Stack>
				{myFavorites?.length ? (
					<Stack className="pagination-config">
						<Stack className="pagination-box">
							<Pagination
								count={Math.ceil(total / searchFavorites.limit)}
								page={searchFavorites.page}
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

export default MyFavoriteParts;
