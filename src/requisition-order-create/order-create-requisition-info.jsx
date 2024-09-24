import React, { useMemo } from 'react';
import { formatDate } from '../react-components/utils/format-utils';
import getService from '../react-components/utils/angular-utils';

const OrderCreateRequisitionInfo = ({ order }) => {
    const { formatMessage } = useMemo(() => getService('messageService'), []);

    return (
        <aside className="requisition-info">
            <ul>
                <li>
                    <strong>{ formatMessage('requisition.orderCreate.requisistionInfo.status') }</strong>
                    {order.status}
                </li>
                <li>
                    <strong>{ formatMessage('requisition.orderCreate.requisistionInfo.dateCreated') }</strong>
                    {formatDate(order.createdDate)}
                </li>
                <li>
                    <strong>{ formatMessage('requisition.orderCreate.program') }</strong>
                    {_.get(order, ['program', 'name'])}
                </li>
                <li>
                    <strong>{ formatMessage('requisition.orderCreate.reqFacility') }</strong>
                    {_.get(order, ['requestingFacility', 'name'])}
                </li>
                <li>
                    <strong>{ formatMessage('requisition.orderCreate.supFacility') }</strong>
                    {_.get(order, ['supplyingFacility', 'name'])}
                </li>
            </ul>
        </aside>
    );
};

export default OrderCreateRequisitionInfo;
