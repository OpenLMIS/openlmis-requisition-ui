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
     * @name admin-rejection-reason.controller:RejectionReasonViewController
     *
     * @description
     * Controller for add Rejection Reasons.
     */
    angular
        .module('admin-rejection-reason-view')
        .controller('RejectionReasonViewController', controller);

    controller.$inject = ['$state', 'stateTrackerService', 'rejectionReason',
        'loadingModalService', 'RejectionReasonRepository', 'notificationService', 'rejectionReasonCategories'];

    function controller($state, stateTrackerService, rejectionReason, loadingModalService,
                        RejectionReasonRepository, notificationService, rejectionReasonCategories) {
        var vm = this;

        vm.$onInit = onInit;
        vm.goToPreviousState = stateTrackerService.goToPreviousState;
        vm.rejectionReason = rejectionReason;
        vm.saveRejectionReasonDetails = updateRejectionReason;
        vm.rejectionReasonCategories = rejectionReasonCategories.content;

        function onInit() {
            vm.rejectionReason = angular.copy(rejectionReason);
            vm.name = rejectionReason.name;
        }

        /**
         * @ngdoc method
         * @methodOf admin-rejection-reason.controller:RejectionReasonViewController
         * @name updateRejectionReasonDetails
         *
         * @description
         * Update the rejection reason and takes user back to the previous state.
         */
        function updateRejectionReason() {
            return doUpdateRejectionReason().then(function(response) {
                $state.go('admin-rejection-reason-list', {
                    rejectionReason: response
                });
            });
        }

        function doUpdateRejectionReason() {
            loadingModalService.open();
            return new RejectionReasonRepository().create(vm.rejectionReason)
                .then(function(rejectionReason) {
                    notificationService.success('adminRejectionReason.saved');
                    stateTrackerService.goToPreviousState();
                    return rejectionReason;
                })
                .catch(function() {
                    notificationService.error('adminRejectionReason.failedToSaveRejectionReason');
                    loadingModalService.close();
                });
        }
    }
})();