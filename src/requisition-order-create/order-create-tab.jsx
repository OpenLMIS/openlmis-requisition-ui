import Tippy from '@tippyjs/react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import QuantityUnitToggle from '../openlmis-quantity-unit-toggle/quantity-unit-toggle';
import EditableTable from '../react-components/table/editable-table';
import getService from '../react-components/utils/angular-utils';
import OrderCreateRequisitionInfo from './order-create-requisition-info';

import { getUpdatedOrder } from './order-create-table-helper-functions';
import { validateOrderItem } from './order-create-validation-helper-functions';
import { orderTableColumns } from './order-create.constant';
import { SearchSelect } from './search-select';

const QUANTITY_UNIT_KEY = 'quantityUnit';

const OrderCreateTab = ({
  passedOrder,
  updateOrderArray,
  showValidationErrors,
  isTableReadOnly,
  stockCardSummaryRepositoryImpl,
  tabIndex,
  cacheOrderableOptions,
  cachedOrderableOptions,
}) => {
  const localStorageService = useMemo(
    () => getService('localStorageService'),
    []
  );
  const { formatMessage } = useMemo(() => getService('messageService'), []);
  const orderCreatePrintService = useMemo(
    () => getService('orderCreatePrintService'),
    []
  );
  const loadingModalService = useMemo(
    () => getService('loadingModalService'),
    []
  );
  const QUANTITY_UNIT = useMemo(() => getService('QUANTITY_UNIT'), []);
  const featureFlagService = useMemo(
    () => getService('featureFlagService'),
    []
  );
  const DEFAULT_QUANTITY_UNIT_FEATURE_FLAG = useMemo(
    () => getService('DEFAULT_QUANTITY_UNIT_FEATURE_FLAG'),
    []
  );
  const quantityUnitCalculateService = useMemo(
    () => getService('quantityUnitCalculateService'),
    []
  );

  const [order, setOrder] = useState({ orderLineItems: [], ...passedOrder });
  const [selectedOrderable, setSelectedOrderable] = useState('');
  const [orderableOptions, setOrderableOptions] = useState(
    cachedOrderableOptions
  );

  const [currentQuantityUnit, setCurrentQuantityUnit] = useState('');
  const showInDoses = useMemo(
    () => currentQuantityUnit === QUANTITY_UNIT.DOSES,
    [currentQuantityUnit, QUANTITY_UNIT.DOSES]
  );

  useEffect(() => {
    const getDefaultUnit = () => {
      if (featureFlagService && DEFAULT_QUANTITY_UNIT_FEATURE_FLAG) {
        const flagValue = featureFlagService.get(
          DEFAULT_QUANTITY_UNIT_FEATURE_FLAG
        );
        if (
          flagValue === QUANTITY_UNIT.PACKS ||
          flagValue === QUANTITY_UNIT.DOSES
        ) {
          return flagValue;
        }
      }

      return QUANTITY_UNIT.DOSES;
    };

    const cachedUnit = localStorageService.get(QUANTITY_UNIT_KEY);
    const initialUnit = cachedUnit || getDefaultUnit();

    if (!cachedUnit) {
      localStorageService.add(QUANTITY_UNIT_KEY, initialUnit);
    }
    setCurrentQuantityUnit(initialUnit);
  }, [
    localStorageService,
    QUANTITY_UNIT,
    featureFlagService,
    DEFAULT_QUANTITY_UNIT_FEATURE_FLAG,
  ]);

  const handleQuantityUnitChange = useCallback(
    (newUnit) => {
      localStorageService.add(QUANTITY_UNIT_KEY, newUnit);
      setCurrentQuantityUnit(newUnit);

      // Recalculate all existing order items for the new unit
      const recalculatedOrderItems = order.orderLineItems.map((item) => {
        return quantityUnitCalculateService.recalculateInputQuantity(
          item,
          item.orderable.netContent,
          showInDoses,
          'orderedQuantity'
        );
      });

      const updatedOrder = { ...order, orderLineItems: recalculatedOrderItems };

      setOrder(updatedOrder);
      updateOrderArray(updatedOrder);
    },
    [
      localStorageService,
      order,
      quantityUnitCalculateService,
      showInDoses,
      updateOrderArray,
    ]
  );

  useMemo(() => {
    if (cachedOrderableOptions?.length) {
      setOrderableOptions(cachedOrderableOptions);
      return;
    }

    loadingModalService.open();
    stockCardSummaryRepositoryImpl
      .query({
        programId: order.program.id,
        facilityId: order.requestingFacility.id,
      })
      .then((page) => {
        const fetchedOrderableOptions = page.content;
        const orderableOptionsValue = fetchedOrderableOptions.map(
          (stockItem) => ({
            name: stockItem.orderable.fullProductName,
            value: { ...stockItem.orderable, soh: stockItem.stockOnHand },
          })
        );

        setOrderableOptions(orderableOptionsValue);
        loadingModalService.close();
      })
      .catch(() => {
        loadingModalService.close();
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
      orderLineItems: changedItems,
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

  const isProductAdded =
    selectedOrderable &&
    _.find(
      order.orderLineItems,
      (item) => item.orderable.id === selectedOrderable.id
    );

  const columns = useMemo(
    () =>
      orderTableColumns(
        isTableReadOnly,
        formatMessage,
        showInDoses,
        updateData,
        quantityUnitCalculateService
      ),
    [
      isTableReadOnly,
      formatMessage,
      showInDoses,
      updateData,
      quantityUnitCalculateService,
    ]
  );

  return (
    <>
      <OrderCreateRequisitionInfo order={order} />
      <div className='page-content'>
        <div className='order-create-table-container'>
          <div className='order-create-table'>
            <div className='order-create-table-header'>
              {!isTableReadOnly && (
                <SearchSelect
                  options={orderableOptions}
                  value={selectedOrderable}
                  onChange={(value) => setSelectedOrderable(value)}
                  objectKey={'id'}
                  disabled={isTableReadOnly}
                >
                  {formatMessage('requisition.orderCreate.table.product')}
                </SearchSelect>
              )}
              <div className='buttons-container'>
                <Tippy
                  content={formatMessage(
                    'requisition.orderCreate.table.productAlreadyAdded'
                  )}
                  disabled={!isProductAdded}
                >
                  {!isTableReadOnly && (
                    <div>
                      <button
                        className={'add'}
                        onClick={addOrderable}
                        disabled={!selectedOrderable || isProductAdded}
                      >
                        {formatMessage(
                          'requisition.orderCreate.table.addProduct'
                        )}
                      </button>
                    </div>
                  )}
                </Tippy>
                {isTableReadOnly && (
                  <button className='order-print' onClick={printOrder}>
                    {formatMessage('requisition.orderCreate.printOrder')}
                  </button>
                )}
                <QuantityUnitToggle
                  selectedUnit={currentQuantityUnit}
                  onUnitChange={handleQuantityUnitChange}
                />
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
