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

describe('validationFactory', function() {

    var validationFactory, TEMPLATE_COLUMNS, messageServiceMock,
        calculationFactoryMock, requisitionMock, lineItem;

    beforeEach(function() {
        module('requisition-validation', function($provide) {
            messageServiceMock = jasmine.createSpyObj('messageService', ['get']);
            calculationFactoryMock = jasmine.createSpyObj('calculationFactory', ['calculatedOrderQuantity']);

            $provide.factory('messageService', function() {
                return messageServiceMock;
            });

            $provide.factory('calculationFactory', function() {
                return calculationFactoryMock;
            });
        });

        inject(function($injector) {
            validationFactory = $injector.get('validationFactory');
            TEMPLATE_COLUMNS = $injector.get('TEMPLATE_COLUMNS');
        });

        requisitionMock = {
            template: jasmine.createSpyObj('template', ['getColumn'])
        };

        lineItem = jasmine.createSpyObj('lineItem', ['isNonFullSupply']);
    });

    describe('stockOnHand', function() {

        beforeEach(function() {
            messageServiceMock.get.andReturn('negative');
        });

        it('should return undefined if stock on hand is non negative', function() {
            lineItem.stockOnHand = 0;

            expect(validationFactory.stockOnHand(lineItem)).toBeUndefined();
        });

        it('should return "negative" if stock on hand is negative', function() {
            lineItem.stockOnHand = -1;

            expect(validationFactory.stockOnHand(lineItem)).toEqual('negative');
        });

    });

    describe('totalConsumedQuantity', function() {

        beforeEach(function() {
            messageServiceMock.get.andReturn('negative');
        });

        it('should return undefined if stock on hand is non negative', function() {
            lineItem.totalConsumedQuantity = 0;

            expect(validationFactory.totalConsumedQuantity(lineItem)).toBeUndefined();
        });

        it('should return "negative" if stock on hand is negative', function() {
            lineItem.totalConsumedQuantity = -1;

            expect(validationFactory.totalConsumedQuantity(lineItem)).toEqual('negative');
        });

    });

    describe('requestedQuantityExplanation', function() {

        var jColumn, iColumn, sColumn;

        beforeEach(function() {
            jColumn = {
                name: TEMPLATE_COLUMNS.REQUESTED_QUANTITY,
                $display: true
            };

            iColumn = {
                name: TEMPLATE_COLUMNS.CALCULATED_ORDER_QUANTITY,
                $display: true
            };

            sColumn = {
                name: TEMPLATE_COLUMNS.CALCULATED_ORDER_QUANTITY_ISA,
                $display: true
            };

            messageServiceMock.get.andReturn('required');
            requisitionMock.template.getColumn.andCallFake(function(name) {
                if (name === TEMPLATE_COLUMNS.REQUESTED_QUANTITY) {
                    return jColumn;
                }
                if (name === TEMPLATE_COLUMNS.CALCULATED_ORDER_QUANTITY) {
                    return iColumn;
                }
                if (name === TEMPLATE_COLUMNS.CALCULATED_ORDER_QUANTITY_ISA) {
                    return sColumn;
                }
            });
        });

        it('should return undefined if requestedQuantity column is not present', function() {
            requisitionMock.template.getColumn.andReturn(undefined);

            expect(validationFactory.requestedQuantityExplanation(lineItem, requisitionMock))
                .toBeUndefined();
        });

        it('should return undefined if requestedQuantity column is not displayed', function() {
            jColumn.$display = false;

            expect(validationFactory.requestedQuantityExplanation(lineItem, requisitionMock))
                .toBeUndefined();
        });

        it('should return undefined if calculatedOrderQuantity and calculatedOrderQuantityIsa columns are not' +
            ' displayed', function() {
            lineItem.requestedQuantity = 10;
            lineItem.requestedQuantityExplanation = undefined;
            iColumn.$display = false;
            sColumn.$display = false;

            expect(validationFactory.requestedQuantityExplanation(lineItem, requisitionMock))
                .toBeUndefined();
        });

        it('should return error if only calculatedOrderQuantity column is displayed', function() {
            lineItem.requestedQuantity = 10;
            lineItem.requestedQuantityExplanation = undefined;
            sColumn.$display = false;

            expect(validationFactory.requestedQuantityExplanation(lineItem, requisitionMock))
                .toEqual('required');
        });

        it('should return error if only calculatedOrderQuantityIsa column is displayed', function() {
            lineItem.requestedQuantity = 10;
            lineItem.requestedQuantityExplanation = undefined;
            iColumn.$display = false;

            expect(validationFactory.requestedQuantityExplanation(lineItem, requisitionMock))
                .toEqual('required');
        });

        it('should return undefined if requestedQuantity is null', function() {
            lineItem.requestedQuantity = null;

            expect(validationFactory.requestedQuantityExplanation(lineItem, requisitionMock))
                .toBeUndefined();
        });

        it('should return undefined if requestedQuantity is undefined', function() {
            lineItem.requestedQuantity = undefined;

            expect(validationFactory.requestedQuantityExplanation(lineItem, requisitionMock))
                .toBeUndefined();
        });

        it('should return "required" if requestedQuantity has value and explanation is missing', function() {
            lineItem.requestedQuantity = 10;
            lineItem.requestedQuantityExplanation = undefined;

            expect(validationFactory.requestedQuantityExplanation(lineItem, requisitionMock))
                .toEqual('required');
        });

        it('should return undefined if requestedQuantity has value, explanation is missing and line item is non full' +
            ' supply', function() {
            lineItem.requestedQuantity = 10;
            lineItem.isNonFullSupply.andReturn(true);

            expect(validationFactory.requestedQuantityExplanation(lineItem, requisitionMock))
                .toBeUndefined();
        });

        it('should return undefined if requestedQuantity has value and explanation is present', function() {
            lineItem.requestedQuantity = 10;
            lineItem.requestedQuantityExplanation = 'explanation';

            expect(validationFactory.requestedQuantityExplanation(lineItem, requisitionMock))
                .toBeUndefined();
        });

    });

    describe('requestedQuantity', function() {

        var calculatedOrderQuantityColumn,
            calculatedOrderQuantityIsaColumn;

        beforeEach(function() {

            calculatedOrderQuantityColumn = {
                name: TEMPLATE_COLUMNS.CALCULATED_ORDER_QUANTITY,
                $display: true
            };

            calculatedOrderQuantityIsaColumn = {
                name: TEMPLATE_COLUMNS.CALCULATED_ORDER_QUANTITY_ISA,
                $display: true
            };

            messageServiceMock.get.andReturn('required');
            requisitionMock.template.getColumn.andCallFake(function(name) {
                if (name === TEMPLATE_COLUMNS.CALCULATED_ORDER_QUANTITY) {
                    return calculatedOrderQuantityColumn;
                }
                if (name === TEMPLATE_COLUMNS.CALCULATED_ORDER_QUANTITY_ISA) {
                    return calculatedOrderQuantityIsaColumn;
                }
            });

            lineItem.requestedQuantity = null;
        });

        it('should return undefined if calculatedOrderQuantity column is present and displayed', function() {
            calculatedOrderQuantityIsaColumn.$display = false;

            expect(validationFactory.requestedQuantity(lineItem, requisitionMock)).toBeUndefined();
        });

        it('should return undefined if calculatedOrderQuantityIsa column is present and displayed', function() {
            calculatedOrderQuantityColumn.$display = false;

            expect(validationFactory.requestedQuantity(lineItem, requisitionMock)).toBeUndefined();
        });

        it('should return required if calculatedOrderQuantity and calculatedOrderQuantityIsa columns are not' +
            ' displayed and requestedQuantity is null', function() {
            calculatedOrderQuantityIsaColumn.$display = false;
            calculatedOrderQuantityColumn.$display = false;

            expect(validationFactory.requestedQuantity(lineItem, requisitionMock)).toEqual('required');
        });

        it('should return required if calculatedOrderQuantity and calculatedOrderQuantityIsa columns are not' +
            ' displayed and requestedQuantity is undefined', function() {
            lineItem.requestedQuantity = undefined;
            calculatedOrderQuantityIsaColumn.$display = false;
            calculatedOrderQuantityColumn.$display = false;

            expect(validationFactory.requestedQuantity(lineItem, requisitionMock)).toEqual('required');
        });

        it('should return undefined if calculatedOrderQuantity column is displayed and requestedQuantity is undefined',
            function() {
                lineItem.requestedQuantity = undefined;
                calculatedOrderQuantityIsaColumn.$display = false;

                expect(validationFactory.requestedQuantity(lineItem, requisitionMock)).toBeUndefined();
            });

        it('should return undefined if calculatedOrderQuantityIsa column is displayed and requestedQuantity is' +
            ' undefined', function() {
            lineItem.requestedQuantity = undefined;
            calculatedOrderQuantityColumn.$display = false;

            expect(validationFactory.requestedQuantity(lineItem, requisitionMock)).toBeUndefined();
        });

        it('should return required if calculatedOrderQuantity and calculatedOrderQuantityIsa columns are not' +
            ' present and requestedQuantity is null', function() {
            requisitionMock.template.getColumn.andReturn(undefined);

            expect(validationFactory.requestedQuantity(lineItem, requisitionMock))
                .toEqual('required');
        });

        it('should return required if calculatedOrderQuantity and calculatedOrderQuantityIsa columns are not present' +
            ' and requestedQuantity is undefined', function() {
            lineItem.requestedQuantity = undefined;
            requisitionMock.template.getColumn.andReturn(undefined);

            expect(validationFactory.requestedQuantity(lineItem, requisitionMock)).toEqual('required');
        });

        it('should return true if line item is non full supply and requestedQuantity is null', function() {
            lineItem.isNonFullSupply.andReturn(true);
            lineItem.requestedQuantity = null;

            expect(validationFactory.requestedQuantity(lineItem, requisitionMock)).toEqual('required');
        });

        it('should return true if line item is non full supply and requestedQuantity is undefined', function() {
            lineItem.isNonFullSupply.andReturn(true);
            lineItem.requestedQuantity = undefined;

            expect(validationFactory.requestedQuantity(lineItem, requisitionMock)).toEqual('required');
        });

        it('should return required for emergency requisition', function() {
            calculatedOrderQuantityIsaColumn.$display = false;
            requisitionMock.emergency = true;

            expect(validationFactory.requestedQuantity(lineItem, requisitionMock)).toEqual('required');
        });
    });

    describe('totalStockoutDays', function() {

        beforeEach(function() {
            messageServiceMock.get.andReturn('valueExceedPeriodDuration');
        });

        var period = {
            durationInMonths: 1
        };

        it('should return undefined if total stock out days are non negative', function() {
            lineItem.totalStockoutDays = 0;

            expect(validationFactory.totalStockoutDays(lineItem, {
                processingPeriod: period
            })).toBeUndefined();
        });

        it('should return "valueExceedPeriodDuration" if total stock out days exceed number of days in period',
            function() {
                lineItem.totalStockoutDays = 100;

                expect(validationFactory.totalStockoutDays(lineItem, {
                    processingPeriod: period
                }))
                    .toEqual('valueExceedPeriodDuration');
            });

    });

});
