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
        'notificationService',
        'messageService'
    ];

    function synchronizeOrders(
        $rootScope,
        offlineService,
        localStorageService,
        orderCreateService,
        notificationService,
        messageService
    ) {
        $rootScope.$watch(function() {
            return offlineService.isOffline();
        }, function(isOffline, wasOffline) {
            if (!isOffline && isOffline !== wasOffline) {
                var ordersLocalStorageKey = 'reduxPersist.requisition';
                var localStorageOrders = JSON.parse(localStorageService.get(ordersLocalStorageKey));

                var updateDraftsPromise = updateDraftOrders(JSON.parse(localStorageOrders.drafts))
                    .then(function(notUpdatedDrafts) {
                        return {
                            type: 'drafts',
                            value: JSON.stringify(notUpdatedDrafts)
                        };
                    });

                var sendOrdersPromise = sendOfflineCreatedOrders(JSON.parse(localStorageOrders.createdOffline))
                    .then(function(notSentOrders) {
                        return {
                            type: 'createdOffline',
                            value: JSON.stringify(notSentOrders)
                        };
                    });

                //eslint-disable-next-line no-undef
                Promise.all([updateDraftsPromise, sendOrdersPromise])
                    .then(function(results) {
                        _.each(results, function(result) {
                            localStorageOrders[result.type] = result.value;
                        });

                        localStorageService.add(ordersLocalStorageKey, JSON.stringify(localStorageOrders));
                    });
            }
        }, true);

        /**
         * @ngdoc method
         * @methodOf requisition-order-create.synchronizeOrders
         * @name updateDraftOrders
         *
         * @param {Object} drafts id indexed drafts to update
         * @return {Promise} Promise which resolves to drafts which failed to update
         * @description Update draft orders saved offline
         */
        function updateDraftOrders(drafts) {
            var updatePromises = _.map(drafts, function(orderDraft) {
                return orderCreateService.update(orderDraft);
            });

            //eslint-disable-next-line no-undef
            return Promise.allSettled(updatePromises)
                .then(function(results) {
                    var successfulIds = notifyAboutStatusCountAndGetFailedIds(
                        results,
                        'requisition.orderCreate.draftUpdate.success',
                        'requisition.orderCreate.draftUpdate.error'
                    );

                    return mapOrdersExcludingNonSuccessful(drafts, successfulIds);
                });
        }

        /**
         * @ngdoc method
         * @methodOf requisition-order-create.synchronizeOrders
         * @name sendOfflineCreatedOrders
         * @param {Object} orders id indexed orders
         *
         * @return {Promise} Promise which resolves to orders which failed to create
         * @description Send orders created offline
         */
        function sendOfflineCreatedOrders(orders) {
            var sendPromises = _.map(orders, function(order) {
                return orderCreateService.send(order);
            });

            //eslint-disable-next-line no-undef
            return Promise.allSettled(sendPromises)
                .then(function(results) {
                    var successfulIds = notifyAboutStatusCountAndGetFailedIds(
                        results,
                        'requisition.orderCreate.createdOrderSent.success',
                        'requisition.orderCreate.createdOrderSent.error'
                    );

                    return mapOrdersExcludingNonSuccessful(orders, successfulIds);
                });
        }

        function notifyAboutStatusCountAndGetFailedIds(settledPromiseResults, successMsgKey, errorMsgKey) {
            var failCount = 0;
            var successCount = 0;
            var successfulIds = new Set();

            _.each(settledPromiseResults, function(result) {
                if (result.status === 'rejected') {
                    failCount++;
                    return;
                }

                if (result.status === 'fulfilled') {
                    successCount++;
                    successfulIds.add(result.value.id);
                }
            });

            if (failCount > 0) {
                notificationService.error(
                    messageService.get(errorMsgKey, {
                        count: failCount
                    })
                );
            }

            if (successCount > 0) {
                notificationService.success(
                    messageService.get(successMsgKey, {
                        count: successCount
                    })
                );
            }

            return successfulIds;
        }

        function mapOrdersExcludingNonSuccessful(orders, successfulIds) {
            var failedOrders = {};

            for (var orderId in orders) {
                if (!successfulIds.has(orderId)) {
                    failedOrders[orderId] = orders[orderId];
                }
            }

            return failedOrders;
        }

    }
})();

