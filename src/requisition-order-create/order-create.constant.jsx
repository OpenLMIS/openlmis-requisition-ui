import React from 'react';
import TrashButton from '../react-components/buttons/trash-button';
import InputCell from '../react-components/table/input-cell';

const orderTableDefaultColumns = (formatMessage) => [
    {
        Header: formatMessage('requisition.orderCreate.table.productCode'),
        accessor: 'orderable.productCode'
    },
    {
        Header: formatMessage('requisition.orderCreate.table.product'),
        accessor: 'orderable.fullProductName'
    },
    {
        Header: formatMessage('requisition.orderCreate.table.soh'),
        accessor: 'soh',
        Cell: ({ value }) => (<div className="text-right">{value}</div>)
    },
    {
        Header: formatMessage('requisition.orderCreate.table.quantity'),
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
        Header: formatMessage('requisition.orderCreate.table.actions'),
        accessor: 'id',
        Cell: ({ row: { index }, deleteRow }) => (
            <TrashButton
                onClick={() => deleteRow(index)} />
        )
    }
];

const orderReadonlyTableColumns = (formatMessage) => [
    {
        Header: formatMessage('requisition.orderCreate.table.productCode'),
        accessor: 'orderable.productCode'
    },
    {
        Header: formatMessage('requisition.orderCreate.table.product'),
        accessor: 'orderable.fullProductName'
    },
    {
        Header: formatMessage('requisition.orderCreate.table.soh'),
        accessor: 'soh',
        Cell: ({ value }) => (<div className="text-right">{value}</div>)
    },
    {
        Header: formatMessage('requisition.orderCreate.table.quantity'),
        accessor: 'orderedQuantity',
    }
];

export const orderTableColumns = (isTableReadOnly, formatMessage) => {
    return isTableReadOnly ? orderReadonlyTableColumns(formatMessage) :
        orderTableDefaultColumns(formatMessage);
}

export const orderCreateFormTableColumns = (formatMessage) => [
    {
        Header: formatMessage('requisition.orderCreate.table.facility'),
        accessor: 'name'
    },
    {
        Header: formatMessage('requisition.orderCreate.table.actions'),
        accessor: 'value',
        Cell: ({ row: { index }, deleteRow }) => (
            <TrashButton onClick={() => deleteRow(index)} />
        )
    }
];

export const ORDER_STATUS = {
    CREATING: 'CREATING',
};
