import React from 'react';
import { useRouter } from 'next/router';
import { Stack, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import PhoneIcon from '@mui/icons-material/Phone';
import StarIcon from '@mui/icons-material/Star';
import { Member } from '../../types/member/member';

interface TopAgentProps {
	agent: Member;
}
const TopAgentCard = (props: TopAgentProps) => {
	const { agent } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const agentImage = agent?.memberImage
		? `${process.env.REACT_APP_API_URL}/${agent?.memberImage}`
		: '/img/profile/defaultUser.svg';

	const goToProfile = () => {
		router.push({
			pathname: '/member',
			query: { memberId: agent?._id },
		});
	};

	/** HANDLERS **/

	if (device === 'mobile') {
		return (
			<Stack className="top-agent-card" onClick={goToProfile}>
				<Box className="image-wrapper">
					<img src={agentImage} alt="" />
					<Box className="rank-badge">
						<StarIcon />
						<span>{agent?.memberRank?.toFixed(1) || '5.0'}</span>
					</Box>
				</Box>
				<strong>{agent?.memberNick}</strong>
				<span className="member-type">{agent?.memberType}</span>
				{agent?.memberPhone && (
					<Box className="phone-box">
						<PhoneIcon />
						<span>{agent.memberPhone}</span>
					</Box>
				)}
			</Stack>
		);
	} else {
		return (
			<Stack className="top-agent-card" onClick={goToProfile}>
				<Box className="image-wrapper">
					<img src={agentImage} alt="" />
					<Box className="rank-badge">
						<StarIcon />
						<span>{agent?.memberRank?.toFixed(1) || '5.0'}</span>
					</Box>
				</Box>
				<strong>{agent?.memberNick}</strong>
				<span className="member-type">{agent?.memberType}</span>
				{agent?.memberPhone && (
					<Box className="phone-box">
						<PhoneIcon />
						<span>{agent.memberPhone}</span>
					</Box>
				)}
			</Stack>
		);
	}
};

export default TopAgentCard;
