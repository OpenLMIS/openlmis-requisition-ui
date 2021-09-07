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

describe('LossesAndAdjustmentsController', function() {

    var vm, $scope, adjustmentsModalService, lineItem, lineItem2, requisitionValidatorMock, $q, calculationFactory,
        columns, reasonOne, reasonTwo;

    beforeEach(function() {
        module('requisition-losses-and-adjustments');

        module(function($provide) {
            requisitionValidatorMock = jasmine.createSpyObj('requisitionValidator', ['validateLineItem']);

            $provide.factory('requisitionValidator', function() {
                return requisitionValidatorMock;
            });
        });

        inject(function($injector) {
            adjustmentsModalService = $injector.get('adjustmentsModalService');
            calculationFactory = $injector.get('calculationFactory');
            $q = $injector.get('$q');

            $scope = $injector.get('$rootScope').$new();

            columns = [{
                type: $injector.get('COLUMN_TYPES').NUMERIC,
                name: 'totalLossesAndAdjustments',
                source: $injector.get('COLUMN_SOURCES').USER_INPUT
            }];

            vm = $injector.get('$controller')('LossesAndAdjustmentsController', {
                $scope: $scope
            });
        });

        lineItem = {
            id: 'line-item-id'
        };

        lineItem2 = {
            id: 'line-item-id',
            stockAdjustments: [{
                reasonId: 'reason-one',
                quantity: 20
            }]
        };

        reasonOne = {
            id: 'reason-one'
        };

        reasonTwo = {
            id: 'reason-two'
        };

        $scope.requisition = {
            id: 'requisition-id',
            $stockAdjustments: [],
            template: {
                columnsMap: columns
            },
            stockAdjustmentReasons: [reasonOne, reasonTwo]
        };
        vm.isDisabled = false;

        spyOn($scope, '$watchCollection').and.callThrough();
        spyOn(calculationFactory, 'totalLossesAndAdjustments');
    });

    it('$onInit should not validate lineItem on first load', function() {
        $scope.lineItem = lineItem;

        vm.$onInit();

        expect(requisitionValidatorMock.validateLineItem).not.toHaveBeenCalled();
    });

    it('$onInit should call watchCollection', function() {
        $scope.lineItem = lineItem;

        vm.$onInit();

        expect($scope.$watchCollection).toHaveBeenCalled();
    });

    it('$onInit should validate lineItem after change', function() {
        $scope.lineItem = lineItem2;

        vm.$onInit();

        vm.lineItem = jasmine.createSpyObj('lineItem', [
            'getFieldValue', 'updateDependentFields'
        ]);

        $scope.lineItem = lineItem2;
        $scope.$digest();

        $scope.lineItem.stockAdjustments = [{
            reasonId: 'reason-one',
            quantity: 10
        }];
        $scope.$digest();

        expect(calculationFactory.totalLossesAndAdjustments).toHaveBeenCalled();
        expect(vm.lineItem.updateDependentFields).toHaveBeenCalled();
        expect(requisitionValidatorMock.validateLineItem).toHaveBeenCalled();
    });

    it('$onInit should expose lineItem', function() {
        $scope.lineItem = lineItem;

        vm.$onInit();

        expect(vm.lineItem).toEqual($scope.lineItem);
    });

    describe('showModal', function() {
        beforeEach(function() {
            spyOn(adjustmentsModalService, 'open').and.returnValue($q.when());
            $scope.lineItem = lineItem2;
            vm.$onInit();
        });

        it('should call adjustmentsModalService', function() {
            vm.showModal();

            expect(adjustmentsModalService.open).toHaveBeenCalled();
        });

        it('should call adjustmentsModalService with proper params', function() {
            vm.showModal();

            expect(adjustmentsModalService.open)
                .toHaveBeenCalledWith(
                    [{
                        quantity: 20,
                        reason: reasonOne
                    }],
                    [reasonTwo],
                    'requisitionLossesAndAdjustments.lossesAndAdjustments',
                    'requisitionLossesAndAdjustments.addNewLossOrAdjustment',
                    vm.isDisabled,
                    {
                        'requisitionLossesAndAdjustments.total': jasmine.any(Function)
                    },
                    undefined,
                    undefined,
                    jasmine.any(Function)
                );
        });
    });
});
