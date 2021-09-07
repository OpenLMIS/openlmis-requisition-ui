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

describe('RejectionReasonViewController', function() {

    var $q, $state, loadingModalService, vm, notificationService,
        RejectionReasonRepository, $rootScope, rejectionReason,
        messageService, RejectionReasonDataBuilder, $controller,
        saveDeferred, confirmDeferred, stateParams, rejectionReasonCategories,
        RejectionReasonCategoryDataBuilder;

    beforeEach(function() {
        module('admin-rejection-reason');
        module('admin-rejection-reason-category');
        module('admin-rejection-reason-view');

        inject(function($injector) {
            $q = $injector.get('$q');
            $state = $injector.get('$state');
            $rootScope = $injector.get('$rootScope');
            $controller = $injector.get('$controller');
            messageService = $injector.get('messageService');
            loadingModalService = $injector.get('loadingModalService');
            notificationService = $injector.get('notificationService');
            RejectionReasonRepository = $injector.get('RejectionReasonRepository');
            RejectionReasonDataBuilder = $injector.get('RejectionReasonDataBuilder');
            RejectionReasonCategoryDataBuilder = $injector.get('RejectionReasonCategoryDataBuilder');
        });

        rejectionReason = new RejectionReasonDataBuilder().build();

        rejectionReasonCategories = [
            new RejectionReasonCategoryDataBuilder().build(),
            new RejectionReasonCategoryDataBuilder().build(),
            new RejectionReasonCategoryDataBuilder().build()
        ];

        confirmDeferred = $q.defer();
        saveDeferred = $q.defer();

        stateParams = {
            param: 'param'
        };

        vm = $controller('RejectionReasonViewController', {
            rejectionReason: rejectionReason,
            rejectionReasonCategories: rejectionReasonCategories,
            $stateParams: stateParams
        });
        vm.$onInit();

        spyOn($state, 'go').and.returnValue();
    });

    describe('onInit', function() {
        it('should expose rejection reason', function() {
            expect(vm.rejectionReason).toEqual(rejectionReason);
        });
    });

    describe('saveRejectionReasonDetails', function() {

        beforeEach(function() {
            spyOn(loadingModalService, 'open').and.returnValue($q.resolve());
            spyOn(loadingModalService, 'close').and.returnValue($q.resolve());
            spyOn(RejectionReasonRepository.prototype, 'create').and.returnValue(saveDeferred.promise);
            spyOn(notificationService, 'success').and.returnValue($q.resolve());
            spyOn(notificationService, 'error').and.returnValue($q.resolve());
            spyOn(messageService, 'get').and.callFake(function(messageKey) {
                return messageKey;
            });
        });

        it('should update a rejection reason and display success notification', function() {
            vm.saveRejectionReasonDetails();

            confirmDeferred.reject();
            saveDeferred.resolve();
            $rootScope.$apply();

            expect(notificationService.success).toHaveBeenCalledWith('adminRejectionReason.saved');
        });

        it('should display error notification when rejection reason creation fails', function() {
            vm.saveRejectionReasonDetails();

            confirmDeferred.reject();
            saveDeferred.reject();
            $rootScope.$apply();

            expect(notificationService.error).toHaveBeenCalledWith(
                'adminRejectionReason.failedToSaveRejectionReason'
            );
        });
    });
});
