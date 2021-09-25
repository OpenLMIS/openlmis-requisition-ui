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

describe('requisitionInitiateFactory', function() {

    var requisitionInitiateFactory, $q, permissionService, $rootScope, authorizationService,
        REQUISITION_RIGHTS, FacilityDataBuilder, ProgramDataBuilder, facility, program;

    beforeEach(function() {
        module('requisition-initiate');

        inject(function($injector) {
            requisitionInitiateFactory = $injector.get('requisitionInitiateFactory');
            $rootScope = $injector.get('$rootScope');
            $q = $injector.get('$q');
            permissionService = $injector.get('permissionService');
            authorizationService = $injector.get('authorizationService');
            REQUISITION_RIGHTS = $injector.get('REQUISITION_RIGHTS');

            FacilityDataBuilder = $injector.get('FacilityDataBuilder');
            ProgramDataBuilder = $injector.get('ProgramDataBuilder');
        });

        facility = new FacilityDataBuilder().build();
        program = new ProgramDataBuilder().build();
    });

    describe('canInitiate', function() {
        beforeEach(function() {
            spyOn(authorizationService, 'getUser').andReturn({
                //eslint-disable-next-line camelcase
                user_id: 'user-id'
            });
        });

        it('should return true if permission was found', function() {
            spyOn(permissionService, 'hasPermission').andReturn($q.resolve(true));
            var result;

            requisitionInitiateFactory.canInitiate(program.id, facility.id)
                .then(function(response) {
                    result = response;
                });
            $rootScope.$apply();

            expect(result).toBe(true);
        });

        it('should call permissionService with proper values', function() {
            spyOn(permissionService, 'hasPermission').andReturn($q.resolve(true));

            requisitionInitiateFactory.canInitiate(program.id, facility.id);
            $rootScope.$apply();

            expect(permissionService.hasPermission).toHaveBeenCalledWith('user-id', {
                right: REQUISITION_RIGHTS.REQUISITION_CREATE,
                programId: program.id,
                facilityId: facility.id
            });
        });

        it('should return false if permission was not found', function() {
            spyOn(permissionService, 'hasPermission').andReturn($q.reject(false));
            var result;

            requisitionInitiateFactory.canInitiate(program.id, facility.id)
                .then(function(response) {
                    result = response;
                });
            $rootScope.$apply();

            expect(result).toBe(false);
        });
    });

});