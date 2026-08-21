import React, { useState, useCallback, useEffect } from 'react';
import { Stack, Box, Divider, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import CategoryIcon from '@mui/icons-material/Category';
import BuildIcon from '@mui/icons-material/Build';
import LabelIcon from '@mui/icons-material/Label';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import { Part } from '../../types/part/part';
import { PartCategory } from '../../enums/part.enum';
import { REACT_APP_API_URL } from '../../config';
import { formatPrice } from '../../utils';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import PartCard from './PartCard';

interface PartBigCardProps {
	part: Part;
	likePartHandler?: any;
}

/**
 * The wide "related items" card, the parts twin of PropertyBigCard. It keeps the
 * same `.property-big-card-box` shell so the related-section styling (grid,
 * stagger animation, hover lift) applies unchanged, and layers the part-only
 * bits — category ribbon, stock state, fitment strip — on top of it.
 */
const PartBigCard = (props: PartBigCardProps) => {
	const { part, likePartHandler } = props;
	const device = useDeviceDetect();
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const router = useRouter();

	/** Like is echoed locally first so the card reacts on the click, not on the refetch. */
	const [optimisticLikes, setOptimisticLikes] = useState<number | null>(null);
	const [optimisticLiked, setOptimisticLiked] = useState<boolean | null>(null);
	const [isLiking, setIsLiking] = useState<boolean>(false);

	useEffect(() => {
		if (part && !isLiking) {
			const currentLiked = part?.meLiked && part?.meLiked[0]?.myFavorite;
			const currentLikes = part?.partLikes || 0;

			if (
				optimisticLiked !== null &&
				optimisticLiked === currentLiked &&
				optimisticLikes !== null &&
				optimisticLikes === currentLikes
			) {
				setOptimisticLiked(null);
				setOptimisticLikes(null);
			}
		}
	}, [part?._id, part?.meLiked?.[0]?.myFavorite, part?.partLikes, isLiking]);

	const isLiked = optimisticLiked !== null ? optimisticLiked : part?.meLiked && part?.meLiked[0]?.myFavorite;
	const likesCount = optimisticLikes !== null ? optimisticLikes : part?.partLikes || 0;

	const isAccessory = part?.partCategory === PartCategory.ACCESSORY;
	const categoryLabel = isAccessory ? t('Accessory') : t('Spare Part');
	const stockCount = part?.partStockCount ?? 0;
	const inStock = stockCount > 0;

	/** Fitment is the question a parts buyer actually asks, so it gets its own strip. */
	const compatibleBrands = part?.partCompatibleBrands?.length ? part.partCompatibleBrands : null;

	/** HANDLERS **/
	const goPartDetailPage = (partId: string) => {
		router.push(`/part/detail?id=${partId}`);
	};

	const handleLikeClick = useCallback(
		async (e: any) => {
			e.stopPropagation();
			e.preventDefault();

			if (!likePartHandler || !user || !part?._id || isLiking) return;

			setIsLiking(true);

			const currentLiked = part?.meLiked && part?.meLiked[0]?.myFavorite;
			const currentLikes = part?.partLikes || 0;
			const newLiked = !currentLiked;
			const newLikes = newLiked ? currentLikes + 1 : Math.max(0, currentLikes - 1);

			setOptimisticLiked(newLiked);
			setOptimisticLikes(newLikes);

			try {
				await likePartHandler(user, part._id);
				setIsLiking(false);
				setTimeout(() => {
					setOptimisticLiked(null);
					setOptimisticLikes(null);
				}, 500);
			} catch (error) {
				setOptimisticLiked(null);
				setOptimisticLikes(null);
				setIsLiking(false);
			}
		},
		[likePartHandler, user, part, isLiking],
	);

	/** RENDER **/
	if (device === 'mobile') {
		/** The phone layout already exists on PartCard — no reason to keep a second one. */
		return <PartCard part={part} likePartHandler={likePartHandler} />;
	}

	return (
		<Stack
			className={`property-big-card-box part-big-card ${isAccessory ? 'is-accessory' : 'is-spare'}`}
			onClick={() => goPartDetailPage(part?._id)}
		>
			<Box
				component={'div'}
				className={'card-img'}
				style={{
					backgroundImage: `url(${
						part?.partImages?.length ? `${REACT_APP_API_URL}/${part.partImages[0]}` : '/img/banner/header1.svg'
					})`,
				}}
			>
				{part?.partRank && part?.partRank >= 50 ? (
					<div className={'status'}>
						<img src="/img/icons/electricity.svg" alt="" />
						<span>top</span>
					</div>
				) : null}

				<div className={'category-ribbon'}>
					{isAccessory ? <TwoWheelerIcon /> : <BuildIcon />}
					<span>{categoryLabel}</span>
				</div>

				<div className={'price'}>{formatPrice(part?.partPrice, part?.partCurrency)}</div>
			</Box>

			<Box component={'div'} className={'info'}>
				<strong className={'title'}>{part?.partTitle}</strong>
				<div className={'desc-wrapper'}>
					<LocationOnIcon className={'location-icon'} />
					<p className={'desc'}>{part?.partLocation ? t(part.partLocation) : ''}</p>
				</div>

				<div className={'options'}>
					<div className={'option-item'}>
						<CategoryIcon className={'option-icon'} />
						<span>{part?.partType ? t(part.partType) : 'N/A'}</span>
					</div>
					<div className={'option-item'}>
						<BuildIcon className={'option-icon'} />
						<span>{part?.partCondition ? t(part.partCondition) : 'N/A'}</span>
					</div>
					<div className={'option-item'}>
						<LabelIcon className={'option-icon'} />
						<span>{part?.partBrand || 'N/A'}</span>
					</div>
				</div>

				{compatibleBrands && (
					<div className={'fitment-strip'}>
						<TwoWheelerIcon className={'fitment-icon'} />
						<div className={'fitment-list'}>
							{compatibleBrands.slice(0, 3).map((brand) => (
								<span className={'fitment-chip'} key={brand}>
									{brand}
								</span>
							))}
							{compatibleBrands.length > 3 && (
								<span className={'fitment-chip more'}>+{compatibleBrands.length - 3}</span>
							)}
						</div>
					</div>
				)}

				<Divider sx={{ mt: '15px', mb: '17px' }} />

				<div className={'bott'}>
					<div className={'options-badges'}>
						<span className={`badge ${inStock ? 'badge-stock' : 'badge-disabled'}`}>
							{inStock ? `${stockCount} ${t('pcs')}` : t('Out of Stock')}
						</span>
						{part?.partBarter ? (
							<span className={'badge badge-barter'}>{t('Barter')}</span>
						) : (
							<span className={'badge badge-disabled'}>{t('Barter')}</span>
						)}
					</div>
					<div className="buttons-box">
						<IconButton className={'icon-btn'} color={'default'}>
							<RemoveRedEyeIcon />
						</IconButton>
						<Typography className="view-cnt">{part?.partViews || 0}</Typography>
						<IconButton
							className={`icon-btn ${isLiked ? 'liked' : ''} ${isLiking ? 'liking' : ''}`}
							color={'default'}
							disabled={isLiking}
							sx={{
								cursor: isLiking ? 'wait' : 'pointer',
								opacity: isLiking ? 0.7 : 1,
								transition: 'all 0.2s ease',
							}}
							onClick={handleLikeClick}
						>
							{isLiked ? (
								<FavoriteIcon className={'favorite-icon'} sx={{ color: '#e91e63', fontSize: 18 }} />
							) : (
								<FavoriteBorderIcon className={'favorite-icon'} sx={{ fontSize: 18 }} />
							)}
						</IconButton>
						<Typography className="view-cnt">{likesCount}</Typography>
					</div>
				</div>
			</Box>
		</Stack>
	);
};

export default PartBigCard;
