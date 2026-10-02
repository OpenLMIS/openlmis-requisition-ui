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
describe('ProductGridCell', function() {

    beforeEach(function() {
        this.getCompiledElement = getCompiledElement;

        module('requisition-view-tab');
        module('requisition');
        module('requisition-product-grid', function($compileProvider, $provide) {
            $compileProvider.directive('lossesAndAdjustments', function() {
                var def = {
                    priority: 100,
                    terminal: true,
                    restrict: 'EAC',
                    template: '<a></a>'
                };
                return def;
            });

            $provide.value('openlmisCurrencyFilter', function(value) {
                return '$' + value;
            });

            $provide.value('featureFlagService', {
                set: function() {},
                get: function() {}
            });
        });

        inject(function($injector) {
            this.$compile = $injector.get('$compile');
            this.$rootScope = $injector.get('$rootScope');
            this.requisitionValidator = $injector.get('requisitionValidator');
            this.authorizationService = $injector.get('authorizationService');
            this.RequisitionColumnDataBuilder = $injector.get('RequisitionColumnDataBuilder');
            this.COLUMN_TYPES = $injector.get('COLUMN_TYPES');
            this.COLUMN_SOURCES = $injector.get('COLUMN_SOURCES');
            this.RequisitionDataBuilder = $injector.get('RequisitionDataBuilder');
        });

        this.scope = this.$rootScope.$new();

        this.scope.requisition = new this.RequisitionDataBuilder().build();

        this.fullSupplyColumns = [
            new this.RequisitionColumnDataBuilder().buildBeginningBalanceColumn(this.scope.requisition)
        ];

        this.nonFullSupplyColumns = [
            new this.RequisitionColumnDataBuilder().build(this.scope.requisition),
            new this.RequisitionColumnDataBuilder().build(this.scope.requisition)
        ];

        this.scope.requisition.template.patientsTabEnabled = false;
        this.scope.column = this.fullSupplyColumns[0];
        this.scope.lineItem = this.scope.requisition.requisitionLineItems[0];
        this.scope.program = {
            name: 'mock-program',
            id: 'mock-id'
        };

        spyOn(this.scope.lineItem, 'getFieldValue').andReturn('readOnlyFieldValue');
        spyOn(this.requisitionValidator, 'validateLineItem');
        spyOn(this.authorizationService, 'isAuthenticated').andReturn(true);
        spyOn(this.authorizationService, 'hasRight').andReturn(true);
        spyOn(this.scope.lineItem, 'canBeSkipped');
        spyOn(this.scope.lineItem, 'updateDependentFields');
    });

    it('should produce losesAndAdjustment cell', function() {
        this.scope.requisition.$isApproved.andReturn(false);
        this.scope.requisition.$isReleased.andReturn(false);
        this.scope.requisition.$isAuthorized.andReturn(false);
        this.scope.column.name = 'totalLossesAndAdjustments';

        this.directiveElem = this.getCompiledElement();

        expect(this.directiveElem.html()).not.toContain('readOnlyFieldValue');
        expect(this.directiveElem.find('a').length).toEqual(1);
    });

    it('should produce read only for losesAndAdjustment and stock based requisition', function() {
        this.scope.requisition.$isApproved.andReturn(false);
        this.scope.requisition.$isReleased.andReturn(false);
        this.scope.requisition.$isAuthorized.andReturn(false);
        this.scope.column.name = 'totalLossesAndAdjustments';
        this.scope.requisition.template.populateStockOnHandFromStockCards = true;

        this.directiveElem = this.getCompiledElement();

        expect(this.directiveElem.html()).toContain('readOnlyFieldValue');
        expect(this.directiveElem.find('input').length).toEqual(0);
    });

    it('should produce currency cell if column is of currency type', function() {
        this.scope.column = new this.RequisitionColumnDataBuilder().buildTotalCostColumn(this.scope.requisition);
        this.scope.lineItem.getFieldValue.andReturn(123);

        this.directiveElem = this.getCompiledElement();

        expect(this.directiveElem.html()).toContain('$123');
    });

    it('should produce cell with integer input for numeric column that is not read only', function() {
        this.scope.column = new this.RequisitionColumnDataBuilder()
            .buildTotalConsumedQuantityColumn(this.scope.requisition);
        this.scope.userCanEdit = true;

        this.directiveElem = this.getCompiledElement();

        expect(this.directiveElem.html()).toContain('openlmis-quantity-unit-input');
    });

    it('should validate full supply line item columns after updating fields', function() {
        this.scope.requisition.template.getColumns.andReturn(this.fullSupplyColumns);
        this.scope.userCanEdit = true;
        this.scope.requisition.$isInitiated.andReturn(true);

        var element = this.getCompiledElement();
        var isolatedScope = element.find('td').scope();

        this.scope.lineItem.quantities = {};
        this.scope.lineItem.quantities[this.scope.column.name] = {
            quantity: 1000
        };
        isolatedScope.update();
        this.scope.$apply();

        expect(this.requisitionValidator.validateLineItem).toHaveBeenCalledWith(
            this.scope.lineItem, this.fullSupplyColumns, this.scope.requisition
        );

        expect(this.scope.lineItem.updateDependentFields).toHaveBeenCalledWith(
            this.scope.column, this.scope.requisition
        );
    });

    it('should not show error message if line item is skipped', function() {
        this.scope.lineItem.skipped = true;

        var elScope = angular.element(this.getCompiledElement().children()[0]).scope();

        expect(elScope.invalidMessage).toBeUndefined();

        this.scope.lineItem.$errors[this.scope.column.name] = 'Invalid entry';
        this.$rootScope.$apply();

        expect(elScope.invalidMessage).toBeUndefined();
    });

    it('should show error message if line item is not skipped', function() {
        var elScope = angular.element(this.getCompiledElement().children()[0]).scope();

        expect(elScope.invalidMessage).toBeUndefined();

        this.scope.lineItem.$errors[this.scope.column.name] = 'Invalid entry';
        this.$rootScope.$apply();

        expect(elScope.invalidMessage).toEqual('Invalid entry');
    });

    it('should validate non full supply line item columns after updating fields', function() {
        this.scope.userCanEdit = true;
        this.scope.requisition.template.getColumns.andReturn(this.nonFullSupplyColumns);
        this.scope.requisition.$isInitiated.andReturn(true);

        var element = this.getCompiledElement();

        var directiveScope = element.find('td').scope();
        this.scope.lineItem.$program.fullSupply = false;

        this.scope.lineItem.quantities = {};
        this.scope.lineItem.quantities[this.scope.column.name] = {
            quantity: 1000
        };

        directiveScope.update();
        this.scope.$apply();

        expect(this.requisitionValidator.validateLineItem).toHaveBeenCalledWith(
            this.scope.lineItem, this.nonFullSupplyColumns, this.scope.requisition
        );

        expect(this.scope.lineItem.updateDependentFields).toHaveBeenCalledWith(
            this.scope.column, this.scope.requisition
        );
    });

    it('should produce read only cell for approved requisition', function() {
        this.scope.requisition.$isApproved.andReturn(true);

        var cell = angular.element(this.getCompiledElement().children()[0]);

        expect(cell.text()).toEqual('readOnlyFieldValue');
    });

    it('should produce read only cell for released requisition', function() {
        this.scope.requisition.$isReleased.andReturn(true);

        var cell = angular.element(this.getCompiledElement().children()[0]);

        expect(cell.text()).toEqual('readOnlyFieldValue');
    });

    it('should produce editable cell for approval columns if user can approve', function() {
        this.scope.canApprove = true;
        this.scope.column = new this.RequisitionColumnDataBuilder()
            .buildApprovedQuantityColumn(this.scope.requisition);

        var cell = angular.element(this.getCompiledElement().children()[0]);

        expect(cell.text()).not.toEqual('readOnlyFieldValue');

        this.scope.column = new this.RequisitionColumnDataBuilder().buildRemarksColumn(this.scope.requisition);

        cell = angular.element(this.getCompiledElement().children()[0]);

        expect(cell.text()).not.toEqual('readOnlyFieldValue');
    });

    it('should produce editable cell if user can edit and column is editable', function() {
        this.scope.userCanEdit = true;
        this.scope.column = new this.RequisitionColumnDataBuilder()
            .buildTotalConsumedQuantityColumn(this.scope.requisition);

        var cell = angular.element(this.getCompiledElement().children()[0]);

        expect(cell.text()).not.toEqual('readOnlyFieldValue');
    });

    it('should produce read only cell if user can not edit', function() {
        this.scope.userCanEdit = false;
        this.scope.column = new this.RequisitionColumnDataBuilder()
            .buildTotalConsumedQuantityColumn(this.scope.requisition);

        var cell = angular.element(this.getCompiledElement().children()[0]);

        expect(cell.text()).toEqual('readOnlyFieldValue');
    });

    it('should produce real only cell if column is not editable', function() {
        this.scope.userCanEdit = true;
        this.scope.column = new this.RequisitionColumnDataBuilder().buildProductCodeColumn(this.scope.requisition);

        var cell = angular.element(this.getCompiledElement().children()[0]);

        expect(cell.text()).toEqual('readOnlyFieldValue');
    });

    // OLMIS-8123: No of Patients on Treatment next month (C) must not be editable on the
    // standard edit path (facility/initiate/submit) and stays editable only on the approval
    // stage for district-level users (patients tab templates), like Approved Quantity/Remarks.
    describe('No of Patients on Treatment next month (C) column (OLMIS-8123)', function() {

        beforeEach(function() {
            this.buildCColumn = function() {
                return new this.RequisitionColumnDataBuilder()
                    .buildNumberOfPatientsOnTreatmentNextMonthColumn(this.scope.requisition);
            };
        });

        it('should be read only for an editing user who is not an approver', function() {
            this.scope.userCanEdit = true;
            this.scope.canApprove = false;
            this.scope.column = this.buildCColumn();

            expect(angular.element(this.getCompiledElement().children()[0]).text()).toEqual('readOnlyFieldValue');
            expect(this.getCompiledElement().find('input').length).toEqual(0);
        });

        it('should be read only even in a TB Monthly program for a non-approver', function() {
            this.scope.userCanEdit = true;
            this.scope.canApprove = false;
            this.scope.program.name = 'TB Monthly';
            this.scope.column = this.buildCColumn();

            expect(angular.element(this.getCompiledElement().children()[0]).text())
                .toEqual('readOnlyFieldValue');
        });

        it('should be editable for an approver when patients tab is enabled', function() {
            this.scope.canApprove = true;
            this.scope.requisition.template.patientsTabEnabled = true;
            this.scope.column = this.buildCColumn();

            expect(angular.element(this.getCompiledElement().children()[0]).text())
                .not.toEqual('readOnlyFieldValue');
        });

        it('should stay read only for an approver when patients tab is disabled', function() {
            this.scope.canApprove = true;
            this.scope.requisition.template.patientsTabEnabled = false;
            this.scope.column = this.buildCColumn();

            expect(angular.element(this.getCompiledElement().children()[0]).text())
                .toEqual('readOnlyFieldValue');
        });
    });

    // OLMIS-8123 regression guard: the sibling columns sharing the approval-stage rule must
    // keep their previous behavior and not be affected by the column C change.
    describe('approval-stage sibling columns are unchanged (OLMIS-8123 regression)', function() {

        it('should keep Approved Quantity editable for an approver (non patients tab)', function() {
            this.scope.canApprove = true;
            this.scope.requisition.template.patientsTabEnabled = false;
            this.scope.column = new this.RequisitionColumnDataBuilder()
                .buildApprovedQuantityColumn(this.scope.requisition);

            expect(angular.element(this.getCompiledElement().children()[0]).text())
                .not.toEqual('readOnlyFieldValue');
        });

        it('should keep Remarks editable for an approver in both template kinds', function() {
            this.scope.canApprove = true;

            this.scope.requisition.template.patientsTabEnabled = false;
            this.scope.column = new this.RequisitionColumnDataBuilder().buildRemarksColumn(this.scope.requisition);

            expect(angular.element(this.getCompiledElement().children()[0]).text())
                .not.toEqual('readOnlyFieldValue');

            this.scope.requisition.template.patientsTabEnabled = true;
            this.scope.column = new this.RequisitionColumnDataBuilder().buildRemarksColumn(this.scope.requisition);

            expect(angular.element(this.getCompiledElement().children()[0]).text())
                .not.toEqual('readOnlyFieldValue');
        });

        it('should keep Total Received Quantity editable in a TB Monthly program', function() {
            this.scope.userCanEdit = true;
            this.scope.program.name = 'TB Monthly';
            this.scope.column = new this.RequisitionColumnDataBuilder()
                .asUserInput()
                .build(this.scope.requisition);
            this.scope.column.name = 'totalReceivedQuantity';
            this.scope.column.columnDefinition.columnType = this.COLUMN_TYPES.NUMERIC;
            this.scope.column.$type = this.COLUMN_TYPES.NUMERIC;

            expect(angular.element(this.getCompiledElement().children()[0]).text())
                .not.toEqual('readOnlyFieldValue');
        });
    });

    describe('Skip Column', function() {

        var skipColumn, element;

        beforeEach(function() {
            skipColumn = new this.RequisitionColumnDataBuilder().buildSkipColumn(false, this.scope.requisition);
            this.scope.column = skipColumn;
        });

        it('should be always disabled if user can not edit', function() {
            this.scope.userCanEdit = false;
            this.scope.lineItem.canBeSkipped.andReturn(true);

            element = this.getCompiledElement();

            expect(getSkipInput().attr('disabled')).toBe('disabled');

            this.scope.lineItem.canBeSkipped.andReturn(false);
            this.scope.$digest();

            expect(getSkipInput().attr('disabled')).toBe('disabled');

            this.scope.lineItem.canBeSkipped.andReturn(true);
            this.scope.$digest();

            expect(getSkipInput().attr('disabled')).toBe('disabled');
        });

        it('should change disabled state if lineItem changes its skipability and user has right to edit', function() {
            this.scope.userCanEdit = true;
            this.scope.lineItem.canBeSkipped.andReturn(true);

            element = this.getCompiledElement();

            expect(getSkipInput().attr('disabled')).toBe(undefined);

            this.scope.lineItem.canBeSkipped.andReturn(false);
            this.scope.$digest();

            expect(getSkipInput().attr('disabled')).toBe('disabled');

            this.scope.lineItem.canBeSkipped.andReturn(true);
            this.scope.$digest();

            expect(getSkipInput().attr('disabled')).toBe(undefined);
        });

        function getSkipInput() {
            return element.find('input.skip');
        }

    });

    it('should flag a user-input text column (Remarks / Requested quantity explanation) as long-text', function() {
        this.scope.column = new this.RequisitionColumnDataBuilder().build(this.scope.requisition);
        this.scope.column.$type = this.COLUMN_TYPES.TEXT;
        this.scope.column.source = this.COLUMN_SOURCES.USER_INPUT;

        var element = this.getCompiledElement();
        var cellScope = element.find('td').scope();

        expect(cellScope.isLongTextColumn).toBe(true);
    });

    it('should not flag a non-user-input text column (e.g. product name) as long-text', function() {
        this.scope.column = new this.RequisitionColumnDataBuilder().build(this.scope.requisition);
        this.scope.column.$type = this.COLUMN_TYPES.TEXT;
        this.scope.column.source = this.COLUMN_SOURCES.REFERENCE_DATA;

        var element = this.getCompiledElement();
        var cellScope = element.find('td').scope();

        expect(cellScope.isLongTextColumn).toBe(false);
    });

    it('should cap the Remarks column to its backend column length', function() {
        this.scope.column = new this.RequisitionColumnDataBuilder().build(this.scope.requisition);
        this.scope.column.name = 'remarks';

        var element = this.getCompiledElement();
        var cellScope = element.find('td').scope();

        expect(cellScope.maxLength).toBe(250);
    });

    it('should cap the Requested quantity explanation column to its backend column length', function() {
        this.scope.column = new this.RequisitionColumnDataBuilder().build(this.scope.requisition);
        this.scope.column.name = 'requestedQuantityExplanation';

        var element = this.getCompiledElement();
        var cellScope = element.find('td').scope();

        expect(cellScope.maxLength).toBe(255);
    });

    function getCompiledElement() {
        var rootElement = angular.element('<div><div product-grid-cell requisition="requisition" column="column"' +
            ' line-item="lineItem" user-can-edit="userCanEdit" can-approve="canApprove" program="program">' +
            '</div></div>');
        var compiledElement = this.$compile(rootElement)(this.scope);
        angular.element('body').append(compiledElement);
        this.scope.$digest();
        return compiledElement;
    }
});
