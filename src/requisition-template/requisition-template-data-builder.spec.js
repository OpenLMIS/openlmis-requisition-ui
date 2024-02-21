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

    angular
        .module('requisition-template')
        .factory('RequisitionTemplateDataBuilder', RequisitionTemplateDataBuilder);

    RequisitionTemplateDataBuilder.$inject = [
        'ObjectReferenceDataBuilder', 'RequisitionColumnDataBuilder', 'TEMPLATE_COLUMNS',
        'RequisitionTemplate'
    ];

    function RequisitionTemplateDataBuilder(ObjectReferenceDataBuilder,
                                            RequisitionColumnDataBuilder, TEMPLATE_COLUMNS,
                                            RequisitionTemplate) {

        RequisitionTemplateDataBuilder.prototype.build = build;
        RequisitionTemplateDataBuilder.prototype.buildJson = buildJson;
        RequisitionTemplateDataBuilder.prototype.withSkipColumn = withSkipColumn;
        RequisitionTemplateDataBuilder.prototype.buildWithSkipColumn = buildWithSkipColumn;

        return RequisitionTemplateDataBuilder;

        function RequisitionTemplateDataBuilder(requisition) {
            RequisitionTemplateDataBuilder.instanceNumber =
                (RequisitionTemplateDataBuilder.instanceNumber || 0) + 1;

            var instanceNumber = RequisitionTemplateDataBuilder.instanceNumber;
            this.createdDate = '2016-06-14T12:00:00Z';
            this.modifiedDate = '2016-06-14T12:00:00Z';
            this.numberOfPeriodsToAverage = 3;
            this.name = 'Template ' + instanceNumber;
            this.populateStockOnHandFromStockCards = false;
            this.program = new ObjectReferenceDataBuilder()
                .withId('program-id-' + instanceNumber)
                .build();
            this.facilityTypes = [
                new ObjectReferenceDataBuilder()
                    .withId('facility-type-' + instanceNumber)
                    .build()
            ];
            // temporary template to build columnsMap and later it will be replaced
            requisition.template = this.buildJson();

            this.columnsMap = {
                productCode: new RequisitionColumnDataBuilder()
                    .buildProductCodeColumn(requisition),
                productName: new RequisitionColumnDataBuilder()
                    .buildProductNameColumn(requisition),
                stockOnHand: new RequisitionColumnDataBuilder()
                    .buildStockOnHandColumn(requisition),
                requestedQuantity: new RequisitionColumnDataBuilder()
                    .buildRequestedQuantityColumn(requisition),
                requestedQuantityExplanation: new RequisitionColumnDataBuilder()
                    .buildRequestedQuantityExplanationColumn(requisition),
                beginningBalance: new RequisitionColumnDataBuilder()
                    .buildBeginningBalanceColumn(requisition)
            };
        }

        function build() {
            return new RequisitionTemplate(this.buildJson());
        }

        function buildJson() {
            return {
                createdDate: this.createdDate,
                modifiedDate: this.modifiedDate,
                numberOfPeriodsToAverage: this.numberOfPeriodsToAverage,
                name: this.name,
                populateStockOnHandFromStockCards: this.populateStockOnHandFromStockCards,
                program: this.program,
                facilityTypes: this.facilityTypes,
                columnsMap: this.columnsMap
            };
        }

        function withSkipColumn(hideOptionSelected) {
            this.columnsMap.skipped = new RequisitionColumnDataBuilder().buildSkipColumn(hideOptionSelected);
            return this;
        }

        function buildWithSkipColumn() {
            return this.withSkipColumn().build();
        }
    }

})();
