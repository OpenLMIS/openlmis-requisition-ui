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

describe('requisitionService', function() {

    var $rootScope, httpBackend, requisitionService, dateUtils, q, allStatuses, $templateCache, requisitionUrlFactory,
        requisitionsStorage, batchRequisitionsStorage, onlineOnlyRequisitions, startDate, endDate, startDate1, endDate1,
        modifiedDate, createdDate, processingSchedule, facility, program, period, emergency, requisition,
        requisitionDto, requisitionDto2, createdDate2,  statusMessage, statusMessagesStorage, reasonWithoutHidden,
        reasonNotHidden, reasonHidden, offlineService;

    beforeEach(function() {
        module('requisition');

        startDate = [2016, 4, 30, 16, 21, 33];
        endDate = [2016, 4, 30, 16, 21, 33];
        startDate1 = new Date();
        endDate1 = new Date();
        modifiedDate = [2016, 4, 30, 16, 21, 33];
        createdDate = [2016, 4, 30, 16, 21, 33];
        createdDate2 = [2016, 10, 30, 16, 21, 33];
        processingSchedule = {
            modifiedDate: modifiedDate
        };
        facility = {
            id: '1',
            name: 'facility1'
        };
        program = {
            id: '1',
            name: 'program1'
        };
        period = {
            id: '1',
            startDate: startDate,
            endDate: endDate,
            processingSchedule: processingSchedule
        };
        emergency = false;
        reasonNotHidden = {
            id: 'reason-id',
            hidden: false
        };
        reasonHidden = {
            id: 'hidden-id',
            hidden: true
        };
        reasonWithoutHidden = {
            id: 'without-hidden-id'
        };
        requisition = {
            id: '1',
            name: 'requisition',
            status: 'INITIATED',
            facilityId: facility.id,
            programId: program.id,
            processingPeriod: period,
            createdDate: createdDate,
            supplyingFacility: '2',
            template: '1',
            program: {
                id: 'program-id'
            },
            facility: {
                id: 'facility-id'
            },
            stockAdjustmentReasons: [reasonNotHidden, reasonHidden, reasonWithoutHidden]
        };
        requisitionDto = {
            id: '2',
            name: 'requisitionDto',
            status: 'INITIATED',
            facility: facility,
            program: program,
            processingPeriod: period,
            createdDate: createdDate
        };
        requisitionDto2 = {
            id: '3',
            name: 'requisitionDto',
            status: 'RELEASED',
            facility: facility,
            program: program,
            processingPeriod: period,
            createdDate: createdDate2
        };
        statusMessage = {
            id: '123'
        };

        module(function($provide) {
            var RequisitionSpy = jasmine.createSpy('Requisition').andCallFake(function(requisition) {
                    return requisition;
                }),
                confirmServiceMock = jasmine.createSpyObj('confirmService', ['confirm']);

            confirmServiceMock.confirm.andCallFake(function() {
                return q.when(true);
            });

            $provide.service('Requisition', function() {
                return RequisitionSpy;
            });

            $provide.service('confirmService', function() {
                return confirmServiceMock;
            });

            requisitionsStorage = jasmine.createSpyObj('requisitionsStorage', ['search', 'put', 'getBy', 'removeBy']);
            batchRequisitionsStorage = jasmine
                .createSpyObj('batchRequisitionsStorage', ['search', 'put', 'getBy', 'removeBy']);
            statusMessagesStorage = jasmine
                .createSpyObj('statusMessagesStorage', ['search', 'put', 'getBy', 'removeBy']);

            var offlineFlag = jasmine.createSpyObj('offlineRequisitions', ['getAll']);
            offlineFlag.getAll.andReturn([false]);
            onlineOnlyRequisitions = jasmine.createSpyObj('onlineOnly', ['contains']);
            var localStorageFactorySpy = jasmine.createSpy('localStorageFactory').andCallFake(function(resourceName) {
                if (resourceName === 'offlineFlag') {
                    return offlineFlag;
                }
                if (resourceName === 'onlineOnly') {
                    return onlineOnlyRequisitions;
                }
                if (resourceName === 'batchApproveRequisitions') {
                    return batchRequisitionsStorage;
                }
                if (resourceName === 'statusMessages') {
                    return statusMessagesStorage;
                }
                return requisitionsStorage;
            });

            $provide.service('localStorageFactory', function() {
                return localStorageFactorySpy;
            });
        });

        inject(function($injector) {
            httpBackend = $injector.get('$httpBackend');
            $rootScope = $injector.get('$rootScope');
            requisitionService = $injector.get('requisitionService');
            allStatuses = $injector.get('REQUISITION_STATUS').$toList();
            dateUtils = $injector.get('dateUtils');
            q = $injector.get('$q');
            requisitionUrlFactory = $injector.get('requisitionUrlFactory');
            offlineService = $injector.get('offlineService');
            $templateCache = $injector.get('$templateCache');

            $templateCache.put('common/notification-modal.html', 'something');
        });

        spyOn(offlineService, 'isOffline').andReturn(false);
    });

    describe('get', function() {

        var getRequisitionUrl,
            getStatusMessagesUrl,
            headers = {
                eTag: 'W/1'
            };

        beforeEach(function() {
            getStatusMessagesUrl = '/api/requisitions/' + requisition.id + '/statusMessages';
            getRequisitionUrl = '/api/requisitions/' + requisition.id;
        });

        it('should return eTag for requisition', function() {
            httpBackend.expect('GET', requisitionUrlFactory(getRequisitionUrl)).respond(200, requisition, headers);
            httpBackend.expect('GET', requisitionUrlFactory(getStatusMessagesUrl)).respond(200, [statusMessage]);

            var data = {};
            requisitionService.get('1').then(function(response) {
                data = response;
            });

            httpBackend.flush();
            $rootScope.$apply();

            expect(data.id).toBe(requisition.id);
            expect(data.eTag).toBe(headers['eTag']);
            expect(requisitionsStorage.put).toHaveBeenCalled();
            expect(statusMessagesStorage.put).toHaveBeenCalled();
        });

        it('should get requisition by id', function() {
            httpBackend.expect('GET', requisitionUrlFactory(getRequisitionUrl)).respond(200, requisition, headers);
            httpBackend.expect('GET', requisitionUrlFactory(getStatusMessagesUrl)).respond(200, [statusMessage]);

            var data = {};
            requisitionService.get('1').then(function(response) {
                data = response;
            });

            httpBackend.flush();
            $rootScope.$apply();

            expect(data.id).toBe(requisition.id);
            expect(requisitionsStorage.put).toHaveBeenCalled();
            expect(statusMessagesStorage.put).toHaveBeenCalled();
        });

        it('should get requisition by id from offline resources', function() {
            offlineService.isOffline.andReturn(true);
            requisitionsStorage.getBy.andCallFake(function(param, value) {
                if (param === 'id' && value === requisition.id) {
                    return requisition;
                }

                return undefined;
            });

            var data = {};
            requisitionService.get('1').then(function(response) {
                data = response;
            });

            $rootScope.$apply();

            expect(data.id).toBe(requisition.id);
            expect(requisitionsStorage.put).not.toHaveBeenCalled();
            expect(statusMessagesStorage.put).not.toHaveBeenCalled();
        });

        it('should filter out hidden reasons', function() {
            httpBackend.expect('GET', requisitionUrlFactory(getRequisitionUrl)).respond(200, requisition, headers);
            httpBackend.expect('GET', requisitionUrlFactory(getStatusMessagesUrl)).respond(200, [statusMessage]);

            var data = {};
            requisitionService.get('1').then(function(response) {
                data = response;
            });

            httpBackend.flush();
            $rootScope.$apply();

            expect(data.id).toBe(requisition.id);
            expect(data.stockAdjustmentReasons).toEqual([reasonNotHidden, reasonWithoutHidden]);
        });

        it('should try to fetch requisition from the backend if it is not stored in the local storage', function() {
            offlineService.isOffline.andReturn(true);
            requisitionsStorage.getBy.andReturn(undefined);
            httpBackend
                .expectGET(requisitionUrlFactory(getRequisitionUrl))
                .respond(418, requisition);

            requisitionService.get(requisition.id);
            $rootScope.$apply();

            expect(offlineService.isOffline).toHaveBeenCalled();
            expect(requisitionsStorage.getBy).toHaveBeenCalledWith('id', '1');
        });

        it('should retrieve requisition from the local storage if it was modified locally', function() {
            httpBackend.expect('GET', requisitionUrlFactory(getRequisitionUrl)).respond(200, requisition, headers);

            requisition.$modified = true;
            requisitionsStorage.getBy.andReturn(requisition);
            statusMessagesStorage.search.andReturn([statusMessage]);

            var result;
            requisitionService.get(requisition.id)
                .then(function(response) {
                    result = response;
                });
            httpBackend.flush();
            $rootScope.$apply();

            expect(result.id).toEqual(requisition.id);
        });

        //eslint-disable-next-line jasmine/missing-expect
        it('should retrieve requisition from the server if it is not modified', function() {
            httpBackend.expect('GET', requisitionUrlFactory(getRequisitionUrl)).respond(200, requisition, headers);
            httpBackend.expect('GET', requisitionUrlFactory(getStatusMessagesUrl)).respond(200, [statusMessage]);

            requisition.$modified = false;
            requisitionsStorage.getBy.andReturn(requisition);

            requisitionService.get(requisition.id);
            httpBackend.flush();
            $rootScope.$apply();
        });

        it('should retrieve requisition from the server to check if the cached one is outdated', function() {
            httpBackend.expect('GET', requisitionUrlFactory(getRequisitionUrl)).respond(200, requisition, headers);

            var offlineRequisition = angular.copy(requisition);
            offlineRequisition.modifiedDate = [2016, 4, 30, 15, 20, 33];
            offlineRequisition.$modified = true;
            requisitionsStorage.getBy.andReturn(offlineRequisition);

            requisition.modifiedDate = [2016, 4, 30, 16, 21, 33];

            var result;
            requisitionService.get(requisition.id)
                .then(function(requisition) {
                    result = requisition;
                });
            httpBackend.flush();
            $rootScope.$apply();

            expect(result.$outdated).toBe(true);
        });

        it('should mark requisition as outdated if it does not have modified date', function() {
            httpBackend.expect('GET', requisitionUrlFactory(getRequisitionUrl)).respond(200, requisition, headers);

            var offlineRequisition = angular.copy(requisition);
            offlineRequisition.$modified = true;
            requisitionsStorage.getBy.andReturn(offlineRequisition);

            requisition.modifiedDate = [2016, 4, 30, 16, 21, 33];

            var result;
            requisitionService.get(requisition.id)
                .then(function(requisition) {
                    result = requisition;
                });
            httpBackend.flush();
            $rootScope.$apply();

            expect(result.$outdated).toBe(true);
        });
    });

    it('should initiate requisition', function() {
        var data;

        httpBackend.when('POST', requisitionUrlFactory('/api/requisitions/initiate?emergency=' + emergency +
            '&facility=' + facility.id + '&program=' + program.id + '&suggestedPeriod=' + period.id))
            .respond(200, requisition);

        requisitionService.initiate(facility.id, program.id, period.id, emergency).then(function(response) {
            data = response;
        });

        httpBackend.flush();
        $rootScope.$apply();

        requisition.$modified = true;
        requisition.$availableOffline = true;

        expect(angular.toJson(data.id)).toEqual(angular.toJson(requisition.id));
        expect(requisitionsStorage.put).toHaveBeenCalled();
        expect(data.stockAdjustmentReasons).toEqual([reasonNotHidden, reasonWithoutHidden]);
    });

    it('should get requisitions for convert', function() {
        var data,
            requisitionCopy = formatDatesInRequisition(angular.copy(requisitionDto)),
            params = {
                filterBy: 'filterBy',
                filterValue: 'filterValue',
                sortBy: 'sortBy',
                descending: 'true'
            };

        httpBackend.when('GET', requisitionUrlFactory('/api/requisitions/requisitionsForConvert?descending=' +
            params.descending + '&filterBy=' + params.filterBy + '&filterValue=' + params.filterValue + '&sortBy=' +
            params.sortBy))
            .respond(200, {
                content: [{
                    requisition: requisitionDto
                }]
            });

        requisitionService.forConvert(params).then(function(response) {
            data = response;
        });

        httpBackend.flush();
        $rootScope.$apply();

        expect(angular.toJson(data)).toEqual(angular.toJson({
            content: [{
                requisition: requisitionCopy
            }]
        }));
    });

    it('should release a batch of requisitions with order', function() {
        var callback = jasmine.createSpy();

        httpBackend.when('POST', requisitionUrlFactory('/api/requisitions/batchReleases'))
            .respond(function() {
                return [200, angular.toJson({})];
            });

        requisitionService.convertToOrder([{
            requisition: requisition
        }]).then(callback);

        $rootScope.$apply();
        httpBackend.flush();
        $rootScope.$apply();

        expect(callback).toHaveBeenCalled();
        expect(requisitionsStorage.removeBy).toHaveBeenCalledWith('id', '1');
    });

    it('should release a batch of requisitions without order', function() {
        var callback = jasmine.createSpy();

        httpBackend.when('POST', requisitionUrlFactory('/api/requisitions/batchReleases'))
            .respond(function() {
                return [200, angular.toJson({})];
            });

        requisitionService.releaseWithoutOrder([{
            requisition: requisition
        }]).then(callback);

        $rootScope.$apply();
        httpBackend.flush();
        $rootScope.$apply();

        expect(callback).toHaveBeenCalled();
        expect(requisitionsStorage.removeBy).toHaveBeenCalledWith('id', '1');
    });

    it('should search requisitions with all params', function() {
        var data,
            params = {
                facility: facility.id,
                program: program.id,
                initiatedDateFrom: startDate1.toISOString(),
                initiatedDateTo: endDate1.toISOString(),
                requisitionStatus: [allStatuses[0].label, allStatuses[1].label],
                emergency: true,
                sort: 'createdDate,desc'
            },
            requisitionCopy = formatDatesInRequisition(angular.copy(requisitionDto));

        httpBackend.when('GET', requisitionUrlFactory('/api/requisitions/search?initiatedDateFrom=' +
            startDate1.toISOString() + '&initiatedDateTo=' + endDate1.toISOString() + '&emergency=' + params.emergency +
            '&facility=' + facility.id + '&program=' + program.id + '&requisitionStatus=' + allStatuses[0].label +
            '&requisitionStatus=' + allStatuses[1].label + '&sort=' + params.sort))
            .respond(200, {
                content: [requisitionDto]
            });

        requisitionsStorage.getBy.andReturn(false);

        requisitionService.search(false, params).then(function(response) {
            data = response;
        }, function() {
        });

        httpBackend.flush();
        $rootScope.$apply();

        expect(angular.toJson(data)).toEqual(angular.toJson({
            content: [
                requisitionCopy
            ]
        }));
    });

    it('should search requisitions only with facility paramter', function() {
        var data,
            requisitionCopy = formatDatesInRequisition(angular.copy(requisitionDto2)),
            params = {
                facility: facility.id
            };

        httpBackend.when('GET', requisitionUrlFactory('/api/requisitions/search?facility=' + facility.id))
            .respond(200, {
                content: [requisitionDto2]
            });

        requisitionsStorage.getBy.andReturn(false);

        requisitionService.search(false, params).then(function(response) {
            data = response;
        });

        httpBackend.flush();
        $rootScope.$apply();

        expect(angular.toJson(data)).toEqual(angular.toJson({
            content: [
                requisitionCopy
            ]
        }));
    });

    it('should search requisitions offline', function() {
        var data,
            params = {
                facility: facility.id,
                page: 0,
                size: 10,
                sort: 'createdDate,desc'
            };

        requisitionsStorage.search.andReturn([requisitionDto2, requisitionDto]);

        requisitionService.search(true, params).then(function(response) {
            data = response;
        });

        $rootScope.$apply();

        expect(angular.toJson(data)).toEqual(angular.toJson({
            content: [requisitionDto2, requisitionDto],
            number: 0,
            totalElements: 2,
            size: 10,
            sort: 'createdDate,desc'
        }));

        expect(requisitionsStorage.search).toHaveBeenCalledWith(params, 'requisitionSearch');
    });

    it('should count batch requisitions in search total elements if showBatchRequisitions is true', function() {
        var data,
            params = {
                showBatchRequisitions: true,
                program: program.id,
                page: 0,
                size: 10
            };

        requisitionsStorage.search.andReturn([requisitionDto]);
        batchRequisitionsStorage.search.andReturn([requisitionDto, requisitionDto2]);

        requisitionService.search(true, params).then(function(response) {
            data = response;
        });

        $rootScope.$apply();

        expect(angular.toJson(data)).toEqual(angular.toJson({
            content: [requisitionDto, requisitionDto2],
            number: 0,
            totalElements: 2,
            size: 10
        }));

        expect(batchRequisitionsStorage.search).toHaveBeenCalledWith(params.program, 'requisitionSearch');
    });

    it('should not count batch requisitions in search total elements if showBatchRequisitions is false', function() {
        var data,
            params = {
                showBatchRequisitions: false,
                program: program.id,
                page: 0,
                size: 10
            };

        requisitionsStorage.search.andReturn([requisitionDto]);
        batchRequisitionsStorage.search.andReturn([requisitionDto, requisitionDto2]);

        requisitionService.search(true, params).then(function(response) {
            data = response;
        });

        $rootScope.$apply();

        expect(angular.toJson(data)).toEqual(angular.toJson({
            content: [requisitionDto],
            number: 0,
            totalElements: 1,
            size: 10
        }));

        expect(batchRequisitionsStorage.search).not.toHaveBeenCalled();
    });

    describe('transformRequisition', function() {

        it('should not require createdDate to be set', function() {
            var data;

            requisition.createdDate = null;

            httpBackend.when(
                'GET', requisitionUrlFactory('/api/requisitions/search?facility=' + facility.id)
            ).respond(200, {
                content: [
                    requisition
                ]
            });

            requisitionService.search(false, {
                facility: facility.id
            }).then(function(response) {
                data = response;
            });

            httpBackend.flush();
            $rootScope.$apply();

            expect(data.content[0].createdDate).toEqual(null);
        });

        it('should not require processingSchedule to be set', function() {
            var data;

            requisition.processingPeriod.processingSchedule = null;

            httpBackend.when(
                'GET', requisitionUrlFactory('/api/requisitions/search?facility=' + facility.id)
            ).respond(200, {
                content: [
                    requisition
                ]
            });

            requisitionService.search(false, {
                facility: facility.id
            }).then(function(response) {
                data = response;
            });

            httpBackend.flush();
            $rootScope.$apply();

            expect(data.content[0].processingPeriod.processingSchedule).toEqual(null);
        });

        it('will mark the offline version of the requisition as $outdated, if modifiedDates do not match', function() {
            var offlineRequisition = {
                id: '1',
                modifiedDate: [2016, 4, 30, 16, 21, 33]
            };
            requisitionsStorage.getBy.andReturn(offlineRequisition);

            requisition.modifiedDate = [2016, 4, 30, 16, 21, 33];

            httpBackend.when('GET',
                requisitionUrlFactory('/api/requisitions/search')).respond(200, {
                content: [
                    requisition
                ]
            });

            requisitionService.search();
            httpBackend.flush();
            $rootScope.$apply();

            expect(requisitionsStorage.getBy).toHaveBeenCalled();
            expect(offlineRequisition.$outdated).toBeUndefined();

            requisition.modifiedDate = [2000, 9, 1, 1, 1, 1];

            requisitionService.search();
            httpBackend.flush();
            $rootScope.$apply();

            expect(offlineRequisition.$outdated).toBe(true);

            // The offline requisition should have been updated twice (once as $outdated, and once not)
            expect(requisitionsStorage.put.calls.length).toBe(2);
        });

        it('will put requisition to the batch requisitions storage if modifiedDates do not match', function() {
            requisition.modifiedDate = [2016, 4, 30, 16, 21, 33];

            batchRequisitionsStorage.getBy.andReturn(requisition);

            httpBackend.when('GET',
                requisitionUrlFactory('/api/requisitions/search')).respond(200, {
                content: [
                    requisition
                ]
            });

            requisitionService.search();
            httpBackend.flush();
            $rootScope.$apply();

            expect(batchRequisitionsStorage.put).toHaveBeenCalled();
            expect(requisitionsStorage.put).not.toHaveBeenCalled();
        });

        it('will put requisition to the requisitions storage if modifiedDates do not match', function() {
            requisition.modifiedDate = [2016, 4, 30, 16, 21, 33];

            requisitionsStorage.getBy.andReturn(requisition);

            httpBackend.when('GET',
                requisitionUrlFactory('/api/requisitions/search')).respond(200, {
                content: [
                    requisition
                ]
            });

            requisitionService.search();
            httpBackend.flush();
            $rootScope.$apply();

            expect(requisitionsStorage.put).toHaveBeenCalled();
            expect(batchRequisitionsStorage.put).not.toHaveBeenCalled();
        });

        it('will set requisition as available offline if was found the batch requisitions storage', function() {
            batchRequisitionsStorage.getBy.andReturn(requisition);

            var data = {};

            httpBackend.when('GET',
                requisitionUrlFactory('/api/requisitions/search')).respond(200, {
                content: [
                    requisition
                ]
            });

            requisitionService.search().then(function(response) {
                data = response;
            });

            httpBackend.flush();
            $rootScope.$apply();

            expect(data.content[0].$availableOffline).toBe(true);
        });

        it('will set requisition as available offline if was found the requisitions storage', function() {
            requisitionsStorage.getBy.andReturn(requisition);

            var data = {};

            httpBackend.when('GET',
                requisitionUrlFactory('/api/requisitions/search')).respond(200, {
                content: [
                    requisition
                ]
            });

            requisitionService.search().then(function(response) {
                data = response;
            });

            httpBackend.flush();
            $rootScope.$apply();

            expect(data.content[0].$availableOffline).toBe(true);
        });

        it('will not set requisition as available offline if was not found in any storage', function() {
            var data = {};

            httpBackend.when('GET',
                requisitionUrlFactory('/api/requisitions/search')).respond(200, {
                content: [
                    requisition
                ]
            });

            requisitionService.search().then(function(response) {
                data = response;
            });

            httpBackend.flush();
            $rootScope.$apply();

            expect(requisitionsStorage.getBy).toHaveBeenCalled();
            expect(batchRequisitionsStorage.getBy).toHaveBeenCalled();
            expect(data.content[0].$availableOffline).toBe(undefined);
        });

    });

    function formatDatesInRequisition(requisition) {
        requisition.processingPeriod.processingSchedule.modifiedDate = dateUtils
            .toDate(requisition.processingPeriod.processingSchedule.modifiedDate);
        requisition.processingPeriod.endDate = dateUtils.toDate(requisition.processingPeriod.endDate);
        requisition.processingPeriod.startDate = dateUtils.toDate(requisition.processingPeriod.startDate);
        requisition.createdDate = dateUtils.toDate(requisition.createdDate);
        return requisition;
    }

});
