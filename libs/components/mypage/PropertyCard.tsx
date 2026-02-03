import { Menu, MenuItem } from '@mui/material';
import React, { useState } from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import IconButton from '@mui/material/IconButton';
import ModeIcon from '@mui/icons-material/Mode';
import DeleteIcon from '@mui/icons-material/Delete';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { Property } from '../../types/property/property';
import { formatterStr } from '../../utils';
import Moment from 'react-moment';
import { useRouter } from 'next/router';
import { PropertyStatus, PropertyType } from '../../enums/property.enum';
import { REACT_APP_API_URL } from '../../config';

interface PropertyCardProps {
	property: Property;
	deletePropertyHandler?: any;
	memberPage?: boolean;
	updatePropertyHandler?: any;
}

export const PropertyCard = (props: PropertyCardProps) => {
	const { property, deletePropertyHandler, memberPage, updatePropertyHandler } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);

	/** HANDLERS **/
	const pushEditProperty = async (id: string) => {
		console.log('+pushEditProperty: ', id);
		await router.push({
			pathname: '/mypage',
			query: { category: 'addProperty', propertyId: id },
		});
	};

	const pushPropertyDetail = async (id: string) => {
		if (memberPage)
			await router.push({
				pathname: '/property/detail',
				query: { id: id },
			});
		else return;
	};

	const handleClick = (event: any) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const getTypeBadgeColor = (type: PropertyType) => {
		switch (type) {
			case PropertyType.SPORT:
				return { bg: '#4CAF50', text: '#fff' };
			case PropertyType.CRUISER:
				return { bg: '#2196F3', text: '#fff' };
			case PropertyType.SCOOTER:
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
		return <div>MOBILE PROPERTY CARD</div>;
	} else
		return (
			<div className="property-card-box">
				<div className="image-section">
					<div className="image-box">
						<img 
							src={property.propertyImages?.[0] ? `${REACT_APP_API_URL}/${property.propertyImages[0]}` : '/img/property/defaultBike.jpg'} 
							alt={property.propertyTitle}
						/>
						<div 
							className="type-badge"
							style={{ 
								background: getTypeBadgeColor(property.propertyType).bg,
								color: getTypeBadgeColor(property.propertyType).text
							}}
						>
							{property.propertyType}
						</div>
					</div>
				</div>
				<div className="content-section">
					<div className="bike-name">{property.propertyTitle}</div>
					<div className="bike-details">
						{property.propertyBrand} • {property.propertyYear} • {property.propertyEngineCc}cc • {property.propertyCondition}
					</div>
					<div className="specs-row">
						<span className="spec-chip">{`${property.propertyYear} Year`}</span>
						<span className="spec-chip">{`${property.propertyEngineCc}cc`}</span>
						<span className="spec-chip">{property.propertyLocation}</span>
					</div>
					<div 
						className="status-badge"
						style={{ 
							background: getStatusColor(property.propertyStatus).bg,
							color: getStatusColor(property.propertyStatus).text
						}}
					>
						{property.propertyStatus}
					</div>
				</div>
				<div className="actions-section">
					{!memberPage && property.propertyStatus === PropertyStatus.ACTIVE && (
						<div className="action-buttons">
							<IconButton className="edit-button" onClick={() => pushEditProperty(property._id)}>
								<ModeIcon />
							</IconButton>
							<IconButton className="delete-button" onClick={() => deletePropertyHandler(property._id)}>
								<DeleteIcon />
							</IconButton>
						</div>
					)}
					<div className="metrics-row">
						<div className="metric-item">
							<RemoveRedEyeIcon className="metric-icon" />
							<span className="metric-value">{property.propertyViews || 0}</span>
						</div>
						<div className="metric-item">
							<FavoriteIcon className="metric-icon" />
							<span className="metric-value">{property.propertyLikes || 0}</span>
						</div>
					</div>
				</div>
				<div className="price-section">
					<span className="price-label">FROM</span>
					<span className="price-value">${formatterStr(property?.propertyPrice)}</span>
					<span className="price-period">/DAY</span>
				</div>
			</div>
		);
};
