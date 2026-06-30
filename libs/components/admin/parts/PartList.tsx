import React from 'react';
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
import Avatar from '@mui/material/Avatar';
import { Stack } from '@mui/material';
import { Part } from '../../../types/part/part';
import { REACT_APP_API_URL } from '../../../config';
import DeleteIcon from '@mui/icons-material/Delete';
import Typography from '@mui/material/Typography';
import { PartStatus } from '../../../enums/part.enum';

interface Data {
	id: string;
	title: string;
	price: string;
	agent: string;
	category: string;
	type: string;
	status: string;
}

interface HeadCell {
	disablePadding: boolean;
	id: keyof Data;
	label: string;
	numeric: boolean;
}

const headCells: readonly HeadCell[] = [
	{ id: 'id', numeric: true, disablePadding: false, label: 'MB ID' },
	{ id: 'title', numeric: true, disablePadding: false, label: 'TITLE' },
	{ id: 'price', numeric: false, disablePadding: false, label: 'PRICE' },
	{ id: 'agent', numeric: false, disablePadding: false, label: 'AGENT' },
	{ id: 'category', numeric: false, disablePadding: false, label: 'CATEGORY' },
	{ id: 'type', numeric: false, disablePadding: false, label: 'TYPE' },
	{ id: 'status', numeric: false, disablePadding: false, label: 'STATUS' },
];

function EnhancedTableHead() {
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

interface PartPanelListType {
	parts: Part[];
	anchorEl: any;
	menuIconClickHandler: any;
	menuIconCloseHandler: any;
	updatePartHandler: any;
	removePartHandler: any;
}

export const PartPanelList = (props: PartPanelListType) => {
	const { parts, anchorEl, menuIconClickHandler, menuIconCloseHandler, updatePartHandler, removePartHandler } = props;

	return (
		<Stack>
			<TableContainer>
				<Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size={'medium'}>
					<EnhancedTableHead />
					<TableBody>
						{parts.length === 0 && (
							<TableRow>
								<TableCell align="center" colSpan={8}>
									<span className={'no-data'}>data not found!</span>
								</TableCell>
							</TableRow>
						)}

						{parts.length !== 0 &&
							parts.map((part: Part, index: number) => {
								const partImage = `${REACT_APP_API_URL}/${part?.partImages[0]}`;
								const isDeleted = part.partStatus === PartStatus.DELETE;

								return (
									<TableRow
										hover
										key={part?._id}
										className={isDeleted ? 'property-row-deleted' : ''}
										sx={{
											'&:last-child td, &:last-child th': { border: 0 },
											backgroundColor: isDeleted ? 'rgba(239, 68, 68, 0.05)' : 'transparent',
											'&:hover': {
												backgroundColor: isDeleted ? 'rgba(239, 68, 68, 0.1)' : 'rgba(0, 0, 0, 0.04)',
											},
										}}
									>
										<TableCell align="left" className="property-id">
											{part._id}
										</TableCell>
										<TableCell align="left" className={'name'}>
											<Stack direction={'row'}>
												<Link href={`/part/detail?id=${part?._id}`}>
													<div>
														<Avatar alt="part" src={partImage} sx={{ ml: '2px', mr: '10px' }} />
													</div>
												</Link>
												<Link href={`/part/detail?id=${part?._id}`}>
													<div className="property-title">{part.partTitle}</div>
												</Link>
											</Stack>
										</TableCell>
										<TableCell align="center" className="property-price">
											{part.partPrice}
										</TableCell>
										<TableCell align="center" className="property-agent">
											{part.memberData?.memberNick}
										</TableCell>
										<TableCell align="center" className="property-location">
											{part.partCategory?.replace('_', ' ')}
										</TableCell>
										<TableCell align="center" className="property-brand">
											{part.partType} {part.partCondition && `• ${part.partCondition}`}
										</TableCell>
										<TableCell align="center">
											{part.partStatus === PartStatus.DELETE && (
												<>
													<Button className={'badge property-status-deleted'} sx={{ mr: 1 }}>
														Deleted
													</Button>
													<Button
														variant="outlined"
														className="delete-button"
														sx={{ p: '3px', border: 'none', ':hover': { border: '1px solid #ef4444' } }}
														onClick={() => removePartHandler(part._id)}
													>
														<DeleteIcon fontSize="small" />
													</Button>
												</>
											)}

											{part.partStatus === PartStatus.SOLD && (
												<Button className={'badge property-status-sold'}>{part.partStatus}</Button>
											)}

											{part.partStatus === PartStatus.ACTIVE && (
												<>
													<Button onClick={(e: any) => menuIconClickHandler(e, index)} className={'badge property-status-active'}>
														{part.partStatus}
													</Button>

													<Menu
														className={'menu-modal'}
														MenuListProps={{ 'aria-labelledby': 'fade-button' }}
														anchorEl={anchorEl[index]}
														open={Boolean(anchorEl[index])}
														onClose={menuIconCloseHandler}
														TransitionComponent={Fade}
														sx={{ p: 1 }}
													>
														{Object.values(PartStatus)
															.filter((ele) => ele !== part.partStatus)
															.map((status: string) => (
																<MenuItem
																	onClick={() => updatePartHandler({ _id: part._id, partStatus: status })}
																	key={status}
																>
																	<Typography variant={'subtitle1'} component={'span'}>
																		{status === PartStatus.DELETE ? 'Deleted' : status}
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
