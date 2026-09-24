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

describe('rejectionReasonModalService', function() {

    beforeEach(function() {
        module('requisition-rejection-reason');

        inject(function($injector) {
            this.rejectionReasonModalService = $injector.get('rejectionReasonModalService');
            this.openlmisModalService = $injector.get('openlmisModalService');
            this.$q = $injector.get('$q');
            this.$rootScope = $injector.get('$rootScope');
        });

        this.category = {
            code: 'CAT_ONE',
            name: 'Category One'
        };

        this.rejectionReasonCategories = {
            content: [this.category]
        };

        this.rejectionReasons = {
            content: [{
                id: 'reason-one',
                name: 'Reason One',
                rejectionReasonCategory: this.category
            }]
        };

        var spec = this;
        spyOn(this.openlmisModalService, 'createDialog').andCallFake(function(options) {
            spec.options = options;
            return {
                promise: spec.$q.defer().promise
            };
        });

        this.rejectionReasonModalService.open();

        this.modalDeferred = this.$q.defer();
        this.resolved = jasmine.createSpy('resolved');
        this.modalDeferred.promise.then(this.resolved);

        this.vm = {};
        this.options.controller.call(
            this.vm, this.rejectionReasons, this.rejectionReasonCategories, this.modalDeferred
        );

        this.selectedReason = {
            rejectionReason: this.rejectionReasons.content[0]
        };
    });

    describe('hasRejectionReasons', function() {

        it('should return false if no rejection reason was added', function() {
            expect(this.vm.hasRejectionReasons()).toBe(false);
        });

        it('should return false if the list of rejection reasons is undefined', function() {
            this.vm.selectedRejectionReasons = undefined;

            expect(this.vm.hasRejectionReasons()).toBe(false);
        });

        it('should return true if a rejection reason was added', function() {
            this.vm.selectedRejectionReasons = [this.selectedReason];

            expect(this.vm.hasRejectionReasons()).toBe(true);
        });
    });

    describe('addRejectionReason', function() {

        it('should add the reason to the list of selected rejection reasons', function() {
            this.vm.reason = this.selectedReason;

            this.vm.addRejectionReason();

            expect(this.vm.selectedRejectionReasons).toEqual([this.selectedReason]);
        });

        it('should clear the category and reason inputs', function() {
            this.vm.category = this.category;
            this.vm.reason = this.selectedReason;

            this.vm.addRejectionReason();

            expect(this.vm.category).toEqual({});
            expect(this.vm.reason).toEqual({});
        });

        it('should return a resolved promise so the reload-form directive resets the form', function() {
            this.vm.reason = this.selectedReason;

            var resolvedSpy = jasmine.createSpy('addResolved'),
                promise = this.vm.addRejectionReason();

            expect(promise).not.toBeUndefined();
            expect(angular.isFunction(promise.then)).toBe(true);

            promise.then(resolvedSpy);
            this.$rootScope.$apply();

            expect(resolvedSpy).toHaveBeenCalled();
        });
    });

    describe('save', function() {

        it('should not resolve the modal if no rejection reason was added', function() {
            this.vm.save();
            this.$rootScope.$apply();

            expect(this.resolved).not.toHaveBeenCalled();
        });

        it('should not resolve the modal if the last rejection reason was removed', function() {
            this.vm.reason = this.selectedReason;
            this.vm.addRejectionReason();
            this.vm.removeRejectionReason(this.selectedReason);

            this.vm.save();
            this.$rootScope.$apply();

            expect(this.resolved).not.toHaveBeenCalled();
        });

        it('should resolve the modal with the selected rejection reasons', function() {
            this.vm.reason = this.selectedReason;
            this.vm.addRejectionReason();

            this.vm.save();
            this.$rootScope.$apply();

            expect(this.resolved).toHaveBeenCalledWith([this.selectedReason]);
        });
    });
});
