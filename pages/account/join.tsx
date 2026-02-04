import React, { useCallback, useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Box, Button, Checkbox, FormControlLabel, FormGroup, Stack, TextField, Typography, IconButton, InputAdornment } from '@mui/material';
import { useRouter } from 'next/router';
import { logIn, signUp } from '../../libs/auth';
import { sweetMixinErrorAlert } from '../../libs/sweetAlert';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import PhoneIcon from '@mui/icons-material/Phone';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const Join: NextPage = () => {
	const router = useRouter();
	const device = useDeviceDetect();
	const [input, setInput] = useState({ nick: '', password: '', phone: '', type: 'USER' });
	const [loginView, setLoginView] = useState<boolean>(true);
	const [showPassword, setShowPassword] = useState<boolean>(false);

	/** HANDLERS **/
	const viewChangeHandler = (state: boolean) => {
		setLoginView(state);
		setInput({ nick: '', password: '', phone: '', type: 'USER' });
		setShowPassword(false);
	};

	const checkUserTypeHandler = (e: any) => {
		const checked = e.target.checked;
		if (checked) {
			const value = e.target.name;
			handleInput('type', value);
		} else {
			handleInput('type', 'USER');
		}
	};

	const handleInput = useCallback((name: any, value: any) => {
		setInput((prev) => {
			return { ...prev, [name]: value };
		});
	}, []);

	const doLogin = useCallback(async () => {
		try {
			await logIn(input.nick, input.password);
			await router.push(`${router.query.referrer ?? '/'}`);
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message);
		}
	}, [input, router]);

	const doSignUp = useCallback(async () => {
		try {
			await signUp(input.nick, input.password, input.phone, input.type);
			await router.push(`${router.query.referrer ?? '/'}`);
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message);
		}
	}, [input, router]);

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};

	if (device === 'mobile') {
		return <div>LOGIN MOBILE</div>;
	}

	return (
		<Stack className="join-page">
			<Box component="div" className="background-gradient" />
				<Stack className={'container'}>
					<Stack className={'main'}>
						{/* Left Side - Form */}
						<Stack className={'left'}>
							{/* Logo Section */}
						<Box component="div" className={'logo-section'}>
							<Box component="div" className={'logo-box'}>
									<img src="/img/logo/logo1.webp" alt="Ignition Logo" className={'logo-img'} />
									<Typography className={'logo-text'}>Ignition</Typography>
							</Box>
							<Typography className={'logo-subtitle'}>Your Motorcycle Marketplace</Typography>
						</Box>

						{/* Title Section */}
						<Box component="div" className={'title-section'}>
								<Typography className={'title'}>
									{loginView ? 'Welcome Back!' : 'Create Account'}
								</Typography>
								<Typography className={'subtitle'}>
									{loginView
										? 'Sign in to continue to Ignition'
										: 'Join Ignition and start buying or selling motorcycles'}
								</Typography>
							</Box>

							{/* Form Section */}
							<Box component="div" className={'form-section'}>
								<Box component="div" className={'input-box'}>
									<TextField
										fullWidth
										label="Nickname"
										placeholder="Enter your nickname"
										value={input.nick}
										onChange={(e) => handleInput('nick', e.target.value)}
										onKeyDown={(event) => {
											if (event.key == 'Enter' && loginView) doLogin();
											if (event.key == 'Enter' && !loginView) doSignUp();
										}}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<PersonIcon className={'input-icon'} />
												</InputAdornment>
											),
										}}
									className={'custom-input'}
								/>
							</Box>

							<Box component="div" className={'input-box'}>
									<TextField
										fullWidth
										label="Password"
										type={showPassword ? 'text' : 'password'}
										placeholder="Enter your password"
										value={input.password}
										onChange={(e) => handleInput('password', e.target.value)}
										onKeyDown={(event) => {
											if (event.key == 'Enter' && loginView) doLogin();
											if (event.key == 'Enter' && !loginView) doSignUp();
										}}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<LockIcon className={'input-icon'} />
												</InputAdornment>
											),
											endAdornment: (
												<InputAdornment position="end">
													<IconButton onClick={togglePasswordVisibility} edge="end" className={'eye-icon'}>
														{showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
													</IconButton>
												</InputAdornment>
											),
										}}
									className={'custom-input'}
								/>
							</Box>

							{!loginView && (
								<Box component="div" className={'input-box'}>
										<TextField
											fullWidth
											label="Phone Number"
											placeholder="Enter your phone number"
											value={input.phone}
											onChange={(e) => handleInput('phone', e.target.value)}
											onKeyDown={(event) => {
												if (event.key == 'Enter') doSignUp();
											}}
											InputProps={{
												startAdornment: (
													<InputAdornment position="start">
														<PhoneIcon className={'input-icon'} />
													</InputAdornment>
												),
											}}
									className={'custom-input'}
								/>
							</Box>
						)}
					</Box>

					{/* User Type Selection (Signup only) */}
					{!loginView && (
						<Box component="div" className={'user-type-section'}>
							<Typography className={'user-type-label'}>I want to register as:</Typography>
							<Box component="div" className={'user-type-buttons'}>
										<Button
											variant={input.type === 'USER' ? 'contained' : 'outlined'}
											onClick={() => handleInput('type', 'USER')}
											className={`user-type-btn ${input.type === 'USER' ? 'active' : ''}`}
											startIcon={<PersonIcon />}
										>
											User
										</Button>
										<Button
											variant={input.type === 'AGENT' ? 'contained' : 'outlined'}
											onClick={() => handleInput('type', 'AGENT')}
											className={`user-type-btn ${input.type === 'AGENT' ? 'active' : ''}`}
											startIcon={<TwoWheelerIcon />}
										>
							Agent
						</Button>
					</Box>
				</Box>
			)}

			{/* Remember Me / Forgot Password (Login only) */}
			{loginView && (
				<Box component="div" className={'remember-section'}>
									<FormControlLabel
										control={<Checkbox defaultChecked className={'remember-checkbox'} />}
										label="Remember me"
										className={'remember-label'}
									/>
					<Button className={'forgot-password-btn'}>Forgot Password?</Button>
				</Box>
			)}

			{/* Submit Button */}
							<Button
								variant="contained"
								fullWidth
								disabled={
									loginView
										? input.nick == '' || input.password == ''
										: input.nick == '' || input.password == '' || input.phone == '' || input.type == ''
								}
								onClick={loginView ? doLogin : doSignUp}
								className={'submit-btn'}
							>
								{loginView ? 'LOGIN' : 'SIGN UP'}
							</Button>

			{/* Switch View */}
			<Box component="div" className={'switch-view'}>
								<Typography className={'switch-text'}>
									{loginView ? "Don't have an account? " : 'Already have an account? '}
									<Button
										onClick={() => viewChangeHandler(!loginView)}
										className={'switch-btn'}
									>
										{loginView ? 'SIGN UP' : 'LOGIN'}
					</Button>
				</Typography>
			</Box>
		</Stack>

		{/* Right Side - Decorative */}
		<Stack className={'right'}>
			<Box component="div" className={'right-content'}>
				<Box component="div" className={'moto-icon-wrapper'}>
					<TwoWheelerIcon className={'moto-icon'} />
				</Box>
								<Typography className={'right-title'}>Welcome to Ignition</Typography>
				<Typography className={'right-subtitle'}>
					Your trusted marketplace for buying and selling motorcycles
				</Typography>
				<Box component="div" className={'features-list'}>
					<Box component="div" className={'feature-item'}>
						<Typography className={'feature-icon'}>🏍️</Typography>
						<Typography className={'feature-text'}>Wide Selection</Typography>
					</Box>
					<Box component="div" className={'feature-item'}>
						<Typography className={'feature-icon'}>🔒</Typography>
						<Typography className={'feature-text'}>Secure Transactions</Typography>
					</Box>
					<Box component="div" className={'feature-item'}>
						<Typography className={'feature-icon'}>⚡</Typography>
						<Typography className={'feature-text'}>Fast & Easy</Typography>
					</Box>
				</Box>
			</Box>
						</Stack>
					</Stack>
				</Stack>
			</Stack>
	);
};

export default withLayoutBasic(Join);
