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

describe('templateFacilityTypeFactory', function() {

    var template, TemplateDataBuilder, FacilityTypeDataBuilder, templateTwo, districtHospital,
        healthCenter, districtStore, templateFacilityTypeFactory, facilityTypes, result;

    beforeEach(function() {
        module('admin-template-configure-settings', function($provide) {
            $provide.value('featureFlagService', {
                set: function() {},
                get: function() {}
            });
        });

        inject(function($injector) {
            TemplateDataBuilder = $injector.get('TemplateDataBuilder');
            FacilityTypeDataBuilder = $injector.get('FacilityTypeDataBuilder');
            templateFacilityTypeFactory = $injector.get('templateFacilityTypeFactory');
        });

        districtHospital = FacilityTypeDataBuilder.buildDistrictHospital();
        healthCenter = new FacilityTypeDataBuilder();
        districtStore = FacilityTypeDataBuilder.buildDistrictStore();

        facilityTypes = [districtHospital, districtStore, healthCenter];

        template = new TemplateDataBuilder()
            .withFacilityTypes([healthCenter])
            .build();

        templateTwo = new TemplateDataBuilder()
            .withFacilityTypes([districtStore])
            .build();
    });

    describe('getAvailableFacilityTypesForProgram', function() {

        it('should return programs with its templates', function() {
            result = templateFacilityTypeFactory.getAvailableFacilityTypesForProgram(
                [template, templateTwo], facilityTypes
            );

            expect(result).toEqual([districtHospital]);
        });
    });

});
