import React, { ChangeEvent, useEffect, useState } from 'react';
import { Box, Button, Stack, Typography, Pagination as MuiPagination } from '@mui/material';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import { NextPage } from 'next';
import PartCard from '../../libs/components/part/PartCard';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import { Part } from '../../libs/types/part/part';
import { formatterStr } from '../../libs/utils';
import { REACT_APP_API_URL } from '../../libs/config';
import { userVar } from '../../apollo/store';
import Link from 'next/link';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CategoryIcon from '@mui/icons-material/Category';
import BuildIcon from '@mui/icons-material/Build';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import LabelIcon from '@mui/icons-material/Label';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { GET_PART, GET_PARTS } from '../../apollo/user/query';
import { T } from '../../libs/types/common';
import { Direction, Message } from '../../libs/enums/common.enum';
import { PartCategory } from '../../libs/enums/part.enum';
import { LIKE_TARGET_PART } from '../../apollo/user/mutation';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const PartDetail: NextPage = ({ ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const [partId, setPartId] = useState<string | null>(null);
	const [part, setPart] = useState<Part | null>(null);
	const [slideImage, setSlideImage] = useState<string>('');
	const [destinationParts, setDestinationParts] = useState<Part[]>([]);
	const [relatedPage, setRelatedPage] = useState<number>(1);
	const [relatedTotal, setRelatedTotal] = useState<number>(0);

	/** APOLLO REQUESTS **/
	const [likeTargetPart] = useMutation(LIKE_TARGET_PART);

	const { refetch: getPartRefetch } = useQuery(GET_PART, {
		fetchPolicy: 'cache-and-network',
		variables: { input: partId },
		skip: !partId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			if (data?.getPart) setPart(data?.getPart);
			if (data?.getPart) setSlideImage(data?.getPart?.partImages[0]);
		},
	});

	useQuery(GET_PARTS, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: {
				page: relatedPage,
				limit: 9,
				sort: 'createdAt',
				direction: Direction.DESC,
				search: {
					categoryList: part?.partCategory ? [part?.partCategory] : [],
				},
			},
		},
		skip: !partId && !part,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			if (data?.getParts?.list) {
				setDestinationParts(data?.getParts?.list);
				setRelatedTotal(data?.getParts?.metaCounter?.[0]?.total || 0);
			}
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (router.query.id) setPartId(router.query.id as string);
	}, [router]);

	/** HANDLERS **/
	const changeImageHandler = (image: string) => setSlideImage(image);

	const relatedPaginationHandler = async (event: ChangeEvent<unknown>, value: number) => {
		setRelatedPage(value);
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	const likePartHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
			await likeTargetPart({ variables: { input: id } });
			await getPartRefetch({ input: id });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			console.log('ERROR likePartHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const categoryLabel = part?.partCategory === PartCategory.ACCESSORY ? t('Accessory') : t('Spare Part');
	const isLiked = part?.meLiked && part?.meLiked[0]?.myFavorite;

	/** RENDER **/
	return (
		<div id={'property-detail-page'}>
			<div className={'container'}>
				<Stack className={'property-detail-config'}>
					{/* Breadcrumb Section */}
					<Stack className={'breadcrumb-section'}>
						<Stack className={'breadcrumb-nav'}>
							<Link href="/">
								<Typography className={'breadcrumb-item'}>{t('Home')}</Typography>
							</Link>
							<Typography className={'breadcrumb-separator'}>/</Typography>
							<Link href="/part">
								<Typography className={'breadcrumb-item'}>{t('Parts & Accessories')}</Typography>
							</Link>
							<Typography className={'breadcrumb-separator'}>/</Typography>
							<Typography className={'breadcrumb-item active'}>{part?.partTitle}</Typography>
						</Stack>
						<Button className={'back-button'} onClick={() => router.back()}>
							<ArrowBackIcon sx={{ fontSize: 18 }} />
							<Typography>{t('Back')}</Typography>
						</Button>
					</Stack>

					{/* Main Content Section */}
					<Stack className={'main-content-section'}>
						<Stack className={'image-section'}>
							<Stack className={'main-image-wrapper'}>
								<img
									src={slideImage ? `${REACT_APP_API_URL}/${slideImage}` : '/img/property/bigImage.png'}
									alt={'main-image'}
								/>
								<Stack className={'image-type-badge'}>
									<Typography>{categoryLabel}</Typography>
								</Stack>
								<Stack className={'image-location-badge'}>
									<LocationOnIcon sx={{ fontSize: 16 }} />
									<Typography>{part?.partLocation ? t(part.partLocation) : ''}</Typography>
								</Stack>
								<Stack className={'image-engagement-metrics'}>
									<Stack className={'engagement-metric-badge view-badge'}>
										<RemoveRedEyeIcon sx={{ fontSize: 16, color: '#fff' }} />
										<Typography>{part?.partViews || 0}</Typography>
									</Stack>
									<Stack
										className={`engagement-metric-badge like-badge ${isLiked ? 'liked' : ''}`}
										sx={{ cursor: 'pointer' }}
										onClick={() => {
											if (user && part?._id) likePartHandler(user, part._id);
										}}
									>
										{isLiked ? (
											<FavoriteIcon sx={{ fontSize: 16, color: '#fff' }} />
										) : (
											<FavoriteBorderIcon sx={{ fontSize: 16, color: '#fff' }} />
										)}
										<Typography>{part?.partLikes || 0}</Typography>
									</Stack>
								</Stack>
								<Stack className={'image-price-overlay'}>
									<Typography className={'price-label'}>{t('Price')}</Typography>
									<Typography className={'price-value'}>${formatterStr(part?.partPrice)}</Typography>
								</Stack>
							</Stack>
							<Stack className={'thumbnail-gallery'}>
								{part?.partImages?.map((subImg: string, index: number) => {
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
							<Stack className={'pricing-section'}>
								<Typography className={'pricing-label'}>{t('Price')}</Typography>
								<Typography className={'pricing-value'}>${formatterStr(part?.partPrice)}</Typography>
								<Typography className={'pricing-period'}>
									{part?.partBarter ? 'for exchange' : 'total'}
								</Typography>
							</Stack>

							<Stack className={'action-buttons'}>
								<Button className={'btn-call-dealer'} startIcon={<PhoneIcon />}>
									{t('Call Dealer')}
								</Button>
								<Button
									className={`btn-like ${isLiked ? 'liked' : ''}`}
									startIcon={isLiked ? <FavoriteIcon sx={{ color: '#e91e63' }} /> : <FavoriteBorderIcon />}
									onClick={(e: any) => {
										e.stopPropagation();
										e.preventDefault();
										if (user && part?._id) likePartHandler(user, part._id);
									}}
								>
									{isLiked ? t('Liked') : t('Like')}
								</Button>
							</Stack>

							<Stack className={'dealer-card'}>
								<img
									className={'dealer-avatar'}
									src={
										part?.memberData?.memberImage
											? `${REACT_APP_API_URL}/${part?.memberData?.memberImage}`
											: '/img/profile/defaultUser.svg'
									}
									alt={'dealer'}
								/>
								<Stack className={'dealer-info'}>
									<Link href={`/agent/detail?agentId=${part?.memberData?._id}`}>
										<Typography className={'dealer-name'}>{part?.memberData?.memberNick || 'Dealer'}</Typography>
									</Link>
									<Typography className={'dealer-location'}>{part?.partLocation ? t(part.partLocation) : ''}</Typography>
								</Stack>
								<Stack className={'dealer-actions'}>
									<Link href={`/agent/detail?agentId=${part?.memberData?._id}`}>
										<Button className={'btn-view-dealer'}>{t('View Dealer')}</Button>
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
										<CategoryIcon sx={{ fontSize: 24 }} />
									</Stack>
									<Stack className={'option-includes'}>
										<Typography className={'title'}>{t('Category')}</Typography>
										<Typography className={'option-data'}>{categoryLabel}</Typography>
									</Stack>
								</Stack>
								<Stack className={'option option-room'}>
									<Stack className={'svg-box'}>
										<TwoWheelerIcon sx={{ fontSize: 24 }} />
									</Stack>
									<Stack className={'option-includes'}>
										<Typography className={'title'}>{t('Type')}</Typography>
										<Typography className={'option-data'}>{part?.partType ? t(part.partType) : ''}</Typography>
									</Stack>
								</Stack>
								<Stack className={'option option-year'}>
									<Stack className={'svg-box'}>
										<BuildIcon sx={{ fontSize: 24 }} />
									</Stack>
									<Stack className={'option-includes'}>
										<Typography className={'title'}>{t('Condition')}</Typography>
										<Typography className={'option-data'}>{part?.partCondition ? t(part.partCondition) : ''}</Typography>
									</Stack>
								</Stack>
								<Stack className={'option option-size'}>
									<Stack className={'svg-box'}>
										<LabelIcon sx={{ fontSize: 24 }} />
									</Stack>
									<Stack className={'option-includes'}>
										<Typography className={'title'}>{t('Brand')}</Typography>
										<Typography className={'option-data'}>{part?.partBrand}</Typography>
									</Stack>
								</Stack>
								<Stack className={'option option-type'}>
									<Stack className={'svg-box'}>
										<Inventory2Icon sx={{ fontSize: 24 }} />
									</Stack>
									<Stack className={'option-includes'}>
										<Typography className={'title'}>{t('In Stock')}</Typography>
										<Typography className={'option-data'}>
											{part?.partStockCount ?? 0} {t('pcs')}
										</Typography>
									</Stack>
								</Stack>
							</Stack>
							<Stack className={'prop-desc-config'}>
								<Stack className={'top'}>
									<Typography className={'title'}>{t('Description')}</Typography>
									<Typography className={'desc'}>{part?.partDesc ?? 'No Description!'}</Typography>
								</Stack>
								<Stack className={'bottom'}>
									<Typography className={'title'}>{t('Details')}</Typography>
									<Stack className={'info-box'}>
										<Stack className={'left'}>
											<Box component={'div'} className={'info'}>
												<Typography className={'title'}>{t('Price')}</Typography>
												<Typography className={'data'}>${formatterStr(part?.partPrice)}</Typography>
											</Box>
											<Box component={'div'} className={'info'}>
												<Typography className={'title'}>{t('Location')}</Typography>
												<Typography className={'data'}>{part?.partLocation ? t(part.partLocation) : ''}</Typography>
											</Box>
											<Box component={'div'} className={'info'}>
												<Typography className={'title'}>{t('Category')}</Typography>
												<Typography className={'data'}>{categoryLabel}</Typography>
											</Box>
										</Stack>
										<Stack className={'right'}>
											<Box component={'div'} className={'info'}>
												<Typography className={'title'}>{t('Type')}</Typography>
												<Typography className={'data'}>{part?.partType ? t(part.partType) : ''}</Typography>
											</Box>
											<Box component={'div'} className={'info'}>
												<Typography className={'title'}>{t('Condition')}</Typography>
												<Typography className={'data'}>{part?.partCondition ? t(part.partCondition) : ''}</Typography>
											</Box>
											<Box component={'div'} className={'info'}>
												<Typography className={'title'}>{t('In Stock')}</Typography>
												<Typography className={'data'}>
													{part?.partStockCount ?? 0} {t('pcs')}
												</Typography>
											</Box>
										</Stack>
									</Stack>
								</Stack>
							</Stack>
						</Stack>
					</Stack>

					{destinationParts.length !== 0 && (
						<Stack className={'similar-properties-config'}>
							<Stack className={'title-pagination-box'}>
								<Stack className={'title-box'}>
									<Typography className={'main-title'}>{t('Related parts')}</Typography>
									<Typography className={'sub-title'}>{t('Discover more parts & accessories')}</Typography>
								</Stack>
							</Stack>
							<Stack className={'cards-box'}>
								{destinationParts.map((relatedPart: Part, index: number) => {
									return (
										<Box
											component="div"
											key={relatedPart?._id}
											className={`property-card-wrapper card-${index + 1}`}
											sx={{ animationDelay: `${index * 0.1}s` }}
										>
											<PartCard part={relatedPart} likePartHandler={likePartHandler} />
										</Box>
									);
								})}
							</Stack>
							{relatedTotal > 9 && (
								<Stack className={'pagination-container'}>
									<Box component="div" className={'pagination-wrapper'}>
										<MuiPagination
											page={relatedPage}
											count={Math.ceil(relatedTotal / 9)}
											onChange={relatedPaginationHandler}
											shape="circular"
											color="primary"
											size="large"
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
};

export default withLayoutFull(PartDetail);
