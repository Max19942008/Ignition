import React, { useState } from 'react';
import { useRouter } from 'next/router';
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
	Box,
	Checkbox,
	Toolbar,
	IconButton,
	Tooltip,
} from '@mui/material';
import Typography from '@mui/material/Typography';
import { Stack } from '@mui/material';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { NotePencil } from 'phosphor-react';
import { NoticeStatus } from '../../../enums/notice.enum';

interface Data {
	category: string;
	title: string;
	_id: string;
	writer: string;
	date: string;
	view: number;
	status: string;
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
		id: '_id',
		numeric: false,
		disablePadding: false,
		label: 'ID',
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
		id: 'view',
		numeric: true,
		disablePadding: false,
		label: 'VIEWS',
	},
	{
		id: 'status',
		numeric: false,
		disablePadding: false,
		label: 'STATUS',
	},
	{
		id: 'status',
		numeric: false,
		disablePadding: false,
		label: 'ACTION',
	},
];

interface NoticeListType {
	dense?: boolean;
	noticeList?: any[];
	anchorEl?: any;
	menuIconClickHandler?: any;
	menuIconCloseHandler?: any;
	updateNoticeHandler?: any;
	deleteNoticeHandler?: any;
	selected?: string[];
	handleSelectAllClick?: any;
	handleClick?: any;
	isSelected?: any;
}

export const NoticeList = (props: NoticeListType) => {
	const {
		noticeList = [],
		anchorEl,
		menuIconClickHandler,
		menuIconCloseHandler,
		updateNoticeHandler,
		deleteNoticeHandler,
		selected = [],
		handleSelectAllClick,
		handleClick,
		isSelected,
	} = props;
	const router = useRouter();

	const numSelected = selected.length;
	const rowCount = noticeList.length;

	return (
		<Stack>
			{numSelected > 0 ? (
				<Toolbar
					sx={{
						pl: { sm: 2 },
						pr: { xs: 1, sm: 1 },
						background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
						borderRadius: '8px',
						margin: '16px 0',
					}}
				>
					<Box component={'div'} sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
						<Box component={'div'} className="flex_box">
							<Checkbox
								color="primary"
								indeterminate={numSelected > 0 && numSelected < rowCount}
								checked={rowCount > 0 && numSelected === rowCount}
								onChange={handleSelectAllClick}
								inputProps={{
									'aria-label': 'select all',
								}}
							/>
							<Typography sx={{ flex: '1 1 100%' }} color="inherit" variant="h6" component="div">
								{numSelected} selected
							</Typography>
						</Box>
						<Button
							variant={'text'}
							size={'large'}
							onClick={() => {
								// TODO: Implement bulk delete
								console.log('Bulk delete:', selected);
							}}
							sx={{
								color: '#ef4444',
								'&:hover': {
									background: 'rgba(239, 68, 68, 0.1)',
								},
							}}
						>
							Delete
						</Button>
					</Box>
				</Toolbar>
			) : null}
			<TableContainer>
				<Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size={'medium'}>
					<TableHead>
						<TableRow>
							<TableCell padding="checkbox">
								<Checkbox
									color="primary"
									indeterminate={numSelected > 0 && numSelected < rowCount}
									checked={rowCount > 0 && numSelected === rowCount}
									onChange={handleSelectAllClick}
									inputProps={{
										'aria-label': 'select all',
									}}
								/>
							</TableCell>
							{headCells.map((headCell) => (
								<TableCell
									key={headCell.id}
									align={headCell.numeric ? 'right' : 'left'}
									padding={headCell.disablePadding ? 'none' : 'normal'}
								>
									{headCell.label}
								</TableCell>
							))}
						</TableRow>
					</TableHead>
					<TableBody>
						{noticeList.length === 0 ? (
							<TableRow>
								<TableCell colSpan={9} align="center" sx={{ py: 8 }}>
									<Typography variant="body1" sx={{ color: '#94a3b8' }}>
										No notices found
									</Typography>
								</TableCell>
							</TableRow>
						) : (
							noticeList.map((notice: any, index: number) => {
								const isItemSelected = isSelected && isSelected(notice._id);
								const isDeleted = notice.status === NoticeStatus.DELETE;

								return (
									<TableRow
										hover
										key={notice._id || index}
										sx={{
											'&:last-child td, &:last-child th': { border: 0 },
											opacity: isDeleted ? 0.6 : 1,
											background: isDeleted ? 'rgba(239, 68, 68, 0.02)' : 'transparent',
										}}
										className={isDeleted ? 'deleted-row' : ''}
									>
										<TableCell padding="checkbox">
											<Checkbox
												color="primary"
												checked={isItemSelected}
												onClick={(event) => handleClick && handleClick(event, notice._id)}
												inputProps={{
													'aria-labelledby': `enhanced-table-checkbox-${index}`,
												}}
											/>
										</TableCell>
										<TableCell align="left">
											<Typography
												sx={{
													color: '#667eea',
													fontWeight: 700,
													fontSize: '13px',
													textTransform: 'uppercase',
													letterSpacing: '0.5px',
												}}
											>
												{notice.category}
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
												onClick={() => router.push(`/_admin/cs/notice_detail?id=${notice._id}`)}
											>
												{notice.title}
											</Typography>
										</TableCell>
										<TableCell align="left">
											<Typography
												sx={{
													color: '#3b82f6',
													fontSize: '13px',
													fontFamily: 'monospace',
													fontWeight: 600,
												}}
											>
												{notice._id}
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
												{notice.writer}
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
												{notice.date}
											</Typography>
										</TableCell>
										<TableCell align="right">
											<Typography
												sx={{
													color: '#10b981',
													fontWeight: 700,
													fontSize: '14px',
												}}
											>
												{notice.view?.toLocaleString() || 0}
											</Typography>
										</TableCell>
										<TableCell align="center">
											{notice.status === NoticeStatus.DELETE ? (
												<Button className={'badge badge-deleted'}>Deleted</Button>
											) : (
												<>
													<Button
														onClick={(e: any) => menuIconClickHandler && menuIconClickHandler(e, index)}
														className={`badge badge-${notice.status.toLowerCase()}`}
													>
														{notice.status}
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
															.filter((ele: string) => ele !== notice.status)
															.map((status: string) => (
																<MenuItem
																	onClick={() =>
																		updateNoticeHandler && updateNoticeHandler({ _id: notice._id, status: status })
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
										<TableCell align="right">
											<Tooltip title="Delete">
												<IconButton
													onClick={() => deleteNoticeHandler && deleteNoticeHandler(notice._id)}
													sx={{
														color: '#ef4444',
														'&:hover': {
															background: 'rgba(239, 68, 68, 0.1)',
														},
													}}
												>
													<DeleteRoundedIcon />
												</IconButton>
											</Tooltip>
											<Tooltip title="Edit">
												<IconButton
													onClick={() => router.push(`/_admin/cs/notice_create?id=${notice._id}`)}
													sx={{
														color: '#667eea',
														'&:hover': {
															background: 'rgba(102, 126, 234, 0.1)',
														},
													}}
												>
													<NotePencil size={24} weight="fill" />
												</IconButton>
											</Tooltip>
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
