import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { Button, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useTranslation } from 'next-i18next';
import { PartBrand, PartCategory, PartCondition, PartLocation, PartType } from '../../enums/part.enum';
import { REACT_APP_API_URL } from '../../config';
import { PartInput } from '../../types/part/part.input';
import axios from 'axios';
import { getJwtToken } from '../../auth';
import { sweetMixinErrorAlert, sweetMixinSuccessAlert } from '../../sweetAlert';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { CREATE_PART, UPDATE_PART } from '../../../apollo/user/mutation';
import { GET_PART } from '../../../apollo/user/query';

const AddPart = ({ initialValues, ...props }: any) => {
	const device = useDeviceDetect();
	const { t } = useTranslation('common');
	const router = useRouter();
	const inputRef = useRef<any>(null);
	const [insertPartData, setInsertPartData] = useState<PartInput>(initialValues);
	const [partCategory] = useState<PartCategory[]>(Object.values(PartCategory));
	const [partType] = useState<PartType[]>(Object.values(PartType));
	const [partLocation] = useState<PartLocation[]>(Object.values(PartLocation));
	const [partBrand] = useState<PartBrand[]>(Object.values(PartBrand));
	const [partCondition] = useState<PartCondition[]>(Object.values(PartCondition));
	const token = getJwtToken();
	const user = useReactiveVar(userVar);

	/** APOLLO REQUESTS **/
	const [updatePart] = useMutation(UPDATE_PART);
	const [createPart] = useMutation(CREATE_PART);

	const { loading: getPartLoading, data: getPartData } = useQuery(GET_PART, {
		fetchPolicy: 'network-only',
		variables: { input: router.query.partId },
		skip: !router.query.partId,
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (getPartData?.getPart && !getPartLoading) {
			const p = getPartData.getPart;
			setInsertPartData({
				...insertPartData,
				partTitle: p?.partTitle ?? '',
				partPrice: p?.partPrice ?? 0,
				partCategory: p?.partCategory ?? '',
				partType: p?.partType ?? '',
				partBrand: p?.partBrand ?? '',
				partCondition: p?.partCondition ?? '',
				partLocation: p?.partLocation ?? '',
				partStockCount: p?.partStockCount ?? 1,
				partBarter: p?.partBarter ?? false,
				partDesc: p?.partDesc ?? '',
				partImages: p?.partImages ?? [],
			});
		}
	}, [getPartLoading, getPartData]);

	/** HANDLERS **/
	async function uploadImages() {
		try {
			const formData = new FormData();
			const selectedFiles = inputRef.current.files;

			if (selectedFiles.length == 0) return false;
			if (selectedFiles.length > 5) throw new Error('Cannot upload more than 5 images!');

			formData.append(
				'operations',
				JSON.stringify({
					query: `mutation ImagesUploader($files: [Upload!]!, $target: String!) {
						imagesUploader(files: $files, target: $target)
				  }`,
					variables: {
						files: [null, null, null, null, null],
						target: 'part',
					},
				}),
			);
			formData.append(
				'map',
				JSON.stringify({
					'0': ['variables.files.0'],
					'1': ['variables.files.1'],
					'2': ['variables.files.2'],
					'3': ['variables.files.3'],
					'4': ['variables.files.4'],
				}),
			);
			for (const key in selectedFiles) {
				if (/^\d+$/.test(key)) formData.append(`${key}`, selectedFiles[key]);
			}

			const response = await axios.post(`${process.env.REACT_APP_API_GRAPHQL_URL}`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
					'apollo-require-preflight': true,
					Authorization: `Bearer ${token}`,
				},
			});

			const responseImages = response.data.data.imagesUploader;
			setInsertPartData({ ...insertPartData, partImages: responseImages });
		} catch (err: any) {
			console.log('err: ', err.message);
			await sweetMixinErrorAlert(err.message);
		}
	}

	const doDisabledCheck = () => {
		if (
			insertPartData.partTitle === '' ||
			insertPartData.partPrice === 0 || // @ts-ignore
			insertPartData.partCategory === '' || // @ts-ignore
			insertPartData.partType === '' || // @ts-ignore
			insertPartData.partLocation === '' || // @ts-ignore
			insertPartData.partBrand === '' || // @ts-ignore
			insertPartData.partCondition === '' ||
			insertPartData.partDesc === '' ||
			insertPartData.partImages.length === 0
		) {
			return true;
		}
	};

	const buildInput = () => ({
		partTitle: insertPartData.partTitle,
		partPrice: insertPartData.partPrice,
		partCategory: insertPartData.partCategory,
		partType: insertPartData.partType,
		partBrand: insertPartData.partBrand,
		partCondition: insertPartData.partCondition,
		partLocation: insertPartData.partLocation,
		partStockCount: insertPartData.partStockCount || 1,
		partBarter: insertPartData.partBarter || false,
		partDesc: insertPartData.partDesc || '',
		partImages: insertPartData.partImages || [],
	});

	const insertPartHandler = useCallback(async () => {
		try {
			if (doDisabledCheck()) {
				await sweetMixinErrorAlert('Please fill all required fields!');
				return;
			}
			const result = await createPart({ variables: { input: buildInput() } });
			if (result.data?.createPart) {
				await sweetMixinSuccessAlert('Part created successfully!');
				await router.push('/mypage?category=myParts');
			}
		} catch (err: any) {
			console.log('insertPartHandler error: ', err);
			await sweetMixinErrorAlert(err.message || 'Failed to create part!');
		}
	}, [insertPartData, createPart, router]);

	const updatePartHandler = useCallback(async () => {
		try {
			if (doDisabledCheck()) {
				await sweetMixinErrorAlert('Please fill all required fields!');
				return;
			}
			if (!router.query.partId) {
				await sweetMixinErrorAlert('Part ID is missing!');
				return;
			}
			const result = await updatePart({
				variables: { input: { _id: router.query.partId as string, ...buildInput() } },
			});
			if (result.data?.updatePart) {
				await sweetMixinSuccessAlert('Part updated successfully!');
				await router.push('/mypage?category=myParts');
			}
		} catch (err: any) {
			console.log('updatePartHandler error: ', err);
			await sweetMixinErrorAlert(err.message || 'Failed to update part!');
		}
	}, [insertPartData, updatePart, router]);

	if (user?.memberType !== 'AGENT') {
		router.back();
	}

	if (device === 'mobile') {
		return <div>ADD NEW PART MOBILE PAGE</div>;
	} else {
		return (
			<div id="add-property-page">
				<Stack className="main-title-box">
					<Typography className="main-title">{t('Add New Part')}</Typography>
					<Typography className="sub-title">{t('List a spare part or accessory for sale.')}</Typography>
				</Stack>

				<div>
					<Stack className="config">
						<Stack className="description-box">
							<Stack className="config-column">
								<Typography className="title">{t('Title')}</Typography>
								<input
									type="text"
									className="description-input"
									placeholder={'Title'}
									value={insertPartData.partTitle}
									onChange={({ target: { value } }) => setInsertPartData({ ...insertPartData, partTitle: value })}
								/>
							</Stack>

							<Stack className="config-row">
								<Stack className="price-year-after-price">
									<Typography className="title">{t('Price')}</Typography>
									<input
										type="number"
										className="description-input"
										placeholder={'Price'}
										value={insertPartData.partPrice || ''}
										onChange={({ target: { value } }) =>
											setInsertPartData({ ...insertPartData, partPrice: value === '' ? 0 : parseInt(value) || 0 })
										}
									/>
								</Stack>
								<Stack className="price-year-after-price">
									<Typography className="title">{t('Category')}</Typography>
									<select
										className={'select-description'}
										value={insertPartData.partCategory || 'select'}
										onChange={({ target: { value } }) =>
											// @ts-ignore
											setInsertPartData({ ...insertPartData, partCategory: value })
										}
									>
										<option disabled={true} value={'select'}>
											Select
										</option>
										{partCategory.map((category: any) => (
											<option value={`${category}`} key={category}>
												{t(category)}
											</option>
										))}
									</select>
									<div className={'divider'}></div>
									<img src={'/img/icons/Vector.svg'} className={'arrow-down'} />
								</Stack>
							</Stack>

							<Stack className="config-row">
								<Stack className="price-year-after-price">
									<Typography className="title">{t('Select Type')}</Typography>
									<select
										className={'select-description'}
										value={insertPartData.partType || 'select'}
										onChange={({ target: { value } }) =>
											// @ts-ignore
											setInsertPartData({ ...insertPartData, partType: value })
										}
									>
										<option disabled={true} value={'select'}>
											Select
										</option>
										{partType.map((type: any) => (
											<option value={`${type}`} key={type}>
												{t(type)}
											</option>
										))}
									</select>
									<div className={'divider'}></div>
									<img src={'/img/icons/Vector.svg'} className={'arrow-down'} />
								</Stack>
								<Stack className="price-year-after-price">
									<Typography className="title">{t('Select Location')}</Typography>
									<select
										className={'select-description'}
										value={insertPartData.partLocation || 'select'}
										onChange={({ target: { value } }) =>
											// @ts-ignore
											setInsertPartData({ ...insertPartData, partLocation: value })
										}
									>
										<option disabled={true} value={'select'}>
											Select
										</option>
										{partLocation.map((location: any) => (
											<option value={`${location}`} key={location}>
												{t(location)}
											</option>
										))}
									</select>
									<div className={'divider'}></div>
									<img src={'/img/icons/Vector.svg'} className={'arrow-down'} />
								</Stack>
							</Stack>

							<Stack className="config-row">
								<Stack className="price-year-after-price">
									<Typography className="title">{t('Brand')}</Typography>
									<select
										className={'select-description'}
										value={insertPartData.partBrand || 'select'}
										onChange={({ target: { value } }) =>
											// @ts-ignore
											setInsertPartData({ ...insertPartData, partBrand: value })
										}
									>
										<option disabled={true} value={'select'}>
											Select Brand
										</option>
										{partBrand.map((brand: any) => (
											<option value={`${brand}`} key={brand}>
												{t(brand)}
											</option>
										))}
									</select>
									<div className={'divider'}></div>
									<img src={'/img/icons/Vector.svg'} className={'arrow-down'} />
								</Stack>
								<Stack className="price-year-after-price">
									<Typography className="title">{t('Condition')}</Typography>
									<select
										className={'select-description'}
										value={insertPartData.partCondition || 'select'}
										onChange={({ target: { value } }) =>
											// @ts-ignore
											setInsertPartData({ ...insertPartData, partCondition: value })
										}
									>
										<option disabled={true} value={'select'}>
											Select Condition
										</option>
										{partCondition.map((condition: any) => (
											<option value={`${condition}`} key={condition}>
												{t(condition)}
											</option>
										))}
									</select>
									<div className={'divider'}></div>
									<img src={'/img/icons/Vector.svg'} className={'arrow-down'} />
								</Stack>
							</Stack>

							<Stack className="config-row">
								<Stack className="price-year-after-price">
									<Typography className="title">{t('Stock Count')}</Typography>
									<input
										type="number"
										className="description-input"
										placeholder={'Stock count (e.g., 10)'}
										value={insertPartData.partStockCount || ''}
										onChange={({ target: { value } }) =>
											setInsertPartData({ ...insertPartData, partStockCount: value === '' ? 1 : parseInt(value) || 1 })
										}
									/>
								</Stack>
								<Stack className="price-year-after-price">
									<Typography className="title">{t('Barter')}</Typography>
									<select
										className={'select-description'}
										value={insertPartData.partBarter ? 'yes' : 'no'}
										onChange={({ target: { value } }) =>
											setInsertPartData({ ...insertPartData, partBarter: value === 'yes' })
										}
									>
										<option value={'yes'}>{t('Yes')}</option>
										<option value={'no'}>{t('No')}</option>
									</select>
									<div className={'divider'}></div>
									<img src={'/img/icons/Vector.svg'} className={'arrow-down'} />
								</Stack>
							</Stack>

							<Typography className="property-title">{t('Part Description')}</Typography>
							<Stack className="config-column">
								<Typography className="title">{t('Description')}</Typography>
								<textarea
									className="description-text"
									value={insertPartData.partDesc}
									onChange={({ target: { value } }) => setInsertPartData({ ...insertPartData, partDesc: value })}
								></textarea>
							</Stack>
						</Stack>

						<Typography className="upload-title">{t('Upload photos of your part')}</Typography>
						<Stack className="images-box">
							<Stack className="upload-box">
								<Stack className="text-box">
									<Typography className="drag-title">{t('Drag and drop images here')}</Typography>
									<Typography className="format-title">{t('Photos must be JPEG or PNG format')}</Typography>
								</Stack>
								<Button
									className="browse-button"
									onClick={() => {
										inputRef.current.click();
									}}
								>
									<Typography className="browse-button-text">{t('Browse Files')}</Typography>
									<input
										ref={inputRef}
										type="file"
										hidden={true}
										onChange={uploadImages}
										multiple={true}
										accept="image/jpg, image/jpeg, image/png"
									/>
								</Button>
							</Stack>
							<Stack className="gallery-box">
								{insertPartData?.partImages.map((image: string) => {
									const imagePath: string = `${REACT_APP_API_URL}/${image}`;
									return (
										<Stack className="image-box" key={image}>
											<img src={imagePath} alt="" />
										</Stack>
									);
								})}
							</Stack>
						</Stack>

						<Stack className="buttons-row">
							{router.query.partId ? (
								<Button className="next-button" disabled={doDisabledCheck()} onClick={updatePartHandler}>
									<Typography className="next-button-text">{t('Save')}</Typography>
								</Button>
							) : (
								<Button className="next-button" disabled={doDisabledCheck()} onClick={insertPartHandler}>
									<Typography className="next-button-text">{t('Save')}</Typography>
								</Button>
							)}
						</Stack>
					</Stack>
				</div>
			</div>
		);
	}
};

AddPart.defaultProps = {
	initialValues: {
		partTitle: '',
		partPrice: 0,
		partCategory: '',
		partType: '',
		partBrand: '',
		partCondition: '',
		partLocation: '',
		partStockCount: 1,
		partBarter: false,
		partDesc: '',
		partImages: [],
	},
};

export default AddPart;
