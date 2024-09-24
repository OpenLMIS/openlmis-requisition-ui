import React, { useState, useMemo, useEffect } from 'react';
import Tippy from '@tippyjs/react';

import EditableTable from '../react-components/table/editable-table';
import getService from '../react-components/utils/angular-utils';
import OrderCreateRequisitionInfo from './order-create-requisition-info';

import { SearchSelect } from './search-select';
import { getUpdatedOrder } from './order-create-table-helper-functions';
import { orderTableColumns } from './order-create.constant';
import { validateOrderItem } from './order-create-validation-helper-functions';

const OrderCreateTab = ({ passedOrder,
    updateOrderArray,
    showValidationErrors,
    isTableReadOnly,
    stockCardSummaryRepositoryImpl,
    tabIndex,
    cacheOrderableOptions,
    cachedOrderableOptions }) => {
    const [order, setOrder] = useState({ orderLineItems: [], ...passedOrder });
    const [selectedOrderable, setSelectedOrderable] = useState('');
    const [orderableOptions, setOrderableOptions] = useState(cachedOrderableOptions);
    const columns = useMemo(() => orderTableColumns(isTableReadOnly), []);
    const orderCreatePrintService = useMemo(() => getService('orderCreatePrintService'), []);

    useMemo(() => {
        if (cachedOrderableOptions?.length) {
            setOrderableOptions(cachedOrderableOptions);
            return;
        }

        stockCardSummaryRepositoryImpl.query({
            programId: order.program.id,
            facilityId: order.requestingFacility.id
        }).then((page) => {
            const fetchedOrderableOptions = page.content
            const orderableOptionsValue = fetchedOrderableOptions.map(stockItem => ({
                name: stockItem.orderable.fullProductName,
                value: { ...stockItem.orderable, soh: stockItem.stockOnHand }
            }));

            setOrderableOptions(orderableOptionsValue);
        });
    }, []);

    useEffect(() => {
        if (orderableOptions.length > 0) {
            cacheOrderableOptions(orderableOptions, tabIndex);
        }
    }, [orderableOptions]);

    const updateData = (changedItems) => {
        const updatedOrder = {
            ...order,
            orderLineItems: changedItems
        };

        setOrder(updatedOrder);
        updateOrderArray(updatedOrder);
    };

    const addOrderable = () => {
        const updatedOrder = getUpdatedOrder(selectedOrderable, order);
        setOrder(updatedOrder);
        setSelectedOrderable('');
        updateOrderArray(updatedOrder);
    };

    const validateRow = (row) => {
        const errors = validateOrderItem(row);
        return !errors.length;
    };

    const printOrder = () => {
        orderCreatePrintService.print(order.id);
    };

    const isProductAdded = selectedOrderable && _.find(order.orderLineItems, item => (item.orderable.id === selectedOrderable.id));

    return (
        <>
            <OrderCreateRequisitionInfo order={order} />
            <div className="page-content">
                <div className="order-create-table-container">
                    <div className="order-create-table">
                        <div className="order-create-table-header">
                            {
                                !isTableReadOnly &&
                                <SearchSelect
                                    options={orderableOptions}
                                    value={selectedOrderable}
                                    onChange={value => setSelectedOrderable(value)}
                                    objectKey={'id'}
                                    disabled={isTableReadOnly}
                                >Product</SearchSelect>
                            }
                            <div className='buttons-container'>
                                <Tippy
                                    content="This product was already added to the table"
                                    disabled={!isProductAdded}
                                >
                                    {
                                        !isTableReadOnly &&
                                        <div>
                                            <button
                                                className={"add"}
                                                onClick={addOrderable}
                                                disabled={!selectedOrderable || isProductAdded}
                                            >Add</button>
                                        </div>
                                    }
                                </Tippy>
                                {
                                    isTableReadOnly &&
                                    <button
                                        className="order-print"
                                        onClick={printOrder}>
                                        Print Order
                                    </button>
                                }
                            </div>
                        </div>
                        <EditableTable
                            columns={columns}
                            data={order.orderLineItems || []}
                            updateData={updateData}
                            validateRow={validateRow}
                            showValidationErrors={showValidationErrors}
                            isReadOnly={isTableReadOnly}
                            pageSize={6}
                        />
                    </div>
                </div>
            </div>
        </>

    );
};

export default OrderCreateTab;
