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

describe('TemplateAddController', function() {

    var $rootScope, $q, $state, $controller, ProgramDataBuilder, vm, program, FacilityTypeDataBuilder,
        TemplateDataBuilder, TemplateColumnDataBuilder, facilityTypes, productCodeColumn, Template,
        confirmService, messageService, templateOne, templateTwo, healthCenter, districtHospital,
        programTemplates, programTwo, calculatedOrderQuantityIsaColumn, skippedColumn, filteredProgramTemplates;

    beforeEach(function() {
        module('admin-template-add', function($provide) {
            $provide.value('featureFlagService', {
                set: function() {},
                get: function() {}
            });
        });
        module('referencedata-facility-type');
        module('requisition-template');

        inject(function($injector) {
            $rootScope = $injector.get('$rootScope');
            $q = $injector.get('$q');
            $controller = $injector.get('$controller');
            $state = $injector.get('$state');
            ProgramDataBuilder = $injector.get('ProgramDataBuilder');
            FacilityTypeDataBuilder = $injector.get('FacilityTypeDataBuilder');
            TemplateColumnDataBuilder = $injector.get('TemplateColumnDataBuilder');
            TemplateDataBuilder = $injector.get('TemplateDataBuilder');
            confirmService = $injector.get('confirmService');
            messageService = $injector.get('messageService');
            Template = $injector.get('Template');
        });

        program = new ProgramDataBuilder().withId('program-1')
            .build();
        programTwo = new ProgramDataBuilder().withId('program-2')
            .build();

        calculatedOrderQuantityIsaColumn = new TemplateColumnDataBuilder()
            .buildCalculatedOrderQuantityIsaColumn();
        productCodeColumn = new TemplateColumnDataBuilder().build();
        skippedColumn = new TemplateColumnDataBuilder()
            .buildSkipped();

        districtHospital = new FacilityTypeDataBuilder.buildDistrictHospital();
        healthCenter = new FacilityTypeDataBuilder().build();

        templateOne = new TemplateDataBuilder()
            .withFacilityTypes([healthCenter, districtHospital])
            .build();

        templateTwo = new TemplateDataBuilder()
            .withFacilityTypes([healthCenter])
            .build();

        filteredProgramTemplates = [];
        programTemplates = {};
        programTemplates[program.id] = [templateOne];
        programTemplates[programTwo.id] = [templateTwo];

        facilityTypes = [
            districtHospital,
            healthCenter
        ];

        vm = $controller('TemplateAddController', {
            programs: [program, programTwo],
            facilityTypes: facilityTypes,
            availableColumns: [
                productCodeColumn.columnDefinition,
                calculatedOrderQuantityIsaColumn.columnDefinition,
                skippedColumn.columnDefinition
            ],
            programTemplates: programTemplates,
            template: new Template({
                populateStockOnHandFromStockCards: false,
                columnsMap: {},
                facilityTypes: [],
                requisitionReportOnly: false
            })
        });
        vm.$onInit();

        spyOn($state, 'go').andReturn();
    });

    describe('onInit', function() {

        it('should resolve program', function() {
            expect(vm.programs).toEqual([program, programTwo]);
        });

        it('should resolve template', function() {
            expect(vm.template instanceof Template).toBe(true);
        });

        it('should resolve available columns', function() {
            expect(vm.availableColumns).toEqual([
                productCodeColumn.columnDefinition,
                calculatedOrderQuantityIsaColumn.columnDefinition,
                skippedColumn.columnDefinition
            ]);
        });
    });

    describe('addFacilityType', function() {

        it('should add facility type', function() {
            vm.facilityTypes = facilityTypes;
            vm.selectedFacilityType = facilityTypes[0];
            vm.addFacilityType();

            expect(vm.template.facilityTypes).toEqual([vm.selectedFacilityType]);
        });
    });

    describe('removeFacilityType', function() {

        beforeEach(function() {
            vm.template.facilityTypes = [facilityTypes[0]];
            vm.facilityTypes = facilityTypes;
        });

        it('should remove facility type', function() {
            vm.removeFacilityType(facilityTypes[0]);

            expect(vm.template.facilityTypes).toEqual([]);
        });

        it('should not remove if facility type was not found', function() {
            vm.removeFacilityType(new FacilityTypeDataBuilder().build());

            expect(vm.template.facilityTypes).toEqual([facilityTypes[0]]);
        });
    });

    describe('create', function() {

        beforeEach(function() {
            spyOn(confirmService, 'confirm').andReturn($q.resolve());
            spyOn(messageService, 'get').andCallFake(function(messageKey) {
                return messageKey;
            });

            vm.template.program = program;
            vm.template.create = jasmine.createSpy();
            vm.template.addColumn = jasmine.createSpy();
        });

        it('should create a template with proper columns order', function() {
            vm.create();
            $rootScope.$apply();

            expect(vm.template.addColumn.callCount).toBe(3);
            expect(vm.template.addColumn.calls[0].args).toEqual([skippedColumn.columnDefinition, true]);
            expect(vm.template.addColumn.calls[1].args).toEqual([productCodeColumn.columnDefinition, true]);
            expect(vm.template.addColumn.calls[2].args)
                .toEqual([calculatedOrderQuantityIsaColumn.columnDefinition, false]);

            expect(vm.template.columnsMap).not.toBeUndefined();
            expect(vm.template.numberOfPeriodsToAverage).toEqual(3);
        });

        it('should create a template and display success notification', function() {
            vm.create();
            $rootScope.$apply();

            expect(confirmService.confirm)
                .toHaveBeenCalledWith('adminTemplateAdd.createTemplate.confirm', 'adminTemplateAdd.create');

            expect(vm.template.create).toHaveBeenCalled();
        });

        it('should not call any service when confirmation fails', function() {
            confirmService.confirm.andReturn($q.reject());

            vm.create();
            $rootScope.$apply();

            expect(confirmService.confirm)
                .toHaveBeenCalledWith('adminTemplateAdd.createTemplate.confirm', 'adminTemplateAdd.create');

            expect(vm.template.create).not.toHaveBeenCalled();
        });
    });

    describe('populateFacilityTypes', function() {

        beforeEach(function() {
            vm.template.facilityTypes = [facilityTypes[0]];
            vm.facilityTypes = facilityTypes;
        });

        it('should assign facility type to requisition only template', function() {
            vm.selectedFacilityType = facilityTypes[0];
            vm.template.requisitionReportOnly = true;
            filteredProgramTemplates.push(templateOne);
            vm.populateFacilityTypes();

            expect(vm.template.facilityTypes).toEqual([vm.selectedFacilityType]);
        });
    });
});
