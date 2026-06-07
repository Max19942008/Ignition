import React, { useEffect, useState } from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Head from 'next/head';
import Top from '../Top';
import Footer from '../Footer';
import { Stack } from '@mui/material';
import { userVar } from '../../../apollo/store';
import { useReactiveVar } from '@apollo/client';
import { getJwtToken, updateUserInfo } from '../../auth';
import Chat from '../Chat';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const HERO_VIDEOS = [
	'/video/3936776-hd_1920_1080_25fps.mp4',
	'/video/5052417-hd_1920_1080_30fps.mp4',
	'/video/5052676-hd_1920_1080_30fps.mp4',
];

const withLayoutMain = (Component: any) => {
	return (props: any) => {
		const device = useDeviceDetect();
		const user = useReactiveVar(userVar);
		const [heroVideoIndex, setHeroVideoIndex] = useState(0);

		/** LIFECYCLES **/
		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
		}, []);

		/** HANDLERS **/
		const handleHeroVideoEnd = () => setHeroVideoIndex((prev) => (prev + 1) % HERO_VIDEOS.length);

		if (device == 'mobile') {
			return (
				<>
					<Head>
						<title>MOTOPRESTO</title>
						<meta name={'title'} content={`MOTOPRESTO`} />
					</Head>
					<Stack id="mobile-wrap">
						<Stack id={'top'}>
							<Top />
						</Stack>

						<Stack id={'main'}>
							<Component {...props} />
						</Stack>

						<Stack id={'footer'}>
							<Footer />
						</Stack>
					</Stack>
				</>
			);
		} else {
			return (
				<>
					<Head>
						<title>MOTOPRESTO</title>
						<meta name={'title'} content={`MOTOPRESTO`} />
					</Head>
					<Stack id="pc-wrap">
						<Stack id={'top'}>
							<Top />
						</Stack>

						<Stack className={'header-main'}>
							<video
								key={HERO_VIDEOS[heroVideoIndex]}
								className={'hero-video'}
								autoPlay
								muted
								playsInline
								preload="auto"
								onEnded={handleHeroVideoEnd}
							>
								<source src={HERO_VIDEOS[heroVideoIndex]} type="video/mp4" />
							</video>
							<Stack className={'video-overlay'} />
							<Stack className={'hero-layer'}>
								<Stack className={'hero-text'}>
									<h1>All bikes. One place.</h1>
									<p>Looping hero videos keep the spotlight on fresh listings while you search.</p>
								</Stack>
								<Stack className={'container'}>
							
								</Stack>
							</Stack>
						</Stack>

						<Stack id={'main'}>
							<Component {...props} />
						</Stack>

						<Chat />

						<Stack id={'footer'}>
							<Footer />
						</Stack>
					</Stack>
				</>
			);
		}
	};
};

export default withLayoutMain;
