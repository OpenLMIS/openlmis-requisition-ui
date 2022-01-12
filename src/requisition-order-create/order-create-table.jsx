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

import TrashButton from '../react-components/buttons/trash-button';
import EditableTable from '../react-components/table/editable-table';
import InputCell from '../react-components/table/input-cell';

import { formatDate } from '../react-components/utils/format-utils';
import getService from '../react-components/utils/angular-utils';

const OrderCreteTable = () => {

    const history = useHistory();
    const { orderId } = useParams();

    const [order, setOrder] = useState({ orderLineItems: [] });

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

    useEffect(
        () => {
            orderService.get(orderId)
                .then((fetchedOrder) => {
                    const orderableIds = fetchedOrder.orderLineItems.map((lineItem) => {
                        return lineItem.orderable.id;
                    });

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
                });
        },
        [orderService]
    );

    const deleteItem = (itemId, index, deleteRow) => {
        if (itemId) {
            orderService.deleteItem(itemId)
                .then(() => {
                    deleteRow(index);
                });
        } else {
            deleteRow(index);
        }
    };

    const columns = useMemo(
        () => [
            {
                Header: 'Product Code',
                accessor: 'orderable.productCode',
            },
            {
                Header: 'Product',
                accessor: 'orderable.fullProductName',
            },
            {
                Header: 'SOH',
                accessor: 'soh',
            },
            {
                Header: 'Quantity',
                accessor: 'orderedQuantity',
                Cell: InputCell
            },
            {
                Header: 'Actions',
                accessor: 'id',
                Cell: ({ value, row: { index }, deleteRow }) => (
                    <TrashButton onClick={() => deleteItem(value, index, deleteRow)} />
                )
            },
        ],
        []
    );

    const updateData = (changedItems) => {
        const updatedOrder = {
            ...order,
            orderLineItems: changedItems
        };

        setOrder(updatedOrder);
    };

    const updateOrder = () => {
        orderService.update(order);
    };

    const sendOrder = () => {
        orderService.send(order.id)
            .then(() => {
                history.push('/orders/fulfillment');
            });
    };

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
                <EditableTable columns={columns} data={order.orderLineItems || []} updateData={updateData} />
            </div>
            <div className="page-footer">
                <button
                    type="button"
                    className="btn"
                    onClick={() => updateOrder()}
                >Save Draft</button>
                <button
                    type="button"
                    className="btn primary"
                    onClick={() => sendOrder()}
                >Create Order</button>
            </div>
        </div>
    );
};

export default OrderCreteTable;
