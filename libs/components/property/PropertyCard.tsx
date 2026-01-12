import React from 'react';
import { Stack, Typography, Box, Button } from '@mui/material';
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
import { useRouter } from 'next/router';

interface PropertyCardType {
	property: Property;
	likePropertyHandler?: any;
	myFavorites?: boolean;
	recentlyVisited?: boolean;
}

const PropertyCard = (props: PropertyCardType) => {
	const { property, likePropertyHandler, myFavorites, recentlyVisited } = props;
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

	if (device === 'mobile') {
		return <div>PROPERTY CARD</div>;
	} else {
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
					{property && property?.propertyRank > 0 && (
						<Box component={'div'} className={'top-badge'}>
							<img src="/img/icons/electricity.svg" alt="" />
							<Typography>TOP</Typography>
						</Box>
					)}
					{/* Views Badge - Chap pastda */}
					<Box component={'div'} className={'views-badge'}>
						<RemoveRedEyeIcon sx={{ fontSize: '16px', color: '#fff' }} />
						<Typography>{property?.propertyViews || 0}</Typography>
					</Box>
					{/* Likes Badge - O'ng pastda */}
					<Box 
						component={'div'} 
						className={'likes-badge'}
						onClick={(e) => {
							e.preventDefault();
							if (likePropertyHandler && user) {
								likePropertyHandler(user, property?._id);
							}
						}}
						sx={{ cursor: 'pointer' }}
					>
						{liked ? (
							<FavoriteIcon sx={{ fontSize: '16px', color: '#fff' }} />
						) : (
							<FavoriteBorderIcon sx={{ fontSize: '16px', color: '#fff' }} />
						)}
						<Typography>{property?.propertyLikes || 0}</Typography>
					</Box>
				</Stack>
				<Stack className="bottom">
					{/* Title va Brand/Year */}
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
								{property.propertyBrand} - {property.propertyYear}
							</Typography>
						</Stack>
						{/* Rating Badge */}
						<Box className="rating-badge">
							<StarIcon sx={{ fontSize: '14px', color: '#FFD700' }} />
							<Typography>{ratingValue}</Typography>
						</Box>
					</Stack>

					{/* Location Badge */}
					<Box className="location-badge">
						<LocationOnIcon sx={{ fontSize: '16px', color: '#7B61FF' }} />
						<Typography className="location-text">{property.propertyLocation}</Typography>
						<Typography className="address-text">{property.propertyAddress}</Typography>
					</Box>

					{/* Specs Badges */}
					<Stack className="specs-row">
						<Box className="spec-badge">
							<SpeedIcon sx={{ fontSize: '14px', color: '#7B61FF' }} />
							<Typography>{property.propertyMileAge} miles</Typography>
						</Box>
						<Box className="spec-badge">
							<TwoWheelerIcon sx={{ fontSize: '14px', color: '#7B61FF' }} />
							<Typography>{property.propertyCondition}</Typography>
						</Box>
						<Box className="spec-badge">
							<EngineeringIcon sx={{ fontSize: '14px', color: '#7B61FF' }} />
							<Typography>{property.propertyEngineCc} cc</Typography>
						</Box>
					</Stack>

					{/* Price va Buy Now Button */}
					<Stack className="card-footer">
						<Box className="price-section">
							<Typography className="price-label">FROM</Typography>
							<Typography className="price-value">${formatterStr(property?.propertyPrice)}</Typography>
						</Box>
						<Button className="buy-now-button" onClick={handleBuyNow}>
							Buy Now
						</Button>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default PropertyCard;
