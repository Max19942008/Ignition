import { setRefreshToken, updateStorage, updateUserInfo } from './index';

const SESSION_KEY = 'googleLoginSession';

/**
 * Login must hit the same backend that issues our tokens, i.e. the GraphQL one.
 * REACT_APP_API_URL can point elsewhere (it serves images), so it is not used here.
 */
const authOrigin = (): string => new URL(`${process.env.REACT_APP_API_GRAPHQL_URL}`).origin;

interface GoogleLoginSession {
	binding: string;
	returnPath: string;
}

/**
 * Only same-origin paths survive. Parsing with URL (instead of string checks)
 * also catches tricks the browser would normalise away, like "/\t/evil.com".
 */
export const toSafeReturnPath = (value: unknown): string => {
	if (typeof value !== 'string' || !value.startsWith('/')) return '/';
	try {
		const url = new URL(value, window.location.origin);
		if (url.origin !== window.location.origin) return '/';
		return `${url.pathname}${url.search}${url.hash}`;
	} catch {
		return '/';
	}
};

const toHex = (bytes: ArrayBuffer | Uint8Array): string =>
	Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, '0')).join('');

/**
 * Google sign-in is a full-page navigation, not an API call: the backend has to
 * set its state cookie on this very request. Before leaving, this tab creates a
 * secret "binding" and sends only its hash; the login code that comes back
 * works only together with the secret, so a code pushed to someone else in a
 * link cannot log them into the wrong account.
 */
export const startGoogleLogin = async (returnPath?: unknown): Promise<void> => {
	const binding = toHex(crypto.getRandomValues(new Uint8Array(32)));
	const bindingHash = toHex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(binding)));

	const session: GoogleLoginSession = { binding, returnPath: toSafeReturnPath(returnPath) };
	try {
		sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
	} catch {
		throw new Error('Please enable browser storage to sign in with Google');
	}

	window.location.assign(`${authOrigin()}/auth/google?binding=${bindingHash}`);
};

/** Reads and forgets this tab's pending login. The path is re-validated: storage is writable by any script. */
export const takeGoogleLoginSession = (): GoogleLoginSession | null => {
	try {
		const raw = sessionStorage.getItem(SESSION_KEY);
		sessionStorage.removeItem(SESSION_KEY);
		const parsed = raw ? JSON.parse(raw) : null;
		if (typeof parsed?.binding !== 'string') return null;
		return { binding: parsed.binding, returnPath: toSafeReturnPath(parsed.returnPath) };
	} catch {
		return null;
	}
};

/**
 * Trades the one-time code (plus this tab's binding) for our own token pair.
 * Plain fetch on purpose: through Apollo, the refresh link could act on a stale
 * token still in storage and log the user out in the middle of logging in.
 */
export const completeGoogleLogin = async (code: string, binding: string): Promise<void> => {
	const res = await fetch(`${process.env.REACT_APP_API_GRAPHQL_URL}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			query: `mutation ExchangeLoginCode($code: String!, $binding: String!) {
				exchangeLoginCode(code: $code, binding: $binding) { accessToken refreshToken }
			}`,
			variables: { code, binding },
		}),
	});

	const json = await res.json();
	const tokens = json?.data?.exchangeLoginCode;
	if (!tokens?.accessToken) throw new Error(json?.errors?.[0]?.message ?? 'Google login failed. Please try again.');

	updateStorage({ jwtToken: tokens.accessToken });
	setRefreshToken(tokens.refreshToken);
	updateUserInfo(tokens.accessToken);
};
