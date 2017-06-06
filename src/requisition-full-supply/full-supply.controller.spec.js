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

describe('FullSupplyController', function() {

    //tested
    var vm;

    //mocks
    var requisition, requisitionValidator, lineItems, paginatedListFactory, columns,
        requisitionStatus, stateParams;

    beforeEach(module('requisition-full-supply'));

    beforeEach(function() {
        requisitionValidator = jasmine.createSpyObj('requisitionValidator', ['isLineItemValid']);

        paginatedListFactory = jasmine.createSpyObj('paginatedListFactory', ['getPaginatedItems']);
        paginatedListFactory.getPaginatedItems.andCallFake(function(lineItems) {
            return [lineItems];
        });
    });

    beforeEach(function($rootScope) {
        requisition = jasmine.createSpyObj('requisition', ['$isInitiated', '$isSubmitted','$isRejected']);
        requisition.template = jasmine.createSpyObj('RequisitionTemplate', ['getColumns']);
        requisition.requisitionLineItems = [
            lineItem('One', true),
            lineItem('Two', true),
            lineItem('One', true),
            lineItem('Two', true),
            lineItem('Three', false)
        ];

        lineItems = [
            requisition.requisitionLineItems[0],
            requisition.requisitionLineItems[1],
            requisition.requisitionLineItems[2],
            requisition.requisitionLineItems[3]
        ];

        requisition.$isInitiated.andReturn(false);
        requisition.$isSubmitted.andReturn(false);
        requisition.$isRejected.andReturn(false);

        columns = [{
            name: 'skipped'
        }];

        stateParams = {
            page: 0,
            size: 10
        };

        function lineItem(category, fullSupply) {
            var lineItem = jasmine.createSpyObj('lineItem', ['canBeSkipped']);
            lineItem.canBeSkipped.andCallFake(function() {
                return lineItem.$program.orderableCategoryDisplayName === 'One';
            });
            lineItem.skipped = false;
            lineItem.$program =  {
                orderableCategoryDisplayName: category,
                fullSupply: fullSupply
            };
            return lineItem;
        }
    });

    beforeEach(inject(function($controller) {
        vm = $controller('FullSupplyController', {
            totalItems: 4,
            columns: columns,
            lineItems: lineItems,
            stateParams: stateParams,
            requisition: requisition,
            requisitionValidator: requisitionValidator,
            paginatedListFactory: paginatedListFactory
        });
        vm.items = [
            lineItems[0],
            lineItems[1]
        ];
    }));

    it('should expose requisitionValidator.isLineItemValid method', function() {
        expect(vm.isLineItemValid).toBe(requisitionValidator.isLineItemValid);
    });

    it('should mark all full supply line items as skipped', function() {
        vm.skipAll();

        expect(requisition.requisitionLineItems[0].skipped).toBe(true);
        expect(requisition.requisitionLineItems[2].skipped).toBe(true);

        expect(requisition.requisitionLineItems[1].skipped).toBe(false);
        expect(requisition.requisitionLineItems[3].skipped).toBe(false);
        expect(requisition.requisitionLineItems[4].skipped).toBe(false);
    });

    it('should mark all full supply line items as not skipped', function() {
        vm.unskipAll();

        expect(requisition.requisitionLineItems[0].skipped).toBe(false);
        expect(requisition.requisitionLineItems[1].skipped).toBe(false);
        expect(requisition.requisitionLineItems[2].skipped).toBe(false);
        expect(requisition.requisitionLineItems[3].skipped).toBe(false);
        expect(requisition.requisitionLineItems[4].skipped).toBe(false);
    });

    it('should not show skip controls', function(){
        expect(vm.areSkipControlsVisible()).toBe(false);
    });

    it('should show skip controls if the requistions status is INITIATED', function(){
        requisition.$isInitiated.andReturn(true);
        expect(vm.areSkipControlsVisible()).toBe(true);
    });

    it('should show skip controls if the requistions status is SUBMITTED', function(){
        requisition.$isSubmitted.andReturn(true);
        expect(vm.areSkipControlsVisible()).toBe(true);
    });

    it('should show skip controls if the requistions status is REJECTED', function(){
        requisition.$isRejected.andReturn(true);
        expect(vm.areSkipControlsVisible()).toBe(true);
    });

    it('should show skip controls if the requisition template has a skip columm', function(){
        requisition.$isInitiated.andReturn(true);
        columns[0].name = 'skipped';

        expect(vm.areSkipControlsVisible()).toBe(true);
    });


    it('should not show skip controls if the requisition template doesnt have a skip columm', function(){
        requisition.$isInitiated.andReturn(true);
        columns[0].name = 'foo';

        expect(vm.areSkipControlsVisible()).toBe(false);
    });
});
