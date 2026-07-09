import React, { useCallback, useEffect, useRef } from 'react';
import { useState } from 'react';
import { useRouter, withRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { getJwtToken, logOut, updateUserInfo } from '../auth';
import { Stack, Box } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import { alpha, styled } from '@mui/material/styles';
import Menu, { MenuProps } from '@mui/material/Menu';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import { CaretDown } from 'phosphor-react';
import useDeviceDetect from '../hooks/useDeviceDetect';
import Link from 'next/link';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import { Badge, Divider, Typography } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useReactiveVar, useQuery, useMutation } from '@apollo/client';
import { userVar } from '../../apollo/store';
import { Logout } from '@mui/icons-material';
import { REACT_APP_API_URL } from '../config';
import { GET_NOTIFICATIONS } from '../../apollo/user/query';
import { DELETE_NOTIFICATION, MARK_NOTIFICATIONS_READ } from '../../apollo/user/mutation';
import { Notification } from '../types/notification/notification';
import { NotificationStatus } from '../enums/notification.enum';
import { Direction } from '../enums/common.enum';
import { T } from '../types/common';
import moment from 'moment';

const Top = () => {
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const { t, i18n } = useTranslation('common');
	const router = useRouter();
	const [anchorEl2, setAnchorEl2] = useState<null | HTMLElement>(null);
	const [lang, setLang] = useState<string | null>('uz');
	const drop = Boolean(anchorEl2);
	const [colorChange, setColorChange] = useState(false);
	const [anchorEl, setAnchorEl] = React.useState<any | HTMLElement>(null);
	let open = Boolean(anchorEl);
	const [bgColor, setBgColor] = useState<boolean>(false);
	const [logoutAnchor, setLogoutAnchor] = React.useState<null | HTMLElement>(null);
	const logoutOpen = Boolean(logoutAnchor);
	const [notifyAnchor, setNotifyAnchor] = useState<null | HTMLElement>(null);
	const notifyOpen = Boolean(notifyAnchor);

	/** APOLLO REQUESTS **/
	const [markNotificationsRead] = useMutation(MARK_NOTIFICATIONS_READ);
	const [deleteNotificationMutation] = useMutation(DELETE_NOTIFICATION);

	const {
		data: notiData,
		refetch: refetchNotifications,
	} = useQuery(GET_NOTIFICATIONS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { page: 1, limit: 20, direction: Direction.DESC, search: {} } },
		skip: !user?._id,
		notifyOnNetworkStatusChange: true,
		pollInterval: 30000,
	});

	const notifications: Notification[] = notiData?.getNotifications?.list ?? [];
	const unreadCount: number = notiData?.getNotifications?.unreadCounter?.[0]?.total ?? 0;

	/** LIFECYCLES **/
	useEffect(() => {
		if (localStorage.getItem('locale') === null) {
			localStorage.setItem('locale', 'uz');
			setLang('uz');
		} else {
			setLang(localStorage.getItem('locale'));
		}
	}, [router]);

	useEffect(() => {
		switch (router.pathname) {
			case '/property/detail':
				setBgColor(true);
				break;
			default:
				break;
		}
	}, [router]);

	useEffect(() => {
		const jwt = getJwtToken();
		if (jwt) updateUserInfo(jwt);
	}, []);

	/** HANDLERS **/
	const langClick = (e: any) => {
		setAnchorEl2(e.currentTarget);
	};

	const langClose = () => {
		setAnchorEl2(null);
	};

	const langChoice = useCallback(
		async (e: any) => {
			setLang(e.target.id);
			localStorage.setItem('locale', e.target.id);
			setAnchorEl2(null);
			await router.push(router.asPath, router.asPath, { locale: e.target.id });
		},
		[router],
	);

	const changeNavbarColor = () => {
		if (window.scrollY >= 50) {
			setColorChange(true);
		} else {
			setColorChange(false);
		}
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const notifyClick = async (event: any) => {
		setNotifyAnchor(event.currentTarget);
		// mark all as read when the dropdown opens
		if (unreadCount > 0) {
			try {
				await markNotificationsRead({ variables: { input: {} } });
				await refetchNotifications();
			} catch (err) {
				console.log('markNotificationsRead err:', err);
			}
		}
	};

	const notifyClose = () => {
		setNotifyAnchor(null);
	};

	const removeNotification = async (e: any, notificationId: string) => {
		e.stopPropagation();
		try {
			await deleteNotificationMutation({ variables: { input: { _id: notificationId } } });
			await refetchNotifications();
		} catch (err) {
			console.log('deleteNotification err:', err);
		}
	};

	const handleHover = (event: any) => {
		if (anchorEl !== event.currentTarget) {
			setAnchorEl(event.currentTarget);
		} else {
			setAnchorEl(null);
		}
	};

	const StyledMenu = styled((props: MenuProps) => (
		<Menu
			elevation={0}
			anchorOrigin={{
				vertical: 'bottom',
				horizontal: 'right',
			}}
			transformOrigin={{
				vertical: 'top',
				horizontal: 'right',
			}}
			{...props}
		/>
	))(({ theme }) => ({
		'& .MuiPaper-root': {
			top: '109px',
			borderRadius: 6,
			marginTop: theme.spacing(1),
			minWidth: 160,
			color: theme.palette.mode === 'light' ? 'rgb(55, 65, 81)' : theme.palette.grey[300],
			boxShadow:
				'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
			'& .MuiMenu-list': {
				padding: '4px 0',
			},
			'& .MuiMenuItem-root': {
				'& .MuiSvgIcon-root': {
					fontSize: 18,
					color: theme.palette.text.secondary,
					marginRight: theme.spacing(1.5),
				},
				'&:active': {
					backgroundColor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
				},
			},
		},
	}));

	if (typeof window !== 'undefined') {
		window.addEventListener('scroll', changeNavbarColor);
	}

	if (device == 'mobile') {
		return (
			<Stack className={'top'}>
				<Link href={'/'}>
					<div>{t('Home')}</div>
				</Link>
				<Link href={'/property'}>
					<div>{t('Bikes')}</div>
				</Link>
				<Link href={'/part?category=SPARE_PART'}>
					<div>{t('Spare Parts')}</div>
				</Link>
				<Link href={'/part?category=ACCESSORY'}>
					<div>{t('Accessories')}</div>
				</Link>
				<Link href={'/agent'}>
					<div> {t('Agents')} </div>
				</Link>
				<Link href={'/community?articleCategory=FREE'}>
					<div> {t('Community')} </div>
				</Link>
				{user?._id && (
					<Link href={'/mypage'}>
						<div> {t('My Page')} </div>
					</Link>
				)}
				<Link href={'/cs'}>
					<div> {t('CS')} </div>
				</Link>
			</Stack>
		);
	} else {
		return (
			<Stack className={'navbar'}>
				<Stack className={`navbar-main ${colorChange ? 'transparent' : ''} ${bgColor ? 'transparent' : ''}`}>
					<Stack className={'container'}>
						<Box component={'div'} className={'logo-box'}>
							<Link href={'/'}>
								<Stack direction="row" alignItems="center" spacing={1.5} className="brand">
									<img
										src="/img/logo/motopresto.png"
										alt="MOTOPRESTO logo"
										className="logo-img"
										style={{ height: '46px', width: 'auto' }}
									/>
								</Stack>
							</Link>
						</Box>
						<Box component={'div'} className={'router-box'}>
							<Link href={'/'}>
								<div>{t('Home')}</div>
							</Link>
							<Link href={'/property'}>
								<div>{t('Bikes')}</div>
							</Link>
							<Link href={'/part?category=SPARE_PART'}>
								<div>{t('Spare Parts')}</div>
							</Link>
							<Link href={'/part?category=ACCESSORY'}>
								<div>{t('Accessories')}</div>
							</Link>
							<Link href={'/agent'}>
								<div> {t('Agents')} </div>
							</Link>
							<Link href={'/community?articleCategory=FREE'}>
								<div> {t('Community')} </div>
							</Link>
							{user?._id && (
								<Link href={'/mypage'}>
									<div> {t('My Page')} </div>
								</Link>
							)}
							<Link href={'/cs'}>
								<div> {t('CS')} </div>
							</Link>
						</Box>
						<Box component={'div'} className={'user-box'}>
							{user?._id ? (
								<>
									<div className={'login-user'} onClick={(event: any) => setLogoutAnchor(event.currentTarget)}>
										<img
											src={
												user?.memberImage ? `${REACT_APP_API_URL}/${user?.memberImage}` : '/img/profile/defaultUser.svg'
											}
											alt=""
										/>
									</div>

									<Menu
										id="basic-menu"
										anchorEl={logoutAnchor}
										open={logoutOpen}
										onClose={() => {
											setLogoutAnchor(null);
										}}
										sx={{ mt: '5px' }}
									>
										<MenuItem onClick={() => logOut()}>
											<Logout fontSize="small" style={{ color: 'blue', marginRight: '10px' }} />
											Logout
										</MenuItem>
									</Menu>
								</>
							) : (
								<Link href={'/account/join'}>
									<div className={'join-box'}>
										<AccountCircleOutlinedIcon />
										<span>
											{t('Login')} / {t('Register')}
										</span>
									</div>
								</Link>
							)}

							<div className={'lan-box'}>
								{user?._id && (
									<>
										<Badge badgeContent={unreadCount} color="error" overlap="circular">
											<NotificationsOutlinedIcon
												className={'notification-icon'}
												style={{ cursor: 'pointer' }}
												onClick={notifyClick}
											/>
										</Badge>
										<Menu
											anchorEl={notifyAnchor}
											open={notifyOpen}
											onClose={notifyClose}
											sx={{ mt: '10px' }}
											anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
											transformOrigin={{ vertical: 'top', horizontal: 'right' }}
											PaperProps={{ style: { width: 360, maxHeight: 460 } }}
										>
											<Box component={'div'} sx={{ px: 2, py: 1, display: 'flex', justifyContent: 'space-between' }}>
												<Typography fontWeight={700}>{t('Notifications')}</Typography>
												<Link href={'/notifications'} onClick={notifyClose}>
													<Typography color="primary" fontSize={13} sx={{ cursor: 'pointer' }}>
														{t('View all')}
													</Typography>
												</Link>
											</Box>
											<Divider />
											{notifications.length === 0 ? (
												<Box component={'div'} sx={{ px: 2, py: 3, textAlign: 'center', color: '#888' }}>
													{t('No notifications')}
												</Box>
											) : (
												notifications.slice(0, 8).map((noti: Notification) => (
													<MenuItem
														key={noti._id}
														sx={{
															whiteSpace: 'normal',
															alignItems: 'flex-start',
															background:
																noti.notificationStatus === NotificationStatus.WAIT ? 'rgba(37,180,75,0.06)' : 'transparent',
														}}
													>
														<Box component={'div'} sx={{ flex: 1 }}>
															<Typography fontSize={13} fontWeight={600}>
																{noti.notificationTitle}
															</Typography>
															{noti.notificationDesc && (
																<Typography fontSize={12} color="#666">
																	{noti.notificationDesc}
																</Typography>
															)}
															<Typography fontSize={11} color="#aaa">
																{moment(noti.createdAt).fromNow()}
															</Typography>
														</Box>
														<DeleteOutlineIcon
															fontSize="small"
															sx={{ color: '#bbb', ml: 1 }}
															onClick={(e: T) => removeNotification(e, noti._id)}
														/>
													</MenuItem>
												))
											)}
										</Menu>
									</>
								)}
								<Button
									disableRipple
									className="btn-lang"
									onClick={langClick}
									endIcon={<CaretDown size={14} color="#616161" weight="fill" />}
								>
									<Box component={'div'} className={'flag'}>
										{lang !== null ? (
											<img src={`/img/flag/lang${lang}.png`} alt={'usaFlag'} />
										) : (
											<img src={`/img/flag/langen.png`} alt={'usaFlag'} />
										)}
									</Box>
								</Button>

								<StyledMenu anchorEl={anchorEl2} open={drop} onClose={langClose} sx={{ position: 'absolute' }}>
									<MenuItem disableRipple onClick={langChoice} id="en">
										<img
											className="img-flag"
											src={'/img/flag/langen.png'}
											onClick={langChoice}
											id="en"
											alt={'usaFlag'}
										/>
										{t('English')}
									</MenuItem>
									<MenuItem disableRipple onClick={langChoice} id="kr">
										<img
											className="img-flag"
											src={'/img/flag/langkr.png'}
											onClick={langChoice}
											id="kr"
											alt={'koreanFlag'}
										/>
										{t('Korean')}
									</MenuItem>
									<MenuItem disableRipple onClick={langChoice} id="ru">
										<img
											className="img-flag"
											src={'/img/flag/langru.png'}
											onClick={langChoice}
											id="ru"
											alt={'russiaFlag'}
										/>
										{t('Russian')}
									</MenuItem>
									<MenuItem disableRipple onClick={langChoice} id="uz">
										<img
											className="img-flag"
											src={'/img/flag/languz.png'}
											onClick={langChoice}
											id="uz"
											alt={'uzbekFlag'}
										/>
										{t('Uzbek')}
									</MenuItem>
								</StyledMenu>
							</div>
						</Box>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default withRouter(Top);
