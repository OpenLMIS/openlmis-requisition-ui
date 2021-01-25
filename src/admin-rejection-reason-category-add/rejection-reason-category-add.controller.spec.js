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

describe('RejectionReasonCategoryAddController', function() {

    var $q, $state, $controller, loadingModalService, stateParams, vm, notificationService,
        RejectionReasonCategoryRepository, $rootScope, rejectionReasonCategory, saveDeferred,
        RejectionReasonCategoryDataBuilder, messageService, confirmService, confirmDeferred;

    beforeEach(function() {
        module('admin-rejection-reason-category');
        module('admin-rejection-reason-category-add');

        inject(function($injector) {
            $state = $injector.get('$state');
            $q = $injector.get('$q');
            $rootScope = $injector.get('$rootScope');
            confirmService = $injector.get('confirmService');
            $controller = $injector.get('$controller');
            messageService = $injector.get('messageService');
            loadingModalService = $injector.get('loadingModalService');
            notificationService = $injector.get('notificationService');
            RejectionReasonCategoryRepository = $injector.get('RejectionReasonCategoryRepository');
            RejectionReasonCategoryDataBuilder = $injector.get('RejectionReasonCategoryDataBuilder');
        });

        rejectionReasonCategory = new RejectionReasonCategoryDataBuilder().build();

        confirmDeferred = $q.defer();
        saveDeferred = $q.defer();

        stateParams = {
            param: 'param'
        };

        vm = $controller('RejectionReasonCategoryAddController', {
            rejectionReasonCategory: rejectionReasonCategory,
            $stateParams: stateParams
        });

        spyOn($state, 'go').andReturn();
    });

    describe('save', function() {
        beforeEach(function() {

            spyOn(confirmService, 'confirm').andReturn($q.resolve());
            spyOn(loadingModalService, 'open').andReturn($q.resolve());
            spyOn(loadingModalService, 'close').andReturn($q.resolve());
            spyOn(RejectionReasonCategoryRepository.prototype, 'create').andReturn(saveDeferred.promise);
            spyOn(notificationService, 'success').andReturn($q.resolve());
            spyOn(notificationService, 'error').andReturn($q.resolve());
            spyOn(messageService, 'get').andCallFake(function(messageKey) {
                return messageKey;
            });
        });

        it('should show notification if rejection reason category was saved successfully', function() {
            vm.save();

            confirmDeferred.reject();
            saveDeferred.resolve();
            $rootScope.$apply();

            expect(notificationService.success).toHaveBeenCalledWith('adminRejectionReasonCategory.saved');
        });

        it('should show notification if rejection reason category  save has failed', function() {
            vm.save();

            confirmDeferred.reject();
            saveDeferred.reject();
            $rootScope.$apply();

            expect(notificationService.error).toHaveBeenCalledWith(
                'adminRejectionReasonCategory.failedToSaveRejectionReasonCategory'
            );
        });
    });
});
