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
     * @name requisition.requisitionCacheService
     *
     * @description
     * Stores requisitions locally, deals with returning correct list of requisitions for the current user.
     */
    angular
        .module('requisition')
        .service('requisitionCacheService', requisitionCacheService);

    requisitionCacheService.$inject = [
        'localStorageFactory', '$filter', 'paginationFactory', '$q', 'permissionService', 'authorizationService',
        'REQUISITION_RIGHTS'
    ];

    function requisitionCacheService(localStorageFactory, $filter, paginationFactory, $q, permissionService,
                                     authorizationService, REQUISITION_RIGHTS) {

        var offlineRequisitions = localStorageFactory('requisitions'),
            offlineBatchRequisitions = localStorageFactory('batchApproveRequisitions'),
            offlineProcessingPeriods = localStorageFactory('processingPeriods'),
            offlineUserPrograms = localStorageFactory('userPrograms'),
            offlineFacilities = localStorageFactory('facilities');

        this.cacheRequisition = cacheRequisition;
        this.cacheRequisitionToStorage = cacheRequisitionToStorage;
        this.cacheBatchRequisition = cacheBatchRequisition;
        this.search = search;
        this.removeById = removeById;
        this.getRequisition = getRequisition;
        this.getBatchRequisition = getBatchRequisition;

        /**
         * @ngdoc method
         * @methodOf requisition.requisitionCacheService
         * @name cacheRequisition
         *
         * @description
         * Caches given requisition in the local storage.
         *
         * @param {Object} requisition  the requisition to be cached
         */
        function cacheRequisition(requisition) {
            offlineRequisitions.put(minimizeRequisition(requisition));
        }

        /**
         * @ngdoc method
         * @methodOf requisition.requisitionCacheService
         * @name cacheRequisitionToStorage
         *
         * @description
         * Caches given requisition in the proper storage.
         *
         * @param {Object} requisition  the requisition to be cached
         * @param {Object} storage  the storage to save requisition
         */
        function cacheRequisitionToStorage(requisition, storage) {
            storage.put(minimizeRequisition(requisition));
        }

        /**
         * @ngdoc method
         * @methodOf requisition.requisitionCacheService
         * @name cacheBatchRequisition
         *
         * @description
         * Caches given batch requisition in the local storage.
         *
         * @param {Object} batchRequisition  the batch requisition to be cached
         */
        function cacheBatchRequisition(batchRequisition) {
            offlineBatchRequisitions.put(batchRequisition);
        }

        /**
         * @ngdoc method
         * @methodOf requisition.requisitionCacheService
         * @name search
         *
         * @description
         * Searched local storage and returns requisitions matching given parameters. In order to include batch
         * requisitions the "showBatchRequisitions" flag inside search parameters must be set to true. This method
         * will return requisitions that the user has access to.
         *
         * @param {Object}   searchParams  the search parameters
         * @return {Promise}               the promise resolving to a list of matching requisitions
         */
        function search(searchParams) {
            var requisitions = getRequisitionsFromCache(searchParams);

            return $q.all(requisitions.map(toAccessPromise))
                .then(filterOutRequisitionThatUserCanNotAccess(requisitions))
                .then(getRequisitionPage(searchParams));
        }

        /**
         * @ngdoc method
         * @methodOf requisition.requisitionCacheService
         * @name removeById
         *
         * @description
         * Remove a non-batch requisition with the given ID.
         *
         * @param {string} requisitionId  the ID of the requisition to delete
         */
        function removeById(requisitionId) {
            offlineRequisitions.removeBy('id', requisitionId);
        }

        /**
         * @ngdoc method
         * @methodOf requisition.requisitionCacheService
         * @name getRequisition
         *
         * @description
         * Fetches a non-batch requisition with the given ID.
         *
         * @param {string}  id  the requisition ID
         * @return {Object}     the matching requisition
         */
        function getRequisition(id) {
            return offlineRequisitions.getBy('id', id);
        }

        /**
         * @ngdoc method
         * @methodOf requisition.requisitionCacheService
         * @name getBatchRequisition
         *
         * @description
         * Fetches a batch requisition with the given ID.
         *
         * @param {string}  id  the batch requisition ID
         * @return {Object}     the matching batch requisition
         */
        function getBatchRequisition(id) {
            return offlineBatchRequisitions.getBy('id', id);
        }

        function getRequisitionsFromCache(searchParams) {
            var requisitions = offlineRequisitions.search(searchParams, 'requisitionSearch'),
                batchRequisitions = searchParams.showBatchRequisitions ?
                    offlineBatchRequisitions.search(searchParams.program, 'requisitionSearch') : [];

            angular.forEach(batchRequisitions, function(batchRequisition) {
                if ($filter('filter')(requisitions, {
                    id: batchRequisition.id
                }).length === 0) {
                    requisitions.push(batchRequisition);
                }
            });

            requisitions.forEach(function(requisition) {
                var processingPeriod = offlineProcessingPeriods.getBy('id', requisition.processingPeriod.id);
                var program = offlineUserPrograms.getBy('id', requisition.program.id);
                var facilities = offlineFacilities.getBy('id', requisition.facility.id);
                requisition.processingPeriod = processingPeriod;
                requisition.program = program;
                requisition.facility = facilities;
            });
            return requisitions;
        }

        function toAccessPromise(requisition) {
            return $q
                .all([
                    hasPermissionStringForRequisition(requisition),
                    hasRightForRequisition(requisition)
                ])
                .then(function(responses) {
                    return responses[0] || responses[1];
                });
        }

        function hasPermissionStringForRequisition(requisition) {
            var user = authorizationService.getUser();
            return permissionService
                .hasPermission(user.user_id, {
                    right: REQUISITION_RIGHTS.REQUISITION_VIEW,
                    programId: requisition.program.id,
                    facilityId: requisition.facility.id
                })
                .then(function() {
                    return true;
                })
                .catch(function() {
                    return false;
                });
        }

        function hasRightForRequisition(requisition) {
            return permissionService.hasRoleWithRightForProgramAndSupervisoryNode(
                REQUISITION_RIGHTS.REQUISITION_VIEW,
                requisition
            );
        }

        function filterOutRequisitionThatUserCanNotAccess(requisitions) {
            return function(hasAccessTo) {
                return requisitions.filter(function(requisition, index) {
                    return hasAccessTo[index];
                });
            };
        }

        function getRequisitionPage(searchParams) {
            return function(requisitions) {
                var page = searchParams.page,
                    size = searchParams.size,
                    items = paginationFactory.getPage(requisitions, page, size),
                    totalPages = Math.ceil(requisitions.length / size);

                return {
                    first: page === 0,
                    last: page + 1 === totalPages,
                    number: page,
                    numberOfElements: items.length,
                    size: size,
                    sort: searchParams.sort,
                    totalElements: requisitions.length,
                    totalPages: totalPages,
                    content: items
                };
            };
        }

        function minimizeRequisition(requisition) {
            var requisitionToSave = JSON.parse(JSON.stringify(requisition));
            requisitionToSave.requisitionLineItems.forEach(function(lineItem) {
                lineItem.orderable = getVersionedObjectReference(lineItem.orderable);
                lineItem.approvedProduct = lineItem.approvedProduct ?
                    getVersionedObjectReference(lineItem.approvedProduct) : undefined;
            });
            requisitionToSave.availableFullSupplyProducts = undefined;
            requisitionToSave.availableNonFullSupplyProducts = undefined;
            return requisitionToSave;
        }

        function getVersionedObjectReference(resource) {
            if (resource.meta) {
                return {
                    id: resource.id,
                    versionNumber: resource.meta.versionNumber
                };
            }
            return resource;
        }
    }
})();
