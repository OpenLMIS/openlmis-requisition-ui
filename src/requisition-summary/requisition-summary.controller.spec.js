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

describe('RequisitionSummaryController', function() {

    var calculationFactory, lineItems, vm;

    beforeEach(function() {

        module('requisition-summary');

        lineItems = [
            createLineItem(false, true),
            createLineItem(false, true),
            createLineItem(false, false),
            createLineItem(false, false)
        ];

        inject(function(_$filter_, _calculationFactory_, $controller) {
            calculationFactory = _calculationFactory_;
            spyOn(calculationFactory, 'totalCost').and.callFake(function(lineItem) {
                if (lineItem === lineItems[0]) {
                    return 30.5;
                }
                if (lineItem === lineItems[1]) {
                    return 44;
                }
                if (lineItem === lineItems[2]) {
                    return 15;
                }
                if (lineItem === lineItems[3]) {
                    return 11.4;
                }
            });

            var requisitionMock = jasmine.createSpyObj('requisition', ['$isAfterAuthorize']);
            var templateMock = jasmine.createSpyObj('template', ['getColumn']);
            templateMock.getColumn.and.returnValue({
                name: 'orderQuantity',
                $display: true
            });
            requisitionMock.template = templateMock;
            requisitionMock.$isAfterAuthorize.and.returnValue(false);
            requisitionMock.requisitionLineItems = lineItems;
            requisitionMock.program = {
                showNonFullSupplyTab: true
            };

            vm = $controller('RequisitionSummaryController', {
                $scope: {
                    requisition: requisitionMock
                }
            });
        });

    });

    describe('initialization', function() {

        it('should expose requistion', function() {
            expect(vm.requisition).not.toBeUndefined();
        });

        it('should set showNonFullSupplySummary property', function() {
            expect(vm.showNonFullSupplySummary).not.toBeUndefined();
        });

    });

    describe('calculateFullSupplyCost', function() {

        it('should calculate total cost correctly', function() {
            expect(vm.calculateFullSupplyCost()).toBe(74.5);
        });

        it('should only include full supply line items', function() {
            vm.calculateFullSupplyCost();

            expect(calculationFactory.totalCost).toHaveBeenCalledWith(lineItems[0], vm.requisition);
            expect(calculationFactory.totalCost).toHaveBeenCalledWith(lineItems[1], vm.requisition);
            expect(calculationFactory.totalCost).not.toHaveBeenCalledWith(lineItems[2], vm.requisition);
            expect(calculationFactory.totalCost).not.toHaveBeenCalledWith(lineItems[3], vm.requisition);
        });

        it('should skip skipped lineItems', function() {
            lineItems[0].skipped = true;

            vm.calculateFullSupplyCost();

            expect(calculationFactory.totalCost).not.toHaveBeenCalledWith(lineItems[0]);
        });

    });

    describe('calculateNonFullSupplyCost', function() {

        it('should calculate total cost correctly', function() {
            expect(vm.calculateNonFullSupplyCost()).toBe(26.4);
        });

        it('should only include non full supply line items', function() {
            vm.calculateNonFullSupplyCost();

            expect(calculationFactory.totalCost).not.toHaveBeenCalledWith(lineItems[0], vm.requisition);
            expect(calculationFactory.totalCost).not.toHaveBeenCalledWith(lineItems[1], vm.requisition);
            expect(calculationFactory.totalCost).toHaveBeenCalledWith(lineItems[2], vm.requisition);
            expect(calculationFactory.totalCost).toHaveBeenCalledWith(lineItems[3], vm.requisition);
        });

        it('should skip skipped line items', function() {
            lineItems[2].skipped = true;

            vm.calculateNonFullSupplyCost();

            expect(calculationFactory.totalCost).not.toHaveBeenCalledWith(lineItems[2]);
        });

    });

    describe('calculateTotalCost', function() {

        it('should calculate total cost correctly', function() {
            expect(vm.calculateTotalCost().toFixed(1)).toBe('100.9');
        });

        it('should only include all non-skipped line items', function() {
            vm.calculateTotalCost();

            expect(calculationFactory.totalCost).toHaveBeenCalledWith(lineItems[0], vm.requisition);
            expect(calculationFactory.totalCost).toHaveBeenCalledWith(lineItems[1], vm.requisition);
            expect(calculationFactory.totalCost).toHaveBeenCalledWith(lineItems[2], vm.requisition);
            expect(calculationFactory.totalCost).toHaveBeenCalledWith(lineItems[3], vm.requisition);
        });

        it('should skip skipped line items', function() {
            lineItems[0].skipped = true;
            lineItems[2].skipped = true;

            vm.calculateTotalCost();

            expect(calculationFactory.totalCost).not.toHaveBeenCalledWith(lineItems[0], vm.requisition);
            expect(calculationFactory.totalCost).not.toHaveBeenCalledWith(lineItems[2], vm.requisition);
        });

    });

    function createLineItem(skipped, fullSupply, requestedQuantity) {
        var lineItem = {
            skipped: skipped,
            $program: {
                fullSupply: fullSupply
            },
            requestedQuantity: requestedQuantity
        };

        return lineItem;
    }

});
