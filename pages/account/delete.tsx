import React, { useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { Stack, Button } from '@mui/material';
import { useMutation, useReactiveVar } from '@apollo/client';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { userVar } from '../../apollo/store';
import { UPDATE_MEMBER } from '../../apollo/user/mutation';
import { logOut } from '../../libs/auth';
import { sweetConfirmAlert, sweetMixinErrorAlert } from '../../libs/sweetAlert';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

/** Account deletion page — Google Play requires a public URL for this, so keep /account/delete stable. */
const DeleteAccount: NextPage = () => {
	const user = useReactiveVar(userVar);
	const [updateMember] = useMutation(UPDATE_MEMBER);
	const [busy, setBusy] = useState(false);

	const deleteHandler = async () => {
		const ok = await sweetConfirmAlert(
			'Hisobingiz butunlay o‘chiriladi, e’lonlaringiz olib tashlanadi. Davom etasizmi? / Delete your account permanently?',
		);
		if (!ok) return;
		try {
			setBusy(true);
			await updateMember({ variables: { input: { _id: user._id, memberStatus: 'DELETE' } } });
			alert('Hisobingiz o‘chirildi. / Your account has been deleted.');
			logOut();
		} catch (err: any) {
			setBusy(false);
			await sweetMixinErrorAlert(err?.message ?? 'Error');
		}
	};

	return (
		<Stack className={'container'} sx={{ maxWidth: 820, mx: 'auto', px: 2, py: 6, gap: 1.5, lineHeight: 1.7 }}>
			<h1>Hisobni o‘chirish</h1>
			<p>MotoHub hisobingizni (sayt va Android ilova uchun bitta) shu yerda o‘chirishingiz mumkin.</p>
			<p>
				<b>Nima o‘chiriladi:</b> hisobingiz yopiladi, barcha qurilmalardagi sessiyalar tugaydi, mototsikl va qism e’lonlaringiz
				hamda maqolalaringiz saytdan olib tashlanadi, nik va telefon raqamingiz bo‘shatiladi.
			</p>
			<p>
				<b>Nima saqlanib qoladi:</b> xavfsizlik va qonuniy talablar uchun hisob yozuvi o‘chirilgan holatda saqlanadi va hech
				kimga ko‘rinmaydi. Boshqa foydalanuvchilarga yozgan izoh va chat xabarlaringiz qolishi mumkin.
			</p>
			<p>
				Ilovada: <b>Profil → Hisobni o‘chirish</b>.
			</p>

			<h3>Delete your account (English)</h3>
			<p>
				Deleting your MotoHub account closes it, ends all sessions, removes your listings and articles from the site and frees
				your nick and phone number. A deactivated record is kept for security purposes and is not visible to anyone. In the
				app: <b>Profile → Delete account</b>.
			</p>

			{user?._id ? (
				<Stack sx={{ mt: 3, gap: 1, alignItems: 'flex-start' }}>
					<span>
						Siz <b>{user.memberNick}</b> sifatida kirgansiz. / Signed in as <b>{user.memberNick}</b>.
					</span>
					<Button variant={'contained'} color={'error'} disabled={busy} onClick={deleteHandler}>
						Hisobni o‘chirish / Delete account
					</Button>
				</Stack>
			) : (
				<Stack sx={{ mt: 3, gap: 1, alignItems: 'flex-start' }}>
					<span>Avval hisobingizga kiring. / Please sign in first.</span>
					<Link href={'/account/join'}>
						<Button variant={'contained'}>Kirish / Sign in</Button>
					</Link>
				</Stack>
			)}

			<p style={{ marginTop: 24 }}>
				<Link href={'/privacy'}>Maxfiylik siyosati / Privacy policy</Link>
			</p>
		</Stack>
	);
};

export default withLayoutBasic(DeleteAccount);
