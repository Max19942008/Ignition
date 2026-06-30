import React, { useMemo } from 'react';
import { Stack, Box, Divider, Typography, Button } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { Part } from '../../types/part/part';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CategoryIcon from '@mui/icons-material/Category';
import BuildIcon from '@mui/icons-material/Build';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import StarIcon from '@mui/icons-material/Star';
import { REACT_APP_API_URL } from '../../config';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { useTranslation } from 'next-i18next';

interface TopPartCardProps {
	part: Part;
	likePartHandler: any;
}

const TopPartCard = (props: TopPartCardProps) => {
	const { part, likePartHandler } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const liked = part?.meLiked && part?.meLiked[0]?.myFavorite;

	const imagePath: string = useMemo(() => {
		if (part?.partImages?.length) return `${REACT_APP_API_URL}/${part.partImages[0]}`;
		return '/img/banner/header1.svg';
	}, [part]);

	const formattedPrice = useMemo(() => (part?.partPrice ? part.partPrice.toLocaleString() : '0'), [part?.partPrice]);

	const ratingValue = useMemo(() => {
		if (part?.partRank && part.partRank > 0) return part.partRank.toFixed(2);
		return '4.6';
	}, [part?.partRank]);

	const goToDetail = () => {
		router.push({ pathname: '/part/detail', query: { id: part?._id } });
	};

	return (
		<Stack className="top-card-box" onClick={goToDetail}>
			<Box component={'div'} className={'card-img'} style={{ backgroundImage: `url(${imagePath})` }}>
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
							likePartHandler(e, user, part?._id);
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
						<strong className={'title'}>{part.partTitle}</strong>
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
				</Stack>

				<Stack className="spec-row">
					<div className="spec">
						<CategoryIcon fontSize="small" />
						<span>{part.partType}</span>
					</div>
					<div className="spec">
						<BuildIcon fontSize="small" />
						<span>{part.partCondition}</span>
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
					<Button variant="contained" className="cta" onClick={goToDetail}>
						{t('Buy Now')}
					</Button>
				</Stack>
			</Box>
		</Stack>
	);
};

export default TopPartCard;
