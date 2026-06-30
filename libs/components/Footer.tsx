import FacebookOutlinedIcon from '@mui/icons-material/FacebookOutlined';
import InstagramIcon from '@mui/icons-material/Instagram';
import TelegramIcon from '@mui/icons-material/Telegram';
import TwitterIcon from '@mui/icons-material/Twitter';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import useDeviceDetect from '../hooks/useDeviceDetect';
import { Stack, Box } from '@mui/material';
import { useTranslation } from 'next-i18next';
import moment from 'moment';

const Footer = () => {
	const device = useDeviceDetect();
	const { t } = useTranslation('common');

	const FooterContent = (
		<Stack component="div" className={'footer-container'}>
			<Stack component="div" className={'main'}>
				<Stack component="div" className={'left'}>
					<Box component={'div'} className={'footer-box logo-box'}>
						<div className={'logo-container'}>
							<img
								src="/img/logo/motopresto.png"
								alt="MOTOPRESTO logo"
								className={'logo'}
								style={{ height: '48px', width: 'auto' }}
							/>
						</div>
						<p className={'description'}>
							{t('Your trusted partner in finding the perfect motorcycle. Experience excellence in bike services and community.')}
						</p>
					</Box>
					<Box component={'div'} className={'footer-box contact-box'}>
						<div className={'contact-item'}>
							<PhoneIcon className={'contact-icon'} />
							<div>
								<span className={'label'}>{t('Total Free Customer Care')}</span>
								<p className={'value'}>+82 10 4867 2909</p>
							</div>
						</div>
						<div className={'contact-item'}>
							<EmailIcon className={'contact-icon'} />
							<div>
								<span className={'label'}>{t('Need Live Support?')}</span>
								<p className={'value'}>support@motohub.com</p>
							</div>
						</div>
					</Box>
					<Box component={'div'} className={'footer-box social-box'}>
						<p className={'social-title'}>{t('Follow Us on Social Media')}</p>
						<div className={'media-box'}>
							<a href="#" className={'social-link facebook'}>
								<FacebookOutlinedIcon />
							</a>
							<a href="#" className={'social-link telegram'}>
								<TelegramIcon />
							</a>
							<a href="#" className={'social-link instagram'}>
								<InstagramIcon />
							</a>
							<a href="#" className={'social-link twitter'}>
								<TwitterIcon />
							</a>
						</div>
					</Box>
				</Stack>
				<Stack component="div" className={'right'}>
					<Box component={'div'} className={'top'}>
						<strong>{t('Keep Yourself Up to Date')}</strong>
						<p className={'newsletter-desc'}>{t('Subscribe to our newsletter for the latest bike updates and deals')}</p>
						<div className={'newsletter-box'}>
							<input type="email" placeholder={t('Enter your email address')} />
							<button className={'subscribe-btn'}>
								<span>{t('Subscribe')}</span>
							</button>
						</div>
					</Box>
					<Box component={'div'} className={'bottom'}>
						<div className={'link-column'}>
							<strong>{t('Popular Search')}</strong>
							<span>{t('Sport Bikes')}</span>
							<span>{t('Cruiser Bikes')}</span>
							<span>{t('New Arrivals')}</span>
							<span>{t('Best Deals')}</span>
						</div>
						<div className={'link-column'}>
							<strong>{t('Quick Links')}</strong>
							<span>{t('Terms of Use')}</span>
							<span>{t('Privacy Policy')}</span>
							<span>{t('Pricing Plans')}</span>
							<span>{t('Our Services')}</span>
							<span>{t('Contact Support')}</span>
							<span>{t('FAQs')}</span>
						</div>
						<div className={'link-column'}>
							<strong>{t('Categories')}</strong>
							<span>{t('Sport Bikes')}</span>
							<span>{t('Cruisers')}</span>
							<span>{t('Touring')}</span>
							<span>{t('Adventure')}</span>
						</div>
					</Box>
				</Stack>
			</Stack>
			<Stack component="div" className={'second'}>
				<span>© MOTOPRESTO - {t('All rights reserved.')} MOTOPRESTO {moment().year()}</span>
				<div className={'footer-links'}>
					<span>{t('Privacy')}</span>
					<span className={'separator'}>·</span>
					<span>{t('Terms')}</span>
					<span className={'separator'}>·</span>
					<span>{t('Sitemap')}</span>
				</div>
			</Stack>
		</Stack>
	);

	return FooterContent;
};

export default Footer;
