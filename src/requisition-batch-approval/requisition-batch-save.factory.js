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
     * @name requisition-batch-approval.requisitionBatchSaveFactory
     *
     * @description
     * Takes a list of requisitions and will try to save them. The factory
     * returns a promise that will either resolve or return with a rejection.
     *
     * This factory will implicitly modify any requisitions passed to it.
     * 
     */
    angular
        .module('requisition-batch-approval')
        .factory('requisitionBatchSaveFactory', factory);

    factory.$inject = ['$q', '$filter', 'localStorageFactory', 'requisitionBatchApprovalService', 'messageService'];

    function factory($q, $filter, localStorageFactory, requisitionBatchApprovalService, messageService) {

        var factory = {
            saveRequisitions: saveRequisitions
        };
        return factory;

        /**
         * @ngdoc method
         * @methodOf requisition-batch-approval.requisitionBatchSaveFactory
         * @name saveRequisitions
         *
         * @param {Array} requisitionObjects A list of requisition objects to save
         *
         * @return {Promise} A promise that returns a list of errors on failure
         *
         * @description
         * Takes a list of requisitionObjects and attempts to save them to the
         * OpenLMIS Server.
         * 
         */
        function saveRequisitions(requisitions) {

            if (!Array.isArray(requisitions) || requisitions.length === 0) {
                return $q.reject([]);
            }

            var deferred = $q.defer(),
                offlineBatchRequisitions = localStorageFactory('batchApproveRequisitions'),
                offlineRequisitions = localStorageFactory('requisitions'),
                requisitionDtos = [];

            requisitions.forEach(function(requisition) {
                delete requisition.$error;
                requisitionDtos.push(transformRequisition(requisition));
            });

            requisitionBatchApprovalService.saveAll(requisitionDtos).then(function(response) {

                angular.forEach(requisitions, function(requisition) {
                    var savedRequisition = $filter('filter')(response.requisitionDtos, {
                        id: requisition.id
                    });
                    saveToStorage(angular.copy(savedRequisition[0]), offlineBatchRequisitions);
                });

                return deferred.resolve(response.requisitionDtos);
            }, function(response) {
                var requisitionErrors = response.data && response.data.requisitionErrors || [],
                    savedRequisitions = response.data && response.data.requisitionDtos || [];

                angular.forEach(requisitions, function(requisition) {
                    var requisitionError = $filter('filter')(requisitionErrors, {
                            requisitionId: requisition.id
                        }),
                        savedRequisition = $filter('filter')(savedRequisitions, {
                            id: requisition.id
                        });
                    if (requisitionError.length > 0) {
                        requisition.$error = requisitionError[0].errorMessage.message;
                        if (isDateModifiedMismatchMessage(requisitionError[0].errorMessage.messageKey)) {
                            // In case of outdated requisition remove it from storage
                            removeFromStorage(requisition, offlineBatchRequisitions);
                            removeFromStorage(requisition, offlineRequisitions);
                        }
                    } else if (savedRequisition.length > 0) {
                        //Save successful requisitions to storage
                        saveToStorage(angular.copy(savedRequisition[0]), offlineBatchRequisitions);
                    } else {
                        requisition.$error = messageService.get('requisitionBatchApproval.errorSave');
                    }
                });

                return deferred.reject(savedRequisitions);
            });

            return deferred.promise;
        }

        function transformRequisition(requisition) {
            var requestBody = angular.copy(requisition);
            angular.forEach(requestBody.requisitionLineItems, function(lineItem) {
                transformLineItem(lineItem);
            });

            return requestBody;
        }

        function transformLineItem(lineItem) {
            lineItem.totalCost = null;
        }

        function saveToStorage(requisition, storage) {
            requisition.$availableOffline = true;
            delete requisition.$outdated;
            delete requisition.$modified;
            storage.put(requisition);
        }

        function removeFromStorage(requisition, storage) {
            storage.removeBy('id', requisition.id);
        }

        function isDateModifiedMismatchMessage(messageKey) {
            return messageKey === 'requisition.error.validation.dateModifiedMismatch';
        }
    }

})();
