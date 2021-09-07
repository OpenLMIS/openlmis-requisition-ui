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

describe('ProgramAddController', function() {

    var $q, $state, $controller, $rootScope, confirmService, loadingModalService, programService, notificationService,
        messageService, ProgramDataBuilder, vm, program, stateParams;

    beforeEach(function() {
        module('admin-program-add');

        inject(function($injector) {
            $q = $injector.get('$q');
            $controller = $injector.get('$controller');
            $state = $injector.get('$state');
            $rootScope = $injector.get('$rootScope');
            confirmService = $injector.get('confirmService');
            loadingModalService = $injector.get('loadingModalService');
            programService = $injector.get('programService');
            notificationService = $injector.get('notificationService');
            messageService = $injector.get('messageService');
            ProgramDataBuilder = $injector.get('ProgramDataBuilder');
        });

        program = new ProgramDataBuilder().build();

        stateParams = {
            param: 'param'
        };

        vm = $controller('ProgramAddController', {
            $stateParams: stateParams
        });
        vm.$onInit();

        spyOn($state, 'go').and.returnValue();
    });

    describe('onInit', function() {

        it('should set active property to program object', function() {
            expect(vm.program).toEqual({
                active: true
            });
        });
    });

    describe('saveProgram', function() {

        beforeEach(function() {
            spyOn(confirmService, 'confirm').and.returnValue($q.resolve());
            spyOn(loadingModalService, 'open').and.returnValue($q.resolve());
            spyOn(loadingModalService, 'close').and.returnValue($q.resolve());
            spyOn(programService, 'create').and.returnValue($q.resolve());
            spyOn(notificationService, 'success').and.returnValue($q.resolve());
            spyOn(notificationService, 'error').and.returnValue($q.resolve());
            spyOn(messageService, 'get').and.callFake(function(messageKey) {
                return messageKey;
            });
        });

        it('should create a program and display success notification', function() {
            vm.program = program;
            vm.saveProgram();
            $rootScope.$apply();

            expect(confirmService.confirm)
                .toHaveBeenCalledWith('adminProgramAdd.createProgram.confirm', 'adminProgramAdd.create');

            expect(loadingModalService.open).toHaveBeenCalled();
            expect(programService.create).toHaveBeenCalledWith(program);
            expect(notificationService.success).toHaveBeenCalledWith('adminProgramAdd.createProgram.success');
            expect($state.go).toHaveBeenCalledWith('openlmis.administration.programs', stateParams, {
                reload: true
            });
        });

        it('should not call any service when confirmation fails', function() {
            confirmService.confirm.and.returnValue($q.reject());

            vm.program = program;
            vm.saveProgram();
            $rootScope.$apply();

            expect(confirmService.confirm)
                .toHaveBeenCalledWith('adminProgramAdd.createProgram.confirm', 'adminProgramAdd.create');

            expect(loadingModalService.open).not.toHaveBeenCalled();
            expect(programService.create).not.toHaveBeenCalled();
            expect(notificationService.success).not.toHaveBeenCalled();
            expect(notificationService.error).not.toHaveBeenCalledWith();
            expect($state.go).not.toHaveBeenCalled();
        });

        it('should display error notification when program creation fails', function() {
            programService.create.and.returnValue($q.reject());

            vm.program = program;
            vm.saveProgram();
            $rootScope.$apply();

            expect(confirmService.confirm)
                .toHaveBeenCalledWith('adminProgramAdd.createProgram.confirm', 'adminProgramAdd.create');

            expect(loadingModalService.open).toHaveBeenCalled();
            expect(programService.create).toHaveBeenCalledWith(program);
            expect(notificationService.success).not.toHaveBeenCalled();
            expect(notificationService.error).toHaveBeenCalledWith('adminProgramAdd.createProgram.failure');
            expect(loadingModalService.close).toHaveBeenCalled();
            expect($state.go).not.toHaveBeenCalledWith();
        });
    });

    describe('goToPreviousState', function() {

        it('should redirects to previous state', function() {
            vm.goToPreviousState();

            expect($state.go).toHaveBeenCalledWith('openlmis.administration.programs');
        });
    });
});
