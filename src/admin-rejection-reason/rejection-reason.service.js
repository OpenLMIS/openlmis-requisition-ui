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
     * @name admin-rejection-reason.RejectionReasonService
     *
     * @description
     * Responsible for retrieving all Rejection Reason information from server.
     */
    angular
        .module('admin-rejection-reason')
        .service('rejectionReasonService', service);

    service.$inject = [
        '$q', '$resource', 'openlmisUrlFactory', 'offlineService',
        'localStorageFactory', 'permissionService', 'FacilityResource', 'localStorageService'
    ];

    function service($q, $resource, openlmisUrlFactory, offlineService,
                     localStorageFactory, permissionService, FacilityResource, localStorageService) {

        var resource = $resource(openlmisUrlFactory('/api/rejectionReasons/:id'), {}, {
                getAll: {
                    url: openlmisUrlFactory('/api/rejectionReasons'),
                    method: 'GET',
                    isArray: false
                },
                update: {
                    method: 'PUT'
                }
            }),
            rejectionReasonsCache = localStorageFactory('rejectionReasons');

        return {
            get: get,
            getAll: getAll,
            update: update,
            create: create,
            clearRejectionReasonsCache: clearRejectionReasonsCache
        };

        /**
         * @ngdoc method
         * @methodOf admin-rejection-reason.RejectionReasonService
         * @name get
         *
         * @description
         * Gets Rejection Reason by id.
         *
         * @param  {String}  id Rejection Reason UUID
         * @return {Promise} Rejection Reason info
         */
        function get(id) {
            var cachedRejectionReason = rejectionReasonsCache.getBy('id', id);
            if (cachedRejectionReason) {
                return $q.resolve(cachedRejectionReason);
            }
            return resource.get({
                id: id
            })
                .$promise;
        }

        /**
         * @ngdoc method
         * @methodOf admin-rejection-reason.RejectionReasonService
         * @name getAll
         *
         * @description
         * Gets all Rejection Reasons.
         *
         * @return {Promise} Array of all Rejection Reasons
         */
        function getAll() {
            return resource.getAll().$promise;
        }

        /**
         * @ngdoc method
         * @methodOf admin-rejection-reason.RejectionReasonService
         * @name create
         *
         * @description
         * Creates new rejection reason.
         *
         * @param  {Object}  rejectionReason Rejection Reason to be created
         * @return {Promise}         Updated rejection reason
         */
        function create(rejectionReason) {
            return resource.save(null, rejectionReason).$promise;
        }

        /**
         * @ngdoc method
         * @methodOf admin-rejection-reason.RejectionReasonService
         * @name update
         *
         * @description
         * Updates rejection reason.
         *
         * @param  {Object}  rejectionReasons Rejection Reason to be updated
         * @return {Promise}         Updated rejection reason
         */
        function update(rejectionReason) {
            return resource.update({
                id: rejectionReason.id
            }, rejectionReason)
                .$promise
                .then(function(rejectionReason) {
                    rejectionReasonsCache.put(rejectionReason);
                    return rejectionReason;
                })
                .catch(function() {
                    return $q.reject();
                });
        }

        /**
         * @ngdoc method
         * @methodOf admin-rejection-reason.RejectionReasonService
         * @name clearRejectionReasonsCache
         *
         * @description
         * Deletes rejectionReason stored in the browser cache.
         */
        function clearRejectionReasonsCache() {
            localStorageService.remove('rejectionReasons');
        }
    }

})();