import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
	TableCell,
	TableHead,
	TableBody,
	TableRow,
	Table,
	TableContainer,
	Button,
	Menu,
	Fade,
	MenuItem,
} from '@mui/material';
import Typography from '@mui/material/Typography';
import { Stack } from '@mui/material';
import { NoticeStatus } from '../../../enums/notice.enum';

interface Data {
	category: string;
	title: string;
	writer: string;
	date: string;
	status: string;
	_id?: string;
}

interface HeadCell {
	disablePadding: boolean;
	id: keyof Data;
	label: string;
	numeric: boolean;
}

const headCells: readonly HeadCell[] = [
	{
		id: 'category',
		numeric: false,
		disablePadding: false,
		label: 'CATEGORY',
	},
	{
		id: 'title',
		numeric: false,
		disablePadding: false,
		label: 'TITLE',
	},
	{
		id: 'writer',
		numeric: false,
		disablePadding: false,
		label: 'WRITER',
	},
	{
		id: 'date',
		numeric: false,
		disablePadding: false,
		label: 'DATE',
	},
	{
		id: 'status',
		numeric: false,
		disablePadding: false,
		label: 'STATUS',
	},
];

interface EnhancedTableProps {
	onRequestSort: (event: React.MouseEvent<unknown>, property: keyof Data) => void;
	orderBy: string;
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

interface FaqArticlesPanelListType {
	dense?: boolean;
	faqList?: any[];
	anchorEl?: any;
	menuIconClickHandler?: any;
	menuIconCloseHandler?: any;
	updateFaqHandler?: any;
	value?: string;
}

export const FaqArticlesPanelList = (props: FaqArticlesPanelListType) => {
	const { faqList = [], anchorEl, menuIconClickHandler, menuIconCloseHandler, updateFaqHandler, value } = props;
	const router = useRouter();

	const filteredList = value === 'ALL' ? faqList : faqList.filter((item) => item.status === value);

	return (
		<Stack>
			<TableContainer>
				<Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size={'medium'}>
					<EnhancedTableHead onRequestSort={() => {}} orderBy={''} />
					<TableBody>
						{filteredList.length === 0 ? (
							<TableRow>
								<TableCell colSpan={5} align="center" sx={{ py: 8 }}>
									<Typography variant="body1" sx={{ color: '#94a3b8' }}>
										No FAQ articles found
									</Typography>
								</TableCell>
							</TableRow>
						) : (
							filteredList.map((faq: any, index: number) => {
								const isDeleted = faq.status === NoticeStatus.DELETE;

								return (
									<TableRow
										hover
										key={faq._id || index}
										sx={{
											'&:last-child td, &:last-child th': { border: 0 },
											opacity: isDeleted ? 0.6 : 1,
											background: isDeleted ? 'rgba(239, 68, 68, 0.02)' : 'transparent',
										}}
										className={isDeleted ? 'deleted-row' : ''}
									>
										<TableCell align="center">
											<Typography
												sx={{
													color: '#667eea',
													fontWeight: 700,
													fontSize: '13px',
													textTransform: 'uppercase',
													letterSpacing: '0.5px',
												}}
											>
												{faq.category}
											</Typography>
										</TableCell>
										<TableCell align="left">
											<Typography
												sx={{
													color: isDeleted ? '#94a3b8' : '#1e293b',
													fontWeight: 600,
													cursor: 'pointer',
													'&:hover': {
														color: '#667eea',
													},
												}}
												onClick={() => router.push(`/_admin/cs/faq_detail?id=${faq._id}`)}
											>
												{faq.title}
											</Typography>
										</TableCell>
										<TableCell align="center">
											<Typography
												sx={{
													color: '#475569',
													fontWeight: 600,
													fontSize: '14px',
												}}
											>
												{faq.writer}
											</Typography>
										</TableCell>
										<TableCell align="center">
											<Typography
												sx={{
													color: '#64748b',
													fontSize: '13px',
													fontFamily: 'monospace',
												}}
											>
												{faq.date}
											</Typography>
										</TableCell>
										<TableCell align="center">
											{faq.status === NoticeStatus.DELETE ? (
												<Button className={'badge badge-deleted'}>Deleted</Button>
											) : (
												<>
													<Button
														onClick={(e: any) => menuIconClickHandler && menuIconClickHandler(e, index)}
														className={`badge badge-${faq.status.toLowerCase()}`}
													>
														{faq.status}
													</Button>
													<Menu
														className={'menu-modal'}
														MenuListProps={{ 'aria-labelledby': 'fade-button' }}
														anchorEl={anchorEl && anchorEl[index]}
														open={Boolean(anchorEl && anchorEl[index])}
														onClose={menuIconCloseHandler}
														TransitionComponent={Fade}
														sx={{ p: 1 }}
													>
														{Object.values(NoticeStatus)
															.filter((ele: string) => ele !== faq.status)
															.map((status: string) => (
																<MenuItem
																	onClick={() =>
																		updateFaqHandler && updateFaqHandler({ _id: faq._id, status: status })
																	}
																	key={status}
																>
																	<Typography variant={'subtitle1'} component={'span'}>
																		{status === NoticeStatus.DELETE ? 'Deleted' : status}
																	</Typography>
																</MenuItem>
															))}
													</Menu>
												</>
											)}
										</TableCell>
									</TableRow>
								);
							})
						)}
					</TableBody>
				</Table>
			</TableContainer>
		</Stack>
	);
};
