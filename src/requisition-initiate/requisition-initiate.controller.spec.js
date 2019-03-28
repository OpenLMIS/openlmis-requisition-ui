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

describe('RequisitionInitiateController', function() {

    var vm, $q, programs, $rootScope, requisitionService, authorizationService, $state, facility,
        REQUISITION_RIGHTS, loadingModalService, permissionService, periods, $stateParams,
        canInitiateRnr, user, UuidGenerator, key;

    beforeEach(function() {
        module('requisition-initiate');

        inject(function($injector) {
            $rootScope = $injector.get('$rootScope');
            $state = $injector.get('$state');
            requisitionService = $injector.get('requisitionService');
            authorizationService = $injector.get('authorizationService');
            $q = $injector.get('$q');
            REQUISITION_RIGHTS = $injector.get('REQUISITION_RIGHTS');
            loadingModalService = $injector.get('loadingModalService');
            UuidGenerator = $injector.get('UuidGenerator');

            user = {
                //eslint-disable-next-line camelcase
                user_id: 'user_id'
            };
            programs = [
                {
                    code: 'HIV',
                    id: 1
                },
                {
                    code: 'programCode',
                    id: 2
                }
            ];
            facility = {
                id: '10134',
                name: 'National Warehouse',
                description: null,
                code: 'CODE',
                supportedPrograms: programs
            };
            periods = [];
            $stateParams = {
                facility: facility.id
            };

            canInitiateRnr = true;

            permissionService = $injector.get('permissionService');
            spyOn(permissionService, 'hasPermission').andReturn($q.resolve());

            spyOn(authorizationService, 'getUser').andReturn(user);

            key = 'key';
            spyOn(UuidGenerator.prototype, 'generate').andCallFake(function() {
                return key;
            });

            vm = $injector.get('$controller')('RequisitionInitiateController', {
                periods: periods,
                $stateParams: $stateParams,
                canInitiateRnr: canInitiateRnr
            });
        });
    });

    it('should change page to requisitions.requisition for with selected period with rnrId', function() {
        spyOn($state, 'go');

        vm.goToRequisition(1);

        expect($state.go).toHaveBeenCalledWith('openlmis.requisitions.requisition.fullSupply', {
            rnr: 1
        });
    });

    it('should change page to requisition full supply for newly initialized requisition in selected period',
        function() {
            var selectedPeriod = {
                id: 1
            };
            vm.$onInit();
            spyOn($state, 'go');
            spyOn(requisitionService, 'initiate').andReturn($q.when({
                id: 1
            }));
            vm.program = programs[0];
            vm.facility = facility;

            vm.initRnr(selectedPeriod);
            $rootScope.$apply();

            expect($state.go).toHaveBeenCalledWith('openlmis.requisitions.requisition.fullSupply', {
                rnr: 1
            });

            expect(permissionService.hasPermission).toHaveBeenCalledWith('user_id', {
                right: REQUISITION_RIGHTS.REQUISITION_CREATE,
                programId: programs[0].id,
                facilityId: facility.id
            });
        });

    it('should initiate requisition with idempotency key', function() {
        var selectedPeriod = {
            id: 1
        };

        vm.$onInit();
        spyOn($state, 'go');
        spyOn(requisitionService, 'initiate').andReturn($q.when({
            id: 1
        }));

        vm.program = programs[0];
        vm.facility = facility;

        vm.initRnr(selectedPeriod);
        $rootScope.$apply();

        expect(requisitionService.initiate)
            .toHaveBeenCalledWith(vm.facility.id, vm.program.id, selectedPeriod.id, vm.emergency, key);
    });

    it('should display error when user has no right to init requisition', function() {
        var selectedPeriod = {
            id: 1
        };

        permissionService.hasPermission.andReturn($q.reject());

        vm.$onInit();
        spyOn($state, 'go');
        spyOn(requisitionService, 'initiate');
        vm.program = programs[0];
        vm.facility = facility;

        vm.initRnr(selectedPeriod);
        $rootScope.$apply();

        expect($state.go).not.toHaveBeenCalled();
        expect(permissionService.hasPermission).toHaveBeenCalled();
        expect(requisitionService.initiate).not.toHaveBeenCalled();
    });

    it('should not change page to requisitions.requisition with selected period without rnrId and when invalid' +
        ' response from service', function() {
        var selectedPeriod = {};
        spyOn(requisitionService, 'initiate').andReturn($q.reject({
            id: 1
        }));
        spyOn($state, 'go');
        vm.program = programs[0];
        vm.facility = facility;

        vm.initRnr(selectedPeriod);
        $rootScope.$apply();

        expect($state.go).not.toHaveBeenCalled();
        expect(UuidGenerator.prototype.generate.calls.length).toEqual(2);
    });

    it('should open loading modal', function() {
        var selectedPeriod = {
            id: 1
        };
        spyOn(loadingModalService, 'open');
        vm.program = programs[0];
        vm.facility = facility;

        vm.initRnr(selectedPeriod);

        expect(loadingModalService.open).toHaveBeenCalled();
    });

    it('should reload periods with proper data', function() {
        spyOn($state, 'go');
        vm.program = programs[0];
        vm.facility = facility;
        vm.isSupervised = false;

        vm.$onInit();
        vm.loadPeriods();
        $rootScope.$apply();

        expect($state.go).toHaveBeenCalledWith('openlmis.requisitions.initRnr', {
            supervised: false,
            emergency: false,
            program: vm.program.id,
            facility: vm.facility.id
        }, {
            reload: true
        });
    });
});
