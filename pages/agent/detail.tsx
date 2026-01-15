import React, { ChangeEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import PropertyBigCard from '../../libs/components/common/PropertyBigCard';
import ReviewCard from '../../libs/components/agent/ReviewCard';
import { Box, Button, Pagination, Stack, Typography, Tabs, Tab } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import PhoneIcon from '@mui/icons-material/Phone';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import { Property } from '../../libs/types/property/property';
import { Member } from '../../libs/types/member/member';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { userVar } from '../../apollo/store';
import { PropertiesInquiry } from '../../libs/types/property/property.input';
import { CommentInput, CommentsInquiry } from '../../libs/types/comment/comment.input';
import { Comment } from '../../libs/types/comment/comment';
import { CommentGroup } from '../../libs/enums/comment.enum';
import { Messages, REACT_APP_API_URL } from '../../libs/config';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { CREATE_COMMENT, LIKE_TARGET_PROPERTY } from '../../apollo/user/mutation';
import { GET_COMMENTS, GET_MEMBER, GET_PROPERTIES } from '../../apollo/user/query';
import { T } from '../../libs/types/common';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const AgentDetail: NextPage = ({ initialInput, initialComment, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [agentId, setAgentId] = useState<string | null>(null);
	const [agent, setAgent] = useState<Member | null>(null);
	const [searchFilter, setSearchFilter] = useState<PropertiesInquiry>(initialInput);
	const [agentProperties, setAgentProperties] = useState<Property[]>([]);
	const [propertyTotal, setPropertyTotal] = useState<number>(0);
	const [commentInquiry, setCommentInquiry] = useState<CommentsInquiry>(initialComment);
	const [agentComments, setAgentComments] = useState<Comment[]>([]);
	const [commentTotal, setCommentTotal] = useState<number>(0);
	const [insertCommentData, setInsertCommentData] = useState<CommentInput>({
		commentGroup: CommentGroup.MEMBER,
		commentContent: '',
		commentRefId: '',
	});
	const [activeTab, setActiveTab] = useState<number>(0);
/** APOLLO REQUESTS **/
	const [createComment] = useMutation(CREATE_COMMENT);
	const [likeTargetProperty] = useMutation(LIKE_TARGET_PROPERTY);

	const {
					loading: getMemberLoading, 
					data: getMemberData, 
					error: getMemberError,
					refetch: getMemberRefetch,
					 } = useQuery(GET_MEMBER, {
					fetchPolicy: "network-only",
					variables: {input: agentId},
					notifyOnNetworkStatusChange: true,
					onCompleted: (data: T) => {
							setAgent(data?.getMember);
						  setSearchFilter({
								...searchFilter,
								search:{
									memberId:data?.getMember?._id,
								},
							});
							setCommentInquiry({
								...commentInquiry,
								search:{
									commentRefId: data?.getMember?._id,
								},
							});
							setInsertCommentData({
								...insertCommentData,
								commentRefId: data?.getMember?._id,
							});
					},
					 });

	const {
					loading: getPropertiesLoading, 
					data: getPropertiesData, 
					error: getPropertiesError,
					refetch: getPropertiesRefetch,
					 } = useQuery(GET_PROPERTIES, {
					fetchPolicy: "network-only",
					variables: {input: searchFilter},
					skip:!searchFilter.search.memberId,
					notifyOnNetworkStatusChange: true,
					onCompleted: (data: T) => {
					setAgentProperties(data?.getProperties?.list);
				  setPropertyTotal(data?.getProperties?.metaCounter[0]?.total);
							},
							 });
		const {
		loading: getCommentsLoading, 
		data: getCommentsData, 
		error: getCommentsError,
		refetch: getCommentsRefetch,
		 } = useQuery(GET_COMMENTS, {
		fetchPolicy: "network-only",
		variables: {input: commentInquiry},
		skip:!commentInquiry.search.commentRefId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
				setAgentComments(data?.getComments?.list);
				setCommentTotal(data?.getComments?.metaCounter[0]?.total ?? 0);
		},
		 });
							 

  	/** LIFECYCLES **/
	useEffect(() => {
		if (router.query.agentId) setAgentId(router.query.agentId as string);
	}, [router]);

	useEffect(() => {
		if (searchFilter.search.memberId) {
			getPropertiesRefetch({variables: {input: searchFilter}}).then();
		}
	}, [searchFilter]);

	useEffect(() => {
		if(commentInquiry.search.commentRefId) {
			getCommentsRefetch({variables: {input: commentInquiry}}).then();
		}
	}, [commentInquiry]);

	/** HANDLERS **/
	const redirectToMemberPageHandler = async (memberId: string) => {
		try {
			if (memberId === user?._id) await router.push(`/mypage?memberId=${memberId}`);
			else await router.push(`/member?memberId=${memberId}`);
		} catch (error) {
			await sweetErrorHandling(error);
		}
	};

	const propertyPaginationChangeHandler = async (event: ChangeEvent<unknown>, value: number) => {
		searchFilter.page = value;
		setSearchFilter({ ...searchFilter });
	};

	const commentPaginationChangeHandler = async (event: ChangeEvent<unknown>, value: number) => {
		commentInquiry.page = value;
		setCommentInquiry({ ...commentInquiry });
	};

	const createCommentHandler = async () => {
		try {
			if(!user._id) throw new Error(Messages.error2);
			if(user._id === agentId) throw new Error('Cannot write review for yourself');
			await createComment({
				variables: {
					input: insertCommentData,
				},
			});
			setInsertCommentData({...insertCommentData, commentContent: ''});

			await getCommentsRefetch({input: commentInquiry});
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const likePropertyHandler = async (user:any, id: string) => {
		try{
			if(!id) return;
			if(!user._id) throw new Error(Messages.error2);

			await likeTargetProperty({
				variables: {
					input: id,
				},
			});
			await getPropertiesRefetch({input: searchFilter});
			await sweetTopSmallSuccessAlert('success', 800);

		} catch(err: any) {
   console.log('ERROR,likePropertyHandler:',err.message);
	 sweetMixinErrorAlert(err.message).then();
		}
	}
	const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
		setActiveTab(newValue);
	};

	if (device === 'mobile') {
		return <div>AGENT DETAIL PAGE MOBILE</div>;
	} else {
		return (
			<Stack className={'agent-detail-page'}>
				<Stack className={'container'}>
					{/* Top Section - Agent Profile */}
					<Stack className={'dealer-profile-section'}>
						<Stack className={'dealer-card'}>
							<Stack className={'dealer-avatar-wrapper'}>
								<img
									className={'dealer-avatar'}
									src={agent?.memberImage ? `${REACT_APP_API_URL}/${agent?.memberImage}` : '/img/profile/defaultUser.svg'}
									alt={agent?.memberNick || 'Agent'}
								/>
								<Stack className={'dealer-badge'}>AGENT</Stack>
							</Stack>
							<Stack className={'dealer-info-section'}>
								<Typography className={'dealer-name'} onClick={() => redirectToMemberPageHandler(agent?._id as string)}>
									{agent?.memberFullName ?? agent?.memberNick ?? 'Agent'}
								</Typography>
								<Typography className={'dealer-location'}>{agent?.memberAddress || 'Location not specified'}</Typography>
								<Stack className={'dealer-actions'}>
									<Button className={'btn-call'} startIcon={<PhoneIcon />}>
										Call
									</Button>
									<Button className={'btn-follow'}>
										Following
									</Button>
								</Stack>
							</Stack>
							<Stack className={'dealer-stats'}>
								<Box className={'stat-item'}>
									<Typography className={'stat-value'}>{propertyTotal || 0}</Typography>
									<Typography className={'stat-label'}>BIKES</Typography>
								</Box>
								<Box className={'stat-item'}>
									<Typography className={'stat-value'}>{agent?.memberLikes || 0}</Typography>
									<Typography className={'stat-label'}>LIKES</Typography>
								</Box>
								<Box className={'stat-item'}>
									<Typography className={'stat-value'}>{agent?.memberViews || 0}</Typography>
									<Typography className={'stat-label'}>VIEWS</Typography>
								</Box>
							</Stack>
						</Stack>
					</Stack>

					{/* Bottom Section - Content with Tabs */}
					<Stack className={'content-panel'}>
						<Stack className={'tabs-section'}>
							<Tabs 
								value={activeTab} 
								onChange={handleTabChange}
								className={'custom-tabs'}
								indicatorColor="primary"
								textColor="primary"
							>
								<Tab 
									label={
										<Stack className={'tab-label'}>
											<TwoWheelerIcon />
											<Typography>Bikes ({propertyTotal || 0})</Typography>
										</Stack>
									} 
									className={'custom-tab'}
								/>
								<Tab 
									label={
										<Stack className={'tab-label'}>
											<StarIcon />
											<Typography>Reviews ({commentTotal || 0})</Typography>
										</Stack>
									} 
									className={'custom-tab'}
								/>
							</Tabs>
						</Stack>

						{/* Bikes Tab Content */}
						{activeTab === 0 && (
							<Stack className={'cars-content'}>
								<Stack className={'content-header'}>
									<Typography className={'section-title'}>Bikes</Typography>
									<Typography className={'section-subtitle'}>{propertyTotal || 0} available</Typography>
								</Stack>
								<Stack className={'card-wrap'}>
									{agentProperties.length > 0 ? (
										agentProperties.map((property: Property) => {
											return (
												<Box className={'wrap-main'} key={property?._id}>
													<PropertyBigCard property={property} likePropertyHandler={likePropertyHandler} />
												</Box>
											);
										})
									) : (
										<Stack className={'no-data'}>
											<img src="/img/icons/icoAlert.svg" alt="" />
											<p>No bikes found!</p>
										</Stack>
									)}
								</Stack>
								{propertyTotal > searchFilter.limit && (
									<Stack className={'pagination'}>
										<Stack className="pagination-box">
											<Pagination
												page={searchFilter.page}
												count={Math.ceil(propertyTotal / searchFilter.limit) || 1}
												onChange={propertyPaginationChangeHandler}
												shape="circular"
												color="primary"
											/>
										</Stack>
									</Stack>
								)}
							</Stack>
						)}

						{/* Reviews Tab Content */}
						{activeTab === 1 && (
							<Stack className={'reviews-content'}>
								{commentTotal > 0 && (
									<Stack className={'reviews-config'}>
										<Stack className={'filter-box'}>
											<Stack className={'review-cnt'}>
												<svg xmlns="http://www.w3.org/2000/svg" width="16" height="12" viewBox="0 0 16 12" fill="none">
													<g clipPath="url(#clip0_6507_7309)">
														<path
															d="M15.7183 4.60288C15.6171 4.3599 15.3413 4.18787 15.0162 4.16489L10.5822 3.8504L8.82988 0.64527C8.7005 0.409792 8.40612 0.257812 8.07846 0.257812C7.7508 0.257812 7.4563 0.409792 7.32774 0.64527L5.57541 3.8504L1.14072 4.16489C0.815641 4.18832 0.540363 4.36035 0.438643 4.60288C0.337508 4.84586 0.430908 5.11238 0.676772 5.28084L4.02851 7.57692L3.04025 10.9774C2.96794 11.2275 3.09216 11.486 3.35771 11.636C3.50045 11.717 3.66815 11.7575 3.83643 11.7575C3.98105 11.7575 4.12577 11.7274 4.25503 11.667L8.07846 9.88098L11.9012 11.667C12.1816 11.7979 12.5342 11.7859 12.7992 11.636C13.0648 11.486 13.189 11.2275 13.1167 10.9774L12.1284 7.57692L15.4801 5.28084C15.7259 5.11238 15.8194 4.84641 15.7183 4.60288Z"
															fill="#181A20"
														/>
													</g>
													<defs>
														<clipPath id="clip0_6507_7309">
															<rect width="15.36" height="12" fill="white" transform="translate(0.398438)" />
														</clipPath>
													</defs>
												</svg>
												<Typography className={'reviews'}>{commentTotal} Comments</Typography>
											</Stack>
										</Stack>
										<Stack className={'review-list'}>
											{agentComments?.map((comment: Comment) => {
												return <ReviewCard comment={comment} key={comment?._id} />;
											})}
											{commentTotal > commentInquiry.limit && (
												<Box component={'div'} className={'pagination-box'}>
													<Pagination
														page={commentInquiry.page}
														count={Math.ceil(commentTotal / commentInquiry.limit) || 1}
														onChange={commentPaginationChangeHandler}
														shape="circular"
														color="primary"
													/>
												</Box>
											)}
										</Stack>
									</Stack>
								)}

								<Stack className={'leave-review-config'}>
									<Typography className={'main-title'}>Drop your thoughts</Typography>
									<Typography className={'review-title'}>👉 Experience</Typography>
									<textarea
										onChange={({ target: { value } }: any) => {
											setInsertCommentData({ ...insertCommentData, commentContent: value });
										}}
										value={insertCommentData.commentContent}
									></textarea>
									<Box className={'submit-btn'} component={'div'}>
										<Button
											className={'submit-review'}
											disabled={insertCommentData.commentContent === '' || user?._id === ''}
											onClick={createCommentHandler}
										>
											<Typography className={'title'}>Submit Review</Typography>
											<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
												<g clipPath="url(#clip0_6975_3642)">
													<path
														d="M16.1571 0.5H6.37936C6.1337 0.5 5.93491 0.698792 5.93491 0.944458C5.93491 1.19012 6.1337 1.38892 6.37936 1.38892H15.0842L0.731781 15.7413C0.558156 15.915 0.558156 16.1962 0.731781 16.3698C0.818573 16.4566 0.932323 16.5 1.04603 16.5C1.15974 16.5 1.27345 16.4566 1.36028 16.3698L15.7127 2.01737V10.7222C15.7127 10.9679 15.9115 11.1667 16.1572 11.1667C16.4028 11.1667 16.6016 10.9679 16.6016 10.7222V0.944458C16.6016 0.698792 16.4028 0.5 16.1571 0.5Z"
														fill="#181A20"
													/>
												</g>
												<defs>
													<clipPath id="clip0_6975_3642">
														<rect width="16" height="16" fill="white" transform="translate(0.601562 0.5)" />
													</clipPath>
												</defs>
											</svg>
										</Button>
									</Box>
								</Stack>
							</Stack>
						)}
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

AgentDetail.defaultProps = {
	initialInput: {
		page: 1,
		limit: 9,
		search: {
			memberId: '',
		},
	},
	initialComment: {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		direction: 'ASC',
		search: {
			commentRefId: '',
		},
	},
};

export default withLayoutBasic(AgentDetail);
