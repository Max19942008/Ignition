import React from 'react';
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
} from '@mui/material';
import Typography from '@mui/material/Typography';
import { Stack } from '@mui/material';

interface Data {
	category: string;
	qna_case_status: string;
	title: string;
	writer: string;
	date: string;
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
		id: 'qna_case_status',
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

interface InquiryPanelListType {
	dense?: boolean;
	inquiryList?: any[];
	anchorEl?: any;
	menuIconClickHandler?: any;
	menuIconCloseHandler?: any;
	updateInquiryHandler?: any;
	value?: string;
}

const statusColors: { [key: string]: string } = {
	PENDING: '#f59e0b',
	RESPONDED: '#3b82f6',
	RESOLVED: '#10b981',
	CLOSED: '#64748b',
};

const statusLabels: { [key: string]: string } = {
	PENDING: 'Pending',
	RESPONDED: 'Responded',
	RESOLVED: 'Resolved',
	CLOSED: 'Closed',
};

export const InquiryList = (props: InquiryPanelListType) => {
	const { inquiryList = [], anchorEl, menuIconClickHandler, menuIconCloseHandler, updateInquiryHandler, value } = props;
	const router = useRouter();

	return (
		<Stack>
			<TableContainer>
				<Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size={'medium'}>
					<EnhancedTableHead onRequestSort={() => {}} orderBy={''} />
					<TableBody>
						{inquiryList.length === 0 ? (
							<TableRow>
								<TableCell colSpan={5} align="center" sx={{ py: 8 }}>
									<Typography variant="body1" sx={{ color: '#94a3b8' }}>
										No inquiries found
									</Typography>
								</TableCell>
							</TableRow>
						) : (
							inquiryList.map((inquiry: any, index: number) => {
								const statusColor = statusColors[inquiry.qna_case_status] || '#64748b';
								const statusLabel = statusLabels[inquiry.qna_case_status] || inquiry.qna_case_status;

								return (
									<TableRow
										hover
										key={inquiry._id || index}
										sx={{
											'&:last-child td, &:last-child th': { border: 0 },
											cursor: 'pointer',
											'&:hover': {
												background: 'rgba(102, 126, 234, 0.03)',
											},
										}}
										onClick={() => router.push(`/_admin/cs/inquiry_detail?id=${inquiry._id}`)}
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
												{inquiry.category}
											</Typography>
										</TableCell>
										<TableCell align="left">
											<Typography
												sx={{
													color: '#1e293b',
													fontWeight: 600,
													'&:hover': {
														color: '#667eea',
													},
												}}
											>
												{inquiry.title}
											</Typography>
										</TableCell>
										<TableCell align="center">
											<Typography
												sx={{
													color: '#3b82f6',
													fontWeight: 600,
													fontSize: '14px',
												}}
											>
												{inquiry.writer}
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
												{inquiry.date}
											</Typography>
										</TableCell>
										<TableCell align="center">
											<Button
												onClick={(e: any) => {
													e.stopPropagation();
													menuIconClickHandler && menuIconClickHandler(e, index);
												}}
												sx={{
													background: `linear-gradient(135deg, ${statusColor} 0%, ${statusColor}dd 100%)`,
													color: '#fff',
													fontWeight: 700,
													fontSize: '12px',
													padding: '6px 16px',
													borderRadius: '20px',
													textTransform: 'uppercase',
													letterSpacing: '0.5px',
													boxShadow: `0 4px 12px ${statusColor}40`,
													'&:hover': {
														background: `linear-gradient(135deg, ${statusColor}dd 0%, ${statusColor}bb 100%)`,
														transform: 'translateY(-2px)',
														boxShadow: `0 6px 16px ${statusColor}60`,
													},
													transition: 'all 0.3s ease',
												}}
											>
												{statusLabel}
											</Button>
											<Menu
												className={'menu-modal'}
												MenuListProps={{ 'aria-labelledby': 'fade-button' }}
												anchorEl={anchorEl && anchorEl[index]}
												open={Boolean(anchorEl && anchorEl[index])}
												onClose={(e) => {
													e?.stopPropagation();
													menuIconCloseHandler();
												}}
												TransitionComponent={Fade}
												sx={{ p: 1 }}
											>
												{Object.keys(statusLabels).map((status: string) => (
													<MenuItem
														onClick={(e) => {
															e.stopPropagation();
															updateInquiryHandler && updateInquiryHandler({ _id: inquiry._id, qna_case_status: status });
														}}
														key={status}
													>
														<Typography variant={'subtitle1'} component={'span'}>
															{statusLabels[status]}
														</Typography>
													</MenuItem>
												))}
											</Menu>
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
