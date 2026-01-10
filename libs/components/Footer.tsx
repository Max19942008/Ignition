import FacebookOutlinedIcon from '@mui/icons-material/FacebookOutlined';
import InstagramIcon from '@mui/icons-material/Instagram';
import TelegramIcon from '@mui/icons-material/Telegram';
import TwitterIcon from '@mui/icons-material/Twitter';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import useDeviceDetect from '../hooks/useDeviceDetect';
import { Stack, Box } from '@mui/material';
import moment from 'moment';

const Footer = () => {
	const device = useDeviceDetect();

	if (device == 'mobile') {
		return (
			<Stack component="div" className={'footer-container'}>
				<Stack component="div" className={'main'}>
					<Stack component="div" className={'left'}>
						<Box component={'div'} className={'footer-box logo-box'}>
							<div className={'logo-container'}>
								<img src="/img/logo/logo1.webp" alt="Logo" className={'logo'} />
								<span className={'logo-text'}>Ignition</span>
							</div>
							<p className={'description'}>
								Your trusted partner in finding the perfect motorcycle. 
								Experience excellence in bike services and community.
							</p>
						</Box>
						<Box component={'div'} className={'footer-box contact-box'}>
							<div className={'contact-item'}>
								<PhoneIcon className={'contact-icon'} />
								<div>
									<span className={'label'}>Total Free Customer Care</span>
									<p className={'value'}>+82 10 4867 2909</p>
								</div>
							</div>
							<div className={'contact-item'}>
								<EmailIcon className={'contact-icon'} />
								<div>
									<span className={'label'}>Need Live Support?</span>
									<p className={'value'}>support@motohub.com</p>
								</div>
							</div>
						</Box>
						<Box component={'div'} className={'footer-box social-box'}>
							<p className={'social-title'}>Follow Us on Social Media</p>
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
							<strong>Keep Yourself Up to Date</strong>
							<p className={'newsletter-desc'}>Subscribe to our newsletter for the latest bike updates and deals</p>
							<div className={'newsletter-box'}>
								<input type="email" placeholder={'Enter your email address'} />
								<button className={'subscribe-btn'}>
									<span>Subscribe</span>
								</button>
							</div>
						</Box>
						<Box component={'div'} className={'bottom'}>
							<div className={'link-column'}>
								<strong>Popular Search</strong>
								<span>Sport Bikes</span>
								<span>Cruiser Bikes</span>
								<span>New Arrivals</span>
								<span>Best Deals</span>
							</div>
							<div className={'link-column'}>
								<strong>Quick Links</strong>
								<span>Terms of Use</span>
								<span>Privacy Policy</span>
								<span>Pricing Plans</span>
								<span>Our Services</span>
								<span>Contact Support</span>
								<span>FAQs</span>
							</div>
							<div className={'link-column'}>
								<strong>Categories</strong>
								<span>Sport Bikes</span>
								<span>Cruisers</span>
								<span>Touring</span>
								<span>Adventure</span>
							</div>
						</Box>
					</Stack>
				</Stack>
				<Stack component="div" className={'second'}>
					<span>© Ignition - All rights reserved. Ignition {moment().year()}</span>
					<div className={'footer-links'}>
						<span>Privacy</span>
						<span className={'separator'}>·</span>
						<span>Terms</span>
						<span className={'separator'}>·</span>
						<span>Sitemap</span>
					</div>
				</Stack>
			</Stack>
		);
					} else {
		return (
			<Stack component="div" className={'footer-container'}>
				<Stack component="div" className={'main'}>
					<Stack component="div" className={'left'}>
						<Box component={'div'} className={'footer-box logo-box'}>
							<div className={'logo-container'}>
								<img src="/img/logo/logo1.webp" alt="Logo" className={'logo'} />
								<span className={'logo-text'}>Ignition</span>
							</div>
							<p className={'description'}>
								Your trusted partner in finding the perfect motorcycle. 
								Experience excellence in bike services and community.
							</p>
						</Box>
						<Box component={'div'} className={'footer-box contact-box'}>
							<div className={'contact-item'}>
								<PhoneIcon className={'contact-icon'} />
								<div>
									<span className={'label'}>Total Free Customer Care</span>
									<p className={'value'}>+82 10 4867 2909</p>
								</div>
							</div>
							<div className={'contact-item'}>
								<EmailIcon className={'contact-icon'} />
								<div>
									<span className={'label'}>Need Live Support?</span>
									<p className={'value'}>support@motohub.com</p>
								</div>
							</div>
						</Box>
						<Box component={'div'} className={'footer-box social-box'}>
							<p className={'social-title'}>Follow Us on Social Media</p>
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
							<strong>Keep Yourself Up to Date</strong>
							<p className={'newsletter-desc'}>Subscribe to our newsletter for the latest bike updates and deals</p>
							<div className={'newsletter-box'}>
								<input type="email" placeholder={'Enter your email address'} />
								<button className={'subscribe-btn'}>
									<span>Subscribe</span>
								</button>
							</div>
						</Box>
						<Box component={'div'} className={'bottom'}>
							<div className={'link-column'}>
								<strong>Popular Search</strong>
								<span>Sport Bikes</span>
								<span>Cruiser Bikes</span>
								<span>New Arrivals</span>
								<span>Best Deals</span>
							</div>
							<div className={'link-column'}>
								<strong>Quick Links</strong>
								<span>Terms of Use</span>
								<span>Privacy Policy</span>
								<span>Pricing Plans</span>
								<span>Our Services</span>
								<span>Contact Support</span>
								<span>FAQs</span>
							</div>
							<div className={'link-column'}>
								<strong>Categories</strong>
								<span>Sport Bikes</span>
								<span>Cruisers</span>
								<span>Touring</span>
								<span>Adventure</span>
							</div>
						</Box>
					</Stack>
				</Stack>
				<Stack component="div" className={'second'}>
					<span>© Ignition - All rights reserved. Ignition {moment().year()}</span>
					<div className={'footer-links'}>
						<span>Privacy</span>
						<span className={'separator'}>·</span>
						<span>Terms</span>
						<span className={'separator'}>·</span>
						<span>Sitemap</span>
					</div>
				</Stack>
			</Stack>
		);
	}
};

export default Footer;
