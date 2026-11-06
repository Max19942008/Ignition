import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useMutation } from '@apollo/client';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import { ASK_ASSISTANT } from '../../apollo/user/mutation';
import { REACT_APP_API_URL } from '../config';

interface AiSource {
	sourceType: 'PROPERTY' | 'PART' | 'ARTICLE';
	sourceId: string;
	title: string;
	subtitle?: string;
	price?: number;
	currency?: string;
	image?: string;
	articleCategory?: string;
}

interface Turn {
	role: 'user' | 'assistant';
	content: string;
	sources?: AiSource[];
	error?: boolean;
}

const SUGGESTIONS = [
	'Toshkentda 5000$ gacha Honda bormi?',
	'Yamaha uchun tormoz kolodkasi kerak',
	'Best beginner bike under 400cc?',
];

const imageUrl = (image?: string) => {
	if (!image) return '/img/banner/header1.svg';
	return /^https?:\/\//.test(image) ? image : `${REACT_APP_API_URL}/${image}`;
};

const sourceHref = (s: AiSource) => {
	if (s.sourceType === 'PROPERTY') return `/property/detail?id=${s.sourceId}`;
	if (s.sourceType === 'PART') return `/part/detail?id=${s.sourceId}`;
	return `/community/detail?articleCategory=${s.articleCategory}&id=${s.sourceId}`;
};

const formatPrice = (price?: number, currency?: string) =>
	price == null ? '' : `${price.toLocaleString()} ${currency === 'USD' || !currency ? '$' : currency}`;

const AiAssistant = () => {
	const [open, setOpen] = useState(false);
	const [turns, setTurns] = useState<Turn[]>([]);
	const [input, setInput] = useState('');
	const [askAssistant, { loading }] = useMutation(ASK_ASSISTANT);
	const bottomRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [turns, loading]);

	const send = async (text: string) => {
		const message = text.trim();
		if (!message || loading) return;
		setInput('');

		// History sent to the server: successful turns only, without the card data.
		const history = turns.filter((t) => !t.error).map(({ role, content }) => ({ role, content }));
		setTurns((prev) => [...prev, { role: 'user', content: message }]);

		try {
			const { data } = await askAssistant({ variables: { input: { message, history } } });
			const { answer, sources } = data.askAssistant;
			setTurns((prev) => [...prev, { role: 'assistant', content: answer, sources }]);
		} catch (err: any) {
			setTurns((prev) => [
				...prev,
				{ role: 'assistant', content: err?.message || 'Something went wrong, please try again.', error: true },
			]);
		}
	};

	return (
		<div className="ai-assistant">
			{!open && (
				<button className="ai-fab" onClick={() => setOpen(true)} aria-label="Open MotoHub Assistant">
					<SmartToyOutlinedIcon />
					<span>AI Assistant</span>
				</button>
			)}

			{open && (
				<div className="ai-panel" role="dialog" aria-label="MotoHub Assistant">
					<div className="ai-header">
						<div>
							<strong>MotoHub Assistant</strong>
							<small>Finds bikes, parts & accessories for you</small>
						</div>
						<button onClick={() => setOpen(false)} aria-label="Close">
							<CloseIcon fontSize="small" />
						</button>
					</div>

					<div className="ai-body">
						{turns.length === 0 && (
							<div className="ai-empty">
								<p>Ask in Uzbek, Russian or English — I search MotoHub listings for you.</p>
								{SUGGESTIONS.map((s) => (
									<button key={s} className="ai-chip" onClick={() => send(s)}>
										{s}
									</button>
								))}
							</div>
						)}

						{turns.map((t, i) => (
							<div key={i} className={`ai-turn ${t.role} ${t.error ? 'error' : ''}`}>
								<div className="ai-bubble">{t.content}</div>
								{!!t.sources?.length && (
									<div className="ai-sources">
										{t.sources.map((s, n) => (
											<Link key={s.sourceId} href={sourceHref(s)} className="ai-card">
												<img src={imageUrl(s.image)} alt="" />
												<div>
													<span className="ai-card-title">
														[{n + 1}] {s.title}
													</span>
													{s.subtitle && <span className="ai-card-sub">{s.subtitle}</span>}
													{s.price != null && <span className="ai-card-price">{formatPrice(s.price, s.currency)}</span>}
												</div>
											</Link>
										))}
									</div>
								)}
							</div>
						))}

						{loading && (
							<div className="ai-turn assistant">
								<div className="ai-bubble ai-typing">
									<span />
									<span />
									<span />
								</div>
							</div>
						)}
						<div ref={bottomRef} />
					</div>

					<form
						className="ai-input"
						onSubmit={(e) => {
							e.preventDefault();
							send(input);
						}}
					>
						<input
							value={input}
							onChange={(e) => setInput(e.target.value)}
							placeholder="Ask about bikes or parts…"
							maxLength={1000}
						/>
						<button type="submit" disabled={loading || !input.trim()} aria-label="Send">
							<SendIcon fontSize="small" />
						</button>
					</form>
				</div>
			)}
		</div>
	);
};

export default AiAssistant;
