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

    var NET_CONTENT = 10;

    var vm, $scope, adjustmentsModalService, lineItem, lineItem2, requisitionValidatorMock, $q, calculationFactory,
        columns, reasonOne, reasonTwo, messageService, quantityUnitCalculateService, dosesBracket;

    beforeEach(function() {
        module('requisition-losses-and-adjustments', function($provide) {
            $provide.value('featureFlagService', {
                set: function() {},
                get: function() {}
            });
        });
        module('requisition-view-tab');

        module(function($provide) {
            requisitionValidatorMock = jasmine.createSpyObj('requisitionValidator', ['validateLineItem']);

            $provide.factory('requisitionValidator', function() {
                return requisitionValidatorMock;
            });
        });

        inject(function($injector) {
            adjustmentsModalService = $injector.get('adjustmentsModalService');
            calculationFactory = $injector.get('calculationFactory');
            messageService = $injector.get('messageService');
            quantityUnitCalculateService = $injector.get('quantityUnitCalculateService');
            dosesBracket = messageService.get('openlmisInputDosesPacks.DosesBracket');
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

        spyOn($scope, '$watchCollection').andCallThrough();
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

    describe('getDisplayedQuantity', function() {

        beforeEach(function() {
            $scope.lineItem = {
                id: 'line-item-id',
                stockAdjustments: [],
                orderable: {
                    netContent: NET_CONTENT
                }
            };

            vm.$onInit();
        });

        describe('in packs mode', function() {

            beforeEach(function() {
                $scope.requisition.showInDoses = function() {
                    return false;
                };
            });

            [undefined, null, 0].forEach(function(total) {
                it('should display zero packs if total is ' + total, function() {
                    vm.lineItem.totalLossesAndAdjustments = total;

                    expect(vm.getDisplayedQuantity()).toEqual('0 ( +0' + dosesBracket);
                });
            });

            it('should split a positive total into packs and remaining doses', function() {
                vm.lineItem.totalLossesAndAdjustments = 12;

                expect(vm.getDisplayedQuantity()).toEqual('1 ( +2' + dosesBracket);
            });

            it('should not clamp a negative total to zero', function() {
                spyOn(quantityUnitCalculateService, 'recalculateSOHQuantity').andCallThrough();
                vm.lineItem.totalLossesAndAdjustments = -25;

                vm.getDisplayedQuantity();

                expect(quantityUnitCalculateService.recalculateSOHQuantity)
                    .toHaveBeenCalledWith(-25, NET_CONTENT, false);
            });

            [undefined, null, 0].forEach(function(netContent) {
                it('should display zero if net content is ' + netContent, function() {
                    vm.lineItem.orderable.netContent = netContent;
                    vm.lineItem.totalLossesAndAdjustments = 12;

                    expect(vm.getDisplayedQuantity()).toEqual(0);
                });
            });

        });

        describe('in doses mode', function() {

            beforeEach(function() {
                $scope.requisition.showInDoses = function() {
                    return true;
                };
            });

            [undefined, null].forEach(function(total) {
                it('should display zero if total is ' + total, function() {
                    vm.lineItem.totalLossesAndAdjustments = total;

                    expect(vm.getDisplayedQuantity()).toEqual(0);
                });
            });

            [0, 12, -25].forEach(function(total) {
                it('should display the total unchanged if it is ' + total, function() {
                    vm.lineItem.totalLossesAndAdjustments = total;

                    expect(vm.getDisplayedQuantity()).toEqual(total);
                });
            });

        });

    });

    describe('showModal', function() {
        beforeEach(function() {
            spyOn(adjustmentsModalService, 'open').andReturn($q.when());
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
                    vm.lineItem,
                    true,
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
