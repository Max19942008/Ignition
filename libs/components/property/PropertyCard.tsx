import React from 'react';
import { Stack, Typography, Box, Button, Chip } from '@mui/material';
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
	const user = useReactiveVar(userVar);
	const router = useRouter();
	const imagePath: string = property?.propertyImages[0]
		? `${REACT_APP_API_URL}/${property?.propertyImages[0]}`
		: '/img/banner/header1.svg';

	const ratingValue = property?.propertyRank ? (property.propertyRank / 10).toFixed(1) : '4.6';
	const liked = myFavorites || (property?.meLiked && property?.meLiked[0]?.myFavorite);

	const handleBuyNow = () => {
		router.push({
			pathname: '/property/detail',
			query: { id: property?._id },
		});
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
		return <div>PROPERTY CARD</div>;
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
						<Chip label={`${property.propertyYear} Year`} className="spec-chip" />
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
							onClick={(e) => {
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
							onClick={(e) => {
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
					<Typography className="price-label">FROM</Typography>
					<Typography className="price-value">${formatterStr(property?.propertyPrice)}</Typography>
					<Typography className="price-period">/DAY</Typography>
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
							<Typography>{property.propertyMileAge || 0} miles</Typography>
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
