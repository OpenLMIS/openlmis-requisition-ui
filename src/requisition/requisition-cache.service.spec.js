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

describe('requisitionCacheService', function() {

    beforeEach(function() {

        this.requisitionStorage = jasmine.createSpyObj('requisitions', ['search', 'put', 'removeBy', 'getBy']);
        this.testStorage = jasmine.createSpyObj('testStorage', ['put']);
        this.batchRequisitionStorage = jasmine
            .createSpyObj('batchRequisitions', ['search', 'put', 'removeBy', 'getBy']);
        this.processingPeriodsStorage = jasmine
            .createSpyObj('processingPeriod', ['getBy']);
        this.userProgramsStorage = jasmine
            .createSpyObj('userPrograms', ['getBy']);
        this.facilitiesStorage = jasmine
            .createSpyObj('facilities', ['getBy']);

        var localStorageMap = {
            requisitions: this.requisitionStorage,
            batchApproveRequisitions: this.batchRequisitionStorage,
            processingPeriods: this.processingPeriodsStorage,
            userPrograms: this.userProgramsStorage,
            facilities: this.facilitiesStorage
        };

        module('requisition-view-tab');
        module('requisition', function($provide) {
            $provide.service('offlineService', function() {
                return function() {};
            });

            $provide.factory('localStorageFactory', function() {
                return function(resourceName) {
                    return localStorageMap[resourceName];
                };
            });
        });

        inject(function($injector) {
            this.RequisitionDataBuilder = $injector.get('RequisitionDataBuilder');
            this.requisitionCacheService = $injector.get('requisitionCacheService');
            this.PageDataBuilder = $injector.get('PageDataBuilder');
            this.permissionService = $injector.get('permissionService');
            this.authorizationService = $injector.get('authorizationService');
            this.UserDataBuilder = $injector.get('UserDataBuilder');
            this.$q = $injector.get('$q');
            this.REQUISITION_RIGHTS = $injector.get('REQUISITION_RIGHTS');
            this.$rootScope = $injector.get('$rootScope');
            this.AuthUser = $injector.get('AuthUser');
        });

        this.requisitionOne = new this.RequisitionDataBuilder().buildJson();
        this.requisitionTwo = new this.RequisitionDataBuilder().buildJson();

        this.batchRequisitionOne = new this.RequisitionDataBuilder().buildJson();
        this.batchRequisitionTwo = new this.RequisitionDataBuilder().buildJson();

        this.duplicatedRequisition = new this.RequisitionDataBuilder().buildJson();

        this.requisitionStorage.search.andReturn([
            this.requisitionOne,
            this.requisitionTwo
        ]);

        this.batchRequisitionStorage.search.andReturn([
            this.batchRequisitionOne,
            this.batchRequisitionTwo
        ]);

        this.processingPeriodsStorage.getBy.andReturn(this.requisitionOne.processingPeriod);
        this.userProgramsStorage.getBy.andReturn(this.requisitionOne.program);
        this.facilitiesStorage.getBy.andReturn(this.requisitionOne.facility);

        this.searchParams = {
            program: this.requisitionOne.program.id,
            size: 10,
            page: 0,
            showBatchRequisitions: true
        };

        this.user = new this.AuthUser('user-id');

        spyOn(this.authorizationService, 'getUser').andReturn(this.user);
        spyOn(this.permissionService, 'hasPermission').andReturn(this.$q.resolve(true));
        spyOn(this.permissionService, 'hasRoleWithRightForProgramAndSupervisoryNode').andReturn(this.$q.resolve(true));
    });

    describe('cacheRequisition', function() {

        it('should cache requisition', function() {
            this.requisitionCacheService.cacheRequisition(this.requisitionOne);

            expect(this.requisitionStorage.put).toHaveBeenCalledWith(minimizedRequisition(this.requisitionOne));
        });

    });

    describe('cacheRequisitionToStorage', function() {

        it('should cache requisition to the proper storage', function() {
            this.requisitionCacheService.cacheRequisitionToStorage(this.requisitionOne, this.testStorage);

            expect(this.testStorage.put).toHaveBeenCalledWith(minimizedRequisition(this.requisitionOne));
        });

    });

    describe('cacheBatchRequisition', function() {

        it('should cache batch requisition', function() {
            this.requisitionCacheService.cacheBatchRequisition(this.requisitionOne);

            expect(this.batchRequisitionStorage.put).toHaveBeenCalledWith(this.requisitionOne);
        });

    });

    describe('search', function() {

        it('should return requisitions if there is no batch requisitions if showBatchRequisition flag is set',
            function() {
                var expectedPage = new this.PageDataBuilder()
                    .withTotalElements(2)
                    .withNumberOfElements(2)
                    .withTotalPages(1)
                    .withContent([
                        this.requisitionOne,
                        this.requisitionTwo
                    ])
                    .build();

                this.batchRequisitionStorage.search.andReturn([]);

                var result;
                this.requisitionCacheService.search(this.searchParams)
                    .then(function(requisitionPage) {
                        result = requisitionPage;
                    });
                this.$rootScope.$apply();

                expect(result).toEqual(expectedPage);
                expect(this.requisitionStorage.search).toHaveBeenCalledWith(this.searchParams, 'requisitionSearch');
                expect(this.batchRequisitionStorage.search)
                    .toHaveBeenCalledWith(this.searchParams.program, 'requisitionSearch');
            });

        it('should return batch requisitions if there is no batch requisitions if showBatchRequisition flag is set',
            function() {
                var expectedPage = new this.PageDataBuilder()
                    .withTotalElements(2)
                    .withNumberOfElements(2)
                    .withTotalPages(1)
                    .withContent([
                        this.batchRequisitionOne,
                        this.batchRequisitionTwo
                    ])
                    .build();

                this.requisitionStorage.search.andReturn([]);

                var result;
                this.requisitionCacheService.search(this.searchParams)
                    .then(function(requisitionPage) {
                        result = requisitionPage;
                    });
                this.$rootScope.$apply();

                expect(result).toEqual(expectedPage);
                expect(this.requisitionStorage.search).toHaveBeenCalledWith(this.searchParams, 'requisitionSearch');
                expect(this.batchRequisitionStorage.search)
                    .toHaveBeenCalledWith(this.searchParams.program, 'requisitionSearch');
            });

        it('should return sum of requisitions and batch requisitions if showBatchRequisition flag is set', function() {
            var result;
            this.requisitionCacheService.search(this.searchParams)
                .then(function(requisitionPage) {
                    result = requisitionPage;
                });
            this.$rootScope.$apply();

            expect(result).toEqual(
                new this.PageDataBuilder()
                    .withTotalElements(4)
                    .withNumberOfElements(4)
                    .withTotalPages(1)
                    .withContent([
                        this.requisitionOne,
                        this.requisitionTwo,
                        this.batchRequisitionOne,
                        this.batchRequisitionTwo
                    ])
                    .build()
            );

            expect(this.requisitionStorage.search).toHaveBeenCalledWith(this.searchParams, 'requisitionSearch');
            expect(this.batchRequisitionStorage.search)
                .toHaveBeenCalledWith(this.searchParams.program, 'requisitionSearch');
        });

        it('should return duplicates if both requisition and batch requisition has the same id', function() {
            var expectedPage = new this.PageDataBuilder()
                .withTotalElements(5)
                .withNumberOfElements(5)
                .withTotalPages(1)
                .withContent([
                    this.requisitionOne,
                    this.requisitionTwo,
                    this.duplicatedRequisition,
                    this.batchRequisitionOne,
                    this.batchRequisitionTwo
                ])
                .build();

            this.requisitionStorage.search.andReturn([
                this.requisitionOne,
                this.requisitionTwo,
                this.duplicatedRequisition
            ]);
            this.batchRequisitionStorage.search.andReturn([
                this.batchRequisitionOne,
                this.batchRequisitionTwo,
                this.duplicatedRequisition
            ]);

            var result;
            this.requisitionCacheService.search(this.searchParams)
                .then(function(requisitionPage) {
                    result = requisitionPage;
                });
            this.$rootScope.$apply();

            expect(result).toEqual(expectedPage);
            expect(this.requisitionStorage.search).toHaveBeenCalledWith(this.searchParams, 'requisitionSearch');
            expect(this.batchRequisitionStorage.search)
                .toHaveBeenCalledWith(this.searchParams.program, 'requisitionSearch');
        });

        it('should not return batch requisitions if showBatchRequisition is not set', function() {
            this.searchParams.showBatchRequisitions = false;

            var result;
            this.requisitionCacheService.search(this.searchParams)
                .then(function(requisitionPage) {
                    result = requisitionPage;
                });
            this.$rootScope.$apply();

            expect(result).toEqual(
                new this.PageDataBuilder()
                    .withTotalElements(2)
                    .withNumberOfElements(2)
                    .withTotalPages(1)
                    .withContent([
                        this.requisitionOne,
                        this.requisitionTwo
                    ])
                    .build()
            );

            expect(this.requisitionStorage.search).toHaveBeenCalledWith(this.searchParams, 'requisitionSearch');
            expect(this.batchRequisitionStorage.search).not.toHaveBeenCalled();
        });

        it('should not return requisition if user has no related permissions string and right', function() {
            var context = this;
            this.permissionService.hasPermission.andCallFake(function(userId, permission) {
                if (context.user.user_id === userId &&
                    permission.right === context.REQUISITION_RIGHTS.REQUISITION_VIEW &&
                    permission.programId === context.batchRequisitionOne.program.id &&
                    permission.facilityId === context.batchRequisitionOne.facility.id) {
                    return context.$q.reject();
                }
                return context.$q.resolve();
            });

            this.permissionService.hasRoleWithRightForProgramAndSupervisoryNode
                .andCallFake(function(right, requisition) {
                    return context.$q.resolve(!(right === context.REQUISITION_RIGHTS.REQUISITION_VIEW
                        && requisition === context.batchRequisitionOne));
                });

            var result;
            this.requisitionCacheService.search(this.searchParams)
                .then(function(requisitionPage) {
                    result = requisitionPage;
                });
            this.$rootScope.$apply();

            expect(result).toEqual(
                new this.PageDataBuilder()
                    .withTotalElements(3)
                    .withNumberOfElements(3)
                    .withTotalPages(1)
                    .withContent([
                        this.requisitionOne,
                        this.requisitionTwo,
                        this.batchRequisitionTwo
                    ])
                    .build()
            );
        });

        it('should return requisition if user has not related permission string but has right', function() {
            var context = this;
            this.permissionService.hasPermission.andCallFake(function(userId, permission) {
                if (context.user.user_id === userId &&
                    permission.right === context.REQUISITION_RIGHTS.REQUISITION_VIEW &&
                    permission.programId === context.batchRequisitionOne.program.id &&
                    permission.facilityId === context.batchRequisitionOne.facility.id) {
                    return context.$q.reject();
                }
                return context.$q.resolve();
            });

            var result;
            this.requisitionCacheService.search(this.searchParams)
                .then(function(requisitionPage) {
                    result = requisitionPage;
                });
            this.$rootScope.$apply();

            expect(result).toEqual(
                new this.PageDataBuilder()
                    .withTotalElements(4)
                    .withNumberOfElements(4)
                    .withTotalPages(1)
                    .withContent([
                        this.requisitionOne,
                        this.requisitionTwo,
                        this.batchRequisitionOne,
                        this.batchRequisitionTwo
                    ])
                    .build()
            );
        });

        it('should return requisition if user has not related right but has permission string', function() {
            var context = this;
            this.permissionService.hasRoleWithRightForProgramAndSupervisoryNode
                .andCallFake(function(right, requisition) {
                    return !(right === context.REQUISITION_RIGHTS.REQUISITION_VIEW &&
                        requisition === context.batchRequisitionOne);
                });

            var result;
            this.requisitionCacheService.search(this.searchParams)
                .then(function(requisitionPage) {
                    result = requisitionPage;
                });
            this.$rootScope.$apply();

            expect(result).toEqual(
                new this.PageDataBuilder()
                    .withTotalElements(4)
                    .withNumberOfElements(4)
                    .withTotalPages(1)
                    .withContent([
                        this.requisitionOne,
                        this.requisitionTwo,
                        this.batchRequisitionOne,
                        this.batchRequisitionTwo
                    ])
                    .build()
            );
        });

        it('should mark page as first if first page is returned', function() {
            var result;
            this.requisitionCacheService.search(this.searchParams)
                .then(function(requisitionPage) {
                    result = requisitionPage;
                });
            this.$rootScope.$apply();

            expect(result.first).toEqual(true);
        });

        it('should mark page as not first if the page returned is not first', function() {
            this.searchParams.page = 1;
            this.searchParams.size = 1;

            var result;
            this.requisitionCacheService.search(this.searchParams)
                .then(function(requisitionPage) {
                    result = requisitionPage;
                });
            this.$rootScope.$apply();

            expect(result.first).toEqual(false);
        });

        it('should mark page as last if last page is returned', function() {
            var result;
            this.requisitionCacheService.search(this.searchParams)
                .then(function(requisitionPage) {
                    result = requisitionPage;
                });
            this.$rootScope.$apply();

            expect(result.last).toEqual(true);
        });

        it('should mark page as not last if the page returned is not last ', function() {
            this.searchParams.size = 1;

            var result;
            this.requisitionCacheService.search(this.searchParams)
                .then(function(requisitionPage) {
                    result = requisitionPage;
                });
            this.$rootScope.$apply();

            expect(result.last).toEqual(false);
        });

    });

    describe('removeById', function() {

        it('should remove requisition by ID', function() {
            this.requisitionCacheService.removeById(this.requisitionOne.id);

            expect(this.requisitionStorage.removeBy).toHaveBeenCalledWith('id', this.requisitionOne.id);
        });

    });

    function minimizedRequisition(requisition) {
        var requisitionToSave = JSON.parse(JSON.stringify(requisition));
        requisitionToSave.requisitionLineItems.forEach(function(lineItem) {
            lineItem.orderable = getVersionedObjectReference(lineItem.orderable);
            lineItem.approvedProduct = lineItem.approvedProduct ?
                getVersionedObjectReference(lineItem.approvedProduct) : undefined;
        });
        requisitionToSave.availableFullSupplyProducts = undefined;
        requisitionToSave.availableNonFullSupplyProducts = undefined;
        return requisitionToSave;
    }

    function getVersionedObjectReference(resource) {
        if (resource.meta) {
            return {
                id: resource.id,
                versionNumber: resource.meta.versionNumber
            };
        }
        return resource;
    }

});