import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Head from 'next/head';
import Top from '../Top';
import Footer from '../Footer';
import { Stack } from '@mui/material';
import { getJwtToken, updateUserInfo } from '../../auth';
import Chat from '../Chat';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { useTranslation } from 'next-i18next';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const withLayoutBasic = (Component: any) => {
	return (props: any) => {
		const router = useRouter();
		const { t, i18n } = useTranslation('common');
		const device = useDeviceDetect();
		const [authHeader, setAuthHeader] = useState<boolean>(false);
		const user = useReactiveVar(userVar);

		const memoizedValues = useMemo(() => {
			let title = '',
				desc = '',
				bgImage = '',
				bgSize = '60%';

			switch (router.pathname) {
				case '/property':
					title = 'Find Your Perfect Ride';
					desc = 'Discover amazing bikes • Explore endless possibilities';
					bgImage = '/img/property/ducati1.avif';
					bgSize = '60%';
					break;
			case '/agent':
				title = 'Find Your Perfect Agent';
				desc = 'Connect with trusted bike agents • Get expert advice';
				bgImage = '/img/property/josh-marshall-s0QMav76pmQ-unsplash.jpg';
				bgSize = '70%';
					break;
				case '/agent/detail':
					title = 'Agent Profile';
					desc = 'Meet your trusted bike agent • Expert service guaranteed';
					bgImage = '/img/property/ducati1.avif';
					bgSize = '60%';
					break;
				case '/mypage':
					title = 'My Page';
					desc = 'Manage your profile • Your bikes, favorites & more';
					bgImage = '/img/property/ducati1.avif';
					bgSize = '60%';
					break;
				case '/community':
					title = 'Community';
					desc = 'Drive the conversation • Share your passion';
					bgImage = '/img/property/ducati1.avif';
					bgSize = '60%';
					break;
				case '/community/detail':
					title = 'Community Detail';
					desc = 'Read, discuss, and connect • Join the conversation';
					bgImage = '/img/property/ducati1.avif';
					bgSize = '60%';
					break;
				case '/cs':
					title = 'CS Center';
					desc = 'We are here to help! Ask us anything';
					bgImage = '/img/property/ducati1.avif';
					bgSize = '60%';
					break;
				case '/account/join':
					title = 'Login/Signup';
					desc = 'Authentication Process';
					bgImage = '/img/property/ducati1.avif';
					bgSize = '70%';
					setAuthHeader(true);
					break;
				case '/member':
					title = 'Member Page';
					desc = 'Home / For Rent';
					bgImage = '/img/banner/header1.svg';
					break;
				default:
					break;
			}

			return { title, desc, bgImage, bgSize };
		}, [router.pathname]);

		/** LIFECYCLES **/
		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
		}, []);

		/** HANDLERS **/

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

						<Stack
							className={`header-basic ${authHeader && 'auth'}`}
							style={{
								backgroundImage: `url(${memoizedValues.bgImage})`,
								backgroundSize: memoizedValues.bgSize || '60%',
								backgroundRepeat: 'no-repeat',
								backgroundPosition: 'center',
								boxShadow: 'inset 10px 40px 150px 40px rgb(24 22 36)',
							}}
						>
							<Stack className={'container'}>
								<strong>{t(memoizedValues.title)}</strong>
								<span>{t(memoizedValues.desc)}</span>
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

export default withLayoutBasic;
