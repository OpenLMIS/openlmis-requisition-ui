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

describe('RejectionReasonCategoryViewController', function() {

    var $q, $state, loadingModalService, vm, notificationService,
        RejectionReasonCategoryRepository, $rootScope, rejectionReasonCategory,
        messageService, RejectionReasonCategoryDataBuilder, $controller,
        saveDeferred, confirmDeferred, stateParams;

    beforeEach(function() {
        module('admin-rejection-reason-category');
        module('admin-rejection-reason-category-view');

        inject(function($injector) {
            $q = $injector.get('$q');
            $rootScope = $injector.get('$rootScope');
            $state = $injector.get('$state');
            messageService = $injector.get('messageService');
            $controller = $injector.get('$controller');
            loadingModalService = $injector.get('loadingModalService');
            notificationService = $injector.get('notificationService');
            RejectionReasonCategoryRepository = $injector.get('RejectionReasonCategoryRepository');
            RejectionReasonCategoryDataBuilder = $injector.get('RejectionReasonCategoryDataBuilder');
        });

        rejectionReasonCategory = new RejectionReasonCategoryDataBuilder().build();

        stateParams = {
            param: 'param'
        };

        vm = $controller('RejectionReasonCategoryViewController', {
            rejectionReasonCategory: rejectionReasonCategory,
            $stateParams: stateParams
        });

        vm.$onInit();

        confirmDeferred = $q.defer();
        saveDeferred = $q.defer();

        spyOn($state, 'go').andReturn();
    });

    describe('onInit', function() {
        it('should expose rejection reason category', function() {
            expect(vm.rejectionReasonCategory).toEqual(rejectionReasonCategory);
        });
    });

    describe('saveRejectionReasonCategoryDetails', function() {

        beforeEach(function() {
            spyOn(loadingModalService, 'open').andReturn($q.resolve());
            spyOn(loadingModalService, 'close').andReturn($q.resolve());
            spyOn(RejectionReasonCategoryRepository.prototype, 'create').andReturn(saveDeferred.promise);
            spyOn(notificationService, 'success').andReturn($q.resolve());
            spyOn(notificationService, 'error').andReturn($q.resolve());
            spyOn(messageService, 'get').andCallFake(function(messageKey) {
                return messageKey;
            });
        });

        it('should update a rejection reason category and display success notification', function() {
            vm.saveRejectionReasonCategoryDetails();

            confirmDeferred.reject();
            saveDeferred.resolve();
            $rootScope.$apply();

            expect(notificationService.success).toHaveBeenCalledWith('adminRejectionReasonCategory.saved');
        });

        it('should display error notification when rejection reason category creation fails', function() {
            vm.saveRejectionReasonCategoryDetails();

            confirmDeferred.reject();
            saveDeferred.reject();
            $rootScope.$apply();

            expect(notificationService.error).toHaveBeenCalledWith(
                'adminRejectionReasonCategory.failedToSaveRejectionReasonCategory'
            );
        });
    });
});