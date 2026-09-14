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
     * @name requisition-batch-approval.invalidateRequisition
     * @restrict A
     *
     * @description
     * Validates requisition and show attaches an error when appropriate.
     *
     * @example
     * ```
     * <input ng-model="someModel" validate-requisition="requisitionObj" product-id="productIdString">
     * ```
     */
    angular
        .module('requisition-batch-approval')
        .directive('validateRequisition', directive);

    directive.$inject = ['messageService'];

    function directive(messageService) {
        var directive = {
            link: link,
            scope: {
                requisition: '=validateRequisition',
                productId: '='
            },
            restrict: 'A',
            require: 'ngModel'
        };
        return directive;

        function link(scope, element, attrs, ngModelCtrl) {
            var wrapper = element.parent(),
                requisition = scope.requisition,
                productId = scope.productId;

            //We don't want to store those errors in localStorage to prevent the requisitions
            //going invalid once we re-enter the state.
            if (!requisition.$$getErrors) {
                requisition.$$getErrors = getErrors();
            }

            ngModelCtrl.$viewChangeListeners.push(validateRequisition);
            element.on('blur', validateRequisition);

            wrapper.on('openlmisInvalid.show', updateMessage);
            wrapper.on('openlmisInvalid.hide', updateMessage);

            function updateMessage() {
                requisition.$error = isValid(requisition) ?
                    messageService.get('requisitionBatchApproval.invalidRequisition') :
                    undefined;
            }

            function validateRequisition() {
                var errors = requisition.$$getErrors();

                if (ngModelCtrl.$invalid) {
                    errors[productId] = true;
                } else {
                    delete errors[productId];
                }
            }

            function isValid(requisition) {
                return Object.keys(requisition.$$getErrors()).length > 0;
            }

            function getErrors() {
                var errors = [];
                return function() {
                    return errors;
                };
            }

        }
    }

})();
