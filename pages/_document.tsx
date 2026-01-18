import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
	return (
		<Html lang="en">
			<Head>
				{/* Character Set */}
				<meta charSet="utf-8" />
				
				{/* Theme Color */}
				<meta name="theme-color" content="#667eea" />
				<meta name="msapplication-TileColor" content="#667eea" />
				<meta name="msapplication-config" content="/browserconfig.xml" />
				
				{/* Favicon & Icons */}
				<link rel="icon" type="image/webp" href="/img/logo/logo1.webp" />
				<link rel="apple-touch-icon" sizes="180x180" href="/img/logo/logo1.webp" />
				<link rel="icon" type="image/webp" sizes="32x32" href="/img/logo/logo1.webp" />
				<link rel="icon" type="image/webp" sizes="16x16" href="/img/logo/logo1.webp" />
				<link rel="manifest" href="/manifest.json" />
				
				{/* Google Fonts - Poppins */}
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
				<link
					href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
					rel="stylesheet"
				/>
				
				{/* DNS Prefetch & Preconnect for Performance */}
				<link rel="dns-prefetch" href="https://fonts.googleapis.com" />
				<link rel="dns-prefetch" href="https://fonts.gstatic.com" />
				
				{/* SEO Meta Tags */}
				<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
				<meta name="googlebot" content="index,follow" />
				<meta name="bingbot" content="index,follow" />
				<meta name="keywords" content="bike hub, motorcycle, bike marketplace, buy sell bikes, moto, bike shop, motorcycle dealer, used bikes, new bikes, bike rental, bike service, bike parts, motorcycle accessories" />
				<meta
					name="description"
					content="Buy and sell motorcycles anywhere anytime. Best Bikes at Best prices on Bike Hub | Покупайте и продавайте мотоциклы в любое время. Лучшие мотоциклы по лучшим ценам на Bike Hub | 언제 어디서나 오토바이를 사고팔 수 있습니다. Bike Hub에서 최적의 가격으로 최고의 오토바이를 만나보세요"
				/>
				<meta name="author" content="Bike Hub" />
				<meta name="copyright" content="Bike Hub" />
				<meta name="language" content="English" />
				<meta name="revisit-after" content="7 days" />
				<meta name="distribution" content="global" />
				<meta name="rating" content="general" />
				
				{/* Open Graph Meta Tags */}
				<meta property="og:type" content="website" />
				<meta property="og:site_name" content="Bike Hub" />
				<meta property="og:title" content="Bike Hub - Buy and Sell Motorcycles" />
				<meta
					property="og:description"
					content="Buy and sell motorcycles anywhere anytime. Best Bikes at Best prices on Bike Hub"
				/>
				<meta property="og:image" content="/img/logo/logo1.webp" />
				<meta property="og:image:width" content="1200" />
				<meta property="og:image:height" content="630" />
				<meta property="og:image:alt" content="Bike Hub Logo" />
				<meta property="og:url" content="https://bikehub.com" />
				<meta property="og:locale" content="en_US" />
				<meta property="og:locale:alternate" content="ru_RU" />
				<meta property="og:locale:alternate" content="ko_KR" />
				
				{/* Twitter Card Meta Tags */}
				<meta name="twitter:card" content="summary_large_image" />
				<meta name="twitter:site" content="@bikehub" />
				<meta name="twitter:creator" content="@bikehub" />
				<meta name="twitter:title" content="Bike Hub - Buy and Sell Motorcycles" />
				<meta
					name="twitter:description"
					content="Buy and sell motorcycles anywhere anytime. Best Bikes at Best prices on Bike Hub"
				/>
				<meta name="twitter:image" content="/img/logo/logo1.webp" />
				<meta name="twitter:image:alt" content="Bike Hub Logo" />
				
				{/* Additional Meta Tags */}
				<meta name="format-detection" content="telephone=no" />
				<meta name="mobile-web-app-capable" content="yes" />
				<meta name="apple-mobile-web-app-capable" content="yes" />
				<meta name="apple-mobile-web-app-status-bar-style" content="default" />
				<meta name="apple-mobile-web-app-title" content="Bike Hub" />
				
				{/* Security Headers */}
				<meta httpEquiv="X-UA-Compatible" content="IE=edge" />
				<meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
				
				{/* Structured Data (JSON-LD) */}
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							'@context': 'https://schema.org',
							'@type': 'WebSite',
							name: 'Bike Hub',
							description: 'Buy and sell motorcycles anywhere anytime. Best Bikes at Best prices on Bike Hub',
							url: 'https://bikehub.com',
							potentialAction: {
								'@type': 'SearchAction',
								target: {
									'@type': 'EntryPoint',
									urlTemplate: 'https://bikehub.com/search?q={search_term_string}',
								},
								'query-input': 'required name=search_term_string',
							},
							publisher: {
								'@type': 'Organization',
								name: 'Bike Hub',
								logo: {
									'@type': 'ImageObject',
									url: 'https://bikehub.com/img/logo/logo1.webp',
								},
							},
						}),
					}}
				/>
				
				{/* Performance Optimization */}
				<link rel="preload" href="/img/logo/logo1.webp" as="image" />
				
				{/* Font Display Strategy */}
				<style
					dangerouslySetInnerHTML={{
						__html: `
							@font-face {
								font-family: 'Poppins';
								font-display: swap;
							}
							* {
								box-sizing: border-box;
							}
							html {
								scroll-behavior: smooth;
							}
							body {
								margin: 0;
								padding: 0;
								font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
								-webkit-font-smoothing: antialiased;
								-moz-osx-font-smoothing: grayscale;
								text-rendering: optimizeLegibility;
							}
						`,
					}}
				/>
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
