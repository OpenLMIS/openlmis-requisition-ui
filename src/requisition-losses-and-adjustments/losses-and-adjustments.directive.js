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
     * @ngdoc directive
     * @restrict A
     * @name requisition-product-grid.lossesAndAdjustments
     *
     * @description
     * Responsible for creating total losses and adjustments cell in product grid.
     * It opens modal that displays reasons upon clicking it.
     *
     * If the input is disabled, then the modal will be in a readOnly state.
     *
     * @example
     * This directive requires 'requisition' and 'line-item' attributes.
     * ```
     * <div losses-and-adjustments
     *     line-item="lineItem"
     *     requisition="requisition"></div>
     * ```
     *
     * This is how product grid cell will look after rendering.
     * ```
     * <a class="losses-and-adjustments icon-link" ng-click="vm.showModal()">
     *     {{vm.getDisplayedQuantity() || 0}}
     * </a>
     * ```
     */
    angular
        .module('requisition-losses-and-adjustments')
        .directive('lossesAndAdjustments', lossesAndAdjustments);

    lossesAndAdjustments.$inject = [];

    function lossesAndAdjustments() {

        var directive = {
            restrict: 'A',
            replace: true,
            controller: 'LossesAndAdjustmentsController',
            controllerAs: 'vm',
            templateUrl: 'requisition-losses-and-adjustments/losses-and-adjustments-cell.html',
            scope: {
                lineItem: '=',
                requisition: '='
            },
            link: link
        };
        return directive;

        function link(scope, element, attr, vm) {
            scope.$watch(function() {
                return attr.disabled;
            }, function(disabled) {
                vm.isDisabled = !!disabled;
            });
        }
    }

})();
