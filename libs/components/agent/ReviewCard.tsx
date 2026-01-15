import React from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Stack, Box, Typography } from '@mui/material';
import { Comment } from '../../types/comment/comment';
import Moment from 'react-moment';
import { REACT_APP_API_URL } from '../../config';

interface ReviewCardProps {
	fromMyPage?: string;
	comment: Comment;
}
const ReviewCard = (props: ReviewCardProps) => {
	const { fromMyPage, comment } = props;
	const device = useDeviceDetect();
	const imagePath: string = comment?.memberData?.memberImage
		? `${REACT_APP_API_URL}/${comment?.memberData?.memberImage}`
		: '/img/profile/defaultUser.svg';

	if (device === 'mobile') {
		return <div>REVIEW CARD</div>;
	} else {
		return (
			<Box component={'div'} className={'review-card'}>
				<div className={'info'}>
					<div className={'left'}>
						<img className='left-img' style={{width: '60px', height: '59px'}} src={imagePath} alt="" />
						<div>
							<strong>{comment.memberData?.memberNick}</strong>
							<span>
								<Moment format={'DD MMMM'}>{comment.createdAt}</Moment>
							</span>
						</div>
					</div>
				</div>
				<p>{comment.commentContent}</p>
				{fromMyPage && (
					<Stack className="reply-button-box">
				
						<Typography className="reply-text">Reply</Typography>
					</Stack>
				)}
			</Box>
		);
	}
};

export default ReviewCard;
