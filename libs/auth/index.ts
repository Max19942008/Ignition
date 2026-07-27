import decodeJWT from 'jwt-decode';
import { initializeApollo } from '../../apollo/client';
import { userVar } from '../../apollo/store';
import { CustomJwtPayload } from '../types/customJwtPayload';
import { LOGIN, SIGN_UP } from '../../apollo/user/mutation';

export function getJwtToken(): any {
	if (typeof window !== 'undefined') {
		return localStorage.getItem('accessToken') ?? '';
	}
}

export function setJwtToken(token: string) {
	localStorage.setItem('accessToken', token);
}

export function getRefreshToken(): string {
	if (typeof window !== 'undefined') {
		return localStorage.getItem('refreshToken') ?? '';
	}
	return '';
}

export function setRefreshToken(token: string) {
	if (token) localStorage.setItem('refreshToken', token);
}

/**
 * Access tokens are short-lived, so this runs whenever one is about to expire.
 * It deliberately uses plain fetch rather than the Apollo client: the refresh
 * call must not travel through the link chain that triggered it.
 */
export const refreshAccessToken = async (): Promise<string> => {
	const refreshToken = getRefreshToken();
	if (!refreshToken) throw new Error('no refresh token');

	const res = await fetch(`${process.env.REACT_APP_API_GRAPHQL_URL}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			query: `mutation RefreshToken($refreshToken: String!) {
				refreshToken(refreshToken: $refreshToken) { accessToken refreshToken }
			}`,
			variables: { refreshToken },
		}),
	});

	const json = await res.json();
	const pair = json?.data?.refreshToken;
	if (!pair?.accessToken) throw new Error(json?.errors?.[0]?.message ?? 'refresh failed');

	// the presented token is already spent server-side — persist the new one first
	setRefreshToken(pair.refreshToken);
	setJwtToken(pair.accessToken);
	updateUserInfo(pair.accessToken);

	return pair.accessToken;
};

/** True while the stored access token still has life left in it (60s of slack). */
export const isAccessTokenValid = (): boolean => {
	const token = getJwtToken();
	if (!token) return true; // guest — nothing to refresh

	try {
		const { exp } = decodeJWT<CustomJwtPayload & { exp?: number }>(token);
		if (!exp) return true;
		return Date.now() < exp * 1000 - 60_000;
	} catch {
		return false;
	}
};

/** Pulls a human-readable message out of an Apollo/GraphQL error safely. */
const extractErrorMessage = (err: any): string => {
	return (
		err?.graphQLErrors?.[0]?.message ||
		err?.networkError?.result?.errors?.[0]?.message ||
		err?.message ||
		'Something went wrong. Please try again.'
	).replace('Definer: ', '');
};

export const logIn = async (nick: string, password: string): Promise<void> => {
	const { jwtToken, refreshToken } = await requestJwtToken({ nick, password });

	if (jwtToken) {
		updateStorage({ jwtToken });
		setRefreshToken(refreshToken);
		updateUserInfo(jwtToken);
	} else {
		throw new Error('Login failed. Please try again.');
	}
};

const requestJwtToken = async ({
	nick,
	password,
}: {
	nick: string;
	password: string;
}): Promise<{ jwtToken: string; refreshToken: string }> => {
	const apolloClient = await initializeApollo();

	try {
		const result = await apolloClient.mutate({
			mutation: LOGIN,
			variables: { input: { memberNick: nick, memberPassword: password } },
			fetchPolicy: 'network-only',
		});

		const accessToken = result?.data?.login?.accessToken;
		return { jwtToken: accessToken, refreshToken: result?.data?.login?.refreshToken };
	} catch (err: any) {
		// Do NOT reload the page here — surface the real reason to the caller.
		const message = extractErrorMessage(err);
		console.log('login request err:', message);
		throw new Error(message);
	}
};

export const signUp = async (nick: string, password: string, phone: string, type: string): Promise<void> => {
	const { jwtToken, refreshToken } = await requestSignUpJwtToken({ nick, password, phone, type });

	if (jwtToken) {
		updateStorage({ jwtToken });
		setRefreshToken(refreshToken);
		updateUserInfo(jwtToken);
	} else {
		throw new Error('Sign up failed. Please try again.');
	}
};

const requestSignUpJwtToken = async ({
	nick,
	password,
	phone,
	type,
}: {
	nick: string;
	password: string;
	phone: string;
	type: string;
}): Promise<{ jwtToken: string; refreshToken: string }> => {
	const apolloClient = await initializeApollo();

	try {
		const result = await apolloClient.mutate({
			mutation: SIGN_UP,
			variables: {
				input: { memberNick: nick, memberPassword: password, memberPhone: phone, memberType: type },
			},
			fetchPolicy: 'network-only',
		});

		const accessToken = result?.data?.signup?.accessToken;
		return { jwtToken: accessToken, refreshToken: result?.data?.signup?.refreshToken };
	} catch (err: any) {
		const message = extractErrorMessage(err);
		console.log('signup request err:', message);
		throw new Error(message);
	}
};

export const updateStorage = ({ jwtToken }: { jwtToken: any }) => {
	setJwtToken(jwtToken);
	window.localStorage.setItem('login', Date.now().toString());
};

export const updateUserInfo = (jwtToken: any) => {
	if (!jwtToken) return false;

	const claims = decodeJWT<CustomJwtPayload>(jwtToken);
	userVar({
		_id: claims._id ?? '',
		memberType: claims.memberType ?? '',
		memberStatus: claims.memberStatus ?? '',
		memberAuthType: claims.memberAuthType,
		memberPhone: claims.memberPhone ?? '',
		memberNick: claims.memberNick ?? '',
		memberFullName: claims.memberFullName ?? '',
		memberImage:
			claims.memberImage === null || claims.memberImage === undefined
				? '/img/profile/defaultUser.svg'
				: `${claims.memberImage}`,
		memberAddress: claims.memberAddress ?? '',
		memberDesc: claims.memberDesc ?? '',
		memberProperties: claims.memberProperties,
		memberRank: claims.memberRank,
		memberArticles: claims.memberArticles,
		memberPoints: claims.memberPoints,
		memberLikes: claims.memberLikes,
		memberViews: claims.memberViews,
		memberWarnings: claims.memberWarnings,
		memberBlocks: claims.memberBlocks,
	});
};

export const logOut = () => {
	/** Tell the server to drop the session too, otherwise the refresh token
	 *  stays valid for its full 60 days. Fire-and-forget — a failed revoke must
	 *  not keep the user stuck in a logged-in UI. */
	const refreshToken = getRefreshToken();
	if (refreshToken) {
		fetch(`${process.env.REACT_APP_API_GRAPHQL_URL}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				query: `mutation Logout($refreshToken: String!) { logout(refreshToken: $refreshToken) }`,
				variables: { refreshToken },
			}),
		}).catch(() => {});
	}

	deleteStorage();
	deleteUserInfo();
	window.location.reload();
};

const deleteStorage = () => {
	localStorage.removeItem('accessToken');
	localStorage.removeItem('refreshToken');
	window.localStorage.setItem('logout', Date.now().toString());
};

const deleteUserInfo = () => {
	userVar({
		_id: '',
		memberType: '',
		memberStatus: '',
		memberAuthType: '',
		memberPhone: '',
		memberNick: '',
		memberFullName: '',
		memberImage: '',
		memberAddress: '',
		memberDesc: '',
		memberProperties: 0,
		memberRank: 0,
		memberArticles: 0,
		memberPoints: 0,
		memberLikes: 0,
		memberViews: 0,
		memberWarnings: 0,
		memberBlocks: 0,
	});
};
