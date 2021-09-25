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

describe('TemplateAddService', function() {

    var templateAddService, TemplateAddService, notificationService, alertService, loadingModalService, $state,
        templateRepositoryMock, TemplateMock, templateMock, originalCreate, template, $q, $rootScope;

    beforeEach(function() {
        module('admin-template-configure-columns');
        module('admin-template-add', function($provide) {
            TemplateMock = jasmine.createSpy('Template');
            $provide.factory('Template', function() {
                return TemplateMock;
            });

            templateRepositoryMock = jasmine.createSpyObj('TemplateRepository', ['create']);
            $provide.factory('TemplateRepository', function() {
                return function() {
                    return templateRepositoryMock;
                };
            });
        });

        inject(function($injector) {
            TemplateAddService = $injector.get('TemplateAddService');
            notificationService = $injector.get('notificationService');
            alertService = $injector.get('alertService');
            loadingModalService = $injector.get('loadingModalService');
            $rootScope = $injector.get('$rootScope');
            $state = $injector.get('$state');
            $q = $injector.get('$q');
        });

        spyOn($state, 'go');
        spyOn(alertService, 'error');
        spyOn(loadingModalService, 'open');
        spyOn(loadingModalService, 'close');
        spyOn(notificationService, 'success');
        spyOn(notificationService, 'error');

        templateMock = jasmine.createSpyObj('Template', ['create']);
        originalCreate = templateMock.create;

        TemplateMock.andReturn(templateMock);

        templateAddService = new TemplateAddService();

        template = templateAddService.initiateTemplate();
    });

    describe('constructor', function() {

        it('should set repository', function() {
            expect(templateAddService.repository).toBe(templateRepositoryMock);
        });
    });

    describe('initiateTemplate', function() {

        it('should decorate create', function() {
            template = templateAddService.initiateTemplate();

            expect(template.create).not.toBe(originalCreate);
        });
    });

    describe('decorated create', function() {

        it('should open loading modal', function() {
            originalCreate.andReturn($q.resolve());

            template.create();

            expect(loadingModalService.open).toHaveBeenCalled();
        });

        it('should leave closing loading modal to the state change', function() {
            originalCreate.andReturn($q.resolve({
                id: 'template-id'
            }));

            template.create();
            $rootScope.$apply();

            expect(loadingModalService.close).not.toHaveBeenCalled();
        });

        it('should close loading modal on error', function() {
            originalCreate.andReturn($q.reject());

            template.create();

            expect(loadingModalService.close).not.toHaveBeenCalled();

            $rootScope.$apply();

            expect(loadingModalService.close).toHaveBeenCalled();
        });

        it('should show notification if save was successful', function() {
            originalCreate.andReturn($q.resolve());

            template.create();

            expect(notificationService.success).not.toHaveBeenCalled();

            $rootScope.$apply();

            expect(notificationService.success).toHaveBeenCalledWith('adminTemplateAdd.createTemplate.success');
        });

        it('should redirect user to the columns configuration after save was successful', function() {
            originalCreate.andReturn($q.resolve({
                id: 'template-id'
            }));

            var result;
            template.create()
                .then(function(response) {
                    result = response;
                });

            expect($state.go).not.toHaveBeenCalled();

            $rootScope.$apply();

            expect($state.go).toHaveBeenCalledWith('openlmis.administration.requisitionTemplates.configure.columns', {
                id: result.id
            }, {
                reload: true
            });
        });

        it('should not redirect use to parent state after save failed', function() {
            originalCreate.andReturn($q.reject());

            template.create();
            $rootScope.$apply();

            expect($state.go).not.toHaveBeenCalled();
        });

        it('should resolve to original save response', function() {
            var createResult = {
                id: 'template-id'
            };

            originalCreate.andReturn($q.resolve(createResult));

            var result;
            template.create()
                .then(function(response) {
                    result = response;
                });
            $rootScope.$apply();

            expect(result).toBe(createResult);
        });

        it('should reject to the original error', function() {
            var error = 'Original Error';

            originalCreate.andReturn($q.reject(error));

            var result;
            template.create()
                .catch(function(error) {
                    result = error;
                });
            $rootScope.$apply();

            expect(result).toBe(error);
        });
    });
});