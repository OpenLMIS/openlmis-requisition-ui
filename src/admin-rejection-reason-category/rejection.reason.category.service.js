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
     * @name admin-rejection-reason-category.RejectionReasonCategoryService
     *
     * @description
     * Responsible for retrieving all Rejection Reason Category information from server.
     */
    angular
        .module('admin-rejection-reason-category')
        .service('rejectionReasonCategoryService', service);

    service.$inject = [
        '$q', '$resource', 'openlmisUrlFactory', 'offlineService',
        'localStorageFactory', 'localStorageService'
    ];

    function service($q, $resource, openlmisUrlFactory, offlineService,
                     localStorageFactory, localStorageService) {

        var resource = $resource(openlmisUrlFactory('/api/rejectionReasonCategories/:id'), {}, {
                getAll: {
                    url: openlmisUrlFactory('/api/rejectionReasonCategories'),
                    method: 'GET',
                    isArray: false
                },
                update: {
                    method: 'PUT'
                }
            }),
            rejectionReasonCategoriesCache = localStorageFactory('rejectionReasonCategories');

        return {
            get: getRejectionReasonCategory,
            getAll: getRejectionReasonCategories,
            search: search,
            update: updateRejectionReasonCategory,
            create: createRejectionReasonCategory,
            clearRejectionReasonCategoriesCache: clearRejectionReasonCategoriesCache
        };

        /**
         * @ngdoc method
         * @methodOf admin-rejection-reason-category.RejectionReasonCategoryService
         * @name getRejectionReasonCategory
         *
         * @description
         * Gets Rejection Reason Category by id.
         *
         * @param  {String}  id Rejection Reason Category UUID
         * @return {Promise} Rejection Reason Category info
         */
        function getRejectionReasonCategory(id) {
            var cachedRejectionReasonCategory = rejectionReasonCategoriesCache.getBy('id', id);
            if (cachedRejectionReasonCategory) {
                return $q.resolve(cachedRejectionReasonCategory);
            }
            return resource.get({
                id: id
            }).$promise;
        }

        /**
         * @ngdoc method
         * @methodOf admin-rejection-reason-category.RejectionReasonCategoryService
         * @name getRejectionReasonCategories
         *
         * @description
         * Gets all Rejection Reason Categories.
         *
         * @return {Promise} Array of all Rejection Reason Categories
         */
        function getRejectionReasonCategories() {
            return resource.getAll().$promise;
        }

        /**
         * @ngdoc method
         * @methodOf admin-rejection-reason-category.RejectionReasonCategoryService
         * @name search
         *
         * @description
         * Searches rejection reason category using given parameters.
         *
         * @param  {Object}  paginationParams the pagination parameters
         * @param  {Object}  queryParams      the search parameters
         * @return {Promise}                  the requested page of filtered rejection reason category.
         */
        function search(paginationParams, queryParams) {
            return resource.search(paginationParams, queryParams).$promise;
        }

        /**
         * @ngdoc method
         * @methodOf admin-rejection-reason-category.RejectionReasonCategoryService
         * @name createRejectionReasonCategory
         *
         * @description
         * Creates new rejection reason category.
         *
         * @param  {Object}  rejectionReasonCategory Rejection Reason Category to be created
         * @return {Promise}         Updated rejection reason category
         */
        function createRejectionReasonCategory(rejectionReasonCategory) {
            return resource.save(null, rejectionReasonCategory).$promise;
        }

        /**
         * @ngdoc method
         * @methodOf admin-rejection-reason-category.RejectionReasonCategoryService
         * @name updateRejectionReasonCategory
         *
         * @description
         * Updates rejection reason category.
         *
         * @param  {Object}  rejectionReasonCategories Rejection Reason Category to be updated
         * @return {Promise}         Updated rejection reason category
         */
        function updateRejectionReasonCategory(rejectionReasonCategories) {

            return resource.update({
                id: rejectionReasonCategories.id
            }, rejectionReasonCategories)
                .$promise
                .then(function(rejectionReasonCategories) {
                    rejectionReasonCategoriesCache.put(rejectionReasonCategories);
                    return rejectionReasonCategories;
                })
                .catch(function() {
                    return $q.reject();
                });
        }

        /**
         * @ngdoc method
         * @methodOf admin-rejection-reason-category.RejectionReasonCategoryService
         * @name clearRejectionReasonCategoriesCache
         *
         * @description
         * Deletes rejectionReasonCategory stored in the browser cache.
         */
        function clearRejectionReasonCategoriesCache() {
            localStorageService.remove('rejectionReasonCategories');
        }
    }

})();