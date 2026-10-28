import React from 'react';
import { Button } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { startGoogleLogin } from '../../auth/google';
import { sweetMixinErrorAlert } from '../../sweetAlert';

interface GoogleLoginButtonProps {
	returnPath?: unknown;
}

const GoogleLoginButton = ({ returnPath }: GoogleLoginButtonProps) => {
	const { t } = useTranslation('common');

	const handleClick = async () => {
		try {
			await startGoogleLogin(returnPath);
		} catch (err: any) {
			await sweetMixinErrorAlert(t(err.message));
		}
	};

	return (
		<Button variant="outlined" fullWidth onClick={handleClick} className={'google-btn'}>
			{t('Continue with Google')}
		</Button>
	);
};

export default GoogleLoginButton;
