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

describe('RequisitionTemplate', function() {

    var requisitionTemplate, RequisitionDataBuilder, RequisitionTemplateDataBuilder,
        RequisitionTemplate, TEMPLATE_COLUMNS;

    beforeEach(function() {
        module('requisition');
        module('requisition-template', function($provide) {
            $provide.value('featureFlagService', {
                set: function() {},
                get: function() {}
            });
        });
        module('requisition-view-tab');

        inject(function($injector) {
            RequisitionTemplateDataBuilder = $injector.get('RequisitionTemplateDataBuilder');
            RequisitionDataBuilder = $injector.get('RequisitionDataBuilder');
            RequisitionTemplate = $injector.get('RequisitionTemplate');
            TEMPLATE_COLUMNS = $injector.get('TEMPLATE_COLUMNS');

            this.requisition = new RequisitionDataBuilder().buildJson();
            this.requisitionSource = new RequisitionDataBuilder();

        });
    });

    describe('getColumns', function() {

        beforeEach(function() {
            requisitionTemplate = new RequisitionTemplate(
                new RequisitionTemplateDataBuilder(this.requisition).buildJson(),
                this.requisition

            );
        });

        it('should respect $display', function() {
            requisitionTemplate.columnsMap[TEMPLATE_COLUMNS.BEGINNING_BALANCE].$display = false;

            expect(requisitionTemplate.getColumns(false)).toEqual([
                requisitionTemplate.columnsMap[TEMPLATE_COLUMNS.PRODUCT_CODE],
                requisitionTemplate.columnsMap[TEMPLATE_COLUMNS.PRODUCT_NAME],
                requisitionTemplate.columnsMap[TEMPLATE_COLUMNS.STOCK_ON_HAND],
                requisitionTemplate.columnsMap[TEMPLATE_COLUMNS.REQUESTED_QUANTITY],
                requisitionTemplate.columnsMap[TEMPLATE_COLUMNS.REQUESTED_QUANTITY_EXPLANATION]
            ]);
        });

        it('should return all columns for full supply columns', function() {
            expect(requisitionTemplate.getColumns(false)).toEqual([
                requisitionTemplate.columnsMap[TEMPLATE_COLUMNS.PRODUCT_CODE],
                requisitionTemplate.columnsMap[TEMPLATE_COLUMNS.PRODUCT_NAME],
                requisitionTemplate.columnsMap[TEMPLATE_COLUMNS.STOCK_ON_HAND],
                requisitionTemplate.columnsMap[TEMPLATE_COLUMNS.REQUESTED_QUANTITY],
                requisitionTemplate.columnsMap[TEMPLATE_COLUMNS.REQUESTED_QUANTITY_EXPLANATION],
                requisitionTemplate.columnsMap[TEMPLATE_COLUMNS.BEGINNING_BALANCE]
            ]);
        });

        it('should return non reporting columns only for non full supply', function() {
            expect(requisitionTemplate.getColumns(true)).toEqual([
                requisitionTemplate.columnsMap[TEMPLATE_COLUMNS.PRODUCT_CODE],
                requisitionTemplate.columnsMap[TEMPLATE_COLUMNS.PRODUCT_NAME],
                requisitionTemplate.columnsMap[TEMPLATE_COLUMNS.REQUESTED_QUANTITY],
                requisitionTemplate.columnsMap[TEMPLATE_COLUMNS.REQUESTED_QUANTITY_EXPLANATION]
            ]);
        });

        it('should return non reporting columns only for emergence full supply', function() {
            requisitionTemplate = new RequisitionTemplate(
                new RequisitionTemplateDataBuilder(this.requisition).buildJson(),
                this.requisitionSource.buildEmergency()
            );

            expect(requisitionTemplate.getColumns(true)).toEqual([
                requisitionTemplate.columnsMap[TEMPLATE_COLUMNS.PRODUCT_CODE],
                requisitionTemplate.columnsMap[TEMPLATE_COLUMNS.PRODUCT_NAME],
                requisitionTemplate.columnsMap[TEMPLATE_COLUMNS.REQUESTED_QUANTITY],
                requisitionTemplate.columnsMap[TEMPLATE_COLUMNS.REQUESTED_QUANTITY_EXPLANATION]
            ]);
        });

    });

    describe('hasSkipColumn', function() {

        it('should return true if template has skip column', function() {
            requisitionTemplate = new RequisitionTemplate(
                new RequisitionTemplateDataBuilder(this.requisition)
                    .withSkipColumn(true, this.requisition)
                    .buildJson(),
                this.requisition
            );

            expect(requisitionTemplate.hasSkipColumn()).toBe(true);
        });

        it('should return false if template does not have skip column', function() {
            requisitionTemplate = new RequisitionTemplate(
                new RequisitionTemplateDataBuilder(this.requisition).buildJson(),
                this.requisition
            );

            expect(requisitionTemplate.hasSkipColumn()).toBe(false);
        });

    });

    describe('hideSkippedLineItems', function() {

        it('should return true if template has skip column and is configured to hide line items',
            function() {
                requisitionTemplate = new RequisitionTemplate(
                    new RequisitionTemplateDataBuilder(this.requisition)
                        .withSkipColumn(true, this.requisition)
                        .buildJson(),
                    this.requisition
                );

                expect(requisitionTemplate.hideSkippedLineItems()).toBe(true);
            });

        it('should return false if template has skip column and is configured to disable line items',
            function() {
                requisitionTemplate = new RequisitionTemplate(
                    new RequisitionTemplateDataBuilder(this.requisition)
                        .withSkipColumn(false, this.requisition)
                        .buildJson(),
                    this.requisition
                );

                expect(requisitionTemplate.hideSkippedLineItems()).toBe(false);
            });

        it('should return false if template does not have skip column', function() {
            requisitionTemplate = new RequisitionTemplate(
                new RequisitionTemplateDataBuilder(this.requisition).buildJson(),
                this.requisition
            );

            expect(requisitionTemplate.hideSkippedLineItems()).toBe(false);
        });

    });

});
