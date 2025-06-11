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
        templateFacilityTypes, programTemplates;

    beforeEach(function() {
        module('admin-template-list', function($provide) {
            $provide.value('featureFlagService', {
                set: function() {},
                get: function() {}
            });
        });

        inject(function($injector) {
            $controller = $injector.get('$controller');
            ProgramDataBuilder = $injector.get('ProgramDataBuilder');
            TemplateDataBuilder = $injector.get('TemplateDataBuilder');
            FacilityTypeDataBuilder = $injector.get('FacilityTypeDataBuilder');
        });

        program = new ProgramDataBuilder().withId('program-1')
            .build();
        programTwo = new ProgramDataBuilder().withId('program-2')
            .build();

        districtHospital = FacilityTypeDataBuilder.buildDistrictHospital();
        healthCenter = new FacilityTypeDataBuilder().build();

        template = new TemplateDataBuilder()
            .withFacilityTypes([healthCenter, districtHospital])
            .build();

        templateTwo = new TemplateDataBuilder()
            .withFacilityTypes([healthCenter])
            .build();

        templateFacilityTypes = {};
        templateFacilityTypes[template.id] = [healthCenter, districtHospital];
        templateFacilityTypes[templateTwo.id] = [healthCenter];

        programTemplates = {};
        programTemplates[program.id] = [template];
        programTemplates[programTwo.id] = [templateTwo];

        vm = $controller('TemplateListAdminController', {
            programs: [program, programTwo],
            templates: [template, templateTwo],
            templateFacilityTypes: templateFacilityTypes,
            programTemplates: programTemplates
        });
        vm.$onInit();
    });

    describe('init', function() {

        it('should set programs', function() {
            expect(vm.programs).toEqual([program, programTwo]);
        });

        it('should set templates', function() {
            expect(vm.templates).toEqual([template, templateTwo]);
        });

        it('should set templateFacilityTypes', function() {
            expect(vm.templateFacilityTypes).toEqual(templateFacilityTypes);
        });

        it('should set programTemplates', function() {
            expect(vm.programTemplates[program.id]).toEqual([template]);
            expect(vm.programTemplates[programTwo.id]).toEqual([templateTwo]);
        });
    });

});
