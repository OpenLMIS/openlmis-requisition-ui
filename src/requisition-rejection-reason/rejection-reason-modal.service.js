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
     * @name requisition-rejection-reason.rejectionReasonModalService
     *
     * @description
     * Responsible for handling rejection reason modal.
     */
    angular
        .module('requisition-rejection-reason')
        .service('rejectionReasonModalService', rejectionReasonModalService);

    rejectionReasonModalService.$inject = ['openlmisModalService', '$filter'];

    function rejectionReasonModalService(openlmisModalService, $filter) {
        this.open = open;

        /**
         * @ngdoc method
         * @methodOf requisition-rejection-reason.rejectionReasonModalService
         * @name open
         *
         * @description
         * Opens the requisition rejection reason modal.
         *
         * @return {Promise}
         */
        function open() {
            return openlmisModalService.createDialog({
                templateUrl: 'requisition-view/rejection-reason-modal.html',
                backdrop: 'static',
                controllerAs: 'vm',
                show: true,
                controller: function(rejectionReasons, rejectionReasonCategories, modalDeferred) {
                    this.selectedRejectionReasons = [];
                    this.filteredRejectionReasons = [];

                    this.rejectionReasons = rejectionReasons;
                    this.rejectionReasonCategories = rejectionReasonCategories;
                    this.addRejectionReason = addRejectionReason;
                    this.removeRejectionReason = removeRejectionReason;
                    this.cancel = cancel;
                    this.save = save;
                    this.filterByCategory = filterByCategory;

                    function filterByCategory(selectedCategory) {
                        this.filteredRejectionReasons = $filter('filter')(this.rejectionReasons.content,
                            function(rejectionReason) {
                                return rejectionReason.rejectionReasonCategory.code === selectedCategory.code;
                            });
                    }

                    function addRejectionReason() {
                        this.selectedRejectionReasons.push(this.reason);
                        this.reason = {};
                        this.category = {};
                    }

                    function removeRejectionReason(reason) {
                        var index = this.selectedRejectionReasons.indexOf(reason);
                        if (index > -1) {
                            this.selectedRejectionReasons.splice(index, 1);
                        }
                    }

                    function cancel() {
                        modalDeferred.reject();
                    }

                    function save() {
                        modalDeferred.resolve(this.selectedRejectionReasons);
                    }
                },
                resolve: {
                    rejectionReasons: function(rejectionReasonService) {
                        return rejectionReasonService.getAll();
                    },
                    rejectionReasonCategories: function(rejectionReasonCategoryService) {
                        return rejectionReasonCategoryService.getAll();
                    }
                }
            }).promise;
        }
    }
})();
