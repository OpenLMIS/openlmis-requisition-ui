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
     * @ngdoc controller
     * @name admin-rejection-reason-category.controller:RejectionReasonCategoryViewController
     *
     * @description
     * Controller for add Rejection Reasons Category.
     */
    angular
        .module('admin-rejection-reason-category-view')
        .controller('RejectionReasonCategoryViewController', controller);

    controller.$inject = ['$state', 'stateTrackerService', 'rejectionReasonCategory',
        'loadingModalService', 'RejectionReasonCategoryRepository', 'notificationService'];

    function controller($state, stateTrackerService, rejectionReasonCategory, loadingModalService,
                        RejectionReasonCategoryRepository, notificationService) {
        var vm = this;

        vm.$onInit = onInit;
        vm.goToPreviousState = stateTrackerService.goToPreviousState;
        vm.rejectionReasonCategory = rejectionReasonCategory;
        vm.saveRejectionReasonCategoryDetails = updateRejectionReasonCategory;

        function onInit() {
            vm.rejectionReasonCategory = angular.copy(rejectionReasonCategory);
        }

        /**
         * @ngdoc method
         * @methodOf admin-rejection-reason-category.controller:RejectionReasonCategoryViewController
         * @name saveRejectionReasonCategoryDetails
         *
         * @description
         * Saves the rejection reason category and takes user back to the previous state.
         */
        function updateRejectionReasonCategory() {
            return doUpdateRejectionReasonCategory().then(function(response) {
                $state.go('admin-rejection-reason-category-list', {
                    rejectionReasonCategory: response
                });
            });
        }

        function doUpdateRejectionReasonCategory() {
            loadingModalService.open();
            return new RejectionReasonCategoryRepository().create(vm.rejectionReasonCategory)
                .then(function(rejectionReasonCategory) {
                    notificationService.success('adminRejectionReasonCategory.saved');
                    stateTrackerService.goToPreviousState();
                    return rejectionReasonCategory;
                })
                .catch(function() {
                    notificationService.error('adminRejectionReasonCategory.failedToSaveRejectionReasonCategory');
                    loadingModalService.close();
                });
        }
    }
})();