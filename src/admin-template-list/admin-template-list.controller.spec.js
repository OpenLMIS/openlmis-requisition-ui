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

describe('TemplateListAdminController', function() {

    var vm, template, program, ProgramDataBuilder, TemplateDataBuilder, $controller,
        FacilityTypeDataBuilder, programTwo, templateTwo, districtHospital, healthCenter,
        districtStore;

    beforeEach(function() {
        module('admin-template-list');

        inject(function($injector) {
            $controller = $injector.get('$controller');
            ProgramDataBuilder = $injector.get('ProgramDataBuilder');
            TemplateDataBuilder = $injector.get('TemplateDataBuilder');
            FacilityTypeDataBuilder = $injector.get('FacilityTypeDataBuilder');
        });

        program = new ProgramDataBuilder().withId('program-1').build();
        programTwo = new ProgramDataBuilder().withId('program-2').build();

        template = new TemplateDataBuilder()
            .withFacilityTypes([
                new FacilityTypeDataBuilder().build(),
                new FacilityTypeDataBuilder().buildDistrictHospital().build()
            ]).build();

        templateTwo = new TemplateDataBuilder()
            .withFacilityTypes([
                new FacilityTypeDataBuilder().build()
            ]).build();

        districtHospital = new FacilityTypeDataBuilder().buildDistrictHospital().build();
        healthCenter = new FacilityTypeDataBuilder().build();
        districtStore = new FacilityTypeDataBuilder().buildDistrictStore().build();

        vm = $controller('TemplateListAdminController', {
            programs: [program, programTwo],
            templates: [template, templateTwo],
            facilityTypes: [districtHospital, districtStore, healthCenter]
        });
    });

    describe('init', function() {

        it('should set programs', function() {
            vm.$onInit();
            expect(vm.programs).toEqual([program, programTwo]);
        });

        it('should set templates', function() {
            vm.$onInit();
            expect(vm.templates).toEqual([template, templateTwo]);
        });

        it('should set programTemplates', function() {
            vm.$onInit();
            expect(vm.programTemplates[program.id]).toEqual([template]);
            expect(vm.programTemplates[programTwo.id]).toEqual([templateTwo]);
        });

        it('should set templateFacilityTypes', function() {
            vm.$onInit();
            expect(vm.templateFacilityTypes[template.id]).toEqual([districtStore, healthCenter]);
            expect(vm.templateFacilityTypes[templateTwo.id]).toEqual([healthCenter]);
        });
    });

});