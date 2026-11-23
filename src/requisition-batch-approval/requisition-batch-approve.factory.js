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
     * @name requisition-batch-approval.requisitionBatchApprovalFactory
     *
     * @description
     * Takes a list of requisitions and will try to save/approve all of them.
     * The factory returns a promise that will either pass or return an error
     * array.
     *
     * This factory will implicitly modify any requisitions passed to it.
     */
    angular
        .module('requisition-batch-approval')
        .factory('requisitionBatchApproveFactory', factory);

    factory.$inject = [
        '$q', 'requisitionBatchSaveFactory', 'messageService', 'localStorageFactory', 'requisitionBatchApprovalService',
        'requisitionBatchValidationFactory'
    ];

    function factory($q, requisitionBatchSaveFactory, messageService, localStorageFactory,
                     requisitionBatchApprovalService, requisitionBatchValidationFactory) {

        var factory = {
            batchApprove: batchApprove
        };
        return factory;

        /**
         * @ngdoc method
         * @methodOf requisition-batch-approval.requisitionBatchApprovalFactory
         * @name batchApprove
         *
         * @param {Array} requisitions A list of requisition objects to approve
         *
         * @return {Promise} A promise that returns a list of errors on failure
         * and list of successfully approved requisitions
         *
         * @description
         * Main function of factory, which takes a list of requisitions
         * and tries to save then validate them. After that, only successfully validated requisitions
         * will be approved. Invalid requisitions won't be returned and error message will be applied.
         * 
         */
        function batchApprove(requisitions) {

            // Sending an error would complicate the contract, so we do
            // nothing (and pretend like it was a success)
            if (!Array.isArray(requisitions) || requisitions.length === 0) {
                return $q.reject([]);
            }

            return requisitionBatchSaveFactory.saveRequisitions(requisitions)
                .then(
                    requisitionBatchValidationFactory.validateRequisitions,
                    requisitionBatchValidationFactory.validateRequisitions
                )
                .then(approveRequisitions, approveRequisitions);
        }

        function approveRequisitions(requisitions) {
            var requisitionsObject = {},
                requisitionIds = [],
                offlineBatchRequisitions = localStorageFactory('batchApproveRequisitions');

            if (requisitions.length === 0) {
                return $q.resolve([]);
            }

            requisitions.forEach(function(requisition) {
                requisitionsObject[requisition.id] = requisition;
                requisitionIds.push(requisition.id);
            });

            var deferred = $q.defer();

            requisitionBatchApprovalService.approveAll(requisitionIds).then(function(response) {

                // All requisitions are approved so remove them from batchRequisitions storage
                angular.forEach(requisitions, function(requisition) {
                    removeFromStorage(requisition, offlineBatchRequisitions);
                });

                return deferred.resolve(response.requisitionDtos);
            })
                .catch(function(response) {
                    if (response.status === 400) {
                    // Process errors
                        if (response.data.requisitionErrors) {
                            response.data.requisitionErrors.forEach(function(error) {
                                if (requisitionsObject[error.requisitionId]) {
                                    requisitionsObject[error.requisitionId].$error = error.errorMessage.message ?
                                        error.errorMessage.message :
                                        messageService.get('requisitionBatchApproval.errorApprove');
                                }
                            });
                        }

                        // Process successful requisitions
                        var successfulRequisitions = [];
                        requisitions.forEach(function(requisition) {
                            if (!requisition.$error) {
                            // Remove successful requisitions from batchRequisitions storage
                                removeFromStorage(requisition, offlineBatchRequisitions);
                                successfulRequisitions.push(requisition);
                            }
                        });

                        return deferred.resolve(successfulRequisitions);
                    }
                    return deferred.reject([]);

                });

            return deferred.promise;

        }

        function removeFromStorage(requisition, storage) {
            storage.removeBy('id', requisition.id);
        }
    }

})();
