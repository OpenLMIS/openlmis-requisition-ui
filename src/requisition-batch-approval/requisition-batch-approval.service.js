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
     * @name requisition-batch-approval.requisitionBatchApprovalService
     *
     * @description
     * Responsible for retrieving all information from server.
     */
    angular
        .module('requisition-batch-approval')
        .service('requisitionBatchApprovalService', service);

    service.$inject = ['$q', '$resource',  'requisitionUrlFactory', 'localStorageFactory', 'offlineService'];

    function service($q, $resource, requisitionUrlFactory, localStorageFactory, offlineService) {

        var offlineRequisitions = localStorageFactory('batchApproveRequisitions');

        var resource = $resource(requisitionUrlFactory('/api/requisitions?retrieveAll'), {}, {
            get: {
                method: 'GET'
            },
            saveAll: {
                method: 'PUT',
                url: requisitionUrlFactory('/api/requisitions?saveAll')
            },
            approveAll: {
                method: 'POST',
                url: requisitionUrlFactory('/api/requisitions?approveAll')
            }
        });

        var service = {
            get: get,
            saveAll: saveAll,
            approveAll: approveAll
        };

        return service;

        /**
         * @ngdoc method
         * @methodOf requisition-batch-approval.requisitionBatchApprovalService
         * @name get
         *
         * @description
         * Retrieves requisitions by ids. Requisitions modified locally are taken from the local storage. When online,
         * the ones stored with products reduced to version references are also fetched, and get their products back
         * from the server copy while keeping the local changes. If only those fail to be fetched, they are returned
         * as stored.
         *
         * @param  {String}  ids Requisition UUIDs
         * @return {Promise}    requisition promise
         */
        function get(ids) {
            var deferred = $q.defer(),
                idsArray = [],
                offlineResponse = [];

            if (offlineService.isOffline()) {

                angular.forEach(ids, function(id) {
                    var requisition = offlineRequisitions.getBy('id', id);
                    if (requisition) {
                        offlineResponse.push(requisition);
                    } else {
                        deferred.reject();
                    }
                });

                deferred.resolve(offlineResponse);
            } else {
                var reducedById = {};

                angular.forEach(ids, function(id) {
                    var requisition = offlineRequisitions.search({
                        id: id,
                        $modified: true
                    });
                    if (!requisition || !requisition.length) {
                        idsArray.push(id);
                    } else if (hasReducedProducts(requisition[0])) {
                        idsArray.push(id);
                        reducedById[requisition[0].id] = requisition[0];
                        offlineResponse.push(requisition[0]);
                    } else {
                        offlineResponse.push(requisition[0]);
                    }
                });

                if (idsArray.length > 0) {
                    var resolveWith = function(requisitionDtos) {
                        var fetched = [];

                        angular.forEach(requisitionDtos, function(requisitionDto) {
                            var reducedRequisition = reducedById[requisitionDto.id];
                            if (reducedRequisition) {
                                restoreProducts(reducedRequisition, requisitionDto);
                                offlineRequisitions.put(reducedRequisition);
                            } else {
                                saveToLocalStorage(requisitionDto);
                                fetched.push(requisitionDto);
                            }
                        });
                        deferred.resolve(fetched.concat(offlineResponse));
                    };

                    getRequisitions(idsArray).then(function(response) {
                        resolveWith(response.requisitionDtos);
                    }, function(response) {
                        var failedIds = getFailedIds(response, idsArray),
                            onlyStoredFailed = failedIds.every(function(id) {
                                return reducedById[id];
                            });

                        if (onlyStoredFailed) {
                            resolveWith(response.data && response.data.requisitionDtos);
                        } else {
                            deferred.reject(response);
                        }
                    });
                } else {
                    deferred.resolve(offlineResponse);
                }

            }

            return deferred.promise;
        }

        function saveAll(requisitions) {
            return resource.saveAll(requisitions).$promise;
        }

        function approveAll(ids) {
            return resource.approveAll({
                id: ids.join(',')
            }, {}).$promise;
        }

        function getRequisitions(ids) {
            return resource.get({
                id: ids.join(',')
            }).$promise;
        }

        function getFailedIds(response, requestedIds) {
            var errors = response && response.status === 400 && response.data && response.data.requisitionErrors;
            if (!errors || !errors.length) {
                return requestedIds;
            }
            return errors.map(function(error) {
                return error.requisitionId;
            });
        }

        // The server leaves out a product that every requisition in the response skips, so a skipped line
        // may never get its product back.
        function hasReducedProducts(requisition) {
            return requisition.requisitionLineItems.some(function(lineItem) {
                return !lineItem.skipped && !lineItem.orderable.productCode;
            });
        }

        function restoreProducts(requisition, requisitionDto) {
            requisition.requisitionLineItems.forEach(function(lineItem) {
                requisitionDto.requisitionLineItems.forEach(function(lineItemDto) {
                    if (lineItemDto.orderable.id === lineItem.orderable.id) {
                        lineItem.orderable = lineItemDto.orderable;
                    }
                });
            });
        }

        function saveToLocalStorage(requisition) {
            requisition.$availableOffline = true;
            requisition.$modified = false;
            offlineRequisitions.put(requisition);
        }
    }
})();