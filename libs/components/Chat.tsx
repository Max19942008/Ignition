import React, { useEffect, useRef, useState } from 'react';
import { Avatar, Box, Stack } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import MarkChatUnreadIcon from '@mui/icons-material/MarkChatUnread';
import ScrollableFeed from 'react-scrollable-feed';
import { RippleBadge } from '../../scss/MaterialTheme/styled';
import { useReactiveVar } from '@apollo/client';
import { socketVar, userVar } from '../../apollo/store';
import { Messages, REACT_APP_API_URL } from '../config';
import { sweetErrorAlert } from '../sweetAlert';
import { ensureChatSocket } from '../chatSocket';

/** The sender as the server shares it (see moto-hub socket.gateway.ts). */
interface ChatMember {
	_id: string;
	memberNick: string;
	memberImage?: string;
	memberType?: string;
}

interface MessagePayload {
	event: 'message';
	text: string;
	memberData: ChatMember | null;
	createdAt?: string;
}

const MAX_TEXT_LENGTH = 500;

const avatarUrl = (image?: string) => {
	if (!image) return '/img/profile/defaultUser.svg';
	return /^https?:\/\//.test(image) ? image : `${REACT_APP_API_URL}/${image}`;
};

const Chat = () => {
	const [messagesList, setMessagesList] = useState<MessagePayload[]>([]);
	const [onlineUsers, setOnlineUsers] = useState<number>(0);
	const [connected, setConnected] = useState(false);
	const [messageInput, setMessageInput] = useState<string>('');
	const [open, setOpen] = useState(false);
	const user = useReactiveVar(userVar);
	const socket = useReactiveVar(socketVar);
	const inputRef = useRef<HTMLInputElement>(null);

	/** LIFECYCLES **/
	// Connect on mount, and reconnect with the new token after login / logout.
	useEffect(() => {
		ensureChatSocket();
	}, [user?._id]);

	useEffect(() => {
		if (!socket) return;

		const handleMessage = (msg: MessageEvent) => {
			let data: any;
			try {
				data = JSON.parse(msg.data);
			} catch {
				return;
			}

			switch (data.event) {
				case 'info':
					setOnlineUsers(data.totalClients ?? 0);
					break;
				case 'getMessages':
					setMessagesList(data.list ?? []);
					break;
				case 'message':
					setMessagesList((prev) => [...prev, data as MessagePayload]);
					break;
				default:
					break;
			}
		};
		const handleOpen = () => setConnected(true);
		const handleClose = () => setConnected(false);

		setConnected(socket.readyState === WebSocket.OPEN);
		socket.addEventListener('message', handleMessage);
		socket.addEventListener('open', handleOpen);
		socket.addEventListener('close', handleClose);

		return () => {
			socket.removeEventListener('message', handleMessage);
			socket.removeEventListener('open', handleOpen);
			socket.removeEventListener('close', handleClose);
		};
	}, [socket]);

	useEffect(() => {
		if (open) inputRef.current?.focus();
	}, [open]);

	/** HANDLERS **/
	const handleOpenChat = () => {
		setOpen((prevState) => !prevState);
	};

	const sendMessage = () => {
		const text = messageInput.trim();
		if (!text) {
			sweetErrorAlert(Messages.error4);
			return;
		}
		if (!socket || socket.readyState !== WebSocket.OPEN) {
			sweetErrorAlert('Chat is reconnecting, please try again in a moment.');
			return;
		}
		socket.send(JSON.stringify({ event: 'message', data: text.slice(0, MAX_TEXT_LENGTH) }));
		setMessageInput('');
	};

	const getKeyHandler = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') sendMessage();
	};

	return (
		<Stack className="chatting">
			<button className="chat-button" onClick={handleOpenChat} aria-label={open ? 'Close chat' : 'Open chat'}>
				{open ? <CloseFullscreenIcon /> : <MarkChatUnreadIcon />}
			</button>
			<Stack className={`chat-frame ${open ? 'open' : ''}`}>
				<Box className={'chat-top'} component={'div'}>
					<div style={{ fontFamily: 'Nunito' }}>{connected ? 'Online Chat' : 'Connecting…'}</div>
					<RippleBadge style={{ margin: '-18px 0 0 21px' }} badgeContent={onlineUsers} />
				</Box>
				<Box className={'chat-content'} id="chat-content" component={'div'}>
					<ScrollableFeed>
						<Stack className={'chat-main'}>
							<Box flexDirection={'row'} style={{ display: 'flex' }} sx={{ m: '10px 0px' }} component={'div'}>
								<div className={'welcome'}>Welcome to Live chat!</div>
							</Box>
							{messagesList.map((ele: MessagePayload, index: number) => {
								const { text, memberData } = ele;
								const key = `${ele.createdAt ?? ''}-${index}`;
								const isMine = !!user?._id && memberData?._id === user._id;

								return isMine ? (
									<Box
										key={key}
										component={'div'}
										flexDirection={'row'}
										style={{ display: 'flex' }}
										alignItems={'flex-end'}
										justifyContent={'flex-end'}
										sx={{ m: '10px 0px' }}
									>
										<div className={'msg-right'}>{text}</div>
									</Box>
								) : (
									<Box key={key} flexDirection={'row'} style={{ display: 'flex' }} sx={{ m: '10px 0px' }} component={'div'}>
										<Avatar alt={memberData?.memberNick ?? 'Guest'} src={avatarUrl(memberData?.memberImage)} />
										<Stack sx={{ ml: '10px', minWidth: 0 }}>
											<span style={{ fontSize: 12, color: '#6b7280', marginBottom: 2 }}>
												{memberData?.memberNick ?? 'Guest'}
											</span>
											<div className={'msg-left'} style={{ marginLeft: 0 }}>
												{text}
											</div>
										</Stack>
									</Box>
								);
							})}
						</Stack>
					</ScrollableFeed>
				</Box>
				<Box className={'chat-bott'} component={'div'}>
					<input
						ref={inputRef}
						type={'text'}
						name={'message'}
						className={'msg-input'}
						placeholder={'Type message'}
						value={messageInput}
						maxLength={MAX_TEXT_LENGTH}
						onChange={(e) => setMessageInput(e.target.value)}
						onKeyDown={getKeyHandler}
					/>
					<button className={'send-msg-btn'} onClick={sendMessage} aria-label="Send message">
						<SendIcon style={{ color: '#fff' }} />
					</button>
				</Box>
			</Stack>
		</Stack>
	);
};

export default Chat;
