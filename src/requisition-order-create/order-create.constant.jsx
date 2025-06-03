import React from 'react';
import QuantityUnitInput from '../openlmis-quantity-unit-input/openlmis-quantity-unit-input';
import TrashButton from '../react-components/buttons/trash-button';

const orderTableDefaultColumns = (
  formatMessage,
  showInDoses,
  updateData,
  quantityUnitCalculateService
) => {
  return [
    {
      Header: formatMessage('requisition.orderCreate.table.productCode'),
      accessor: 'orderable.productCode',
    },
    {
      Header: formatMessage('requisition.orderCreate.table.product'),
      accessor: 'orderable.fullProductName',
    },
    {
      Header: showInDoses
        ? formatMessage('requisition.orderCreate.table.soh.doses')
        : formatMessage('requisition.orderCreate.table.soh.packs'),
      accessor: 'soh',
      Cell: (props) => {
        const sohQuantity = props.value;
        const netContent = props.row.original.orderable.netContent;

        const parsedStockOnHand =
          quantityUnitCalculateService.recalculateSOHQuantity(
            sohQuantity,
            netContent,
            showInDoses
          );

        return <div className='text-right'>{parsedStockOnHand}</div>;
      },
    },
    {
      Header: showInDoses
        ? formatMessage('requisition.orderCreate.table.quantity.doses')
        : formatMessage('requisition.orderCreate.table.quantity.packs'),
      accessor: 'orderedQuantity',
      Cell: (props) => {
        const { row } = props;
        const rowData = row.original;

        const handleQuantityChange = (recalculatedItem) => {
          const allOrderItems = props.data;

          const updatedData = [...allOrderItems].map((item) =>
            item.orderable.id === recalculatedItem.orderable.id
              ? recalculatedItem
              : item
          );

          updateData(updatedData);
        };

        return (
          <QuantityUnitInput
            {...props}
            showInDoses={showInDoses}
            item={rowData}
            onChangeQuantity={handleQuantityChange}
            numeric
            key={`quantity-input-${rowData.orderable?.id}`}
          />
        );
      },
    },
    {
      Header: formatMessage('requisition.orderCreate.table.actions'),
      accessor: 'id',
      Cell: ({ row: { index }, deleteRow }) => (
        <TrashButton onClick={() => deleteRow(index)} />
      ),
    },
  ];
};

const orderReadonlyTableColumns = (
  formatMessage,
  showInDoses,
  quantityUnitCalculateService
) => [
  {
    Header: formatMessage('requisition.orderCreate.table.productCode'),
    accessor: 'orderable.productCode',
  },
  {
    Header: formatMessage('requisition.orderCreate.table.product'),
    accessor: 'orderable.fullProductName',
  },
  {
    Header: showInDoses
      ? formatMessage('requisition.orderCreate.table.soh.doses')
      : formatMessage('requisition.orderCreate.table.soh.packs'),
    accessor: 'soh',
    Cell: (props) => {
      const sohQuantity = props.value;
      const netContent = props.row.original.orderable.netContent;

      const parsedStockOnHand =
        quantityUnitCalculateService.recalculateSOHQuantity(
          sohQuantity,
          netContent,
          showInDoses
        );

      return <div className='text-right'>{parsedStockOnHand}</div>;
    },
  },
  {
    Header: showInDoses
      ? formatMessage('requisition.orderCreate.table.quantity.doses')
      : formatMessage('requisition.orderCreate.table.quantity.packs'),
    accessor: 'orderedQuantity',
    Cell: (props) => {
      const { row } = props;
      const rowData = row.original;

      return (
        <QuantityUnitInput
          {...props}
          showInDoses={showInDoses}
          item={rowData}
          onChangeQuantity={() => {}}
          disabled={true}
          numeric
          key={`readonly-quantity-input-${rowData.orderable?.id}`}
        />
      );
    },
  },
];

export const orderTableColumns = (
  isTableReadOnly,
  formatMessage,
  showInDoses,
  updateData,
  quantityUnitCalculateService
) => {
  return isTableReadOnly
    ? orderReadonlyTableColumns(
        formatMessage,
        showInDoses,
        quantityUnitCalculateService
      )
    : orderTableDefaultColumns(
        formatMessage,
        showInDoses,
        updateData,
        quantityUnitCalculateService
      );
};

export const orderCreateFormTableColumns = (formatMessage) => [
  {
    Header: formatMessage('requisition.orderCreate.table.facility'),
    accessor: 'name',
  },
  {
    Header: formatMessage('requisition.orderCreate.table.actions'),
    accessor: 'value',
    Cell: ({ row: { index }, deleteRow }) => (
      <TrashButton onClick={() => deleteRow(index)} />
    ),
  },
];

export const ORDER_STATUS = {
  CREATING: 'CREATING',
};
