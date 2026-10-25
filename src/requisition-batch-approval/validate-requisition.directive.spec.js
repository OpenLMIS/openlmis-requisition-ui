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

describe('validateRequisition directive', function() {

    var $scope, div, $rootScope, $compile, $timeout;

    beforeEach(function() {
        module('requisition-batch-approval');

        inject(function($injector) {
            $rootScope = $injector.get('$rootScope');
            $compile = $injector.get('$compile');
            $timeout = $injector.get('$timeout');
        });

        $scope = $rootScope.$new();

        $scope.requisition = {
            $error: undefined,
            requisitionLineItems: [{
                productId: 'product-id-one',
                approvedQuantity: 10
            }, {
                productId: 'product-id-two',
                approvedQuantity: 11
            }, {
                productId: 'product-id-three',
                approvedQuantity: 12
            }, {
                productId: 'product-id-four',
                approvedQuantity: 13
            }]
        };

        div = compileMarkup(
            '<div>' +
                '<div ng-repeat="lineItem in requisition.requisitionLineItems">' +
                    '<input ng-model="lineItem.approvedQuantity" validate-requisition="requisition"' +
                        ' productId="lineItem.productId" required/>' +
                '</div>' +
            '</div>'
        );
    });

    describe('on openlmisInvalid.show', function() {

        it('should set error if any of the inputs is empty', function() {
            var input = div.find('div:nth-child(1) input');

            input.val('');
            input.triggerHandler('change');
            $scope.$apply();

            input.parent().trigger('openlmisInvalid.show');

            expect($scope.requisition.$error).not.toBeUndefined();
        });

        it('should unset error if all inputs are filled', function() {
            var input = div.find('div:nth-child(1) input');

            input.val('');
            input.triggerHandler('change');
            $scope.$apply();

            input.parent().trigger('openlmisInvalid.show');

            expect($scope.requisition.$error).not.toBeUndefined();

            input.val(15);
            input.triggerHandler('change');
            $scope.$apply();$timeout.flush();

            input.parent().trigger('openlmisInvalid.show');

            expect($scope.requisition.$error).toBeUndefined();
        });

    });

    describe('on openlmisInvalid.hide', function() {

        it('should set error if any of the inputs is empty', function() {
            var input = div.find('div:nth-child(1) input');

            input.val('');
            input.triggerHandler('change');
            $scope.$apply();

            input.parent().trigger('openlmisInvalid.hide');

            expect($scope.requisition.$error).not.toBeUndefined();
        });

        it('should unset error if all inputs are filled', function() {
            var input = div.find('div:nth-child(1) input');

            input.val('');
            input.triggerHandler('change');
            $scope.$apply();

            input.parent().trigger('openlmisInvalid.hide');

            expect($scope.requisition.$error).not.toBeUndefined();

            input.val(15);
            input.triggerHandler('change');
            $scope.$apply();$timeout.flush();

            input.parent().trigger('openlmisInvalid.hide');

            expect($scope.requisition.$error).toBeUndefined();
        });

    });

    describe('on blur (OLMIS-8127)', function() {

        it('should mark requisition invalid when blank field loses focus', function() {
            div.find('div:nth-child(1) input').val('');
            div.find('div:nth-child(1) input').triggerHandler('change');
            $scope.$apply();

            div.find('div:nth-child(1) input').triggerHandler('blur');

            div.find('div:nth-child(1) input')
                .parent()
                .trigger('openlmisInvalid.show');

            expect($scope.requisition.$error).not.toBeUndefined();
        });

        it('should not mark requisition invalid on blur when field is filled', function() {
            div.find('div:nth-child(1) input').val(5);
            div.find('div:nth-child(1) input').triggerHandler('change');
            $scope.$apply();

            div.find('div:nth-child(1) input').triggerHandler('blur');

            div.find('div:nth-child(1) input')
                .parent()
                .trigger('openlmisInvalid.show');

            expect($scope.requisition.$error).toBeUndefined();
        });

    });

    function compileMarkup(markup) {
        var element = $compile(markup)($scope);

        angular.element('body').append(element);
        $scope.$apply();

        return element;
    }

});
