import React from 'react';
import { Stack, Box, Divider, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import FavoriteIcon from '@mui/icons-material/Favorite';
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

	/** HANDLERS **/
	const goPropertyDetatilPage = (propertyId: string) => {
		router.push(`/property/detail?id=${propertyId}`);
	};

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
								className={`icon-btn ${property?.meLiked && property?.meLiked[0]?.myFavorite ? 'liked' : ''}`}
								color={'default'}
								onClick={(e: any) => {
									e.stopPropagation();
									if (likePropertyHandler && user) {
										likePropertyHandler(user, property?._id);
									}
								}}
							>
								{property?.meLiked && property?.meLiked[0]?.myFavorite ? (
									<FavoriteIcon className={'favorite-icon'} />
								) : (
									<FavoriteIcon className={'favorite-icon'} />
								)}
							</IconButton>
							<Typography className="view-cnt">{property?.propertyLikes || 0}</Typography>
						</div>
					</div>
				</Box>
			</Stack>
		);
	}
};

export default PropertyBigCard;
