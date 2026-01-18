import React from 'react';
import Link from 'next/link';
import {
	Box,
	Button,
	Fade,
	Menu,
	MenuItem,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Tooltip,
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import OpenInBrowserRoundedIcon from '@mui/icons-material/OpenInBrowserRounded';
import Moment from 'react-moment';
import { BoardArticle } from '../../../types/board-article/board-article';
import { REACT_APP_API_URL } from '../../../config';
import DeleteIcon from '@mui/icons-material/Delete';
import Typography from '@mui/material/Typography';
import { BoardArticleStatus } from '../../../enums/board-article.enum';

interface Data {
	category: string;
	title: string;
	writer: string;
	register: string;
	view: number;
	like: number;
	status: string;
	article_id: string;
}

interface HeadCell {
	disablePadding: boolean;
	id: keyof Data;
	label: string;
	numeric: boolean;
}

const headCells: readonly HeadCell[] = [
	{
		id: 'article_id',
		numeric: true,
		disablePadding: false,
		label: 'ARTICLE ID',
	},
	{
		id: 'title',
		numeric: true,
		disablePadding: false,
		label: 'TITLE',
	},
	{
		id: 'category',
		numeric: true,
		disablePadding: false,
		label: 'CATEGORY',
	},
	{
		id: 'writer',
		numeric: true,
		disablePadding: false,
		label: 'WRITER',
	},
	{
		id: 'view',
		numeric: false,
		disablePadding: false,
		label: 'VIEW',
	},
	{
		id: 'like',
		numeric: false,
		disablePadding: false,
		label: 'LIKE',
	},
	{
		id: 'register',
		numeric: true,
		disablePadding: false,
		label: 'REGISTER DATE',
	},
	{
		id: 'status',
		numeric: false,
		disablePadding: false,
		label: 'STATUS',
	},
];

interface EnhancedTableProps {
	numSelected: number;
	onRequestSort: (event: React.MouseEvent<unknown>, property: keyof Data) => void;
	onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
	rowCount: number;
}

function EnhancedTableHead(props: EnhancedTableProps) {
	return (
		<TableHead>
			<TableRow>
				{headCells.map((headCell) => (
					<TableCell
						key={headCell.id}
						align={headCell.numeric ? 'left' : 'center'}
						padding={headCell.disablePadding ? 'none' : 'normal'}
					>
						{headCell.label}
					</TableCell>
				))}
			</TableRow>
		</TableHead>
	);
}

interface CommunityArticleListProps {
	articles: BoardArticle[];
	anchorEl: any;
	menuIconClickHandler: any;
	menuIconCloseHandler: any;
	updateArticleHandler: any;
	removeArticleHandler: any;
}

const CommunityArticleList = (props: CommunityArticleListProps) => {
	const { articles, anchorEl, menuIconClickHandler, menuIconCloseHandler, updateArticleHandler, removeArticleHandler } =
		props;

	return (
		<Stack>
			<TableContainer>
				<Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size={'medium'}>
					{/*@ts-ignore*/}
					<EnhancedTableHead />
					<TableBody>
						{articles.length === 0 && (
							<TableRow>
								<TableCell align="center" colSpan={8}>
									<span className={'no-data'}>data not found!</span>
								</TableCell>
							</TableRow>
						)}

						{articles.length !== 0 &&
							articles.map((article: BoardArticle, index: number) => {
								const isDeleted = article.articleStatus === BoardArticleStatus.DELETE;
								return (
									<TableRow 
										hover 
										key={article._id} 
										className={isDeleted ? 'article-row-deleted' : ''}
										sx={{ 
											'&:last-child td, &:last-child th': { border: 0 },
											backgroundColor: isDeleted ? 'rgba(239, 68, 68, 0.05)' : 'transparent',
											'&:hover': {
												backgroundColor: isDeleted ? 'rgba(239, 68, 68, 0.1)' : 'rgba(0, 0, 0, 0.04)',
											}
										}}
									>
										<TableCell align="left" className="article-id">{article._id}</TableCell>
										<TableCell align="left" className="article-title-cell">
											<Box component={'div'} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
												<span className="article-title">{article.articleTitle}</span>
												<Link
													href={`/community/detail?articleCategory=${article.articleCategory}&id=${article._id}`}
													className={'img_box'}
												>
													<IconButton className="btn_window">
														<Tooltip title={'Open window'}>
															<OpenInBrowserRoundedIcon />
														</Tooltip>
													</IconButton>
												</Link>
											</Box>
										</TableCell>
										<TableCell align="left" className="article-category">{article.articleCategory}</TableCell>
										<TableCell align="left" className={'name'}>
											<Link href={`/member?memberId=${article?.memberData?._id}`}>
												<Avatar
													alt="Remy Sharp"
													src={
														article?.memberData?.memberImage
															? `${REACT_APP_API_URL}/${article?.memberData?.memberImage}`
															: `/img/profile/defaultUser.svg`
													}
													sx={{ ml: '2px', mr: '10px' }}
												/>
												<span className="article-writer">{article?.memberData?.memberNick}</span>
											</Link>
										</TableCell>
										<TableCell align="center" className="article-views">{article?.articleViews}</TableCell>
										<TableCell align="center" className="article-likes">{article?.articleLikes}</TableCell>
										<TableCell align="left" className="article-date">
											<Moment format={'DD.MM.YY HH:mm'}>{article?.createdAt}</Moment>
										</TableCell>
										<TableCell align="center">
											{article.articleStatus === BoardArticleStatus.DELETE ? (
												<>
													<Button
														className={'badge article-status-deleted'}
														sx={{ mr: 1 }}
													>
														Deleted
													</Button>
													<Button
														variant="outlined"
														className="delete-button"
														sx={{ p: '3px', border: 'none', ':hover': { border: '1px solid #ef4444' } }}
														onClick={() => removeArticleHandler(article._id)}
													>
														<DeleteIcon fontSize="small" />
													</Button>
												</>
											) : (
												<>
													<Button onClick={(e: any) => menuIconClickHandler(e, index)} className={'badge article-status-active'}>
														{article.articleStatus}
													</Button>

													<Menu
														className={'menu-modal'}
														MenuListProps={{
															'aria-labelledby': 'fade-button',
														}}
														anchorEl={anchorEl[index]}
														open={Boolean(anchorEl[index])}
														onClose={menuIconCloseHandler}
														TransitionComponent={Fade}
														sx={{ p: 1 }}
													>
														{Object.values(BoardArticleStatus)
															.filter((ele) => ele !== article.articleStatus)
															.map((status: string) => (
																<MenuItem
																	onClick={() => updateArticleHandler({ _id: article._id, articleStatus: status })}
																	key={status}
																>
																	<Typography variant={'subtitle1'} component={'span'}>
																		{status === BoardArticleStatus.DELETE ? 'Deleted' : status}
																	</Typography>
																</MenuItem>
															))}
													</Menu>
												</>
											)}
										</TableCell>
									</TableRow>
								);
							})}
					</TableBody>
				</Table>
			</TableContainer>
		</Stack>
	);
};

export default CommunityArticleList;
