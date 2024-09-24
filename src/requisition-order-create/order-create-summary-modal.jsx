import React, { useMemo, useState } from 'react';
import Modal from '../react-components/modals/modal';
import EditableTable from '../react-components/table/editable-table';
import { orderTableColumns } from './order-create.constant';
import TabNavigation from '../react-components/tab-navigation/tab-navigation';
import getService from '../react-components/utils/angular-utils';

const OrderCreateSummaryModal = ({ isOpen, orders, onSaveClick, onModalClose }) => {
    const { formatMessage } = useMemo(() => getService('messageService'), []);
    const columns = useMemo(() => orderTableColumns(true, formatMessage), []);
    const [currentTab, setCurrentTab] = useState(0);

    return (
        <Modal
            isOpen={isOpen}
            body={
                <>
                    <div className="react-modal-header">
                        <span className='modal-title'>Orders Summary</span>
                    </div>
                    <div className="react-modal-body">
                        <TabNavigation
                            config={
                                {
                                    data: orders.map((order, index) => ({
                                        header: order.facility.name,
                                        key: order.id,
                                        isActive: currentTab === index
                                    })),
                                    onTabChange: (index) => {
                                        setCurrentTab(index);
                                    }
                                }
                            }
                        ></TabNavigation>
                        <div>
                            <div>
                                {
                                    currentTab !== undefined &&
                                    <EditableTable
                                        columns={columns}
                                        data={orders[currentTab].orderLineItems || []}
                                        isReadOnly={true}
                                    />
                                }
                            </div>
                        </div>
                    </div>
                    <div className="react-modal-footer">
                        <button
                            type="button"
                            className="btn"
                            onClick={() => onModalClose()}
                        >{ formatMessage('requisition.orderCreate.cancel') }</button>
                        <button
                            type="button"
                            className="btn primary"
                            onClick={() => onSaveClick()}
                        >{ formatMessage('requisition.orderCreate') }</button>
                    </div>
                </>}
        >
        </Modal>
    );
};

export default OrderCreateSummaryModal;
