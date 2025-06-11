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

describe('templateListFactory', function() {

    var template, program, ProgramDataBuilder, TemplateDataBuilder, FacilityTypeDataBuilder,
        programTwo, templateTwo, templateThree, districtHospital, healthCenter, districtStore,
        templateListFactory, templates, facilityTypes, result, templateFour, programThree,
        inactiveType;

    beforeEach(function() {
        module('admin-template-list', function($provide) {
            $provide.value('featureFlagService', {
                set: function() {},
                get: function() {}
            });
        });

        inject(function($injector) {
            ProgramDataBuilder = $injector.get('ProgramDataBuilder');
            TemplateDataBuilder = $injector.get('TemplateDataBuilder');
            FacilityTypeDataBuilder = $injector.get('FacilityTypeDataBuilder');
            templateListFactory = $injector.get('templateListFactory');
        });

        program = new ProgramDataBuilder().withId('program-1')
            .build();
        programTwo = new ProgramDataBuilder().withId('program-2')
            .build();
        programThree = new ProgramDataBuilder().withId('program-3')
            .build();

        districtHospital = FacilityTypeDataBuilder.buildDistrictHospital();
        healthCenter = new FacilityTypeDataBuilder();
        districtStore = FacilityTypeDataBuilder.buildDistrictStore();
        inactiveType = FacilityTypeDataBuilder.buildAsInactive();

        facilityTypes = [districtHospital, districtStore, healthCenter];

        template = new TemplateDataBuilder()
            .withFacilityTypes([healthCenter, districtHospital])
            .build();

        templateTwo = new TemplateDataBuilder()
            .withProgram(program)
            .withFacilityTypes([healthCenter])
            .build();

        templateThree = new TemplateDataBuilder()
            .withProgram(programTwo)
            .withFacilityTypes([districtStore])
            .build();

        templates = [template, templateTwo, templateThree];
    });

    describe('getProgramTemplates', function() {

        it('should return programs with its templates', function() {
            result = templateListFactory.getProgramTemplates(templates, [program, programTwo]);

            expect(result[program.id]).toEqual([template, templateTwo]);
            expect(result[programTwo.id]).toEqual([templateThree]);
        });

        it('should return empty list if templates are empty list', function() {
            result = templateListFactory.getProgramTemplates(templates, [programThree]);

            expect(result[programThree.id]).toEqual([]);
        });
    });

    describe('getTemplateFacilityTypes', function() {

        it('should return templates with its facility types', function() {
            result = templateListFactory.getTemplateFacilityTypes(templates, facilityTypes);

            expect(result[template.id]).toEqual([healthCenter, districtHospital]);
            expect(result[templateTwo.id]).toEqual([healthCenter]);
            expect(result[templateThree.id]).toEqual([districtStore]);
        });

        it('should not return inactive facility types', function() {
            templateTwo = new TemplateDataBuilder()
                .withProgram(program)
                .withFacilityTypes([healthCenter, inactiveType])
                .build();

            result = templateListFactory.getTemplateFacilityTypes([templateTwo], facilityTypes);

            expect(result[templateTwo.id]).toEqual([healthCenter]);
        });

        it('should return empty list if facilityTypes are empty list', function() {
            templateFour = new TemplateDataBuilder()
                .withProgram(programTwo)
                .withFacilityTypes([])
                .build();
            result = templateListFactory.getTemplateFacilityTypes([templateFour], facilityTypes);

            expect(result[templateFour.id]).toEqual([]);
        });
    });

});
