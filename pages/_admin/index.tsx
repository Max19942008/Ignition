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
	const [usersDeleted, setUsersDeleted] = useState<number>(0);
	const [bikesTotal, setBikesTotal] = useState<number>(0);
	const [bikesActive, setBikesActive] = useState<number>(0);
	const [bikesSold, setBikesSold] = useState<number>(0);
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
							<Typography className={'stat-label'}>Total Bikes</Typography>
							<Typography className={'stat-value'}>{bikesTotal}</Typography>
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
