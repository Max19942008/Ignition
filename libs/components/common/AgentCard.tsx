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
import { T } from '../../types/common';

type Agent = {
	_id?: string;
	memberImage?: string;
	memberNick?: string;
	memberFullName?: string;
	memberAddress?: string;
	memberPhone?: string;
	memberRank?: number;
	memberProperties?: number;
	memberViews?: number;
	memberLikes?: number;
	meLiked?: Array<{ myFavorite?: boolean }>;
};

interface AgentCardProps {
	agent: Agent;
	likeMemberHandler?: (user: T, memberId: string) => Promise<void>;
}

type AgentStatsProps = {
	bikes: number;
	views: number;
	likes: number;
	rating: string;
};

const AgentStats = ({ bikes, views, likes, rating }: AgentStatsProps): JSX.Element => (
	<div className={'agent-stats-grid'}>
		<div className={'stat-item cars-stat'}>
			<TwoWheelerIcon className={'stat-icon'} />
			<span className={'stat-value'}>{bikes}</span>
			<span className={'stat-label'}>BIKES</span>
		</div>
		<div className={'stat-item views-stat'}>
			<RemoveRedEyeIcon className={'stat-icon'} />
			<span className={'stat-value'}>{views}</span>
			<span className={'stat-label'}>VIEWS</span>
		</div>
		<div className={'stat-item likes-stat'}>
			<FavoriteIcon className={'stat-icon'} />
			<span className={'stat-value'}>{likes}</span>
			<span className={'stat-label'}>LIKES</span>
		</div>
		<div className={'stat-item rating-stat'}>
			<StarIcon className={'stat-icon'} />
			<span className={'stat-value'}>{rating}</span>
			<span className={'stat-label'}>RATING</span>
		</div>
	</div>
);

const AgentCard = (props: AgentCardProps) => {
	const { agent: rawAgent, likeMemberHandler } = props;
	const agent = rawAgent as Agent;
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const [isLiking, setIsLiking] = useState<boolean>(false);
	const [optimisticLikes, setOptimisticLikes] = useState<number | null>(null);
	const [optimisticLiked, setOptimisticLiked] = useState<boolean | null>(null);
	
	const imagePath: string = agent?.memberImage
		? `${REACT_APP_API_URL}/${agent?.memberImage}`
		: '/img/profile/defaultUser.svg';

	const isLiked = optimisticLiked !== null ? optimisticLiked : Boolean(agent?.meLiked?.[0]?.myFavorite);
	const likesCount = optimisticLikes !== null ? optimisticLikes : (agent?.memberLikes ?? 0);
	const ratingValue = agent?.memberRank && agent.memberRank > 0 ? agent.memberRank.toFixed(1) : '4.5';
	const bikesCount = agent?.memberProperties ?? 0;
	const viewsCount = agent?.memberViews ?? 0;
	
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
		const currentLiked = agent?.meLiked?.[0]?.myFavorite ?? false;
		const currentLikes = agent?.memberLikes ?? 0;
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
	}, [likeMemberHandler, user, agent?._id, agent?.meLiked, agent?.memberLikes, isLiking]);

	if (device === 'mobile') {
		return (
			<Stack className={`agent-general-card variant-${cardVariant}`}>
				{/* Favorite Heart Icon - Top Right */}
				<IconButton 
					className={`favorite-heart ${isLiked ? 'liked' : ''} ${isLiking ? 'liking' : ''}`}
					disabled={isLiking}
					sx={{ 
						cursor: isLiking ? 'wait' : 'pointer', 
						opacity: isLiking ? 0.7 : 1,
						transition: 'all 0.3s ease',
						position: 'absolute',
						top: '16px',
						right: '16px',
						zIndex: 10,
						background: 'rgba(255, 255, 255, 0.95)',
						backdropFilter: 'blur(10px)',
						boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
					}}
					onClick={handleLikeClick}
				>
					{isLiked ? (
						<FavoriteIcon sx={{ fontSize: 20, color: '#f5576c' }} />
					) : (
						<FavoriteBorderIcon sx={{ fontSize: 20, color: '#667eea' }} />
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
						<img src={imagePath} alt={agent?.memberNick || 'Agent'} />
					</Box>
				</Link>

				{/* Card Content */}
				<Stack className={'agent-content'}>
					{/* Header with Name and AGENT Badge */}
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
							label="AGENT" 
							className={'dealer-badge'}
							size="small"
						/>
					</Stack>

					{/* Location and Phone */}
					<Stack className={'agent-contact-info'}>
						<Stack className={'contact-item'}>
							<LocationOnIcon className={'contact-icon location-icon'} />
							<Typography className={'contact-text location-text'}>{agent?.memberAddress || 'N/A'}</Typography>
						</Stack>
						<Stack className={'contact-item'}>
							<PhoneIcon className={'contact-icon phone-icon'} />
							<Typography className={'contact-text phone-text'}>{agent?.memberPhone || 'N/A'}</Typography>
						</Stack>
					</Stack>

					{/* Stats Grid */}
					<AgentStats bikes={bikesCount} views={viewsCount} likes={likesCount} rating={ratingValue} />
				</Stack>
			</Stack>
		);
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
						transition: 'all 0.3s ease',
						position: 'absolute',
						top: '20px',
						right: '20px',
						zIndex: 10,
						background: 'rgba(255, 255, 255, 0.95)',
						backdropFilter: 'blur(10px)',
						boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
						'&:hover': {
							background: 'rgba(255, 255, 255, 1)',
							transform: 'scale(1.1)',
						}
					}}
					onClick={handleLikeClick}
				>
					{isLiked ? (
						<FavoriteIcon sx={{ fontSize: 22, color: '#f5576c' }} />
					) : (
						<FavoriteBorderIcon sx={{ fontSize: 22, color: '#667eea' }} />
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
						<img src={imagePath} alt={agent?.memberNick || 'Agent'} />
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
							label="AGENT" 
							className={'dealer-badge'}
							size="small"
						/>
					</Stack>

					{/* Location and Phone */}
					<Stack className={'agent-contact-info'}>
						<Stack className={'contact-item'}>
							<LocationOnIcon className={'contact-icon location-icon'} />
							<Typography className={'contact-text location-text'}>{agent?.memberAddress }</Typography>
						</Stack>
						<Stack className={'contact-item'}>
							<PhoneIcon className={'contact-icon phone-icon'} />
							<Typography className={'contact-text phone-text'}>{agent?.memberPhone || 'N/A'}</Typography>
						</Stack>
					</Stack>

					{/* Stats Grid */}
					<AgentStats bikes={bikesCount} views={viewsCount} likes={likesCount} rating={ratingValue} />
				</Stack>
			</Stack>
		);
	}
};

export default AgentCard;
