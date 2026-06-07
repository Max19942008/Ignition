import React, { useMemo } from 'react';
import { Stack, Box, Divider, Typography, Button, IconButton } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EngineeringIcon from '@mui/icons-material/Engineering';
import SpeedIcon from '@mui/icons-material/Speed';
import StarIcon from '@mui/icons-material/Star';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import FavoriteIcon from '@mui/icons-material/Favorite';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { Property } from '../../types/property/property';
import { REACT_APP_API_URL } from '../../config';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { useTranslation } from 'next-i18next';

interface TrendPropertyCardProps {
	property: Property;
	likePropertyHandler:any;
}

const TrendPropertyCard = (props: TrendPropertyCardProps) => {
	const { property, likePropertyHandler } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const { t } = useTranslation('common');
		const user = useReactiveVar(userVar);
	const liked = property?.meLiked && property?.meLiked[0]?.myFavorite;

	const imagePath: string = useMemo(() => {
		if (property?.propertyImages?.length) return `${REACT_APP_API_URL}/${property.propertyImages[0]}`;
		return '/img/banner/header1.svg';
	}, [property]);

	const formattedPrice = useMemo(
		() => (property?.propertyPrice ? property.propertyPrice.toLocaleString() : '0'),
		[property?.propertyPrice],
	);

	const ratingValue = useMemo(() => {
		if (property?.propertyRank && property.propertyRank > 0) return property.propertyRank.toFixed(2);
		return '4.6';
	}, [property?.propertyRank]);

	const goToDetail = () => {
		router.push({
			pathname: '/property/detail',
			query: { id: property?._id },
		});
	};

	/** HANDLERS **/
		const pushDetailHandler = async (propertyId: string) => {
	 router.push({pathname: "/property/detail", query: {id: propertyId }});
	};

	if (device === 'mobile') {
		return (
			<Stack className="trend-card-box" key={property._id}>
				<Box 
				component={'div'} 
				className={'card-img'} 
				style={{ backgroundImage: `url(${imagePath})` }}
				onClick={() => {pushDetailHandler(property._id)}}
				>
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
							likePropertyHandler(user, property?._id);
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
							<strong className={'title'} onClick={() => {pushDetailHandler(property._id)}} >{property.propertyTitle} </strong>
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
							<span>{property.propertyMileAge} {t('miles')}</span>
						</div>
						<div className="spec">
							<TwoWheelerIcon fontSize="small" />
							<span>{property.propertyCondition}</span>
						</div>
						<div className="spec">
							<EngineeringIcon fontSize="small" />
							<span>{property.propertyEngineCc} cc</span>
						</div>
					</Stack>

					<Divider sx={{ mt: '12px', mb: '14px' }} />

					<Stack className="card-foot">
						<Box component={'div'} className="price-box">
							<span className="from">{t('From')}</span>
							<strong className="price">${formattedPrice}</strong>
						</Box>
						<Button variant="contained" className="cta" onClick={goToDetail}>
							{t('Buy Now')}
						</Button>
					</Stack>
				</Box>
			</Stack>
		);
	} else {
		return (
			<Stack className="trend-card-box" key={property._id}>
				<Box 
				component={'div'} 
				className={'card-img'} 
				style={{ backgroundImage: `url(${imagePath})` }}
				onClick={() => {pushDetailHandler(property._id)}}
				>
					<Stack flexDirection="row" className="img-bottom-row">
						<IconButton size="small" className="badge">
							<RemoveRedEyeIcon fontSize="small" />
							<Typography>{property?.propertyViews || 0}</Typography>
						</IconButton>
						<IconButton 
						size="small" 
						className={`badge like ${liked ? 'active' : ''}`} 
						onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
							e.preventDefault();
							e.stopPropagation();
							likePropertyHandler(user, property?._id);
						}}
						>
							<FavoriteIcon fontSize="small" />
							<Typography>{property?.propertyLikes || 0}</Typography>
						</IconButton>
					</Stack>
				</Box>
				<Box component={'div'} className={'info'}>
					<Stack className="card-head">
						<Stack className="title-block">
							<strong className={'title'} onClick={() => {pushDetailHandler(property._id)}} >{property.propertyTitle} </strong>
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
							<span>{property.propertyMileAge} {t('miles')}</span>
						</div>
						<div className="spec">
							<TwoWheelerIcon fontSize="small" />
							<span>{property.propertyCondition}</span>
						</div>
						<div className="spec">
							<EngineeringIcon fontSize="small" />
							<span>{property.propertyEngineCc} cc</span>
						</div>
					</Stack>

					<Divider sx={{ mt: '12px', mb: '14px' }} />

					<Stack className="card-foot">
						<Box component={'div'} className="price-box">
							<span className="from">{t('From')}</span>
							<strong className="price">${formattedPrice}</strong>
						</Box>
						<Button variant="contained" className="cta" onClick={goToDetail}>
							{t('Buy Now')}
						</Button>
					</Stack>
				</Box>
			</Stack>
		);
	}
};

export default TrendPropertyCard;



