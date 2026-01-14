import React, { useState, useCallback, useMemo } from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Stack, Box, Typography, Chip } from '@mui/material';
import Link from 'next/link';
import { REACT_APP_API_URL } from '../../config';
import IconButton from '@mui/material/IconButton';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StarIcon from '@mui/icons-material/Star';
import PhoneIcon from '@mui/icons-material/Phone';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';

interface AgentCardProps {
	agent: any;
	likeMemberHandler: any;
}

const AgentCard = (props: AgentCardProps) => {
	const { agent, likeMemberHandler } = props;
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const [isLiking, setIsLiking] = useState<boolean>(false);
	const [optimisticLikes, setOptimisticLikes] = useState<number | null>(null);
	const [optimisticLiked, setOptimisticLiked] = useState<boolean | null>(null);
	
	const imagePath: string = agent?.memberImage
		? `${REACT_APP_API_URL}/${agent?.memberImage}`
		: '/img/profile/defaultUser.svg';

	const isLiked = optimisticLiked !== null ? optimisticLiked : (agent?.meLiked && agent?.meLiked[0]?.myFavorite);
	const likesCount = optimisticLikes !== null ? optimisticLikes : (agent?.memberLikes || 0);
	const ratingValue = agent?.memberRank && agent.memberRank > 0 ? agent.memberRank.toFixed(1) : '4.5';
	
	// Generate card variation based on agent ID for different accent colors
	const cardVariant = useMemo(() => {
		if (!agent?._id) return 0;
		const hash = agent._id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
		return hash % 6; // 6 different color variations
	}, [agent?._id]);

	const handleLikeClick = useCallback(async (e: any) => {
		e.stopPropagation();
		e.preventDefault();
		
		if (!likeMemberHandler || !user || !agent?._id || isLiking) return;

		setIsLiking(true);
		const currentLiked = agent?.meLiked && agent?.meLiked[0]?.myFavorite;
		const currentLikes = agent?.memberLikes || 0;
		const newLiked = !currentLiked;
		const newLikes = newLiked ? currentLikes + 1 : Math.max(0, currentLikes - 1);

		setOptimisticLiked(newLiked);
		setOptimisticLikes(newLikes);

		try {
			await likeMemberHandler(user, agent._id);
			setIsLiking(false);
			setTimeout(() => {
				setOptimisticLiked(null);
				setOptimisticLikes(null);
			}, 500);
		} catch (error) {
			setOptimisticLiked(null);
			setOptimisticLikes(null);
			setIsLiking(false);
		}
	}, [likeMemberHandler, user, agent, isLiking]);

	if (device === 'mobile') {
		return <div>AGENT CARD</div>;
	} else {
		return (
			<Stack className={`agent-general-card variant-${cardVariant}`}>
				{/* Favorite Heart Icon - Top Right */}
				<IconButton 
					className={`favorite-heart ${isLiked ? 'liked' : ''} ${isLiking ? 'liking' : ''}`}
					disabled={isLiking}
					sx={{ 
						cursor: isLiking ? 'wait' : 'pointer', 
						opacity: isLiking ? 0.7 : 1,
						transition: 'all 0.2s ease',
						position: 'absolute',
						top: '16px',
						right: '16px',
						zIndex: 10,
						background: 'rgba(255, 255, 255, 0.9)',
						'&:hover': {
							background: 'rgba(255, 255, 255, 1)',
						}
					}}
					onClick={handleLikeClick}
				>
					{isLiked ? (
						<FavoriteIcon sx={{ fontSize: 20, color: '#e91e63' }} />
					) : (
						<FavoriteBorderIcon sx={{ fontSize: 20, color: '#666' }} />
					)}
				</IconButton>

				{/* Profile Image Section */}
				<Link
					href={{
						pathname: '/agent/detail',
						query: { agentId: agent?._id },
					}}
					style={{ textDecoration: 'none' }}
				>
					<Box
						component={'div'}
						className={'agent-profile-img'}
					>
						<img src={imagePath} alt={agent?.memberNick || 'Dealer'} />
					</Box>
				</Link>

				{/* Card Content */}
				<Stack className={'agent-content'}>
					{/* Header with Name and DEALER Badge */}
					<Stack className={'agent-header'}>
						<Link
							href={{
								pathname: '/agent/detail',
								query: { agentId: agent?._id },
							}}
							style={{ textDecoration: 'none' }}
						>
							<Typography className={'agent-name'}>{agent?.memberFullName ?? agent?.memberNick}</Typography>
						</Link>
						<Chip 
							label="DEALER" 
							className={'dealer-badge'}
							size="small"
						/>
					</Stack>

					{/* Location and Phone */}
					<Stack className={'agent-contact-info'}>
						<Stack className={'contact-item'}>
							<LocationOnIcon className={'contact-icon location-icon'} />
							<Typography className={'contact-text location-text'}>{agent?.memberAddress || 'Unknown location'}</Typography>
						</Stack>
						<Stack className={'contact-item'}>
							<PhoneIcon className={'contact-icon phone-icon'} />
							<Typography className={'contact-text phone-text'}>{agent?.memberPhone || 'N/A'}</Typography>
						</Stack>
					</Stack>

					{/* Stats Grid */}
					<Stack className={'agent-stats-grid'}>
						<Box className={'stat-item cars-stat'}>
							<TwoWheelerIcon className={'stat-icon'} />
							<Typography className={'stat-value'}>{agent?.memberProperties || 0}</Typography>
							<Typography className={'stat-label'}>CARS</Typography>
						</Box>
						<Box className={'stat-item views-stat'}>
							<RemoveRedEyeIcon className={'stat-icon'} />
							<Typography className={'stat-value'}>{agent?.memberViews || 0}</Typography>
							<Typography className={'stat-label'}>VIEWS</Typography>
						</Box>
						<Box className={'stat-item likes-stat'}>
							<FavoriteIcon className={'stat-icon'} />
							<Typography className={'stat-value'}>{likesCount}</Typography>
							<Typography className={'stat-label'}>LIKES</Typography>
						</Box>
						<Box className={'stat-item rating-stat'}>
							<StarIcon className={'stat-icon'} />
							<Typography className={'stat-value'}>{ratingValue}</Typography>
							<Typography className={'stat-label'}>RATING</Typography>
						</Box>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default AgentCard;
