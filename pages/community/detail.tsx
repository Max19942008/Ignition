import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Button, Stack, Typography, Tab, Tabs, IconButton, Backdrop, Pagination, Box } from '@mui/material';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import Moment from 'react-moment';
import { userVar } from '../../apollo/store';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ChatIcon from '@mui/icons-material/Chat';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import { CommentInput, CommentsInquiry } from '../../libs/types/comment/comment.input';
import { Comment } from '../../libs/types/comment/comment';
import dynamic from 'next/dynamic';
import { CommentGroup, CommentStatus } from '../../libs/enums/comment.enum';
import { T } from '../../libs/types/common';
import EditIcon from '@mui/icons-material/Edit';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { BoardArticle } from '../../libs/types/board-article/board-article';
import { GET_BOARD_ARTICLE, GET_COMMENTS } from '../../apollo/user/query';
import { CREATE_COMMENT, LIKE_TARGET_BOARD_ARTICLE, UPDATE_COMMENT } from '../../apollo/user/mutation';
import { Messages } from '../../libs/config';
import { sweetConfirmAlert, sweetMixinErrorAlert, sweetMixinSuccessAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { CommentUpdate } from '../../libs/types/comment/comment.update';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
const ToastViewerComponent = dynamic(() => import('../../libs/components/community/TViewer'), { ssr: false });

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const CommunityDetail: NextPage = ({ initialInput, ...props }: T) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const { query } = router;

	const articleId = query?.id as string;
	const articleCategory = query?.articleCategory as string;

	const [comment, setComment] = useState<string>('');
	const [wordsCnt, setWordsCnt] = useState<number>(0);
	const [updatedCommentWordsCnt, setUpdatedCommentWordsCnt] = useState<number>(0);
	const user = useReactiveVar(userVar);
	const [comments, setComments] = useState<Comment[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [searchFilter, setSearchFilter] = useState<CommentsInquiry>({
		...initialInput,
	});
	const [memberImage, setMemberImage] = useState<string>('/img/community/articleImg.png');
	const [anchorEl, setAnchorEl] = useState<any | null>(null);
	const open = Boolean(anchorEl);
	const id = open ? 'simple-popover' : undefined;
	const [openBackdrop, setOpenBackdrop] = useState<boolean>(false);
	const [updatedComment, setUpdatedComment] = useState<string>('');
	const [updatedCommentId, setUpdatedCommentId] = useState<string>('');
	const [likeLoading, setLikeLoading] = useState<boolean>(false);
	const [boardArticle, setBoardArticle] = useState<BoardArticle>();

		/** APOLLO REQUESTS **/

	const [likeTargetArticle] = useMutation(LIKE_TARGET_BOARD_ARTICLE);
	const [createComment] = useMutation(CREATE_COMMENT);
	const [updateComment] = useMutation(UPDATE_COMMENT);

		const {
	loading: getBoardArticleLoading, 
	data: getBoardArticleData, 
	error: getBoardArticleError,
	refetch: getBoardArticleRefetch,
  } = useQuery(GET_BOARD_ARTICLE, {
	fetchPolicy: "network-only",
	variables: {
	input: articleId,
	},
	notifyOnNetworkStatusChange: true,
	onCompleted: (data: T) => {
	setBoardArticle(data?.getBoardArticle);
	if (data?.getBoardArticle?.memberData?.memberImage) {
   setMemberImage(`${process.env.REACT_APP_API_URL}/${data?.getBoardArticle?.memberData?.memberImage}`);
		 }
		}
	});

		const {
					loading: getCommentsLoading, 
					data: getCommentsData, 
					error: getCommentsError,
					refetch: getCommentsRefetch,
					 } = useQuery(GET_COMMENTS, {
					fetchPolicy: "network-only",
					variables: {input: searchFilter},
					notifyOnNetworkStatusChange: true,
					onCompleted: (data: T) => {
							setComments(data?.getComments?.list);
							setTotal(data?.getComments?.metaCounter[0]?.total || 0);
					},
					 });

	/** LIFECYCLES **/
	useEffect(() => {
		if (articleId) setSearchFilter({ ...searchFilter, search: { commentRefId: articleId } });
	}, [articleId]);

	/** HANDLERS **/
	const tabChangeHandler = (event: React.SyntheticEvent, value: string) => {
		router.replace(
			{
				pathname: '/community',
				query: { articleCategory: value },
			},
			'/community',
			{ shallow: true },
		);
	};

	// const creteCommentHandler = async () => {};

	// const updateButtonHandler = async (commentId: string, commentStatus?: CommentStatus.DELETE) => {};

	const getCommentMemberImage = (imageUrl: string | undefined) => {
		if (imageUrl) return `${process.env.REACT_APP_API_URL}/${imageUrl}`;
		else return '/img/community/articleImg.png';
	};

	const goMemberPage = (id: any) => {
		if (id === user?._id) router.push('/mypage');
		else router.push(`/member?memberId=${id}`);
	};

	const cancelButtonHandler = () => {
		setOpenBackdrop(false);
		setUpdatedComment('');
		setUpdatedCommentWordsCnt(0);
	};

	const updateCommentInputHandler = (value: string) => {
		if (value.length > 100) return;
		setUpdatedCommentWordsCnt(value.length);
		setUpdatedComment(value);
	};

	const paginationHandler = (e: T, value: number) => {
		setSearchFilter({ ...searchFilter, page: value });
	};

		const likeBoardArticleHandler = async ( user: any, id: string) => {
						try {
							// e.stopPropagation();
							if(!id) return;
							if(!user._id) throw new Error(Messages.error2);

							setLikeLoading(true);
	
						 await likeTargetArticle({
							variables: {
								input: id,
							}, 
						});
						 await getBoardArticleRefetch({input: articleId});
				
						 await sweetTopSmallSuccessAlert("success", 800);
				
						} catch(err: any) {
						console.log("ERROR likePropertyHandler:", err.message);
						sweetMixinErrorAlert(err.message).then();
						} finally{
							setLikeLoading(false);
						}
					};

						const creteCommentHandler = async () => {
							if(!comment) return;
						try {						
							if(!user._id) throw new Error(Messages.error2);
              const commentInput: CommentInput = {
								commentGroup:CommentGroup.ARTICLE,
								commentRefId: articleId,
								commentContent: comment
							}; 
							await createComment({
								variables: {
									input: commentInput,
								},
							});
						 await getCommentsRefetch({input: searchFilter});
				   
						 setComment('');
						await sweetMixinSuccessAlert('Successfully commented');
				
						} catch(err: any) {
						sweetMixinErrorAlert(err.message).then();
						} 
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

	const updateButtonHandler = async (commentId: string, commentStatus?: CommentStatus.DELETE) => {
  try {
    if (!user?._id) throw new Error(Messages.error2);
    if (!commentId) throw new Error('Select a comment to update!');
    if (updatedComment === comments?.find((comment) => comment?._id === commentId)?.commentContent) return;

    const updateData: CommentUpdate = {
      _id: commentId,
      ...(commentStatus && { commentStatus: commentStatus }),
      ...(updatedComment && { commentContent: updatedComment }),
    };

    if (!updateData?.commentContent && !updateData?.commentStatus)
      throw new Error('Provide data to update your comment!');

    if (commentStatus) {
      if (await sweetConfirmAlert('Do you want to delete the comment?')) {
        await updateComment({
          variables: {
            input: updateData,
          },
        });
        await sweetMixinSuccessAlert('Successfully deleted!');
      } else return;
    } else {
      await updateComment({
        variables: {
          input: updateData,
        },
      });
      await sweetMixinSuccessAlert('Successfully updated!');
    }

    await getCommentsRefetch({ input: searchFilter });

  } catch (error: any) {
    await sweetMixinErrorAlert(error.message);
  } finally {
    setOpenBackdrop(false);
    setUpdatedComment('');
    setUpdatedCommentWordsCnt(0);
    setUpdatedCommentId('');
  }
};	

	if (device === 'mobile') {
		return (
			<div id="community-detail-page">
				<div className="container">
					{/* Back Button */}
					<Button className="back-button" onClick={() => router.back()} startIcon={<ArrowBackIcon />}>
						Back
					</Button>

					<Stack className="main-box">
						{/* Left Sidebar - Boards */}
						<Stack className="left-config">
							<Typography className="boards-title">Boards</Typography>
							<Tabs
								orientation="vertical"
								aria-label="community boards"
								TabIndicatorProps={{
									style: { display: 'none' },
								}}
								onChange={tabChangeHandler}
								value={articleCategory}
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
									className={`board-tab ${articleCategory === 'FREE' ? 'active' : ''}`}
								/>
								<Tab
									value={'RECOMMEND'}
									label={
										<Stack className="board-item">
											<Typography className="board-name">Recommend</Typography>
											<Typography className="board-desc">Best spots & services</Typography>
										</Stack>
									}
									className={`board-tab ${articleCategory === 'RECOMMEND' ? 'active' : ''}`}
								/>
								<Tab
									value={'NEWS'}
									label={
										<Stack className="board-item">
											<Typography className="board-name">News</Typography>
											<Typography className="board-desc">Auto industry updates</Typography>
										</Stack>
									}
									className={`board-tab ${articleCategory === 'NEWS' ? 'active' : ''}`}
								/>
								<Tab
									value={'HUMOR'}
									label={
										<Stack className="board-item">
											<Typography className="board-name">Humor</Typography>
											<Typography className="board-desc">Memes & fun</Typography>
										</Stack>
									}
									className={`board-tab ${articleCategory === 'HUMOR' ? 'active' : ''}`}
								/>
							</Tabs>
						</Stack>

						{/* Right Main Content */}
						<Stack className="right-config">
							{/* Article Header */}
							<Stack className="article-header">
								<Stack className="header-top">
									<Stack className="category-badge">
										<Typography className="category-text">{getCategoryLabel(articleCategory)}</Typography>
									</Stack>
									<Button
										className="write-button"
										onClick={() =>
											router.push({
												pathname: '/mypage',
												query: {
													category: 'writeArticle',
												},
											})
										}
									>
										Write Article
									</Button>
								</Stack>
								<Typography className="article-title">{boardArticle?.articleTitle}</Typography>
								<Stack className="article-meta">
									<Stack className="author-section" onClick={() => goMemberPage(boardArticle?.memberData?._id)}>
										<img src={memberImage} alt="" className="author-avatar" />
										<Stack className="author-info">
											<Typography className="author-name">{boardArticle?.memberData?.memberNick}</Typography>
											<Moment className="article-date" format={'MMMM DD, YYYY'}>
												{boardArticle?.createdAt}
											</Moment>
										</Stack>
									</Stack>
									<Stack className="engagement-stats">
										<Box component="div" className="stat-badge">
											<VisibilityIcon className="stat-icon" />
											<Typography className="stat-value">{boardArticle?.articleViews || 0}</Typography>
										</Box>
										<Box component="div" className="stat-badge">
											<ChatIcon className="stat-icon" />
											<Typography className="stat-value">{boardArticle?.articleComments || 0}</Typography>
										</Box>
										<Button
											className={`like-button ${boardArticle?.meLiked ? 'liked' : ''}`}
											onClick={() => {
												if (user && boardArticle?._id) {
													likeBoardArticleHandler(user, boardArticle._id);
												}
											}}
											disabled={likeLoading}
											startIcon={boardArticle?.meLiked ? <ThumbUpAltIcon /> : <ThumbUpOffAltIcon />}
										>
											<Typography className="like-text">{boardArticle?.articleLikes || 0}</Typography>
										</Button>
									</Stack>
								</Stack>
							</Stack>

							{/* Article Content */}
							<Stack className="article-content">
								<Typography className="content-title">Article Content</Typography>
								<Stack className="content-wrapper">
									<ToastViewerComponent markdown={boardArticle?.articleContent} className={'article-viewer'} />
								</Stack>
							</Stack>
							{/* Comments Section */}
							<Stack className="comments-section">
								<Stack className="comments-header">
									<Typography className="comments-title">
										Comments <span className="comments-count">({total})</span>
									</Typography>
								</Stack>

								{/* Leave Comment Form */}
								<Stack className="comment-form">
									<Stack className="form-input-wrapper">
										<input
											type="text"
											className="comment-input"
											placeholder="Share your thoughts..."
											value={comment}
											onChange={(e) => {
												if (e.target.value.length > 100) return;
												setWordsCnt(e.target.value.length);
												setComment(e.target.value);
											}}
										/>
										<Stack className="form-footer">
											<Typography className="char-count">{wordsCnt}/100</Typography>
											<Button className="submit-comment-btn" onClick={creteCommentHandler} disabled={!comment}>
												Post Comment
											</Button>
										</Stack>
									</Stack>
								</Stack>

								{/* Comments List */}
								{total > 0 && (
									<Stack className="comments-list">
										{comments?.map((commentData, index) => {
											return (
												<Stack className="comment-card" key={commentData?._id}>
													<Stack className="comment-header">
														<Stack
															className="comment-author"
															onClick={() => goMemberPage(commentData?.memberData?._id as string)}
														>
															<img src={getCommentMemberImage(commentData?.memberData?.memberImage)} alt="" className="comment-avatar" />
															<Stack className="author-details">
																<Typography className="author-name">{commentData?.memberData?.memberNick}</Typography>
																<Moment className="comment-date" format={'MMM DD, YYYY • HH:mm'}>
																	{commentData?.createdAt}
																</Moment>
															</Stack>
														</Stack>
														{commentData?.memberId === user?._id && (
															<Stack className="comment-actions">
																<IconButton
																	className="edit-btn"
																	onClick={(e:any) => {
																		setUpdatedComment(commentData?.commentContent);
																		setUpdatedCommentWordsCnt(commentData?.commentContent?.length);
																		setUpdatedCommentId(commentData?._id);
																		setOpenBackdrop(true);
																	}}
																>
																	<EditIcon />
																</IconButton>
																<IconButton
																	className="delete-btn"
																	onClick={() => {
																		setUpdatedCommentId(commentData?._id);
																		updateButtonHandler(commentData?._id, CommentStatus.DELETE);
																	}}
																>
																	<DeleteForeverIcon />
																</IconButton>
															</Stack>
														)}
													</Stack>
													<Typography className="comment-content">{commentData?.commentContent}</Typography>
												</Stack>
											);
										})}
									</Stack>
								)}

								{/* Pagination */}
								{total > 0 && total > searchFilter.limit && (
									<Stack className="pagination-wrapper">
										<Pagination
											count={Math.ceil(total / searchFilter.limit) || 1}
											page={searchFilter.page}
											shape="circular"
											color="primary"
											onChange={paginationHandler}
										/>
									</Stack>
								)}
							</Stack>

							{/* Update Comment Backdrop */}
							<Backdrop
								sx={{
									zIndex: 999,
								}}
								open={openBackdrop}
								onClick={cancelButtonHandler}
							>
								<Stack className="update-modal" onClick={(e:any) => e.stopPropagation()}>
									<Typography className="modal-title">Update comment</Typography>
									<Stack className="modal-content">
										<input
											className="update-input"
											autoFocus
											value={updatedComment}
											onChange={(e) => updateCommentInputHandler(e.target.value)}
											type="text"
										/>
										<Stack className="modal-footer">
											<Typography className="char-count">{updatedCommentWordsCnt}/100</Typography>
											<Stack className="modal-actions">
												<Button className="cancel-btn" onClick={cancelButtonHandler}>
													Cancel
												</Button>
												<Button className="update-btn" onClick={() => updateButtonHandler(updatedCommentId, undefined)}>
													Update
												</Button>
											</Stack>
										</Stack>
									</Stack>
								</Stack>
							</Backdrop>
						</Stack>
					</Stack>
				</div>
			</div>
		);
	} else {
		return (
			<div id="community-detail-page">
				<div className="container">
					{/* Back Button */}
					<Button className="back-button" onClick={() => router.back()} startIcon={<ArrowBackIcon />}>
						Back
					</Button>

					<Stack className="main-box">
						{/* Left Sidebar - Boards */}
						<Stack className="left-config">
							<Typography className="boards-title">Boards</Typography>
							<Tabs
								orientation="vertical"
								aria-label="community boards"
								TabIndicatorProps={{
									style: { display: 'none' },
								}}
								onChange={tabChangeHandler}
								value={articleCategory}
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
									className={`board-tab ${articleCategory === 'FREE' ? 'active' : ''}`}
								/>
								<Tab
									value={'RECOMMEND'}
									label={
										<Stack className="board-item">
											<Typography className="board-name">Recommend</Typography>
											<Typography className="board-desc">Best spots & services</Typography>
										</Stack>
									}
									className={`board-tab ${articleCategory === 'RECOMMEND' ? 'active' : ''}`}
								/>
								<Tab
									value={'NEWS'}
									label={
										<Stack className="board-item">
											<Typography className="board-name">News</Typography>
											<Typography className="board-desc">Auto industry updates</Typography>
										</Stack>
									}
									className={`board-tab ${articleCategory === 'NEWS' ? 'active' : ''}`}
								/>
								<Tab
									value={'HUMOR'}
									label={
										<Stack className="board-item">
											<Typography className="board-name">Humor</Typography>
											<Typography className="board-desc">Memes & fun</Typography>
										</Stack>
									}
									className={`board-tab ${articleCategory === 'HUMOR' ? 'active' : ''}`}
								/>
							</Tabs>
						</Stack>

						{/* Right Main Content */}
						<Stack className="right-config">
							{/* Article Header */}
							<Stack className="article-header">
								<Stack className="header-top">
									<Stack className="category-badge">
										<Typography className="category-text">{getCategoryLabel(articleCategory)}</Typography>
									</Stack>
									<Button
										className="write-button"
										onClick={() =>
											router.push({
												pathname: '/mypage',
												query: {
													category: 'writeArticle',
												},
											})
										}
									>
										Write Article
									</Button>
								</Stack>
								<Typography className="article-title">{boardArticle?.articleTitle}</Typography>
								<Stack className="article-meta">
									<Stack className="author-section" onClick={() => goMemberPage(boardArticle?.memberData?._id)}>
										<img src={memberImage} alt="" className="author-avatar" />
										<Stack className="author-info">
											<Typography className="author-name">{boardArticle?.memberData?.memberNick}</Typography>
											<Moment className="article-date" format={'MMMM DD, YYYY'}>
												{boardArticle?.createdAt}
											</Moment>
										</Stack>
									</Stack>
									<Stack className="engagement-stats">
										<Box component="div" className="stat-badge">
											<VisibilityIcon className="stat-icon" />
											<Typography className="stat-value">{boardArticle?.articleViews || 0}</Typography>
										</Box>
										<Box component="div" className="stat-badge">
											<ChatIcon className="stat-icon" />
											<Typography className="stat-value">{boardArticle?.articleComments || 0}</Typography>
										</Box>
										<Button
											className={`like-button ${boardArticle?.meLiked ? 'liked' : ''}`}
											onClick={() => {
												if (user && boardArticle?._id) {
													likeBoardArticleHandler(user, boardArticle._id);
												}
											}}
											disabled={likeLoading}
											startIcon={boardArticle?.meLiked ? <ThumbUpAltIcon /> : <ThumbUpOffAltIcon />}
										>
											<Typography className="like-text">{boardArticle?.articleLikes || 0}</Typography>
										</Button>
									</Stack>
								</Stack>
							</Stack>

							{/* Article Content */}
							<Stack className="article-content">
								<Typography className="content-title">Article Content</Typography>
								<Stack className="content-wrapper">
									<ToastViewerComponent markdown={boardArticle?.articleContent} className={'article-viewer'} />
								</Stack>
							</Stack>
							{/* Comments Section */}
							<Stack className="comments-section">
								<Stack className="comments-header">
									<Typography className="comments-title">
										Comments <span className="comments-count">({total})</span>
									</Typography>
								</Stack>

								{/* Leave Comment Form */}
								<Stack className="comment-form">
									<Stack className="form-input-wrapper">
										<input
											type="text"
											className="comment-input"
											placeholder="Share your thoughts..."
											value={comment}
											onChange={(e) => {
												if (e.target.value.length > 100) return;
												setWordsCnt(e.target.value.length);
												setComment(e.target.value);
											}}
										/>
										<Stack className="form-footer">
											<Typography className="char-count">{wordsCnt}/100</Typography>
											<Button className="submit-comment-btn" onClick={creteCommentHandler} disabled={!comment}>
												Post Comment
											</Button>
										</Stack>
									</Stack>
								</Stack>

								{/* Comments List */}
								{total > 0 && (
									<Stack className="comments-list">
										{comments?.map((commentData, index) => {
											return (
												<Stack className="comment-card" key={commentData?._id}>
													<Stack className="comment-header">
														<Stack
															className="comment-author"
															onClick={() => goMemberPage(commentData?.memberData?._id as string)}
														>
															<img src={getCommentMemberImage(commentData?.memberData?.memberImage)} alt="" className="comment-avatar" />
															<Stack className="author-details">
																<Typography className="author-name">{commentData?.memberData?.memberNick}</Typography>
																<Moment className="comment-date" format={'MMM DD, YYYY • HH:mm'}>
																	{commentData?.createdAt}
																</Moment>
															</Stack>
														</Stack>
														{commentData?.memberId === user?._id && (
															<Stack className="comment-actions">
																<IconButton
																	className="edit-btn"
																	onClick={(e:any) => {
																		setUpdatedComment(commentData?.commentContent);
																		setUpdatedCommentWordsCnt(commentData?.commentContent?.length);
																		setUpdatedCommentId(commentData?._id);
																		setOpenBackdrop(true);
																	}}
																>
																	<EditIcon />
																</IconButton>
																<IconButton
																	className="delete-btn"
																	onClick={() => {
																		setUpdatedCommentId(commentData?._id);
																		updateButtonHandler(commentData?._id, CommentStatus.DELETE);
																	}}
																>
																	<DeleteForeverIcon />
																</IconButton>
															</Stack>
														)}
													</Stack>
													<Typography className="comment-content">{commentData?.commentContent}</Typography>
												</Stack>
											);
										})}
									</Stack>
								)}

								{/* Pagination */}
								{total > 0 && total > searchFilter.limit && (
									<Stack className="pagination-wrapper">
										<Pagination
											count={Math.ceil(total / searchFilter.limit) || 1}
											page={searchFilter.page}
											shape="circular"
											color="primary"
											onChange={paginationHandler}
										/>
									</Stack>
								)}
							</Stack>

							{/* Update Comment Backdrop */}
							<Backdrop
								sx={{
									zIndex: 999,
								}}
								open={openBackdrop}
								onClick={cancelButtonHandler}
							>
								<Stack className="update-modal" onClick={(e:any) => e.stopPropagation()}>
									<Typography className="modal-title">Update comment</Typography>
									<Stack className="modal-content">
										<input
											className="update-input"
											autoFocus
											value={updatedComment}
											onChange={(e) => updateCommentInputHandler(e.target.value)}
											type="text"
										/>
										<Stack className="modal-footer">
											<Typography className="char-count">{updatedCommentWordsCnt}/100</Typography>
											<Stack className="modal-actions">
												<Button className="cancel-btn" onClick={cancelButtonHandler}>
													Cancel
												</Button>
												<Button className="update-btn" onClick={() => updateButtonHandler(updatedCommentId, undefined)}>
													Update
												</Button>
											</Stack>
										</Stack>
									</Stack>
								</Stack>
							</Backdrop>
						</Stack>
					</Stack>
				</div>
			</div>
		);
	}
};
CommunityDetail.defaultProps = {
	initialInput: {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		direction: 'DESC',
		search: { commentRefId: '' },
	},
};

export default withLayoutBasic(CommunityDetail);
