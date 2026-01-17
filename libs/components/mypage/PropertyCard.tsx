import { Menu, MenuItem, Stack, Typography, Box, Chip } from '@mui/material';
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
		return <div>MOBILE PROPERTY CARD</div>;
	} else
		return (
			<Stack className="property-card-box">
				<Stack className="image-section">
					<Box className="image-box">
						<img 
							src={property.propertyImages?.[0] ? `${REACT_APP_API_URL}/${property.propertyImages[0]}` : '/img/property/defaultBike.jpg'} 
							alt={property.propertyTitle}
						/>
						<Box 
							className="type-badge" 
							sx={{ 
								background: getTypeBadgeColor(property.propertyType).bg,
								color: getTypeBadgeColor(property.propertyType).text
							}}
						>
							{property.propertyType}
						</Box>
					</Box>
				</Stack>
				<Stack className="content-section">
					<Typography className="bike-name">{property.propertyTitle}</Typography>
					<Typography className="bike-details">
						{property.propertyBrand} • {property.propertyYear} • {property.propertyEngineCc}cc • {property.propertyCondition}
					</Typography>
					<Stack className="specs-row">
						<Chip label={`${property.propertyYear} Year`} className="spec-chip" />
						<Chip label={`${property.propertyEngineCc}cc`} className="spec-chip" />
						<Chip label={property.propertyLocation} className="spec-chip" />
					</Stack>
					<Box 
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
					{!memberPage && property.propertyStatus === PropertyStatus.ACTIVE && (
						<Stack className="action-buttons">
							<IconButton className="edit-button" onClick={() => pushEditProperty(property._id)}>
								<ModeIcon />
							</IconButton>
							<IconButton className="delete-button" onClick={() => deletePropertyHandler(property._id)}>
								<DeleteIcon />
							</IconButton>
						</Stack>
					)}
					<Stack className="metrics-row">
						<Box className="metric-item">
							<RemoveRedEyeIcon className="metric-icon" />
							<Typography className="metric-value">{property.propertyViews || 0}</Typography>
						</Box>
						<Box className="metric-item">
							<FavoriteIcon className="metric-icon" />
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
};
