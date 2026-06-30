import React, { useState } from 'react';
import { Stack, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import WestIcon from '@mui/icons-material/West';
import EastIcon from '@mui/icons-material/East';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper';
import TopPartCard from './TopPartCard';
import { Part } from '../../types/part/part';
import { PartCategory } from '../../enums/part.enum';
import { useMutation, useQuery } from '@apollo/client';
import { GET_PARTS } from '../../../apollo/user/query';
import { T } from '../../types/common';
import Link from 'next/link';
import { LIKE_TARGET_PART } from '../../../apollo/user/mutation';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { Message } from '../../enums/common.enum';
import { useTranslation } from 'next-i18next';

interface TopPartsProps {
	category: PartCategory;
	title: string;
	subtitle: string;
	navPrefix: string;
}

const TopParts = (props: TopPartsProps) => {
	const { category, title, subtitle, navPrefix } = props;
	const device = useDeviceDetect();
	const { t } = useTranslation('common');
	const [topParts, setTopParts] = useState<Part[]>([]);

	const initialInput = {
		page: 1,
		limit: 8,
		sort: 'partRank',
		direction: 'DESC',
		search: { categoryList: [category] },
	};

	/** APOLLO REQUESTS **/
	const [likeTargetPart] = useMutation(LIKE_TARGET_PART);

	const { refetch: getPartsRefetch } = useQuery(GET_PARTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: initialInput },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setTopParts(data?.getParts?.list || []);
		},
	});

	/** HANDLERS **/
	const likePartHandler = async (e: React.MouseEvent, user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
			await likeTargetPart({ variables: { input: id } });
			await getPartsRefetch({ input: initialInput });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			console.log('ERROR likePartHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	if (topParts.length === 0) return null;

	const nextClass = `swiper-${navPrefix}-next`;
	const prevClass = `swiper-${navPrefix}-prev`;
	const pagClass = `swiper-${navPrefix}-pagination`;

	return (
		<Stack className={'top-properties'}>
			<Stack className={'container'}>
				<Stack className={'info-box'}>
					<Box component={'div'} className={'left'}>
						<span>{t(title)}</span>
						<p>🏆 {t(subtitle)}</p>
					</Box>
					{device !== 'mobile' && (
						<Box component={'div'} className={'right'}>
							<div className={'more-box'}>
								<Link href={`/part?category=${category}`}>
									<span>{t('View All')}</span>
								</Link>
								<img src="/img/icons/rightup.svg" alt="" />
							</div>
						</Box>
					)}
				</Stack>
				<Stack className={'card-box'}>
					<Swiper
						className={'top-property-swiper'}
						slidesPerView={'auto'}
						spaceBetween={25}
						modules={[Autoplay, Navigation, Pagination]}
						navigation={{ nextEl: `.${nextClass}`, prevEl: `.${prevClass}` }}
						pagination={{ el: `.${pagClass}` }}
					>
						{topParts.map((part: Part) => {
							return (
								<SwiperSlide className={'top-property-slide'} key={part?._id}>
									<TopPartCard part={part} likePartHandler={likePartHandler} />
								</SwiperSlide>
							);
						})}
					</Swiper>
				</Stack>
				<Stack className={'pagination-box'}>
					<WestIcon className={prevClass} />
					<div className={pagClass}></div>
					<EastIcon className={nextClass} />
				</Stack>
			</Stack>
		</Stack>
	);
};

export default TopParts;
