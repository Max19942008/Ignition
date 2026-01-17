import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
	return (
		<Html lang="en">
			<Head>
				<meta name="robots" content="index,follow" />
				<link rel="icon" type="image/png" href="/img/logo/logo1.webp" />

				{/* SEO */}
				<meta name="keyword" content={'bike hub, motorcycle, bike marketplace, buy sell bikes'} />
				<meta
					name={'description'}
					content={
						'Buy and sell motorcycles anywhere anytime. Best Bikes at Best prices on Bike Hub | ' +
						'Покупайте и продавайте мотоциклы в любое время. Лучшие мотоциклы по лучшим ценам на Bike Hub | ' +
						'언제 어디서나 오토바이를 사고팔 수 있습니다. Bike Hub에서 최적의 가격으로 최고의 오토바이를 만나보세요'
					}
				/>
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
