import React, { useEffect, useRef } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { CircularProgress, Stack, Typography } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { completeGoogleLogin, takeGoogleLoginSession } from '../../libs/auth/google';
import { sweetMixinErrorAlert, sweetMixinSuccessAlert } from '../../libs/sweetAlert';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

/** The backend only ever sends one of these short reasons — anything else reads as a generic failure. */
const FAILURE_MESSAGES: Record<string, string> = {
	cancelled: 'Google login was cancelled',
	blocked: 'You have been blocked!',
	failed: 'Google login failed. Please try again.',
};

/**
 * Reads #code / #error from the fragment and wipes it from the address bar and
 * history straight away. The fragment is never sent to a server or in a Referer.
 */
const takeFragmentParams = (): URLSearchParams => {
	const params = new URLSearchParams(window.location.hash.slice(1));
	window.history.replaceState(window.history.state, '', window.location.pathname);
	return params;
};

/** Where the backend drops the browser after Google: one-time code + this tab's binding → our tokens. */
const GoogleCallback: NextPage = () => {
	const router = useRouter();
	const { t } = useTranslation('common');
	const handled = useRef(false);

	useEffect(() => {
		if (handled.current) return;
		handled.current = true;

		const params = takeFragmentParams();
		const code = params.get('code');
		const error = params.get('error');
		const session = takeGoogleLoginSession();

		const finishLogin = async () => {
			try {
				if (error || !code) throw new Error(FAILURE_MESSAGES[String(error)] ?? FAILURE_MESSAGES.failed);
				/** No pending login in this tab means this tab never started one — refuse the code. */
				if (!session) throw new Error(FAILURE_MESSAGES.failed);

				await completeGoogleLogin(code, session.binding);
				await router.replace(session.returnPath);
				await sweetMixinSuccessAlert(t('Welcome back!'), 1500);
			} catch (err: any) {
				await router.replace('/account/join');
				await sweetMixinErrorAlert(t(err.message));
			}
		};

		finishLogin();
	}, []);

	return (
		<Stack alignItems="center" justifyContent="center" gap={2} sx={{ minHeight: '60vh' }}>
			<CircularProgress />
			<Typography>{t('Signing you in with Google...')}</Typography>
		</Stack>
	);
};

export default withLayoutBasic(GoogleCallback);
