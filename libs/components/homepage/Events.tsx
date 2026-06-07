import React from 'react';
import { Stack, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useTranslation } from 'next-i18next';

interface EventData {
	eventTitle: string;
	city: string;
	description: string;
	imageSrc: string;
}
const eventsData: EventData[] = [
	{
		eventTitle: 'Seoul Motorcycle Rally',
		city: 'Seoul',
		description:
			'Join thousands of riders for the annual Seoul Motorcycle Rally! Experience the thrill of riding through the city streets with fellow motorcycle enthusiasts.',
		imageSrc: '/img/property/ducati1.avif',
	},
	{
		eventTitle: 'Busan Bike Show & Expo',
		city: 'Busan',
		description:
			'Discover the latest motorcycles, gear, and accessories at the Busan Bike Show! Meet industry experts and test ride the newest models.',
		imageSrc: '/img/property/samuel-hagger-SJ9E55peYn4-unsplash.jpg',
	},
	{
		eventTitle: 'Incheon Motorcycle Festival',
		city: 'Incheon',
		description:
			'Celebrate motorcycle culture at the Incheon Motorcycle Festival! Enjoy live music, food trucks, custom bike displays, and group rides.',
		imageSrc: '/img/property/harley-davidson-02tt7EvQKhw-unsplash.jpg',
	},
	{
		eventTitle: 'Daegu Racing Championship',
		city: 'Daegu',
		description:
			'Witness high-speed action at the Daegu Racing Championship! Watch professional riders compete in thrilling motorcycle races and stunts.',
		imageSrc: '/img/property/photo-1688820166312-cb9654f7fd2f.avif',
	},
];

const EventCard = ({ event }: { event: EventData }) => {
	const device = useDeviceDetect();

	if (device === 'mobile') {
		return <div>EVENT CARD</div>;
	} else {
		return (
			<Stack
				className="event-card"
				style={{
					backgroundImage: `url(${event?.imageSrc})`,
					backgroundSize: 'cover',
					backgroundPosition: 'center',
					backgroundRepeat: 'no-repeat',
				}}
			>
				<Box component={'div'} className={'info'}>
					<strong>{event?.city}</strong>
					<span>{event?.eventTitle}</span>
				</Box>
				<Box component={'div'} className={'more'}>
					<span>{event?.description}</span>
				</Box>
			</Stack>
		);
	}
};

const Events = () => {
	const device = useDeviceDetect();
	const { t } = useTranslation('common');

	if (device === 'mobile') {
		return <div>EVENT CARD</div>;
	} else {
		return (
			<Stack className={'events'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<Box component={'div'} className={'left'}>
							<span>{t('Motorcycle Events')}</span>
							<p>{t('Join exciting motorcycle events and connect with riders!')}</p>
						</Box>
					</Stack>
					<Stack className={'card-wrapper'}>
						{eventsData.map((event: EventData) => {
							return <EventCard event={event} key={event?.eventTitle} />;
						})}
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default Events;
