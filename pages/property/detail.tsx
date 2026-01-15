import React, { ChangeEvent, useEffect, useState } from 'react';
import { Box, Button, Checkbox, CircularProgress, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import { NextPage } from 'next';
import Review from '../../libs/components/property/Review';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, { Autoplay, Navigation, Pagination } from 'swiper';
import PropertyBigCard from '../../libs/components/common/PropertyBigCard';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import WestIcon from '@mui/icons-material/West';
import EastIcon from '@mui/icons-material/East';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import { Property } from '../../libs/types/property/property';
import moment from 'moment';
import { formatterStr } from '../../libs/utils';
import { REACT_APP_API_URL } from '../../libs/config';
import { userVar } from '../../apollo/store';
import { CommentInput, CommentsInquiry } from '../../libs/types/comment/comment.input';
import { Comment } from '../../libs/types/comment/comment';
import { CommentGroup } from '../../libs/enums/comment.enum';
import { Pagination as MuiPagination } from '@mui/material';
import Link from 'next/link';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EngineeringIcon from '@mui/icons-material/Engineering';
import SpeedIcon from '@mui/icons-material/Speed';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LabelIcon from '@mui/icons-material/Label';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import 'swiper/css';
import 'swiper/css/pagination';
import { GET_COMMENTS, GET_PROPERTIES, GET_PROPERTY } from '../../apollo/user/query';
import { T } from '../../libs/types/common';
import { Direction, Message } from '../../libs/enums/common.enum';
import { CREATE_COMMENT, LIKE_TARGET_PROPERTY } from '../../apollo/user/mutation';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';

SwiperCore.use([Autoplay, Navigation, Pagination]);

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const PropertyDetail: NextPage = ({ initialComment, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [propertyId, setPropertyId] = useState<string | null>(null);
	const [property, setProperty] = useState<Property | null>(null);
	const [slideImage, setSlideImage] = useState<string>('');
	const [destinationProperty, setDestinationProperty] = useState<Property[]>([]);
	const [commentInquiry, setCommentInquiry] = useState<CommentsInquiry>(initialComment);
	const [propertyComments, setPropertyComments] = useState<Comment[]>([]);
	const [commentTotal, setCommentTotal] = useState<number>(0);
	const [insertCommentData, setInsertCommentData] = useState<CommentInput>({
		commentGroup: CommentGroup.PROPERTY,
		commentContent: '',
		commentRefId: '',
	});
	const [similarPropertiesPage, setSimilarPropertiesPage] = useState<number>(1);
	const [similarPropertiesTotal, setSimilarPropertiesTotal] = useState<number>(0);

	/** APOLLO REQUESTS **/
	const [likeTargetProperty] = useMutation(LIKE_TARGET_PROPERTY);
   const [createComment] = useMutation(CREATE_COMMENT);

		const {
		loading: getPropertyLoading, 
		data: getPropertyData, 
		error: getPropertyError,
		refetch: getPropertyRefetch,
		 } = useQuery(GET_PROPERTY, {
		fetchPolicy: "cache-and-network",
		variables: {input: propertyId},
		skip:!propertyId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			if(data?.getProperty) setProperty(data?.getProperty);
			if(data?.getProperty) setSlideImage(data?.getProperty?.propertyImages[0]);
		},
		 });
		
		  const {
			 loading: getPropertiesLoading, 
			 data: getPropertiesData, 
			 error: getPropertiesError,
			 refetch: getPropertiesRefetch,
				} = useQuery(GET_PROPERTIES, {
			 fetchPolicy: "cache-and-network",
			 variables: {input: {
        page: similarPropertiesPage,
				limit: 9,
				sort: "createdAt",
				direction: Direction.DESC,
				search: {
					locationList: property?.propertyLocation ? [property?.propertyLocation] : [],
				},
			 },
			},
			skip: !propertyId && !property,
			 notifyOnNetworkStatusChange: true,
			 onCompleted: (data: T) => {
				if(data?.getProperties?.list) {
					setDestinationProperty(data?.getProperties?.list);
					setSimilarPropertiesTotal(data?.getProperties?.metaCounter?.[0]?.total || 0);
				}
			 },
				});

			const {
			 loading: getCommentsLoading, 
			 data: getCommentsData, 
			 error: getCommentsError,
			 refetch: getCommentsRefetch,
				} = useQuery(GET_COMMENTS, {
			 fetchPolicy: "cache-and-network",
			 variables: {input: initialComment },
			 skip: !commentInquiry.search.commentRefId,
			 notifyOnNetworkStatusChange: true,
			 onCompleted: (data: T) => {
				if(data?.getComments?.list) setPropertyComments(data?.getComments?.list);
				setCommentTotal(data?.getComments?.metaCounter[0]?.total ?? 0);
			 },
				});

	/** LIFECYCLES **/
	useEffect(() => {
		if (router.query.id) {
			setPropertyId(router.query.id as string);
			setCommentInquiry({
				...commentInquiry,
				search: {
					commentRefId: router.query.id as string,
				},
			});
			setInsertCommentData({
				...insertCommentData,
				commentRefId: router.query.id as string,
			});
		}
	}, [router]);

		useEffect(() => {
		if(commentInquiry.search.commentRefId) {
    getCommentsRefetch({ input: commentInquiry});
		}
		
	}, [commentInquiry]);

	/** HANDLERS **/
	const changeImageHandler = (image: string) => {
		setSlideImage(image);
	};

	const commentPaginationChangeHandler = async (event: ChangeEvent<unknown>, value: number) => {
		commentInquiry.page = value;
		setCommentInquiry({ ...commentInquiry });
	};

	const similarPropertiesPaginationHandler = async (event: ChangeEvent<unknown>, value: number) => {
		setSimilarPropertiesPage(value);
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	const likePropertyHandler = async (user: T, id:string) => {
			try {
				if(!id) return;
				if(!user._id) throw new Error(Message.NOT_AUTHENTICATED);

			await likeTargetProperty({
				variables: { input: id }, 
			});
			
			// Faqat current property ni yangilash
			await getPropertyRefetch({ input: id });
	
			await sweetTopSmallSuccessAlert("success", 800);
	
			} catch(err: any) {
			console.log("ERROR likePropertyHandler:", err.message);
			sweetMixinErrorAlert(err.message).then();
			}
		};

		
	const createCommentHandler = async () => {
   try {
   if(!user._id) throw new Error(Message.NOT_AUTHENTICATED);

	 await createComment( { variables: {input:insertCommentData } } );

	 setInsertCommentData({...insertCommentData, commentContent: ''});

	 await getCommentsRefetch({	input: commentInquiry});
	 } catch(err:any) {
   await sweetErrorHandling(err);
	 }
	};

	// if (getPropertyLoading) {
	// 	return (<Stack 
	// 	sx={{ display:"flex", justifyContent: "center", alignItems: "center", width: "100%", hiehgt: "1080px"}}>
  //   <CircularProgress size={"4rem"} />
	// 	</Stack>)
	// }

   /** RENDER **/

	if (device === 'mobile') {
		return <div>PROPERTY DETAIL PAGE</div>;
	} else {
		return (
			<div id={'property-detail-page'}>
				<div className={'container'}>
					<Stack className={'property-detail-config'}>
						{/* Breadcrumb Section */}
						<Stack className={'breadcrumb-section'}>
							<Stack className={'breadcrumb-nav'}>
								<Link href="/">
									<Typography className={'breadcrumb-item'}>Home</Typography>
								</Link>
								<Typography className={'breadcrumb-separator'}>/</Typography>
								<Link href="/property">
									<Typography className={'breadcrumb-item'}>Bike</Typography>
								</Link>
								<Typography className={'breadcrumb-separator'}>/</Typography>
								<Typography className={'breadcrumb-item active'}>{property?.propertyTitle}</Typography>
							</Stack>
							<Button className={'back-button'} onClick={() => router.back()}>
								<ArrowBackIcon sx={{ fontSize: 18 }} />
								<Typography>Back</Typography>
							</Button>
						</Stack>

						{/* Main Content Section */}
						<Stack className={'main-content-section'}>
							{/* Image Section */}
							<Stack className={'image-section'}>
								<Stack className={'main-image-wrapper'}>
									<img
										src={slideImage ? `${REACT_APP_API_URL}/${slideImage}` : '/img/property/bigImage.png'}
										alt={'main-image'}
									/>
									{/* Image Type Badge */}
									<Stack className={'image-type-badge'}>
										<Typography>{property?.propertyType || 'Bike'}</Typography>
									</Stack>
									{/* Location Badge */}
									<Stack className={'image-location-badge'}>
										<LocationOnIcon sx={{ fontSize: 16 }} />
										<Typography>{property?.propertyLocation}</Typography>
									</Stack>
									{/* Engagement Metrics */}
									<Stack className={'image-engagement-metrics'}>
										<Stack className={'engagement-metric-badge view-badge'}>
											<RemoveRedEyeIcon sx={{ fontSize: 16, color: '#fff' }} />
											<Typography>{property?.propertyViews || 0}</Typography>
										</Stack>
									<Stack 
										className={`engagement-metric-badge like-badge ${property?.meLiked && property?.meLiked[0]?.myFavorite ? 'liked' : ''}`}
										sx={{ cursor: 'pointer' }}
										onClick={() => {
											
											if (user && property?._id) {
												likePropertyHandler(user, property._id);
											}
										}}
									>
											{property?.meLiked && property?.meLiked[0]?.myFavorite ? (
												<FavoriteIcon sx={{ fontSize: 16, color: '#fff' }} />
											) : (
												<FavoriteBorderIcon sx={{ fontSize: 16, color: '#fff' }} />
											)}
											<Typography>
												{property?.propertyLikes || 0}
											</Typography>
										</Stack>
									</Stack>
									{/* Price Overlay */}
									<Stack className={'image-price-overlay'}>
										<Typography className={'price-label'}>Price</Typography>
										<Typography className={'price-value'}>${formatterStr(property?.propertyPrice)}</Typography>
										<Typography className={'price-period'}>
											{property?.propertyRent ? '/month' : property?.propertyBarter ? '/exchange' : ''}
										</Typography>
									</Stack>
								</Stack>
								{/* Thumbnail Gallery */}
								<Stack className={'thumbnail-gallery'}>
									{property?.propertyImages?.map((subImg: string, index: number) => {
										const imagePath: string = `${REACT_APP_API_URL}/${subImg}`;
										const isActive = slideImage === subImg || (!slideImage && index === 0);
										return (
											<Stack 
												className={`thumbnail-item ${isActive ? 'active' : ''}`} 
												onClick={() => changeImageHandler(subImg)} 
												key={subImg}
											>
												<img src={imagePath} alt={'thumbnail'} />
											</Stack>
										);
									})}
								</Stack>
							</Stack>

							{/* Action Panel Section */}
							<Stack className={'action-panel-section'}>
								{/* Pricing Section */}
								<Stack className={'pricing-section'}>
									<Typography className={'pricing-label'}>Price</Typography>
									<Typography className={'pricing-value'}>${formatterStr(property?.propertyPrice)}</Typography>
									<Typography className={'pricing-period'}>
										{property?.propertyRent ? 'per month' : property?.propertyBarter ? 'for exchange' : 'total'}
									</Typography>
								</Stack>

								{/* Action Buttons */}
								<Stack className={'action-buttons'}>
									<Button className={'btn-call-dealer'} startIcon={<PhoneIcon />}>
										Call Dealer
									</Button>
									<Button className={'btn-book-online'}>
										Book Online
									</Button>
									<Button 
										className={`btn-like ${property?.meLiked && property?.meLiked[0]?.myFavorite ? 'liked' : ''}`}
										startIcon={property?.meLiked && property?.meLiked[0]?.myFavorite ? <FavoriteIcon sx={{ color: '#e91e63' }} /> : <FavoriteBorderIcon />}
										onClick={(e: any) => {
											e.stopPropagation();
											e.preventDefault();
											if (user && property?._id) {
												likePropertyHandler(user, property._id);
											}
										}}
									>
										{property?.meLiked && property?.meLiked[0]?.myFavorite ? 'Liked' : 'Like'}
									</Button>
								</Stack>

								{/* Dealer Card */}
								<Stack className={'dealer-card'}>
									<img
										className={'dealer-avatar'}
										src={
											property?.memberData?.memberImage
												? `${REACT_APP_API_URL}/${property?.memberData?.memberImage}`
												: '/img/profile/defaultUser.svg'
										}
										alt={'dealer'}
									/>
									<Stack className={'dealer-info'}>
										<Link href={`/member?memberId=${property?.memberData?._id}`}>
											<Typography className={'dealer-name'}>{property?.memberData?.memberNick || 'Dealer'}</Typography>
										</Link>
										<Typography className={'dealer-location'}>{property?.propertyLocation}</Typography>
									</Stack>
									<Stack className={'dealer-actions'}>
										<Button className={'btn-dealer-call'} startIcon={<PhoneIcon />}>
											Call
										</Button>
										<Link href={`/member?memberId=${property?.memberData?._id}`}>
											<Button className={'btn-view-dealer'}>
												View Dealer
											</Button>
										</Link>
									</Stack>
								</Stack>
							</Stack>
						</Stack>
						<Stack className={'property-desc-config'}>
							<Stack className={'left-config'}>
								<Stack className={'options-config'}>
								<Stack className={'option option-bedroom'}>
									<Stack className={'svg-box'}>
										<EngineeringIcon sx={{ fontSize: 24 }} />
									</Stack>
									<Stack className={'option-includes'}>
										<Typography className={'title'}>Engine</Typography>
										<Typography className={'option-data'}>{property?.propertyEngineCc|| 0} CC</Typography>
									</Stack>
								</Stack>
								<Stack className={'option option-room'}>
									<Stack className={'svg-box'}>
										<SpeedIcon sx={{ fontSize: 24 }} />
									</Stack>
									<Stack className={'option-includes'}>
										<Typography className={'title'}>Mileage</Typography>
										<Typography className={'option-data'}>{property?.propertyMileAge || 0} km</Typography>
									</Stack>
								</Stack>
								<Stack className={'option option-year'}>
									<Stack className={'svg-box'}>
										<CalendarTodayIcon sx={{ fontSize: 24 }} />
									</Stack>
									<Stack className={'option-includes'}>
										<Typography className={'title'}>Year</Typography>
										<Typography className={'option-data'}>{moment(property?.createdAt).format('YYYY')}</Typography>
									</Stack>
								</Stack>
								<Stack className={'option option-size'}>
									<Stack className={'svg-box'}>
										<LabelIcon sx={{ fontSize: 24 }} />
									</Stack>
									<Stack className={'option-includes'}>
										<Typography className={'title'}>Brand</Typography>
										<Typography className={'option-data'}>{property?.propertyBrand} </Typography>
									</Stack>
								</Stack>
								<Stack className={'option option-type'}>
									<Stack className={'svg-box'}>
										<TwoWheelerIcon sx={{ fontSize: 24 }} />
									</Stack>
									<Stack className={'option-includes'}>
										<Typography className={'title'}>Bike Type</Typography>
										<Typography className={'option-data'}>{property?.propertyType || 'N/A'}</Typography>
									</Stack>
								</Stack>
								</Stack>
								<Stack className={'prop-desc-config'}>
									<Stack className={'top'}>
										<Typography className={'title'}>Bike Description</Typography>
										<Typography className={'desc'}>{property?.propertyDesc ?? 'No Description!'}</Typography>
									</Stack>
									<Stack className={'bottom'}>
										<Typography className={'title'}>Bike Details</Typography>
										<Stack className={'info-box'}>
											<Stack className={'left'}>
												<Box component={'div'} className={'info'}>
													<Typography className={'title'}>Price</Typography>
													<Typography className={'data'}>${formatterStr(property?.propertyPrice)}</Typography>
												</Box>
													<Box component={'div'} className={'info'}>
													<Typography className={'title'}>Location</Typography>
													<Typography className={'data'}>{property?.propertyLocation}</Typography>
												</Box>
												<Box component={'div'} className={'info'}>
													<Typography className={'title'}>Address</Typography>
													<Typography className={'data'}>{property?.propertyAddress} </Typography>
												</Box>
												
												<Box component={'div'} className={'info'}>
													<Typography className={'title'}>Engine</Typography>
													<Typography className={'data'}>{property?.propertyEngineCc || 0} CC</Typography>
												</Box>
											</Stack>
											<Stack className={'right'}>
												<Box component={'div'} className={'info'}>
													<Typography className={'title'}>Year</Typography>
													<Typography className={'data'}>{moment(property?.createdAt).format('YYYY')}</Typography>
												</Box>
												<Box component={'div'} className={'info'}>
													<Typography className={'title'}>Bike Type</Typography>
													<Typography className={'data'}>{property?.propertyType || 'N/A'}</Typography>
												</Box>
											  <Box component={'div'} className={'info'}>
													<Typography className={'title'}>Condition</Typography>
													<Typography className={'data'}>{property?.propertyCondition}</Typography>
												</Box>
												<Box component={'div'} className={'info'}>
													<Typography className={'title'}>Options</Typography>
													<Typography className={'data'}>
														{property?.propertyBarter 
															? 'Barter' 
															: property?.propertyRent 
																? 'Rent Available' 
																: 'Rent Available'}
													</Typography>
												</Box>
											</Stack>
										</Stack>
									</Stack>
								</Stack>
								
								{commentTotal !== 0 && (
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
											{propertyComments?.map((comment: Comment) => {
												return <Review comment={comment} key={comment?._id} />;
											})}
											<Box component={'div'} className={'pagination-box'}>
												<MuiPagination
													page={commentInquiry.page}
													count={Math.ceil(commentTotal / commentInquiry.limit)}
													onChange={commentPaginationChangeHandler}
													shape="circular"
													color="primary"
												/>
											</Box>
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
							
						</Stack>
						{destinationProperty.length !== 0 && (
							<Stack className={'similar-properties-config'}>
								<Stack className={'title-pagination-box'}>
									<Stack className={'title-box'}>
										<Typography className={'main-title'}>Related bikes</Typography>
										<Typography className={'sub-title'}>Discover more amazing bikes nearby</Typography>
									</Stack>
								</Stack>
								<Stack className={'cards-box'}>
									{destinationProperty.map((property: Property, index: number) => {
										return (
											<Box 
												key={property?._id} 
												className={`property-card-wrapper card-${index + 1}`}
												sx={{ 
													animationDelay: `${index * 0.1}s`,
												}}
											>
												<PropertyBigCard property={property} likePropertyHandler={likePropertyHandler} />
											</Box>
										);
									})}
								</Stack>
								{similarPropertiesTotal > 9 && (
									<Stack className={'pagination-container'}>
										<Box className={'pagination-wrapper'}>
											<MuiPagination
												page={similarPropertiesPage}
												count={Math.ceil(similarPropertiesTotal / 9)}
												onChange={similarPropertiesPaginationHandler}
												shape="circular"
												color="primary"
												size="large"
												sx={{
													'& .MuiPaginationItem-root': {
														fontSize: '15px',
														fontWeight: 600,
													},
												}}
											/>
										</Box>
									</Stack>
								)}
							</Stack>
						)}
					</Stack>
				</div>
			</div>
		);
	}
};

PropertyDetail.defaultProps = {
	initialComment: {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		direction: 'DESC',
		search: {
			commentRefId: '',
		},
	},
};

export default withLayoutFull(PropertyDetail);
