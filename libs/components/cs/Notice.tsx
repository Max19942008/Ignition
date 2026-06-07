import React from 'react';
import { Stack, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useTranslation } from 'next-i18next';

const Notice = () => {
	const device = useDeviceDetect();
	const { t } = useTranslation('common');

	/** APOLLO REQUESTS **/
	/** LIFECYCLES **/
	/** HANDLERS **/

	const data = [
		{
			no: 1,
			event: true,
			title: 'Register to use and get discounts',
			date: '01.03.2024',
		},
		{
			no: 2,
			title: "It's absolutely free to upload and trade bikes",
			date: '31.03.2024',
		},
	];

	if (device === 'mobile') {
		return <div>NOTICE MOBILE</div>;
	} else {
		return (
			<Stack className={'notice-content'}>
				<span className={'title'}>📢 {t('Notice')}</span>
				<Stack className={'main'}>
					<Box component={'div'} className={'top'}>
						<span>#</span>
						<span>{t('Title')}</span>
						<span>{t('Date')}</span>
					</Box>
					<Stack className={'bottom'}>
						{data.map((ele: any) => (
							<div className={`notice-card ${ele?.event && 'event'}`} key={ele.title}>
								{ele?.event ? (
									<div>
										<span style={{ marginRight: '6px' }}>🎉</span>
										Event
									</div>
								) : (
									<span className={'notice-number'}>{ele.no}</span>
								)}
								<span className={'notice-title'}>{ele.title}</span>
								<span className={'notice-date'}>📅 {ele.date}</span>
							</div>
						))}
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default Notice;
