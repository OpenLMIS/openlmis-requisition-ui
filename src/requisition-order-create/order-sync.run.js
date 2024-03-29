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

(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name requisition-order-create.synchronizeOrders
     *
     * @description
     * Updates requisition-less draft and created when app is online.
     */
    angular
        .module('requisition-order-create')
        .run(synchronizeOrders);

    synchronizeOrders.$inject = [
        '$rootScope',
        'offlineService',
        'localStorageService',
        'orderCreateService',
        'notificationService'
    ];

    function synchronizeOrders(
        $rootScope,
        offlineService,
        localStorageService,
        orderCreateService,
        notificationService
    ) {
        $rootScope.$watch(function() {
            return offlineService.isOffline();
        }, function(isOffline, wasOffline) {
            if (!isOffline && isOffline !== wasOffline) {
                var ordersLocalStorageKey = 'reduxPersist.requisition';
                var orders = JSON.parse(localStorageService.get(ordersLocalStorageKey));

                var notUpdatedDrafts = updateDraftOrders(JSON.parse(orders.drafts));
                orders.drafts = JSON.stringify(notUpdatedDrafts);

                var notSentOfflineOrders = sendOfflineCreatedOrders(JSON.parse(orders.createdOffline));
                orders.createdOffline = JSON.stringify(notSentOfflineOrders);

                localStorageService.add(ordersLocalStorageKey, JSON.stringify(orders));
            }
        }, true);

        /**
         * @ngdoc method
         * @methodOf requisition-order-create.synchronizeOrders
         * @name updateDraftOrders
         *
         * @param {Object} drafts id indexed drafts to update
         * @description Send draft orders saved offline
         */
        function updateDraftOrders(drafts) {
            var  notUpdatedDrafts = {};

            _.each(drafts, function(orderDraft) {
                orderCreateService.update(orderDraft)
                    .then(function() {
                        notificationService.success('requisition.orderCreate.draftUpdate.success');
                    })
                    .catch(function() {
                        notUpdatedDrafts[orderDraft.id] = orderDraft;
                        notificationService.error('requisition.orderCreate.draftUpdate.error');
                    });
            });

            return notUpdatedDrafts;
        }

        /**
         * @ngdoc method
         * @methodOf requisition-order-create.synchronizeOrders
         * @name sendOfflineCreatedOrders
         * @param {Object} orders id indexed orders
         *
         * @return {Object} Orders which failed to create
         * @description Send orders created offline
         */
        function sendOfflineCreatedOrders(orders) {
            var notSentOfflineOrders = {};

            _.each(orders, function(order) {
                orderCreateService.send(order)
                    .then(function() {
                        notificationService.success('requisition.orderCreate.createdOrderSent.success');
                    })
                    .catch(function() {
                        notSentOfflineOrders[order.id] = order;
                        notificationService.error('requisition.orderCreate.createdOrderSent.error');
                    });
            });

            return notSentOfflineOrders;
        }
    }
})();

