import React, { useState } from 'react';
import { NextPage } from 'next';
import { Button, Pagination, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { PropertyCard } from './PropertyCard';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Property } from '../../types/property/property';
import { AgentPropertiesInquiry } from '../../types/property/property.input';
import { T } from '../../types/common';
import { PropertyStatus } from '../../enums/property.enum';
import { userVar } from '../../../apollo/store';
import { useRouter } from 'next/router';
import { UPDATE_PROPERTY } from '../../../apollo/user/mutation';
import { GET_AGENT_PROPERTIES } from '../../../apollo/user/query';
import { sweetConfirmAlert, sweetErrorHandling } from '../../sweetAlert';

const MyProperties: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const [searchFilter, setSearchFilter] = useState<AgentPropertiesInquiry>(initialInput);
	const [agentProperties, setAgentProperties] = useState<Property[]>([]);
	const [total, setTotal] = useState<number>(0);
	const user = useReactiveVar(userVar);
	const router = useRouter();

	/** APOLLO REQUESTS **/
	const [updateProperty] = useMutation(UPDATE_PROPERTY);

	const {
		loading: getAgentPropertiesLoading, 
		data: getAgentPropertiesData, 
		error: getAgentPropertiesError,
		refetch: getAgentPropertiesRefetch,
		 } = useQuery(GET_AGENT_PROPERTIES, {
		fetchPolicy: "network-only",
		variables: {input: searchFilter},
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
				setAgentProperties(data?.getAgentProperties?.list);
				setTotal(data?.getAgentProperties?.metaCounter[0]?.total ?? 0);
		},
		 });	



	/** HANDLERS **/
	const paginationHandler = (e: T, value: number) => {
		setSearchFilter({ ...searchFilter, page: value });
	};

	const changeStatusHandler = (value: PropertyStatus) => {
		setSearchFilter({ ...searchFilter, search: { propertyStatus: value } });
	};

	const deletePropertyHandler = async (id: string) => {
		try {
			if (await sweetConfirmAlert('Are you sure to delete this Bike?')) {
				await updateProperty({
					variables: {
						input: {
							_id: id,
							propertyStatus: 'DELETE',
						},
					},
				});
				await getAgentPropertiesRefetch({input: searchFilter});
			}
		} catch(err:any) {
  await sweetErrorHandling(err)
		}
	};

	const updatePropertyHandler = async (status: string, id: string) => {
		try {
			if (await sweetConfirmAlert(`Are you sure to change to ${status} status`)) {
				await updateProperty({
					variables: {
						input: {
							_id: id,
							propertyStatus: status,
						},
					},
				})
				await getAgentPropertiesRefetch({input: searchFilter});
			}
		} catch(err:any) {
  await sweetErrorHandling(err)
		}
	};

	if (user?.memberType !== 'AGENT') {
		router.back();
	}

	if (device === 'mobile') {
		return <div>NESTAR PROPERTIES MOBILE</div>;
	} else {
		return (
			<div id="my-property-page">
				<Stack className="main-title-box">
					<Stack className="left-header">
						<Typography className="section-label">GARAGE</Typography>
						<Stack className="right-box">
							<Typography className="main-title">My Bikes</Typography>
							<Typography className="sub-title">Manage your listings, update details, and archive old bikes.</Typography>
						</Stack>
					</Stack>
					<Stack className="header-right">
						<Typography className="bikes-count">{total} bikes</Typography>
						<Button
							className="add-bike-button"
							onClick={() => router.push('/mypage?category=addProperty')}
						>
							Add Bike
						</Button>
						<Typography className="showing-text">Showing {((searchFilter.page - 1) * searchFilter.limit) + 1}-{Math.min(searchFilter.page * searchFilter.limit, total)} of {total}</Typography>
					</Stack>
				</Stack>
				<Stack className="property-list-box">
					<Stack className="tab-name-box">
						<Typography
							onClick={() => changeStatusHandler(PropertyStatus.ACTIVE)}
							className={searchFilter.search.propertyStatus === 'ACTIVE' ? 'active-tab-name' : 'tab-name'}
						>
							Active
						</Typography>
						<Typography
							onClick={() => changeStatusHandler(PropertyStatus.HOLD)}
							className={searchFilter.search.propertyStatus === 'HOLD' ? 'active-tab-name' : 'tab-name'}
						>
							Blocked
						</Typography>
						<Typography
							onClick={() => changeStatusHandler(PropertyStatus.SOLD)}
							className={searchFilter.search.propertyStatus === 'SOLD' ? 'active-tab-name' : 'tab-name'}
						>
							Archived
						</Typography>
					</Stack>
					<Stack className="list-box">

						{agentProperties?.length === 0 ? (
							<div className={'no-data'}>
								<img src="/img/icons/icoAlert.svg" alt="" />
								<p>No Bikes found!</p>
							</div>
						) : (
							agentProperties.map((property: Property) => {
								return (
									<PropertyCard
										property={property}
										deletePropertyHandler={deletePropertyHandler}
										updatePropertyHandler={updatePropertyHandler}
									/>
								);
							})
						)}

						{agentProperties.length !== 0 && (
							<Stack className="pagination-config">
								<Stack className="pagination-box">
									<Pagination
										count={Math.ceil(total / searchFilter.limit)}
										page={searchFilter.page}
										shape="circular"
										color="primary"
										onChange={paginationHandler}
									/>
								</Stack>
								<Stack className="total-result">
									<Typography>{total} Bikes  available</Typography>
								</Stack>
							</Stack>
						)}
					</Stack>
				</Stack>
			</div>
		);
	}
};

MyProperties.defaultProps = {
	initialInput: {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		search: {
			propertyStatus: 'ACTIVE',
		},
	},
};

export default MyProperties;
