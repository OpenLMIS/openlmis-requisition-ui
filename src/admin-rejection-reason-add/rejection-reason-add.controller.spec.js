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
describe('RejectionReasonAddController', function() {

    var $q, $state, $controller, loadingModalService, stateParams, vm, notificationService,
        RejectionReasonRepository, $rootScope, rejectionReason, saveDeferred, rejectionReasonCategories,
        RejectionReasonDataBuilder, messageService, confirmService, confirmDeferred,
        RejectionReasonCategoryDataBuilder;

    beforeEach(function() {
        module('admin-rejection-reason');
        module('admin-rejection-reason-category');
        module('admin-rejection-reason-add');

        inject(function($injector) {
            $state = $injector.get('$state');
            $q = $injector.get('$q');
            $rootScope = $injector.get('$rootScope');
            confirmService = $injector.get('confirmService');
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

        vm = $controller('RejectionReasonAddController', {
            rejectionReason: rejectionReason,
            rejectionReasonCategories: rejectionReasonCategories,
            $stateParams: stateParams
        });

        spyOn($state, 'go').and.returnValue();
    });

    describe('save', function() {
        beforeEach(function() {

            spyOn(confirmService, 'confirm').and.returnValue($q.resolve());
            spyOn(loadingModalService, 'open').and.returnValue($q.resolve());
            spyOn(loadingModalService, 'close').and.returnValue($q.resolve());
            spyOn(RejectionReasonRepository.prototype, 'create').and.returnValue(saveDeferred.promise);
            spyOn(notificationService, 'success').and.returnValue($q.resolve());
            spyOn(notificationService, 'error').and.returnValue($q.resolve());
            spyOn(messageService, 'get').and.callFake(function(messageKey) {
                return messageKey;
            });
        });

        it('should show notification if rejection reason was saved successfully', function() {
            vm.save();

            confirmDeferred.reject();
            saveDeferred.resolve();
            $rootScope.$apply();

            expect(notificationService.success).toHaveBeenCalledWith('adminRejectionReason.saved');
        });

        it('should show notification if rejection reason save has failed', function() {
            vm.save();

            confirmDeferred.reject();
            saveDeferred.reject();
            $rootScope.$apply();

            expect(notificationService.error).toHaveBeenCalledWith(
                'adminRejectionReason.failedToSaveRejectionReason'
            );
        });
    });

    describe('goToPreviousState', function() {

        it('should redirects to previous state', function() {
            vm.goToPreviousState();

            expect($state.go).toHaveBeenCalledWith('openlmis.administration.rejectionReasons');
        });
    });
});
