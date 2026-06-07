import React, { useMemo } from 'react';
import { Stack, Typography, Box, Button, Chip, Divider } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Property } from '../../types/property/property';
import Link from 'next/link';
import { formatterStr } from '../../utils';
import { REACT_APP_API_URL } from '../../config';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import IconButton from '@mui/material/IconButton';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import StarIcon from '@mui/icons-material/Star';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SpeedIcon from '@mui/icons-material/Speed';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import EngineeringIcon from '@mui/icons-material/Engineering';
import ModeIcon from '@mui/icons-material/Mode';
import DeleteIcon from '@mui/icons-material/Delete';
import { useRouter } from 'next/router';
import { PropertyType, PropertyStatus } from '../../enums/property.enum';
import { useTranslation } from 'next-i18next';

interface PropertyCardType {
	property: Property;
	likePropertyHandler?: any;
	myFavorites?: boolean;
	recentlyVisited?: boolean;
	deletePropertyHandler?: any;
}

const PropertyCard = (props: PropertyCardType) => {
	const { property, likePropertyHandler, myFavorites, recentlyVisited, deletePropertyHandler } = props;
	const device = useDeviceDetect();
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const router = useRouter();
	const imagePath: string = useMemo(() => {
		if (property?.propertyImages?.length) return `${REACT_APP_API_URL}/${property.propertyImages[0]}`;
		return '/img/banner/header1.svg';
	}, [property]);

	const formattedPrice = useMemo(
		() => (property?.propertyPrice ? property.propertyPrice.toLocaleString() : '0'),
		[property?.propertyPrice],
	);

	const ratingValue = useMemo(() => {
		if (property?.propertyRank && property.propertyRank > 0) return (property.propertyRank / 10).toFixed(1);
		return '4.6';
	}, [property?.propertyRank]);

	const liked = myFavorites || (property?.meLiked && property?.meLiked[0]?.myFavorite);

	const handleBuyNow = () => {
		router.push({
			pathname: '/property/detail',
			query: { id: property?._id },
		});
	};

	const pushDetailHandler = async (propertyId: string) => {
		router.push({ pathname: '/property/detail', query: { id: propertyId } });
	};

	const getTypeBadgeColor = (type: PropertyType) => {
		switch (type) {
			case PropertyType.SPORT:
				return { bg: '#4CAF50', text: '#fff' };
			case PropertyType.CRUISER:
				return { bg: '#2196F3', text: '#fff' };
			case PropertyType.SCOOTER:
				return { bg: '#00BCD4', text: '#fff' };
			case PropertyType.TOURING:
				return { bg: '#9E9E9E', text: '#fff' };
			default:
				return { bg: '#667eea', text: '#fff' };
		}
	};

	const getStatusColor = (status: PropertyStatus) => {
		switch (status) {
			case PropertyStatus.ACTIVE:
				return { bg: '#4CAF50', text: '#fff' };
			case PropertyStatus.HOLD:
				return { bg: '#FF9800', text: '#fff' };
			case PropertyStatus.SOLD:
				return { bg: '#9E9E9E', text: '#fff' };
			default:
				return { bg: '#667eea', text: '#fff' };
		}
	};

	if (device === 'mobile') {
		return (
			<Stack className="property-card-box" key={property._id}>
				<Box 
					component={'div'} 
					className={'card-img'} 
					style={{ backgroundImage: `url(${imagePath})` }}
					onClick={() => {pushDetailHandler(property._id)}}
				>
					{property?.propertyType && (
						<Box component={'div'} className={'type-badge'}>
							<Typography>{property.propertyType}</Typography>
						</Box>
					)}
					<Stack flexDirection="row" className="img-bottom-row">
						<IconButton size="small" className="badge">
							<RemoveRedEyeIcon fontSize="small" />
							<Typography component="span" sx={{ fontSize: '11px', fontWeight: 700, color: '#fff', ml: 0.5 }}>{property?.propertyViews || 0}</Typography>
						</IconButton>
						<IconButton 
							size="small" 
							className={`badge like ${liked ? 'active' : ''}`} 
							onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
								e.preventDefault();
								e.stopPropagation();
								if (likePropertyHandler && user) {
									likePropertyHandler(user, property?._id);
								}
							}}
						>
							<FavoriteIcon fontSize="small" />
							<Typography component="span" sx={{ fontSize: '11px', fontWeight: 700, color: '#fff', ml: 0.5 }}>{property?.propertyLikes || 0}</Typography>
						</IconButton>
					</Stack>
				</Box>
				<Box component={'div'} className={'info'}>
					<Stack className="card-head">
						<Stack className="title-block">
							<strong className={'title'} onClick={() => {pushDetailHandler(property._id)}}>{property.propertyTitle}</strong>
							<span className={'subtitle'}>
								{property.propertyBrand} · {property.propertyYear}
							</span>
						</Stack>
						<Stack direction="row" alignItems="center" spacing={0.5} className="rating">
							<StarIcon fontSize="small" />
							<span>{ratingValue}</span>
						</Stack>
					</Stack>

					<Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} className="location-row">
						<Stack direction="row" alignItems="center" spacing={1}>
							<LocationOnIcon fontSize="small" />
							<span>{property.propertyLocation}</span>
						</Stack>
						<span>{property.propertyAddress}</span>
					</Stack>

					<Stack className="spec-row">
						<div className="spec">
							<SpeedIcon fontSize="small" />
							<span>{property.propertyMileAge || 0} {t('miles')}</span>
						</div>
						<div className="spec">
							<TwoWheelerIcon fontSize="small" />
							<span>{property.propertyCondition || 'N/A'}</span>
						</div>
						<div className="spec">
							<EngineeringIcon fontSize="small" />
							<span>{property.propertyEngineCc || 0} cc</span>
						</div>
					</Stack>

					<Divider sx={{ mt: '12px', mb: '14px' }} />

					<Stack className="card-foot">
						<Box component={'div'} className="price-box">
							<span className="from">{t('From')}</span>
							<strong className="price">${formattedPrice}</strong>
						</Box>
						<Button variant="contained" className="cta" onClick={handleBuyNow}>
							{t('Buy Now')}
						</Button>
					</Stack>
				</Box>
			</Stack>
		);
	} else if (myFavorites || recentlyVisited) {
		// Vertical layout for myFavorites and recentlyVisited
		return (
			<Stack className="card-config vertical-layout">
				<Stack className="image-section">
					<Box component={'div'} className="image-box">
						<Link
							href={{
								pathname: '/property/detail',
								query: { id: property?._id },
							}}
						>
							<img src={imagePath} alt={property.propertyTitle} />
						</Link>
						{property?.propertyType && (
							<Box 
								component={'div'}
								className="type-badge" 
								sx={{ 
									background: getTypeBadgeColor(property.propertyType).bg,
									color: getTypeBadgeColor(property.propertyType).text
								}}
							>
								<Typography>{property.propertyType}</Typography>
							</Box>
						)}
					</Box>
				</Stack>
				<Stack className="content-section">
					<Link
						href={{
							pathname: '/property/detail',
							query: { id: property?._id },
						}}
						style={{ textDecoration: 'none' }}
					>
						<Typography className="bike-name">{property.propertyTitle}</Typography>
					</Link>
					<Typography className="bike-details">
						{property.propertyBrand} • {property.propertyYear} • {property.propertyEngineCc}cc • {property.propertyCondition}
					</Typography>
					<Stack className="specs-row">
						<Chip label={`${property.propertyYear} ${t('Year')}`} className="spec-chip" />
						<Chip label={`${property.propertyEngineCc}cc`} className="spec-chip" />
						<Chip label={property.propertyLocation} className="spec-chip" />
					</Stack>
					<Box 
						component={'div'}
						className="status-badge" 
						sx={{ 
							background: getStatusColor(property.propertyStatus).bg,
							color: getStatusColor(property.propertyStatus).text
						}}
					>
						{property.propertyStatus}
					</Box>
				</Stack>
				<Stack className="actions-section">
					<Stack className="action-buttons">
						<IconButton 
							className="edit-button" 
							onClick={(e:any) => {
								e.preventDefault();
								router.push({
									pathname: '/mypage',
									query: { category: 'addProperty', propertyId: property._id },
								});
							}}
						>
							<ModeIcon />
						</IconButton>
						<IconButton 
							className="delete-button"
							onClick={(e:any) => {
								e.preventDefault();
								if (deletePropertyHandler) {
									deletePropertyHandler(property._id);
								}
							}}
						>
							<DeleteIcon />
						</IconButton>
					</Stack>
					<Stack className="metrics-row">
						<Box component={'div'} className="metric-item">
							<RemoveRedEyeIcon className="metric-icon" />
							<Typography className="metric-value">{property.propertyViews || 0}</Typography>
						</Box>
						<Box 
							component={'div'}
							className={`metric-item likes-metric ${liked ? 'liked' : ''}`}
							onClick={() => {
								if (likePropertyHandler && user) {
									likePropertyHandler(user, property?._id);
								}
							}}
							sx={{ cursor: 'pointer' }}
						>
							{liked ? (
								<FavoriteIcon className="metric-icon" />
							) : (
								<FavoriteBorderIcon className="metric-icon" />
							)}
							<Typography className="metric-value">{property.propertyLikes || 0}</Typography>
						</Box>
					</Stack>
				</Stack>
				<Stack className="price-section">
					<Typography className="price-label">{t('FROM')}</Typography>
					<Typography className="price-value">${formatterStr(property?.propertyPrice)}</Typography>
					<Typography className="price-period">{t('/DAY')}</Typography>
				</Stack>
			</Stack>
		);
	} else {
		// Original layout for other pages
		return (
			<Stack className="card-config">
				<Stack className="top">
					<Link
						href={{
							pathname: '/property/detail',
							query: { id: property?._id },
						}}
					>
						<img src={imagePath} alt="" />
					</Link>
					{/* Type Badge - Yuqori chapda */}
					{property?.propertyType && (
						<Box component={'div'} className={'type-badge'}>
							<Typography>{property.propertyType}</Typography>
						</Box>
					)}
					{/* Price Overlay - Pastki chapda */}
					<Box component={'div'} className={'price-overlay'}>
						<Typography className="price-overlay-value">${formatterStr(property?.propertyPrice)}</Typography>
					</Box>
					{/* Views va Likes Badge - Pastki o'ngda, bir qatorda */}
					<Stack className="engagement-badges">
						<Box 
							component={'div'} 
							className={`likes-badge ${liked ? 'liked' : 'not-liked'}`}
							onClick={() => {
							
								if (likePropertyHandler && user) {
									likePropertyHandler(user, property?._id);
								}
							}}
							sx={{ cursor: 'pointer' }}
						>
							{liked ? (
								<FavoriteIcon sx={{ fontSize: '16px', color: '#fff' }} />
							) : (
								<FavoriteBorderIcon sx={{ fontSize: '16px', color: '#181a20' }} />
							)}
							<Typography>{property?.propertyLikes || 0}</Typography>
						</Box>
						<Box component={'div'} className={'views-badge'}>
							<RemoveRedEyeIcon sx={{ fontSize: '16px', color: '#fff' }} />
							<Typography>{property?.propertyViews || 0}</Typography>
						</Box>
					</Stack>
				</Stack>
				<Stack className="bottom">
					{/* Title va Rating */}
					<Stack className="card-header">
						<Stack className="title-section">
							<Link
								href={{
									pathname: '/property/detail',
									query: { id: property?._id },
								}}
								style={{ textDecoration: 'none' }}
							>
								<Typography className="card-title">{property.propertyTitle}</Typography>
							</Link>
							<Typography className="card-subtitle">
								{property.propertyBrand} • {property.propertyYear}
							</Typography>
						</Stack>
						{/* Rating Badge - O'ngda */}
						<Box component={'div'} className="rating-badge">
							<StarIcon sx={{ fontSize: '16px', color: '#FFD700' }} />
							<Typography className="rating-value">{ratingValue}</Typography>
						</Box>
					</Stack>

					{/* Location va Address - Yashil badge */}
					<Box component={'div'} className="location-info">
						<LocationOnIcon sx={{ fontSize: '16px', color: '#25b44b' }} />
						<Stack className="location-details">
							<Typography className="location-text">{property.propertyLocation}</Typography>
							{property.propertyAddress && (
								<Typography className="address-text">{property.propertyAddress}</Typography>
							)}
						</Stack>
					</Box>

					{/* Specs Badges - Yashil background */}
					<Stack className="specs-row">
						<Box component={'div'} className="spec-badge">
							<SpeedIcon sx={{ fontSize: '14px', color: '#25b44b' }} />
							<Typography>{property.propertyMileAge || 0} {t('miles')}</Typography>
						</Box>
						<Box component={'div'} className="spec-badge">
							<TwoWheelerIcon sx={{ fontSize: '14px', color: '#25b44b' }} />
							<Typography>{property.propertyCondition || 'N/A'}</Typography>
						</Box>
						<Box component={'div'} className="spec-badge">
							<EngineeringIcon sx={{ fontSize: '14px', color: '#25b44b' }} />
							<Typography>{property.propertyEngineCc || 0} cc</Typography>
						</Box>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default PropertyCard;
