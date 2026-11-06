import { socketVar } from '../apollo/store';
import { getJwtToken } from './auth';

/**
 * The one live-chat WebSocket for the whole tab.
 *
 * Reconnects with backoff when the connection drops (a Render deploy, or the free
 * instance waking up), and reconnects with the new token when the user logs in or
 * out, so the chat knows who is talking without a page reload.
 */
let socket: WebSocket | null = null;
let connectedToken: string | null = null;
let retries = 0;
let retryTimer: ReturnType<typeof setTimeout> | undefined;

const wsUrl = () => process.env.REACT_APP_API_WS ?? 'ws://127.0.0.1:3007';

const open = () => {
	clearTimeout(retryTimer);
	if (socket) {
		socket.onclose = null;
		socket.close();
	}

	const token = getJwtToken() ?? '';
	connectedToken = token;
	const ws = new WebSocket(token ? `${wsUrl()}?token=${encodeURIComponent(token)}` : wsUrl());
	socket = ws;
	socketVar(ws);

	ws.onopen = () => {
		retries = 0;
	};
	ws.onclose = () => {
		if (socket !== ws) return; // replaced on purpose
		const delay = Math.min(30_000, 1_000 * 2 ** retries++);
		retryTimer = setTimeout(open, delay);
	};
};

/** Opens the chat socket if needed; reopens it when the logged-in user changed. */
export const ensureChatSocket = () => {
	if (typeof window === 'undefined') return;
	const token = getJwtToken() ?? '';
	const alive = socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING);
	if (alive && token === connectedToken) return;
	if (!alive && retryTimer && token === connectedToken) return; // a reconnect is already scheduled
	open();
};
