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

describe('ProgramSettingsController', function() {

    var $q, $rootScope, $state, confirmService, loadingModalService, programService, notificationService,
        program, vm, ProgramDataBuilder, $controller, stateParams;

    beforeEach(function() {
        module('admin-program-settings', function($provide) {
            confirmService = jasmine.createSpyObj('confirmService', ['confirm']);
            $provide.service('confirmService', function() {
                return confirmService;
            });

            loadingModalService = jasmine.createSpyObj('loadingModalService', ['open', 'close']);
            $provide.service('loadingModalService', function() {
                return loadingModalService;
            });

            programService = jasmine.createSpyObj('programService', ['update']);
            $provide.service('programService', function() {
                return programService;
            });

            notificationService = jasmine.createSpyObj('notificationService', ['success', 'error']);
            $provide.service('notificationService', function() {
                return notificationService;
            });
        });

        inject(function($injector) {
            $rootScope = $injector.get('$rootScope');
            $q = $injector.get('$q');
            $state = $injector.get('$state');
            $controller = $injector.get('$controller');
            ProgramDataBuilder = $injector.get('ProgramDataBuilder');
        });

        program = new ProgramDataBuilder()
            .withId('program-id-1')
            .withName('program-1')
            .build();

        vm = $controller('ProgramSettingsController', {
            program: program
        });
        stateParams = {};
    });

    describe('init', function() {

        it('should expose saveProgram method', function() {
            expect(angular.isFunction(vm.saveProgram)).toBe(true);
        });

        it('should expose program', function() {
            expect(vm.program).toEqual(program);
        });
    });

    describe('saveProgram', function() {

        beforeEach(function() {
            confirmService.confirm.andReturn($q.when(true));
            programService.update.andReturn($q.when(true));
            spyOn($state, 'go').andReturn(true);
        });

        it('should call confirmService', function() {
            vm.saveProgram();
            $rootScope.$apply();

            expect(confirmService.confirm).toHaveBeenCalledWith('adminProgramSettings.saveProgramSettingsConfirm');
        });

        it('should call programService save method if confirmed', function() {
            vm.saveProgram();
            $rootScope.$apply();

            expect(programService.update).toHaveBeenCalledWith(vm.program);
        });

        it('should open loading modal if confirmed', function() {
            vm.saveProgram();
            $rootScope.$apply();

            expect(loadingModalService.open).toHaveBeenCalled();
        });

        it('should not call programService save method if not confirmed', function() {
            confirmService.confirm.andCallFake(function() {
                var deferred = $q.defer();
                deferred.reject();
                return deferred.promise;
            });

            vm.saveProgram();
            $rootScope.$apply();

            expect(programService.update).not.toHaveBeenCalled();
        });

        it('should show success notification if saved was successful', function() {
            vm.saveProgram();
            $rootScope.$apply();

            expect(notificationService.success)
                .toHaveBeenCalledWith('adminProgramSettings.programSettingsSavedSuccessfully');
        });

        it('should redirect to program list after successful save', function() {
            vm.saveProgram();
            $rootScope.$apply();

            expect($state.go).toHaveBeenCalledWith('openlmis.administration.programs', stateParams, {
                reload: true
            });
        });

        it('should show error notification if saved failed', function() {
            programService.update.andCallFake(function() {
                var deferred = $q.defer();
                deferred.reject();
                return deferred.promise;
            });

            vm.saveProgram();
            $rootScope.$apply();

            expect(notificationService.error).toHaveBeenCalledWith('adminProgramSettings.programSettingsSaveFailed');
        });

        it('should close modal after all actions', function() {
            vm.saveProgram();
            $rootScope.$apply();

            expect(loadingModalService.close).toHaveBeenCalled();
        });
    });
});
