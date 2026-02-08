import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Stack, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper';
import TopAgentCard from './TopAgentCard';
import { Member } from '../../types/member/member';
import { AgentsInquiry } from '../../types/member/member.input';
import { GET_AGENTS } from '../../../apollo/user/query';
import { useQuery } from '@apollo/client';
import { T } from '../../types/common';
import Link from 'next/link';

interface TopAgentsProps {
	initialInput: AgentsInquiry;
}

const TopAgents = (props: TopAgentsProps) => {
	const { initialInput } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const [topAgents, setTopAgents] = useState<Member[]>([]);

	/** APOLLO REQUESTS **/
			const {
		loading: getAgentsLoading, 
		data: getAgentsData, 
		error: getAgentsError,
		refetch: getAentsRefetch,
		 } = useQuery(GET_AGENTS, {
		fetchPolicy: "cache-and-network",
		variables: {input: initialInput},
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
				setTopAgents(data?.getAgents?.list);
		},
		 });
	/** HANDLERS **/

	if (device === 'mobile') {
		return (
			<Stack className={'top-agents'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<Box component={'div'} className={'left'}>
							<span>Elite Riders</span>
							<p>⭐ Meet our community champions</p>
						</Box>
					</Stack>
					<Stack className={'wrapper'}>
						{topAgents.length === 0 ? (
							<Box component={'div'} className={'empty-list'}>
								Agents Empty
							</Box>
						) : (
							<Swiper
								className={'top-agents-swiper'}
								slidesPerView={'auto'}
								spaceBetween={15}
								modules={[Autoplay, Navigation, Pagination]}
								navigation={{
									nextEl: '.swiper-agents-next',
									prevEl: '.swiper-agents-prev',
								}}
								pagination={{
									el: '.swiper-agents-pagination',
								}}
							>
								{topAgents.map((agent: Member) => {
									return (
										<SwiperSlide className={'top-agents-slide'} key={agent?._id}>
											<TopAgentCard agent={agent} key={agent?.memberNick} />
										</SwiperSlide>
									);
								})}
							</Swiper>
						)}
						{topAgents.length > 0 && (
							<Box component={'div'} className={'pagination-box'}>
								<ArrowBackIosNewIcon className={'swiper-agents-prev'} />
								<div className={'swiper-agents-pagination'}></div>
								<ArrowBackIosNewIcon className={'swiper-agents-next'} sx={{ transform: 'rotate(180deg)' }} />
							</Box>
						)}
					</Stack>
				</Stack>
			</Stack>
		);
	} else {
		return (
			<Stack className={'top-agents'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<Box component={'div'} className={'left'}>
							<span>Elite Riders</span>
							<p>⭐ Meet our community champions</p>
						</Box>
						<Box component={'div'} className={'right'}>
							<div className={'more-box'}>
								<Link href={'/agent'}>
									<span>Explore All Riders</span>
								</Link>
								<img src="/img/icons/rightup.svg" alt="" />
							</div>
						</Box>
					</Stack>
					<Stack className={'wrapper'}>
						<Box component={'div'} className={'switch-btn swiper-agents-prev'}>
							<ArrowBackIosNewIcon />
						</Box>
						<Box component={'div'} className={'card-wrapper'}>
							<Swiper
								className={'top-agents-swiper'}
								slidesPerView={4}
								spaceBetween={30}
								modules={[Autoplay, Navigation, Pagination]}
								navigation={{
									nextEl: '.swiper-agents-next',
									prevEl: '.swiper-agents-prev',
								}}
								breakpoints={{
									320: {
										slidesPerView: 1,
										spaceBetween: 20,
									},
									768: {
										slidesPerView: 2,
										spaceBetween: 25,
									},
									1024: {
										slidesPerView: 3,
										spaceBetween: 30,
									},
									1280: {
										slidesPerView: 4,
										spaceBetween: 30,
									},
								}}
							>
								{topAgents.map((agent: Member) => {
									return (
										<SwiperSlide className={'top-agents-slide'} key={agent?._id}>
											<TopAgentCard agent={agent} key={agent?.memberNick} />
										</SwiperSlide>
									);
								})}
							</Swiper>
						</Box>
						<Box component={'div'} className={'switch-btn swiper-agents-next'}>
							<ArrowBackIosNewIcon />
						</Box>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

TopAgents.defaultProps = {
	initialInput: {
		page: 1,
		limit: 10,
		sort: 'memberRank',
		direction: 'DESC',
		search: {},
	},
};

export default TopAgents;
