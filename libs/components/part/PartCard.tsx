import React, { useMemo } from 'react';
import { Stack, Typography, Box, Button, Chip, Divider } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Part } from '../../types/part/part';
import Link from 'next/link';
import { formatterStr } from '../../utils';
import { REACT_APP_API_URL } from '../../config';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import IconButton from '@mui/material/IconButton';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import StarIcon from '@mui/icons-material/Star';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CategoryIcon from '@mui/icons-material/Category';
import BuildIcon from '@mui/icons-material/Build';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import ModeIcon from '@mui/icons-material/Mode';
import DeleteIcon from '@mui/icons-material/Delete';
import { useRouter } from 'next/router';
import { PartCategory, PartStatus } from '../../enums/part.enum';
import { useTranslation } from 'next-i18next';

interface PartCardType {
	part: Part;
	likePartHandler?: any;
	myFavorites?: boolean;
	recentlyVisited?: boolean;
	deletePartHandler?: any;
}

const PartCard = (props: PartCardType) => {
	const { part, likePartHandler, myFavorites, recentlyVisited, deletePartHandler } = props;
	const device = useDeviceDetect();
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const router = useRouter();
	const imagePath: string = useMemo(() => {
		if (part?.partImages?.length) return `${REACT_APP_API_URL}/${part.partImages[0]}`;
		return '/img/banner/header1.svg';
	}, [part]);

	const formattedPrice = useMemo(() => (part?.partPrice ? part.partPrice.toLocaleString() : '0'), [part?.partPrice]);

	const ratingValue = useMemo(() => {
		if (part?.partRank && part.partRank > 0) return (part.partRank / 10).toFixed(1);
		return '4.6';
	}, [part?.partRank]);

	const liked = myFavorites || (part?.meLiked && part?.meLiked[0]?.myFavorite);
	const categoryLabel = part?.partCategory === PartCategory.ACCESSORY ? t('Accessory') : t('Spare Part');

	const handleBuyNow = () => {
		router.push({ pathname: '/part/detail', query: { id: part?._id } });
	};

	const pushDetailHandler = async (partId: string) => {
		router.push({ pathname: '/part/detail', query: { id: partId } });
	};

	const getCategoryBadgeColor = (category: PartCategory) => {
		switch (category) {
			case PartCategory.SPARE_PART:
				return { bg: '#2196F3', text: '#fff' };
			case PartCategory.ACCESSORY:
				return { bg: '#9C27B0', text: '#fff' };
			default:
				return { bg: '#667eea', text: '#fff' };
		}
	};

	const getStatusColor = (status: PartStatus) => {
		switch (status) {
			case PartStatus.ACTIVE:
				return { bg: '#4CAF50', text: '#fff' };
			case PartStatus.HOLD:
				return { bg: '#FF9800', text: '#fff' };
			case PartStatus.SOLD:
				return { bg: '#9E9E9E', text: '#fff' };
			default:
				return { bg: '#667eea', text: '#fff' };
		}
	};

	if (device === 'mobile') {
		return (
			<Stack className="property-card-box" key={part._id}>
				<Box
					component={'div'}
					className={'card-img'}
					style={{ backgroundImage: `url(${imagePath})` }}
					onClick={() => {
						pushDetailHandler(part._id);
					}}
				>
					{part?.partCategory && (
						<Box component={'div'} className={'type-badge'}>
							<Typography>{categoryLabel}</Typography>
						</Box>
					)}
					<Stack flexDirection="row" className="img-bottom-row">
						<IconButton size="small" className="badge">
							<RemoveRedEyeIcon fontSize="small" />
							<Typography component="span" sx={{ fontSize: '11px', fontWeight: 700, color: '#fff', ml: 0.5 }}>
								{part?.partViews || 0}
							</Typography>
						</IconButton>
						<IconButton
							size="small"
							className={`badge like ${liked ? 'active' : ''}`}
							onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
								e.preventDefault();
								e.stopPropagation();
								if (likePartHandler && user) likePartHandler(user, part?._id);
							}}
						>
							<FavoriteIcon fontSize="small" />
							<Typography component="span" sx={{ fontSize: '11px', fontWeight: 700, color: '#fff', ml: 0.5 }}>
								{part?.partLikes || 0}
							</Typography>
						</IconButton>
					</Stack>
				</Box>
				<Box component={'div'} className={'info'}>
					<Stack className="card-head">
						<Stack className="title-block">
							<strong
								className={'title'}
								onClick={() => {
									pushDetailHandler(part._id);
								}}
							>
								{part.partTitle}
							</strong>
							<span className={'subtitle'}>
								{part.partBrand} · {part.partType}
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
							<span>{part.partLocation}</span>
						</Stack>
						<span>{categoryLabel}</span>
					</Stack>

					<Stack className="spec-row">
						<div className="spec">
							<CategoryIcon fontSize="small" />
							<span>{part.partType}</span>
						</div>
						<div className="spec">
							<BuildIcon fontSize="small" />
							<span>{part.partCondition || 'N/A'}</span>
						</div>
						<div className="spec">
							<Inventory2Icon fontSize="small" />
							<span>
								{part.partStockCount ?? 0} {t('pcs')}
							</span>
						</div>
					</Stack>

					<Divider sx={{ mt: '12px', mb: '14px' }} />

					<Stack className="card-foot">
						<Box component={'div'} className="price-box">
							<span className="from">{t('Price')}</span>
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
		return (
			<Stack className="card-config vertical-layout">
				<Stack className="image-section">
					<Box component={'div'} className="image-box">
						<Link href={{ pathname: '/part/detail', query: { id: part?._id } }}>
							<img src={imagePath} alt={part.partTitle} />
						</Link>
						{part?.partCategory && (
							<Box
								component={'div'}
								className="type-badge"
								sx={{
									background: getCategoryBadgeColor(part.partCategory).bg,
									color: getCategoryBadgeColor(part.partCategory).text,
								}}
							>
								<Typography>{categoryLabel}</Typography>
							</Box>
						)}
					</Box>
				</Stack>
				<Stack className="content-section">
					<Link href={{ pathname: '/part/detail', query: { id: part?._id } }} style={{ textDecoration: 'none' }}>
						<Typography className="bike-name">{part.partTitle}</Typography>
					</Link>
					<Typography className="bike-details">
						{part.partBrand} • {part.partType} • {part.partCondition}
					</Typography>
					<Stack className="specs-row">
						<Chip label={part.partType} className="spec-chip" />
						<Chip label={`${part.partStockCount ?? 0} ${t('pcs')}`} className="spec-chip" />
						<Chip label={part.partLocation} className="spec-chip" />
					</Stack>
					<Box
						component={'div'}
						className="status-badge"
						sx={{
							background: getStatusColor(part.partStatus).bg,
							color: getStatusColor(part.partStatus).text,
						}}
					>
						{part.partStatus}
					</Box>
				</Stack>
				<Stack className="actions-section">
					<Stack className="action-buttons">
						<IconButton
							className="edit-button"
							onClick={(e: any) => {
								e.preventDefault();
								router.push({ pathname: '/mypage', query: { category: 'addPart', partId: part._id } });
							}}
						>
							<ModeIcon />
						</IconButton>
						<IconButton
							className="delete-button"
							onClick={(e: any) => {
								e.preventDefault();
								if (deletePartHandler) deletePartHandler(part._id);
							}}
						>
							<DeleteIcon />
						</IconButton>
					</Stack>
					<Stack className="metrics-row">
						<Box component={'div'} className="metric-item">
							<RemoveRedEyeIcon className="metric-icon" />
							<Typography className="metric-value">{part.partViews || 0}</Typography>
						</Box>
						<Box
							component={'div'}
							className={`metric-item likes-metric ${liked ? 'liked' : ''}`}
							onClick={() => {
								if (likePartHandler && user) likePartHandler(user, part?._id);
							}}
							sx={{ cursor: 'pointer' }}
						>
							{liked ? <FavoriteIcon className="metric-icon" /> : <FavoriteBorderIcon className="metric-icon" />}
							<Typography className="metric-value">{part.partLikes || 0}</Typography>
						</Box>
					</Stack>
				</Stack>
				<Stack className="price-section">
					<Typography className="price-label">{t('PRICE')}</Typography>
					<Typography className="price-value">${formatterStr(part?.partPrice)}</Typography>
				</Stack>
			</Stack>
		);
	} else {
		return (
			<Stack className="card-config">
				<Stack className="top">
					<Link href={{ pathname: '/part/detail', query: { id: part?._id } }}>
						<img src={imagePath} alt="" />
					</Link>
					{part?.partCategory && (
						<Box component={'div'} className={'type-badge'}>
							<Typography>{categoryLabel}</Typography>
						</Box>
					)}
					<Box component={'div'} className={'price-overlay'}>
						<Typography className="price-overlay-value">${formatterStr(part?.partPrice)}</Typography>
					</Box>
					<Stack className="engagement-badges">
						<Box
							component={'div'}
							className={`likes-badge ${liked ? 'liked' : 'not-liked'}`}
							onClick={() => {
								if (likePartHandler && user) likePartHandler(user, part?._id);
							}}
							sx={{ cursor: 'pointer' }}
						>
							{liked ? (
								<FavoriteIcon sx={{ fontSize: '16px', color: '#fff' }} />
							) : (
								<FavoriteBorderIcon sx={{ fontSize: '16px', color: '#181a20' }} />
							)}
							<Typography>{part?.partLikes || 0}</Typography>
						</Box>
						<Box component={'div'} className={'views-badge'}>
							<RemoveRedEyeIcon sx={{ fontSize: '16px', color: '#fff' }} />
							<Typography>{part?.partViews || 0}</Typography>
						</Box>
					</Stack>
				</Stack>
				<Stack className="bottom">
					<Stack className="card-header">
						<Stack className="title-section">
							<Link href={{ pathname: '/part/detail', query: { id: part?._id } }} style={{ textDecoration: 'none' }}>
								<Typography className="card-title">{part.partTitle}</Typography>
							</Link>
							<Typography className="card-subtitle">
								{part.partBrand} • {part.partType}
							</Typography>
						</Stack>
						<Box component={'div'} className="rating-badge">
							<StarIcon sx={{ fontSize: '16px', color: '#FFD700' }} />
							<Typography className="rating-value">{ratingValue}</Typography>
						</Box>
					</Stack>

					<Box component={'div'} className="location-info">
						<LocationOnIcon sx={{ fontSize: '16px', color: '#25b44b' }} />
						<Stack className="location-details">
							<Typography className="location-text">{part.partLocation}</Typography>
							<Typography className="address-text">{categoryLabel}</Typography>
						</Stack>
					</Box>

					<Stack className="specs-row">
						<Box component={'div'} className="spec-badge">
							<CategoryIcon sx={{ fontSize: '14px', color: '#25b44b' }} />
							<Typography>{part.partType}</Typography>
						</Box>
						<Box component={'div'} className="spec-badge">
							<BuildIcon sx={{ fontSize: '14px', color: '#25b44b' }} />
							<Typography>{part.partCondition || 'N/A'}</Typography>
						</Box>
						<Box component={'div'} className="spec-badge">
							<Inventory2Icon sx={{ fontSize: '14px', color: '#25b44b' }} />
							<Typography>
								{part.partStockCount ?? 0} {t('pcs')}
							</Typography>
						</Box>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default PartCard;
