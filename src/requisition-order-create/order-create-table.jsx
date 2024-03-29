/*
 * This program is part of the OpenLMIS logistics management information system platform software.
 * Copyright © 2017 VillageReach
 *
 * This program is free software: you can redistribute it and/or modify it under the terms
 * of the GNU Affero General Public License as published by the Free Software Foundation, either
 * version 3 of the License, or (at your option) any later version.
 *  
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. 
 * See the GNU Affero General Public License for more details. You should have received a copy of
 * the GNU Affero General Public License along with this program. If not, see
 * http://www.gnu.org/licenses.  For additional information contact info@OpenLMIS.org. 
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import Tippy from '@tippyjs/react';

import TrashButton from '../react-components/buttons/trash-button';
import EditableTable from '../react-components/table/editable-table';
import InputCell from '../react-components/table/input-cell';

import { formatDate } from '../react-components/utils/format-utils';
import getService from '../react-components/utils/angular-utils';
import { SearchSelect } from './search-select';
import { saveDraft, createOrder } from './reducers/orders.reducer';

const OrderCreateTable = () => {

    const history = useHistory();
    const { orderId } = useParams();

    const dispatch = useDispatch();

    const [order, setOrder] = useState({ orderLineItems: [] });
    const [orderParams, setOrderParams] = useState({ programId: null , requestingFacilityId: null });

    const [orderableOptions, setOrderableOptions] = useState([]);
    const [selectedOrderable, selectOrderable] = useState('');

    const [showValidationErrors, setShowValidationErrors] = useState(false);

    const orderService = useMemo(
        () => {
            return getService('orderCreateService');
        },
        []
    );

    const stockCardSummaryRepositoryImpl = useMemo(
        () => {
            const stockCardSummaryRepository = getService('StockCardSummaryRepositoryImpl');
            return new stockCardSummaryRepository();
        },
        []
    );

    const notificationService = useMemo(
        () => {
            return getService('notificationService');
        },
        []
    );

    const offlineService = useMemo(
        () => {
            return getService('offlineService');
        },
        []
    );

    useEffect(
        () => {
            orderService.get(orderId)
                .then((fetchedOrder) => {
                    const orderParams = {
                        programId: fetchedOrder.program.id,
                        facilityId: fetchedOrder.requestingFacility.id
                    };

                    setOrderParams(orderParams);

                    const orderableIds = fetchedOrder.orderLineItems.map((lineItem) => {
                        return lineItem.orderable.id;
                    });

                    if (orderableIds && orderableIds.length) {
                        stockCardSummaryRepositoryImpl.query({
                            programId: fetchedOrder.program.id,
                            facilityId: fetchedOrder.requestingFacility.id,
                            orderableId: orderableIds
                        })
                            .then(function(page) {
                                const stockItems = page.content;

                                const orderWithSoh = {
                                    ...fetchedOrder,
                                    orderLineItems: fetchedOrder.orderLineItems.map((lineItem) => {
                                        const stockItem =_.find(stockItems, (item) => (item.orderable.id === lineItem.orderable.id));

                                        return {
                                            ...lineItem,
                                            soh: stockItem ? stockItem.stockOnHand : 0
                                        };
                                    })
                                };

                                setOrder(orderWithSoh);
                            })
                            .catch(function() {
                                setOrder(fetchedOrder);
                            });
                    } else {
                        setOrder(fetchedOrder);
                    }
                });
        },
        [orderService]
    );

    useEffect(
        () => {
            if (orderParams.programId !== null && orderParams.requestingFacilityId !== null) {
                stockCardSummaryRepositoryImpl.query({
                    programId: orderParams.programId,
                    facilityId: orderParams.facilityId
                })
                    .then(function(page) {
                        const stockItems = page.content;

                        setOrderableOptions(_.map(stockItems, stockItem => ({
                            name: stockItem.orderable.fullProductName,
                            value: { ...stockItem.orderable, soh: stockItem.stockOnHand }
                        })));
                    });
            }
        },
        [orderParams]
    );

    const columns = useMemo(
        () => [
            {
                Header: 'Product Code',
                accessor: 'orderable.productCode'
            },
            {
                Header: 'Product',
                accessor: 'orderable.fullProductName'
            },
            {
                Header: 'SOH',
                accessor: 'soh',
                Cell: ({ value }) => (<div className="text-right">{value}</div>)
            },
            {
                Header: 'Quantity',
                accessor: 'orderedQuantity',
                Cell: (props) => (
                    <InputCell
                        {...props}
                        numeric
                        key={`row-${_.get(props, ['row', 'original', 'orderable', 'id'])}`}
                    />
                )
            },
            {
                Header: 'Actions',
                accessor: 'id',
                Cell: ({ row: { index }, deleteRow }) => (
                    <TrashButton onClick={() => deleteRow(index)} />
                )
            }
        ],
        []
    );

    const validateOrderItem = (item) => {
        const errors = [];

        if (item.orderedQuantity === null || item.orderedQuantity === undefined
            || item.orderedQuantity === '') {
            errors.push('Order quantity is required');
        } else if (item.orderedQuantity < 0) {
            errors.push('Order quantity cannot be negative');
        }

        return errors;
    };

    const validateRow = (row) => {
        const errors = validateOrderItem(row);

        return !errors.length;
    };

    const validateOrder = (orderToValidate) => {
        const lineItems = orderToValidate.orderLineItems;
        let errors = [];

        if (!lineItems) {
            return errors;
        }

        lineItems.forEach(item => {
            errors = errors.concat(validateOrderItem(item));
        });

        return _.uniq(errors);
    };

    const updateData = (changedItems) => {
        const updatedOrder = {
            ...order,
            orderLineItems: changedItems
        };

        setOrder(updatedOrder);
    };

    const updateOrder = () => {
        const validationErrors = validateOrder(order);

        if (validationErrors.length) {
            validationErrors.forEach(error => {
                toast.error(error);
            });
            setShowValidationErrors(true);
            return;
        }

        if (offlineService.isOffline()) {
            dispatch(saveDraft(order));
            toast.success("Draft order saved offline");
        } else {
            setShowValidationErrors(false);

            orderService.update(order)
                .then(() => {
                    toast.success("Order saved successfully");
                });
        }
    };

    const addOrderable = () => {
        const newLineItem = {
            orderedQuantity: '',
            soh: selectedOrderable.soh,
            orderable: {
                id: selectedOrderable.id,
                productCode: selectedOrderable.productCode,
                fullProductName: selectedOrderable.fullProductName,
                meta: {
                    versionNumber: selectedOrderable.meta.versionNumber
                }
            }
        };

        let orderNewLineItems = [...order.orderLineItems, newLineItem];

        const updatedOrder = {
            ...order,
            orderLineItems: orderNewLineItems
        };

        setOrder(updatedOrder);
        selectOrderable('');
    };

    const sendOrder = () => {
        const validationErrors = validateOrder(order);

        if (validationErrors.length) {
            validationErrors.forEach(error => {
                toast.error(error);
            });
            setShowValidationErrors(true);
            return;
        }

        if (offlineService.isOffline()) {
            dispatch(createOrder(order));
            notificationService.success("Offline order created successfully. It will be sent when you are online.");
            history.push('/');
        } else {
            orderService.send(order)
                .then(() => {
                    notificationService.success('requisition.orderCreate.submitted');
                    history.push('/orders/fulfillment');
                });
        }
    };

    const isProductAdded = selectedOrderable && _.find(order.orderLineItems, item => (item.orderable.id === selectedOrderable.id));

    return (
        <div className="page-container">
            <div className="page-header-responsive">
                <h2>Create Order</h2>
            </div>
            <div className="page-content">
                <aside className="requisition-info">
                    <ul>
                        <li>
                            <strong>Status</strong>
                            { order.status }
                        </li>
                        <li>
                            <strong>Date Created</strong>
                            { formatDate(order.createdDate) }
                        </li>
                        <li>
                            <strong>Program</strong>
                            { _.get(order, ['program', 'name']) }
                        </li>
                        <li>
                            <strong>Requesting Facility</strong>
                            { _.get(order, ['requestingFacility', 'name']) }
                        </li>
                        <li>
                            <strong>Supplying Facility</strong>
                            { _.get(order, ['supplyingFacility', 'name']) }
                        </li>
                    </ul>
                </aside>
                <div className="order-create-table-container">
                    <div className="order-create-table">
                        <div className="order-create-table-header" >
                            <SearchSelect
                                options={orderableOptions}
                                value={selectedOrderable}
                                onChange={value => selectOrderable(value)}
                                objectKey={'id'}
                            >Product</SearchSelect>
                            <Tippy
                                content="This product was already added to the table"
                                disabled={!isProductAdded}
                            >
                                <div>
                                    <button
                                        className={"add"}
                                        onClick={addOrderable}
                                        disabled={!selectedOrderable || isProductAdded}
                                    >Add</button>
                                </div>
                            </Tippy>
                        </div>
                        <EditableTable
                            columns={columns}
                            data={order.orderLineItems || []}
                            updateData={updateData}
                            validateRow={validateRow}
                            showValidationErrors={showValidationErrors}
                        />
                    </div>
                </div>
            </div>
            <div className="page-footer">
                <button
                    type="button"
                    className="btn"
                    disabled={!order.id}
                    onClick={() => updateOrder()}
                >Save Draft</button>
                <button
                    type="button"
                    className="btn primary"
                    disabled={!order.orderLineItems || !order.orderLineItems.length || !order.id}
                    onClick={() => sendOrder()}
                >Create Order</button>
            </div>
        </div>
    );
};

export default OrderCreateTable;
