import React, { useState, useCallback, useEffect } from 'react';
import { Stack, Box, Divider, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Property } from '../../types/property/property';
import { REACT_APP_API_URL } from '../../config';
import { formatterStr } from '../../utils';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { useRouter } from 'next/router';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import EngineeringIcon from '@mui/icons-material/Engineering';
import SpeedIcon from '@mui/icons-material/Speed';
import LabelIcon from '@mui/icons-material/Label';
import LocationOnIcon from '@mui/icons-material/LocationOn';

interface PropertyBigCardProps {
	property: Property;
	likePropertyHandler?: any;
}

const PropertyBigCard = (props: PropertyBigCardProps) => {
	const { property, likePropertyHandler } = props;
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const router = useRouter();
	
	// Optimistic update uchun local state
	const [optimisticLikes, setOptimisticLikes] = useState<number | null>(null);
	const [optimisticLiked, setOptimisticLiked] = useState<boolean | null>(null);
	const [isLiking, setIsLiking] = useState<boolean>(false);

	// Property o'zgarganda optimistic state ni tozalash
	useEffect(() => {
		if (property && !isLiking) {
			const currentLiked = property?.meLiked && property?.meLiked[0]?.myFavorite;
			const currentLikes = property?.propertyLikes || 0;
			
			// Agar optimistic state va property state bir xil bo'lsa, tozalash
			if (optimisticLiked !== null && optimisticLiked === currentLiked && 
			    optimisticLikes !== null && optimisticLikes === currentLikes) {
				setOptimisticLiked(null);
				setOptimisticLikes(null);
			}
		}
	}, [property?._id, property?.meLiked?.[0]?.myFavorite, property?.propertyLikes, isLiking]);

	// Joriy like holati va soni
	const isLiked = optimisticLiked !== null ? optimisticLiked : (property?.meLiked && property?.meLiked[0]?.myFavorite);
	const likesCount = optimisticLikes !== null ? optimisticLikes : (property?.propertyLikes || 0);

	/** HANDLERS **/
	const goPropertyDetatilPage = (propertyId: string) => {
		router.push(`/property/detail?id=${propertyId}`);
	};

	const handleLikeClick = useCallback(async (e: any) => {
		e.stopPropagation();
		e.preventDefault();
		
		if (!likePropertyHandler || !user || !property?._id || isLiking) return;

		setIsLiking(true);

		// Optimistic update - darhol UI ni yangilash
		const currentLiked = property?.meLiked && property?.meLiked[0]?.myFavorite;
		const currentLikes = property?.propertyLikes || 0;
		const newLiked = !currentLiked;
		const newLikes = newLiked ? currentLikes + 1 : Math.max(0, currentLikes - 1);

		setOptimisticLiked(newLiked);
		setOptimisticLikes(newLikes);

		try {
			await likePropertyHandler(user, property._id);
			setIsLiking(false);
			// Success dan keyin optimistic state ni tozalash (parent komponent yangilaydi)
			setTimeout(() => {
				setOptimisticLiked(null);
				setOptimisticLikes(null);
			}, 500);
		} catch (error) {
			// Xatolik bo'lsa, optimistic update ni bekor qilish
			setOptimisticLiked(null);
			setOptimisticLikes(null);
			setIsLiking(false);
		}
	}, [likePropertyHandler, user, property, isLiking]);

	if (device === 'mobile') {
		return <div>BIKE BIG CARD</div>;
	} else {
		return (
			<Stack className="property-big-card-box" onClick={() => goPropertyDetatilPage(property?._id)}>
				<Box
					component={'div'}
					className={'card-img'}
					style={{ backgroundImage: `url(${REACT_APP_API_URL}/${property?.propertyImages?.[0]})` }}
				>
					{property?.propertyRank && property?.propertyRank >= 50 && (
						<div className={'status'}>
							<img src="/img/icons/electricity.svg" alt="" />
							<span>top</span>
						</div>
					)}

					<div className={'price'}>${formatterStr(property?.propertyPrice)}</div>
				</Box>
				<Box component={'div'} className={'info'}>
					<strong className={'title'}>{property?.propertyTitle}</strong>
					<div className={'desc-wrapper'}>
						<LocationOnIcon className={'location-icon'} />
						<p className={'desc'}>{property?.propertyLocation || property?.propertyAddress}</p>
					</div>
					<div className={'options'}>
						<div className={'option-item'}>
							<EngineeringIcon className={'option-icon'} />
							<span>{property?.propertyEngineCc || 0} CC</span>
						</div>
						<div className={'option-item'}>
							<SpeedIcon className={'option-icon'} />
							<span>{property?.propertyMileAge || 0} km</span>
						</div>
						<div className={'option-item'}>
							<LabelIcon className={'option-icon'} />
							<span>{property?.propertyBrand || property?.propertyType || 'N/A'}</span>
						</div>
					</div>
					<Divider sx={{ mt: '15px', mb: '17px' }} />
					<div className={'bott'}>
						<div className={'options-badges'}>
							{property?.propertyRent ? (
								<span className={'badge badge-rent'}>Rent Available</span>
							) : (
								<span className={'badge badge-disabled'}>Rent</span>
							)}
							{property?.propertyBarter ? (
								<span className={'badge badge-barter'}>Barter</span>
							) : (
								<span className={'badge badge-disabled'}>Barter</span>
							)}
						</div>
						<div className="buttons-box">
							<IconButton className={'icon-btn'} color={'default'}>
								<RemoveRedEyeIcon />
							</IconButton>
							<Typography className="view-cnt">{property?.propertyViews || 0}</Typography>
							<IconButton
								className={`icon-btn ${isLiked ? 'liked' : ''} ${isLiking ? 'liking' : ''}`}
								color={'default'}
								disabled={isLiking}
								sx={{ 
									cursor: isLiking ? 'wait' : 'pointer', 
									opacity: isLiking ? 0.7 : 1,
									transition: 'all 0.2s ease'
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
	}
};

export default PropertyBigCard;
