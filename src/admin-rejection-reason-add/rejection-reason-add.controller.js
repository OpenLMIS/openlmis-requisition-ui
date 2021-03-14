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
     * @name admin-rejection-reason.controller:RejectionReasonAddController
     *
     * @description
     * Controller for add Rejection Reasons.
     */
    angular
        .module('admin-rejection-reason-add')
        .controller('RejectionReasonAddController', RejectionReasonAddController);

    RejectionReasonAddController.$inject = ['$state', 'loadingModalService', 'notificationService',
        'rejectionReasonCategories', 'RejectionReasonRepository', 'stateTrackerService'];

    function RejectionReasonAddController($state, loadingModalService, notificationService,
                                          rejectionReasonCategories, RejectionReasonRepository, stateTrackerService) {
        var vm = this;

        vm.save = save;
        vm.goToPreviousState = stateTrackerService.goToPreviousState;
        vm.rejectionReasonCategories = rejectionReasonCategories.content;
        vm.goToPreviousState = goToPreviousState;

        /**
         * @ngdoc property
         * @propertyOf admin-rejection-reason.controller:RejectionReasonAddController
         * @name invalidMessage
         * @type {String}
         *
         * @description
         * Holds form error message.
         */
        vm.invalidMessage = undefined;

        /**
         * @ngdoc method
         * @methodOf admin-rejection-reason.controller:RejectionReasonAddController
         * @name save
         *
         * @description
         * Saves the rejection reason and takes user back to the previous state.
         */
        function save() {
            return doSave().then(function(response) {
                $state.go('admin-rejection-reason-list', {
                    rejectionReason: response
                });
            });
        }

        function doSave() {
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

        /**
         * @ngdoc property
         * @methodOf admin-rejection-reason.controller:RejectionReasonAddController
         * @name goToPreviousState
         *
         * @description
         * Redirects user to rejection reason list screen.
         */
        function goToPreviousState() {
            $state.go('openlmis.administration.rejectionReasons');
        }
    }

})();