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
	const { jwtToken } = await requestJwtToken({ nick, password });

	if (jwtToken) {
		updateStorage({ jwtToken });
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
}): Promise<{ jwtToken: string }> => {
	const apolloClient = await initializeApollo();

	try {
		const result = await apolloClient.mutate({
			mutation: LOGIN,
			variables: { input: { memberNick: nick, memberPassword: password } },
			fetchPolicy: 'network-only',
		});

		const accessToken = result?.data?.login?.accessToken;
		return { jwtToken: accessToken };
	} catch (err: any) {
		// Do NOT reload the page here — surface the real reason to the caller.
		const message = extractErrorMessage(err);
		console.log('login request err:', message);
		throw new Error(message);
	}
};

export const signUp = async (nick: string, password: string, phone: string, type: string): Promise<void> => {
	const { jwtToken } = await requestSignUpJwtToken({ nick, password, phone, type });

	if (jwtToken) {
		updateStorage({ jwtToken });
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
}): Promise<{ jwtToken: string }> => {
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
		return { jwtToken: accessToken };
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
	deleteStorage();
	deleteUserInfo();
	window.location.reload();
};

const deleteStorage = () => {
	localStorage.removeItem('accessToken');
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
