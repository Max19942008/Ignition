import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Stack, Tab, Typography, Button, Pagination, Box } from '@mui/material';
import CommunityCard from '../../libs/components/common/CommunityCard';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { BoardArticle } from '../../libs/types/board-article/board-article';
import { T } from '../../libs/types/common';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { BoardArticlesInquiry } from '../../libs/types/board-article/board-article.input';
import { BoardArticleCategory } from '../../libs/enums/board-article.enum';
import { useMutation, useQuery } from '@apollo/client';
import { LIKE_TARGET_BOARD_ARTICLE } from '../../apollo/user/mutation';
import { GET_BOARD_ARTICLES } from '../../apollo/user/query';
import { Messages } from '../../libs/config';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArticleIcon from '@mui/icons-material/Article';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const Community: NextPage = ({ initialInput, ...props }: T) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const { query } = router;
	const articleCategory = query?.articleCategory as string;
	const [searchCommunity, setSearchCommunity] = useState<BoardArticlesInquiry>(initialInput);
	const [boardArticles, setBoardArticles] = useState<BoardArticle[]>([]);
	const [totalCount, setTotalCount] = useState<number>(0);
	if (articleCategory) initialInput.search.articleCategory = articleCategory;

	/** APOLLO REQUESTS **/
		const [likeTargetArticle] = useMutation(LIKE_TARGET_BOARD_ARTICLE);

			const {
							loading: getBoardArticlesLoading, 
							data: getBoardArticlesData, 
							error: getBoardArticlesError,
							refetch: getBoardArticlesRefetch,
							 } = useQuery(GET_BOARD_ARTICLES, {
							fetchPolicy: "cache-and-network",
							variables: {
								input: searchCommunity,
							},	
							notifyOnNetworkStatusChange: true,
							onCompleted: (data: T) => {
									setBoardArticles(data?.getBoardArticles?.list);
									setTotalCount(data?.getBoardArticles?.metaCounter[0]?.total)
							},
							 });
	/** LIFECYCLES **/
	useEffect(() => {
		if (!query?.articleCategory)
			router.push(
				{
					pathname: router.pathname,
					query: { articleCategory: 'FREE' },
				},
				router.pathname,
				{ shallow: true },
			);
	}, []);

	/** HANDLERS **/
	const tabChangeHandler = async (e: T, value: string) => {
		console.log(value);

		setSearchCommunity({ ...searchCommunity, page: 1, search: { articleCategory: value as BoardArticleCategory } });
		await router.push(
			{
				pathname: '/community',
				query: { articleCategory: value },
			},
			router.pathname,
			{ shallow: true },
		);
	};

	const paginationHandler = (e: T, value: number) => {
		setSearchCommunity({ ...searchCommunity, page: value });
	};

	const likeArticleHandler = async (e: any, user: any, id: string) => {
					try {
						e.stopPropagation();
						if(!id) return;
						if(!user._id) throw new Error(Messages.error2);

					 await likeTargetArticle({
						variables: {
							input: id,
						}, 
					});
					 await getBoardArticlesRefetch({input: searchCommunity});
			
					 await sweetTopSmallSuccessAlert("success", 800);
			
					} catch(err: any) {
					console.log("ERROR likePropertyHandler:", err.message);
					sweetMixinErrorAlert(err.message).then();
					}
				};
	// const paginationHandler = (e: T, value: number) => {
	// 	setSearchCommunity({ ...searchCommunity, page: value });
	// };

	const refreshHandler = () => {
		getBoardArticlesRefetch({ input: searchCommunity });
	};

	const getCategoryLabel = (category: string) => {
		switch (category) {
			case 'FREE':
				return 'Free Board';
			case 'RECOMMEND':
				return 'Recommend';
			case 'NEWS':
				return 'News';
			case 'HUMOR':
				return 'Humor';
			default:
				return category;
		}
	};

	if (device === 'mobile') {
		return <h1>COMMUNITY PAGE MOBILE</h1>;
	} else {
		return (
			<div id="community-list-page">
				<div className="container">
					{/* Header Banner */}
					<Stack className="header-banner">
						<Stack className="header-content">
							<Stack className="header-left">
								<Typography className="header-label">COMMUNITY</Typography>
								<Typography className="header-title">Drive the conversation.</Typography>
								<Typography className="header-description">
									Learn, share, and laugh with enthusiasts. Pick a lane and dive into the latest posts.
								</Typography>
								<Stack className="header-actions">
									<Button
										className="btn-write"
										onClick={() =>
											router.push({
												pathname: '/mypage',
												query: {
													category: 'writeArticle',
												},
											})
										}
									>
										Write an article
									</Button>
									<Button className="btn-refresh" onClick={refreshHandler} startIcon={<RefreshIcon />}>
										Refresh
									</Button>
								</Stack>
							</Stack>
					<Stack className="header-stats">
						<Box component={'div'} className="stat-card articles-stat">
							<ArticleIcon className="stat-icon" />
							<Typography className="stat-value">{totalCount || 0}</Typography>
							<Typography className="stat-label">Articles</Typography>
						</Box>
						<Box component={'div'} className="stat-card category-stat">
							<Typography className="stat-value">{getCategoryLabel(searchCommunity.search.articleCategory)}</Typography>
							<Typography className="stat-label">Category</Typography>
						</Box>
					</Stack>
						</Stack>
					</Stack>

					<TabContext value={searchCommunity.search.articleCategory}>
						<Stack className="main-box">
							{/* Left Sidebar - Boards */}
							<Stack className="left-config">
								<Typography className="boards-title">Boards</Typography>
								<TabList
									orientation="vertical"
									aria-label="community boards"
									TabIndicatorProps={{
										style: { display: 'none' },
									}}
									onChange={tabChangeHandler}
									className="boards-list"
								>
									<Tab
										value={'FREE'}
										label={
											<Stack className="board-item">
												<Typography className="board-name">Free Board</Typography>
												<Typography className="board-desc">Open chat about anything</Typography>
											</Stack>
										}
										className={`board-tab ${searchCommunity.search.articleCategory == 'FREE' ? 'active' : ''}`}
									/>
									<Tab
										value={'RECOMMEND'}
										label={
											<Stack className="board-item">
												<Typography className="board-name">Recommend</Typography>
												<Typography className="board-desc">Best spots & services</Typography>
											</Stack>
										}
										className={`board-tab ${searchCommunity.search.articleCategory == 'RECOMMEND' ? 'active' : ''}`}
									/>
									<Tab
										value={'NEWS'}
										label={
											<Stack className="board-item">
												<Typography className="board-name">News</Typography>
												<Typography className="board-desc">Auto industry updates</Typography>
											</Stack>
										}
										className={`board-tab ${searchCommunity.search.articleCategory == 'NEWS' ? 'active' : ''}`}
									/>
									<Tab
										value={'HUMOR'}
										label={
											<Stack className="board-item">
												<Typography className="board-name">Humor</Typography>
												<Typography className="board-desc">Memes & fun</Typography>
											</Stack>
										}
										className={`board-tab ${searchCommunity.search.articleCategory == 'HUMOR' ? 'active' : ''}`}
									/>
								</TabList>
								{totalCount > 0 && (
									<Typography className="showing-count">Showing {boardArticles.length} / {totalCount}</Typography>
								)}
							</Stack>

							{/* Right Main Area - Latest Posts */}
							<Stack className="right-config">
								<Stack className="panel-config">
									<Stack className="posts-header">
										<Typography className="posts-title">Latest posts</Typography>
										<Typography className="posts-subtitle">
											Sorted by newest • {getCategoryLabel(searchCommunity.search.articleCategory)} board
										</Typography>
									</Stack>

									<TabPanel value="FREE">
										<Stack className="list-box">
											{totalCount ? (
												boardArticles?.map((boardArticle: BoardArticle) => {
													return <CommunityCard 
													boardArticle={boardArticle} 
													key={boardArticle?._id} 
													likeArticleHandler={likeArticleHandler} />;
												})
											) : (
												<Stack className={'no-data'}>
													<img src="/img/icons/icoAlert.svg" alt="" />
													<p>No Article found!</p>
												</Stack>
											)}
										</Stack>
									</TabPanel>
									<TabPanel value="RECOMMEND">
										<Stack className="list-box">
											{totalCount ? (
												boardArticles?.map((boardArticle: BoardArticle) => {
													return <CommunityCard 
													boardArticle={boardArticle} 
													key={boardArticle?._id} 
													likeArticleHandler={likeArticleHandler} />;
												})
											) : (
												<Stack className={'no-data'}>
													<img src="/img/icons/icoAlert.svg" alt="" />
													<p>No Article found!</p>
												</Stack>
											)}
										</Stack>
									</TabPanel>
									<TabPanel value="NEWS">
										<Stack className="list-box">
											{totalCount ? (
												boardArticles?.map((boardArticle: BoardArticle) => {
													return <CommunityCard 
													boardArticle={boardArticle} 
													key={boardArticle?._id} 
													likeArticleHandler={likeArticleHandler} />;
												})
											) : (
												<Stack className={'no-data'}>
													<img src="/img/icons/icoAlert.svg" alt="" />
													<p>No Article found!</p>
												</Stack>
											)}
										</Stack>
									</TabPanel>
									<TabPanel value="HUMOR">
										<Stack className="list-box">
											{totalCount ? (
												boardArticles?.map((boardArticle: BoardArticle) => {
													return <CommunityCard boardArticle={boardArticle} 
													key={boardArticle?._id}  
													likeArticleHandler={likeArticleHandler} />;
												})
											) : (
												<Stack className={'no-data'}>
													<img src="/img/icons/icoAlert.svg" alt="" />
													<p>No Article found!</p>
												</Stack>
											)}
										</Stack>
									</TabPanel>
								</Stack>
							</Stack>
						</Stack>
					</TabContext>

					{totalCount > 0 && (
						<Stack className="pagination-config">
							<Stack className="pagination-box">
								<Pagination
									count={Math.ceil(totalCount / searchCommunity.limit)}
									page={searchCommunity.page}
									shape="circular"
									color="primary"
									onChange={paginationHandler}
								/>
							</Stack>
							<Stack className="total-result">
								<Typography>
									Total {totalCount} article{totalCount > 1 ? 's' : ''} available
								</Typography>
							</Stack>
						</Stack>
					)}
				</div>
			</div>
		);
	}
};

Community.defaultProps = {
	initialInput: {
		page: 1,
		limit: 6,
		sort: 'createdAt',
		direction: 'ASC',
		search: {
			articleCategory: 'FREE',
		},
	},
};

export default withLayoutBasic(Community);
