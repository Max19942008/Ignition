import React from 'react';
import Link from 'next/link';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Box } from '@mui/material';
import Moment from 'react-moment';
import { BoardArticle } from '../../types/board-article/board-article';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import PersonIcon from '@mui/icons-material/Person';

interface CommunityCardProps {
	vertical: boolean;
	article: BoardArticle;
	index: number;
}

const CommunityCard = (props: CommunityCardProps) => {
	const { vertical, article, index } = props;
	const device = useDeviceDetect();
	const articleImage = article?.articleImage
		? `${process.env.REACT_APP_API_URL}/${article?.articleImage}`
		: '/img/event.svg';
	const memberNick = article?.memberData?.memberNick || 'Anonymous';
	const isLiked = article?.meLiked && article?.meLiked[0]?.myFavorite;

	if (device === 'mobile') {
		return <div>COMMUNITY CARD (MOBILE)</div>;
	} else {
		if (vertical) {
			return (
				<Link href={`/community/detail?articleCategory=${article?.articleCategory}&id=${article?._id}`}>
					<Box component={'div'} className={'vertical-card'}>
						<div className={'community-img'} style={{ backgroundImage: `url(${articleImage})` }}>
							<div className={'rank-badge'}>{index + 1}</div>
						</div>
						<div className={'card-content'}>
							<strong>{article?.articleTitle}</strong>
							<div className={'author-info'}>
								<PersonIcon className={'author-icon'} />
								<span className={'author-name'}>{memberNick}</span>
							</div>
							<div className={'card-footer'}>
								<div className={'meta-info'}>
									<div className={'meta-item'}>
										<VisibilityIcon />
										<span>{article?.articleViews || 0}</span>
									</div>
									<div className={'meta-item'}>
										{isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
										<span>{article?.articleLikes || 0}</span>
									</div>
									<div className={'meta-item'}>
										<ChatBubbleOutlineIcon />
										<span>{article?.articleComments || 0}</span>
									</div>
								</div>
								<div className={'date-info'}>
									<Moment format="MMM DD" className={'date-text'}>
										{article?.createdAt}
									</Moment>
								</div>
							</div>
						</div>
					</Box>
				</Link>
			);
		} else {
			return (
				<Link href={`/community/detail?articleCategory=${article?.articleCategory}&id=${article?._id}`}>
					<Box component={'div'} className="horizontal-card">
						<img src={articleImage} alt="" />
						<div className={'card-content-horizontal'}>
							<strong>{article.articleTitle}</strong>
							<div className={'card-meta'}>
								<div className={'author-row'}>
									<PersonIcon className={'author-icon-small'} />
									<span className={'author-name-small'}>{memberNick}</span>
								</div>
								<div className={'stats-row'}>
									<div className={'stat-item'}>
										<VisibilityIcon />
										<span>{article?.articleViews || 0}</span>
									</div>
									<div className={'stat-item'}>
										{isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
										<span>{article?.articleLikes || 0}</span>
									</div>
									<div className={'stat-item'}>
										<ChatBubbleOutlineIcon />
										<span>{article?.articleComments || 0}</span>
									</div>
								</div>
								<span className={'date-text-horizontal'}>
									<Moment format="MMM DD, YYYY">{article?.createdAt}</Moment>
								</span>
							</div>
						</div>
					</Box>
				</Link>
			);
		}
	}
};

export default CommunityCard;
