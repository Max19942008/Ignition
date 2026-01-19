import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../libs/components/layout/LayoutAdmin';
import { useRouter } from 'next/router';
import { Box, Stack, Card, CardContent, Typography, Grid, Button } from '@mui/material';
import { useQuery } from '@apollo/client';
import { GET_ALL_MEMBERS_BY_ADMIN } from '../../apollo/admin/query';
import { GET_ALL_PROPERTIES_BY_ADMIN } from '../../apollo/admin/query';
import { GET_ALL_BOARD_ARTICLES_BY_ADMIN } from '../../apollo/admin/query';
import { MembersInquiry } from '../../libs/types/member/member.input';
import { AllPropertiesInquiry } from '../../libs/types/property/property.input';
import { AllBoardArticlesInquiry } from '../../libs/types/board-article/board-article.input';
import { MemberStatus, MemberType } from '../../libs/enums/member.enum';
import { PropertyStatus } from '../../libs/enums/property.enum';
import { BoardArticleStatus } from '../../libs/enums/board-article.enum';
import { T } from '../../libs/types/common';
import PeopleIcon from '@mui/icons-material/People';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import ArticleIcon from '@mui/icons-material/Article';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const AdminHome: NextPage = (props: any) => {
	const router = useRouter();
	const [usersTotal, setUsersTotal] = useState<number>(0);
	const [usersActive, setUsersActive] = useState<number>(0);
	const [usersBlocked, setUsersBlocked] = useState<number>(0);
	const [usersDeleted, setUsersDeleted] = useState<number>(0);
	const [bikesTotal, setBikesTotal] = useState<number>(0);
	const [bikesActive, setBikesActive] = useState<number>(0);
	const [bikesSold, setBikesSold] = useState<number>(0);
	const [bikesHold, setBikesHold] = useState<number>(0);
	const [bikesDeleted, setBikesDeleted] = useState<number>(0);
	const [articlesTotal, setArticlesTotal] = useState<number>(0);
	const [articlesActive, setArticlesActive] = useState<number>(0);
	const [articlesDeleted, setArticlesDeleted] = useState<number>(0);

	// Users query
	const membersInquiry: MembersInquiry = {
		page: 1,
		limit: 1,
		sort: 'createdAt',
		search: {},
	};

	const { data: usersData } = useQuery(GET_ALL_MEMBERS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: membersInquiry },
		onCompleted: (data: T) => {
			setUsersTotal(data?.getAllMembersByAdmin?.metaCounter[0]?.total ?? 0);
		},
	});

	const { data: usersActiveData } = useQuery(GET_ALL_MEMBERS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: {
			input: {
				...membersInquiry,
				search: { memberStatus: MemberStatus.ACTIVE },
			},
		},
		onCompleted: (data: T) => {
			setUsersActive(data?.getAllMembersByAdmin?.metaCounter[0]?.total ?? 0);
		},
	});

	const { data: usersBlockedData } = useQuery(GET_ALL_MEMBERS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: {
			input: {
				...membersInquiry,
				search: { memberStatus: MemberStatus.BLOCK },
			},
		},
		onCompleted: (data: T) => {
			setUsersBlocked(data?.getAllMembersByAdmin?.metaCounter[0]?.total ?? 0);
		},
	});

	const { data: usersDeletedData } = useQuery(GET_ALL_MEMBERS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: {
			input: {
				...membersInquiry,
				search: { memberStatus: MemberStatus.DELETE },
			},
		},
		onCompleted: (data: T) => {
			setUsersDeleted(data?.getAllMembersByAdmin?.metaCounter[0]?.total ?? 0);
		},
	});

	// Bikes query
	const propertiesInquiry: AllPropertiesInquiry = {
		page: 1,
		limit: 1,
		sort: 'createdAt',
		search: {},
	};

	const { data: bikesData } = useQuery(GET_ALL_PROPERTIES_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: propertiesInquiry },
		onCompleted: (data: T) => {
			setBikesTotal(data?.getAllPropertiesByAdmin?.metaCounter[0]?.total ?? 0);
		},
	});

	const { data: bikesActiveData } = useQuery(GET_ALL_PROPERTIES_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: {
			input: {
				...propertiesInquiry,
				search: { propertyStatus: PropertyStatus.ACTIVE },
			},
		},
		onCompleted: (data: T) => {
			setBikesActive(data?.getAllPropertiesByAdmin?.metaCounter[0]?.total ?? 0);
		},
	});

	const { data: bikesSoldData } = useQuery(GET_ALL_PROPERTIES_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: {
			input: {
				...propertiesInquiry,
				search: { propertyStatus: PropertyStatus.SOLD },
			},
		},
		onCompleted: (data: T) => {
			setBikesSold(data?.getAllPropertiesByAdmin?.metaCounter[0]?.total ?? 0);
		},
	});

	const { data: bikesHoldData } = useQuery(GET_ALL_PROPERTIES_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: {
			input: {
				...propertiesInquiry,
				search: { propertyStatus: PropertyStatus.HOLD },
			},
		},
		onCompleted: (data: T) => {
			setBikesHold(data?.getAllPropertiesByAdmin?.metaCounter[0]?.total ?? 0);
		},
	});

	const { data: bikesDeletedData } = useQuery(GET_ALL_PROPERTIES_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: {
			input: {
				...propertiesInquiry,
				search: { propertyStatus: PropertyStatus.DELETE },
			},
		},
		onCompleted: (data: T) => {
			setBikesDeleted(data?.getAllPropertiesByAdmin?.metaCounter[0]?.total ?? 0);
		},
	});

	// Articles query
	const articlesInquiry: AllBoardArticlesInquiry = {
		page: 1,
		limit: 1,
		sort: 'createdAt',
		search: {},
	};

	const { data: articlesData } = useQuery(GET_ALL_BOARD_ARTICLES_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: articlesInquiry },
		onCompleted: (data: T) => {
			setArticlesTotal(data?.getAllBoardArticlesByAdmin?.metaCounter[0]?.total ?? 0);
		},
	});

	const { data: articlesActiveData } = useQuery(GET_ALL_BOARD_ARTICLES_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: {
			input: {
				...articlesInquiry,
				search: { articleStatus: BoardArticleStatus.ACTIVE },
			},
		},
		onCompleted: (data: T) => {
			setArticlesActive(data?.getAllBoardArticlesByAdmin?.metaCounter[0]?.total ?? 0);
		},
	});

	const { data: articlesDeletedData } = useQuery(GET_ALL_BOARD_ARTICLES_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: {
			input: {
				...articlesInquiry,
				search: { articleStatus: BoardArticleStatus.DELETE },
			},
		},
		onCompleted: (data: T) => {
			setArticlesDeleted(data?.getAllBoardArticlesByAdmin?.metaCounter[0]?.total ?? 0);
		},
	});

	const navigateToUsers = () => {
		router.push('/_admin/users');
	};

	const navigateToBikes = () => {
		router.push('/_admin/properties');
	};

	const navigateToArticles = () => {
		router.push('/_admin/community');
	};

	// Calculate percentages for donut charts
	const usersActivePercent = usersTotal > 0 ? Math.round((usersActive / usersTotal) * 100) : 0;
	const usersBlockedPercent = usersTotal > 0 ? Math.round((usersBlocked / usersTotal) * 100) : 0;
	const usersDeletedPercent = usersTotal > 0 ? Math.round((usersDeleted / usersTotal) * 100) : 0;

	const bikesActivePercent = bikesTotal > 0 ? Math.round((bikesActive / bikesTotal) * 100) : 0;
	const bikesSoldPercent = bikesTotal > 0 ? Math.round((bikesSold / bikesTotal) * 100) : 0;
	const bikesHoldPercent = bikesTotal > 0 ? Math.round((bikesHold / bikesTotal) * 100) : 0;
	const bikesDeletedPercent = bikesTotal > 0 ? Math.round((bikesDeleted / bikesTotal) * 100) : 0;

	const articlesActivePercent = articlesTotal > 0 ? Math.round((articlesActive / articlesTotal) * 100) : 0;
	const articlesDeletedPercent = articlesTotal > 0 ? Math.round((articlesDeleted / articlesTotal) * 100) : 0;

	// Donut chart component
	const DonutChart = ({ 
		data, 
		size = 120, 
		strokeWidth = 20 
	}: { 
		data: Array<{ value: number; color: string; label: string }>; 
		size?: number; 
		strokeWidth?: number;
	}) => {
		const radius = (size - strokeWidth) / 2;
		const circumference = 2 * Math.PI * radius;
		const filteredData = data.filter(item => item.value > 0);
		const totalPercent = filteredData.reduce((sum, item) => sum + item.value, 0);
		
		// Normalize percentages to ensure they sum to 100%
		const normalizedData = filteredData.map(item => ({
			...item,
			value: totalPercent > 0 ? Math.round((item.value / totalPercent) * 100) : 0
		}));
		
		// Adjust last item to ensure sum is exactly 100%
		if (normalizedData.length > 0) {
			const sum = normalizedData.reduce((s, item) => s + item.value, 0);
			if (sum !== 100 && normalizedData.length > 0) {
				normalizedData[normalizedData.length - 1].value += (100 - sum);
			}
		}

		// Calculate segment positions
		const segments = normalizedData.map((item, index) => {
			const segmentLength = (item.value / 100) * circumference;
			const previousLength = normalizedData.slice(0, index).reduce((sum, prevItem) => {
				return sum + (prevItem.value / 100) * circumference;
			}, 0);
			// strokeDashoffset should be negative to move the dash pattern backwards
			const strokeDashoffset = -previousLength;
			
			return {
				...item,
				segmentLength,
				strokeDashoffset,
			};
		});

		return (
			<Box className="donut-chart-container" sx={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
				<Box sx={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
					<svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
						{segments.map((segment, index) => {
							return (
								<circle
									key={index}
									cx={size / 2}
									cy={size / 2}
									r={radius}
									fill="none"
									stroke={segment.color}
									strokeWidth={strokeWidth}
									strokeDasharray={`${segment.segmentLength} ${circumference}`}
									strokeDashoffset={segment.strokeDashoffset}
									strokeLinecap="round"
									className="donut-segment"
									style={{
										transition: 'all 0.5s ease',
									}}
								/>
							);
						})}
					</svg>
					<Box className="donut-chart-center" sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }}>
						<Typography className="donut-chart-total">100%</Typography>
					</Box>
				</Box>
				<Box className="donut-chart-legend" sx={{ width: '100%', marginTop: '16px' }}>
					{normalizedData.map((item, index) => (
						<Box key={index} className="donut-legend-item">
							<Box className="donut-legend-color" sx={{ backgroundColor: item.color }} />
							<Typography className="donut-legend-label">{item.label}</Typography>
							<Typography className="donut-legend-value">{item.value}%</Typography>
						</Box>
					))}
				</Box>
			</Box>
		);
	};

	return (
		<Box component={'div'} className={'admin-dashboard'}>
			<Typography variant={'h2'} className={'dashboard-title'} sx={{ mb: '40px' }}>
				Dashboard Overview
			</Typography>

			<Grid container spacing={3} sx={{ mb: 4 }}>
				{/* Users Card */}
				<Grid item xs={12} md={4}>
					<Card className={'stat-card stat-card-users'} onClick={navigateToUsers}>
						<CardContent>
							<Stack direction={'row'} justifyContent={'space-between'} alignItems={'flex-start'} mb={2}>
								<Box className={'stat-icon-box stat-icon-users'}>
									<PeopleIcon sx={{ fontSize: 32 }} />
								</Box>
								<Button className={'stat-action-btn'} endIcon={<ArrowForwardIcon />}>
									View All
								</Button>
							</Stack>
							<Typography className={'stat-label'}>Total Users</Typography>
							<Typography className={'stat-value'}>{usersTotal}</Typography>
							
							<Box className="stat-chart-container">
								<DonutChart
									data={[
										{ value: usersActivePercent, color: '#10b981', label: 'Active' },
										{ value: usersBlockedPercent, color: '#f59e0b', label: 'Blocked' },
										{ value: usersDeletedPercent, color: '#ef4444', label: 'Deleted' },
									]}
									size={140}
									strokeWidth={18}
								/>
							</Box>
							
							<Stack direction={'row'} spacing={2} mt={2} className={'stat-details'}>
								<Box className={'stat-detail-item'}>
									<Typography className={'stat-detail-label'}>Active</Typography>
									<Typography className={'stat-detail-value stat-active'}>{usersActive}</Typography>
								</Box>
								<Box className={'stat-detail-item'}>
									<Typography className={'stat-detail-label'}>Deleted</Typography>
									<Typography className={'stat-detail-value stat-deleted'}>{usersDeleted}</Typography>
								</Box>
							</Stack>
						</CardContent>
					</Card>
				</Grid>

				{/* Bikes Card */}
				<Grid item xs={12} md={4}>
					<Card className={'stat-card stat-card-bikes'} onClick={navigateToBikes}>
						<CardContent>
							<Stack direction={'row'} justifyContent={'space-between'} alignItems={'flex-start'} mb={2}>
								<Box className={'stat-icon-box stat-icon-bikes'}>
									<TwoWheelerIcon sx={{ fontSize: 32 }} />
								</Box>
								<Button className={'stat-action-btn'} endIcon={<ArrowForwardIcon />}>
									View All
								</Button>
							</Stack>
							<Typography className={'stat-label'}>{t('Total Bikes')}</Typography>
							<Typography className={'stat-value'}>{bikesTotal}</Typography>
							
							<Box className="stat-chart-container">
								<DonutChart
									data={[
										{ value: bikesActivePercent, color: '#10b981', label: 'Active' },
										{ value: bikesSoldPercent, color: '#f59e0b', label: 'Sold' },
										{ value: bikesHoldPercent, color: '#3b82f6', label: 'Hold' },
										{ value: bikesDeletedPercent, color: '#ef4444', label: 'Deleted' },
									]}
									size={140}
									strokeWidth={18}
								/>
							</Box>
							
							<Stack direction={'row'} spacing={2} mt={2} className={'stat-details'}>
								<Box className={'stat-detail-item'}>
									<Typography className={'stat-detail-label'}>Active</Typography>
									<Typography className={'stat-detail-value stat-active'}>{bikesActive}</Typography>
								</Box>
								<Box className={'stat-detail-item'}>
									<Typography className={'stat-detail-label'}>Sold</Typography>
									<Typography className={'stat-detail-value stat-sold'}>{bikesSold}</Typography>
								</Box>
								<Box className={'stat-detail-item'}>
									<Typography className={'stat-detail-label'}>Deleted</Typography>
									<Typography className={'stat-detail-value stat-deleted'}>{bikesDeleted}</Typography>
								</Box>
							</Stack>
						</CardContent>
					</Card>
				</Grid>

				{/* Articles Card */}
				<Grid item xs={12} md={4}>
					<Card className={'stat-card stat-card-articles'} onClick={navigateToArticles}>
						<CardContent>
							<Stack direction={'row'} justifyContent={'space-between'} alignItems={'flex-start'} mb={2}>
								<Box className={'stat-icon-box stat-icon-articles'}>
									<ArticleIcon sx={{ fontSize: 32 }} />
								</Box>
								<Button className={'stat-action-btn'} endIcon={<ArrowForwardIcon />}>
									View All
								</Button>
							</Stack>
							<Typography className={'stat-label'}>Total Articles</Typography>
							<Typography className={'stat-value'}>{articlesTotal}</Typography>
							
							<Box className="stat-chart-container">
								<DonutChart
									data={[
										{ value: articlesActivePercent, color: '#10b981', label: 'Active' },
										{ value: articlesDeletedPercent, color: '#ef4444', label: 'Deleted' },
									]}
									size={140}
									strokeWidth={18}
								/>
							</Box>
							
							<Stack direction={'row'} spacing={2} mt={2} className={'stat-details'}>
								<Box className={'stat-detail-item'}>
									<Typography className={'stat-detail-label'}>Active</Typography>
									<Typography className={'stat-detail-value stat-active'}>{articlesActive}</Typography>
								</Box>
								<Box className={'stat-detail-item'}>
									<Typography className={'stat-detail-label'}>Deleted</Typography>
									<Typography className={'stat-detail-value stat-deleted'}>{articlesDeleted}</Typography>
								</Box>
							</Stack>
						</CardContent>
					</Card>
				</Grid>
			</Grid>
		</Box>
	);
};

export default withAdminLayout(AdminHome);
