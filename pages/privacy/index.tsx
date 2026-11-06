import React from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { Stack, Box } from '@mui/material';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const UPDATED = '2026-11-06';

/** Public privacy policy — linked from Google Play, so keep the URL (/privacy) stable. */
const Privacy: NextPage = () => {
	return (
		<Stack className={'container'} sx={{ maxWidth: 820, mx: 'auto', px: 2, py: 6, gap: 1.5, lineHeight: 1.7 }}>
			<h1>Maxfiylik siyosati</h1>
			<p>
				Oxirgi yangilanish: {UPDATED}. Bu siyosat MotoHub veb-sayti va MotoHub Android ilovasiga (birgalikda — «Xizmat»)
				tegishli.
			</p>

			<h3>Qanday ma’lumot yig‘amiz</h3>
			<ul>
				<li>
					<b>Hisob ma’lumotlari:</b> nik (login), telefon raqam, parol (faqat shifrlangan xesh holida saqlanadi), ixtiyoriy
					ravishda ism, manzil, tavsif va profil rasmi.
				</li>
				<li>
					<b>Siz joylagan kontent:</b> mototsikl va qism e’lonlari, rasmlar, maqolalar, izohlar, layklar va chatdagi xabarlar.
				</li>
				<li>
					<b>AI yordamchiga yozgan savollaringiz:</b> javob tayyorlash uchun Google Gemini API’ga yuboriladi. Ularni
					hisobingizga bog‘lab saqlamaymiz.
				</li>
				<li>
					<b>Texnik ma’lumot:</b> server jurnallarida IP manzil va so‘rov vaqti (xavfsizlik va suiiste’mollarni cheklash uchun).
				</li>
			</ul>
			<p>Reklama, kuzatuv (tracking) yoki analitika SDK’laridan foydalanmaymiz, joylashuvingizni ham yig‘maymiz.</p>

			<h3>Nima uchun ishlatamiz</h3>
			<ul>
				<li>Hisobingizga kirish va sessiyani saqlash;</li>
				<li>E’lonlaringizni boshqa foydalanuvchilarga ko‘rsatish (nik, telefon va profil rasmi e’lon bilan birga ko‘rinadi);</li>
				<li>AI yordamchi orqali mos e’lonlarni topish;</li>
				<li>Spam va qoidabuzarliklarga qarshi kurash.</li>
			</ul>
			<p>Ma’lumotlaringizni sotmaymiz va reklama uchun uchinchi tomonlarga bermaymiz.</p>

			<h3>Uchinchi tomon xizmatlari</h3>
			<ul>
				<li>MongoDB Atlas — ma’lumotlar bazasi;</li>
				<li>Render va Vercel — server va sayt hostingi;</li>
				<li>Cloudinary — rasmlarni saqlash;</li>
				<li>Google Gemini API — AI yordamchi javoblari;</li>
				<li>Google — agar Google orqali kirsangiz.</li>
			</ul>

			<h3>Xavfsizlik</h3>
			<p>
				Barcha ulanishlar HTTPS orqali shifrlanadi. Parollar xesh ko‘rinishida saqlanadi. Ilovada kirish tokenlari Android
				keystore’da himoyalangan holda saqlanadi.
			</p>

			<h3>Hisobni o‘chirish</h3>
			<p>
				Hisobingizni istalgan vaqtda ilovaning «Profil» bo‘limidan yoki saytdagi{' '}
				<Link href={'/account/delete'}>hisobni o‘chirish sahifasi</Link> orqali o‘chirishingiz mumkin. O‘chirilganda barcha
				sessiyalar yopiladi, e’lonlaringiz va maqolalaringiz saytdan olib tashlanadi, nik va telefon raqamingiz bo‘shatiladi.
			</p>

			<h3>Bolalar</h3>
			<p>Xizmat 13 yoshgacha bo‘lgan bolalar uchun mo‘ljallanmagan.</p>

			<h3>Bog‘lanish</h3>
			<p>
				Savollar bo‘lsa, <Link href={'/cs'}>yordam markazi</Link> orqali murojaat qiling.
			</p>

			<Box component={'hr'} sx={{ my: 4, opacity: 0.3 }} />

			<h2>Privacy Policy (English)</h2>
			<p>
				Last updated: {UPDATED}. Applies to the MotoHub website and the MotoHub Android app. We collect your account details
				(nick, phone number, password stored only as a hash, and optionally name, address, description and profile photo),
				the content you post (listings, photos, articles, comments, likes, chat messages), questions you send to the AI
				assistant (forwarded to the Google Gemini API to produce an answer, not stored against your account), and server logs
				(IP address, request time) for security and rate limiting. We use no ads, tracking or analytics SDKs and do not
				collect location.
			</p>
			<p>
				Data is used to run your account, show your listings to other users, power the AI assistant and fight abuse. We do not
				sell your data. Processors: MongoDB Atlas, Render, Vercel, Cloudinary, Google (Gemini API, Google sign-in). All
				traffic uses HTTPS.
			</p>
			<p>
				You can delete your account at any time in the app (Profile) or on the{' '}
				<Link href={'/account/delete'}>account deletion page</Link>. Deletion ends all sessions, removes your listings and
				articles from the site and frees your nick and phone number. The service is not intended for children under 13.
				Contact us through the <Link href={'/cs'}>help center</Link>.
			</p>
		</Stack>
	);
};

export default withLayoutBasic(Privacy);
