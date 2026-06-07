import React from 'react';
import { NextPage } from 'next';
import { Box, Stack, Typography, IconButton, Chip, Button } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import moment from 'moment';
import { GET_NOTIFICATIONS } from '../../apollo/user/query';
import { DELETE_NOTIFICATION, MARK_NOTIFICATIONS_READ } from '../../apollo/user/mutation';
import { Notification } from '../../libs/types/notification/notification';
import { NotificationStatus } from '../../libs/enums/notification.enum';
import { Direction } from '../../libs/enums/common.enum';
import { userVar } from '../../apollo/store';
import { T } from '../../libs/types/common';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const NotificationsPage: NextPage = () => {
	const device = useDeviceDetect();
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);

	/** APOLLO **/
	const [markNotificationsRead] = useMutation(MARK_NOTIFICATIONS_READ);
	const [deleteNotificationMutation] = useMutation(DELETE_NOTIFICATION);

	const { data, refetch } = useQuery(GET_NOTIFICATIONS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { page: 1, limit: 100, direction: Direction.DESC, search: {} } },
		skip: !user?._id,
		notifyOnNetworkStatusChange: true,
	});

	const notifications: Notification[] = data?.getNotifications?.list ?? [];
	const unreadCount: number = data?.getNotifications?.unreadCounter?.[0]?.total ?? 0;

	/** HANDLERS **/
	const markAllRead = async () => {
		try {
			await markNotificationsRead({ variables: { input: {} } });
			await refetch();
		} catch (err) {
			console.log('markAllRead err:', err);
		}
	};

	const removeOne = async (notificationId: string) => {
		try {
			await deleteNotificationMutation({ variables: { input: { _id: notificationId } } });
			await refetch();
		} catch (err) {
			console.log('removeOne err:', err);
		}
	};

	if (!user?._id) {
		return (
			<Stack className={'notifications-page'} sx={{ maxWidth: 800, margin: '120px auto', textAlign: 'center' }}>
				<Typography>{t('Please login first')}</Typography>
			</Stack>
		);
	}

	return (
		<Stack
			className={'notifications-page'}
			sx={{ maxWidth: 800, width: '100%', margin: device === 'mobile' ? '20px auto' : '120px auto', padding: '0 16px' }}
		>
			<Box component={'div'} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
				<Typography variant="h5" fontWeight={800}>
					{t('Notifications')}
				</Typography>
				<Button
					startIcon={<DoneAllIcon />}
					onClick={markAllRead}
					disabled={unreadCount === 0}
					variant="outlined"
					size="small"
				>
					{t('Mark all read')}
				</Button>
			</Box>

			{notifications.length === 0 ? (
				<Box
					component={'div'}
					sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, color: '#999' }}
				>
					<NotificationsNoneIcon sx={{ fontSize: 56, mb: 1 }} />
					<Typography>{t('No notifications')}</Typography>
				</Box>
			) : (
				<Stack spacing={1.2}>
					{notifications.map((noti: Notification) => (
						<Box
							component={'div'}
							key={noti._id}
							sx={{
								display: 'flex',
								alignItems: 'flex-start',
								gap: 1.5,
								p: 2,
								borderRadius: 2,
								border: '1px solid #eee',
								background: noti.notificationStatus === NotificationStatus.WAIT ? 'rgba(37,180,75,0.06)' : '#fff',
							}}
						>
							<Box component={'div'} sx={{ flex: 1 }}>
								<Box component={'div'} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
									<Chip label={noti.notificationType} size="small" color="primary" variant="outlined" />
									{noti.notificationStatus === NotificationStatus.WAIT && (
										<Chip label={t('New')} size="small" color="error" />
									)}
								</Box>
								<Typography fontWeight={600} fontSize={14}>
									{noti.notificationTitle}
								</Typography>
								{noti.notificationDesc && (
									<Typography fontSize={13} color="#666" sx={{ mt: 0.3 }}>
										{noti.notificationDesc}
									</Typography>
								)}
								<Typography fontSize={12} color="#aaa" sx={{ mt: 0.5 }}>
									{moment(noti.createdAt).fromNow()}
								</Typography>
							</Box>
							<IconButton size="small" onClick={(e: T) => removeOne(noti._id)}>
								<DeleteOutlineIcon fontSize="small" />
							</IconButton>
						</Box>
					))}
				</Stack>
			)}
		</Stack>
	);
};

export default withLayoutBasic(NotificationsPage);
