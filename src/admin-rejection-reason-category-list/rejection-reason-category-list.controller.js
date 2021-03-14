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
     * @name admin-rejection-.controller:RejectionReasonCategoryListController
     *
     * @description
     * Controller for listing Rejection Reason Categories.
     */
    angular
        .module('admin-rejection-reason-category-list')
        .controller('RejectionReasonCategoryListController', controller);

    controller.$inject = ['$state', 'rejectionReasonCategories'];

    function controller($state, rejectionReasonCategories) {
        var vm = this;

        vm.goToAddRejectionReasonCategoryPage = goToAddRejectionReasonCategoryPage;

        /**
         * @ngdoc property
         * @propertyOf admin-rejection-.controller:RejectionReasonCategoryListController
         * @name rejectionReasonCategories
         * @type {Object}
         *
         * @description
         * Rejection Reason Category object
         */
        vm.rejectionReasonCategories = rejectionReasonCategories;

        /**
         * @ngdoc property
         * @propertyOf admin-rejection-.controller:RejectionReasonCategoryListController
         * @name invalidMessage
         * @type {String}
         *
         * @description
         * Holds form error message.
         */
        vm.invalidMessage = undefined;

        /**
         * @ngdoc method
         * @methodOf admin-rejection-.controller:RejectionReasonCategoryListController
         * @name goToAddRejectionReasonCategoryPage
         *
         * @description
         * Take you to a page for adding reason category.
         */
        function goToAddRejectionReasonCategoryPage() {
            $state.go('openlmis.administration.rejectionReasonCategories.add');
        }
    }

})();
