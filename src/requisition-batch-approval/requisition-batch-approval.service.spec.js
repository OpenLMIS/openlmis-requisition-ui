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

describe('requisitionBatchApprovalService', function() {

    var $rootScope, httpBackend, requisitionBatchApprovalService, requisitionUrlFactory, batchRequisitionsStorage,
        dateUtils, requisitionsStorage, offlineService, requisitions, $q;

    beforeEach(function() {
        module('requisition-batch-approval');

        var requisitionLineItems = [
            {
                id: 1,
                skipped: false,
                approvedQuantity: 10,
                totalCost: 100,
                orderable: {
                    id: 1,
                    productCode: 'Code 1',
                    fullProductName: 'Product name 1'
                }
            },
            {
                id: 2,
                skipped: false,
                approvedQuantity: 1,
                totalCost: 10,
                orderable: {
                    id: 2,
                    productCode: 'Code 2',
                    fullProductName: 'Product name 2'
                }
            }
        ];

        var requisitionLineItems2 = [
            {
                id: 3,
                skipped: false,
                approvedQuantity: 90,
                totalCost: 10000,
                orderable: {
                    id: 1,
                    productCode: 'Code 1',
                    fullProductName: 'Product name 1'
                }
            },
            {
                id: 4,
                skipped: false,
                approvedQuantity: 50,
                totalCost: 1000,
                orderable: {
                    id: 2,
                    productCode: 'Code 2',
                    fullProductName: 'Product name 2'
                }
            }
        ];

        var template = {
            columnsMap: [
                {
                    name: 'approvedQuantity',
                    source: 'USER_INPUT',
                    $type: 'NUMERIC',
                    $display: true
                },
                {
                    name: 'totalCost',
                    source: 'CALCULATED',
                    $type: 'CURRENCY',
                    $display: true
                }
            ]
        };

        var requisition = {
            id: 1,
            status: 'AUTHORIZED',
            requisitionLineItems: requisitionLineItems,
            processingPeriod: {
                name: 'Period name 1',
                startDate: 'Start date 1',
                endDate: 'End date 1'
            },
            facility: {
                name: 'Facility name 1'
            },
            template: template
        };

        var requisition2 = {
            id: 2,
            status: 'AUTHORIZED',
            requisitionLineItems: requisitionLineItems2,
            processingPeriod: {
                name: 'Period name 2',
                startDate: 'Start date 2',
                endDate: 'End date 2'
            },
            facility: {
                name: 'Facility name 1'
            },
            template: template
        };

        requisitions = [requisition, requisition2];

        var requisitionFactoryMock = jasmine.createSpy('Requisition').and.callFake(function(requisition) {
            return requisition;
        });

        module(function($provide) {
            $provide.factory('Requisition', function() {
                return requisitionFactoryMock;
            });

            requisitionsStorage = jasmine.createSpyObj('requisitionsStorage', ['search', 'put', 'getBy', 'removeBy']);
            batchRequisitionsStorage = jasmine.createSpyObj('batchRequisitionsStorage', ['search', 'put', 'getBy',
                'removeBy']);

            var offlineFlag = jasmine.createSpyObj('offlineRequisitions', ['getAll']);
            offlineFlag.getAll.and.returnValue([false]);
            var localStorageFactorySpy = jasmine.createSpy('localStorageFactory').and.callFake(function(resourceName) {
                if (resourceName === 'offlineFlag') {
                    return offlineFlag;
                }
                if (resourceName === 'batchApproveRequisitions') {
                    return batchRequisitionsStorage;
                }
                return requisitionsStorage;
            });

            $provide.service('localStorageFactory', function() {
                return localStorageFactorySpy;
            });
        });

        inject(function($injector) {
            $q = $injector.get('$q');
            httpBackend = $injector.get('$httpBackend');
            $rootScope = $injector.get('$rootScope');
            requisitionBatchApprovalService = $injector.get('requisitionBatchApprovalService');
            requisitionUrlFactory = $injector.get('requisitionUrlFactory');
            dateUtils = $injector.get('dateUtils');
            offlineService = $injector.get('offlineService');
        });

        spyOn(dateUtils, 'toStringDate').and.callFake(function(parameter) {
            return parameter;
        });

        spyOn(offlineService, 'checkConnection').and.callFake(checkConnection);
    });

    it('should get requisition by id', function() {
        var getRequisitionUrl = '/api/requisitions?retrieveAll&id=' + requisitions[0].id + ',' + requisitions[1].id;

        httpBackend.when('GET', requisitionUrlFactory(getRequisitionUrl)).respond(200, {
            requisitionDtos: requisitions
        });

        var data = {};
        requisitionBatchApprovalService.get(['1', '2']).then(function(response) {
            data = response;
        });

        httpBackend.flush();
        $rootScope.$apply();

        expect(data[0].id).toBe(requisitions[0].id);
        expect(batchRequisitionsStorage.put).toHaveBeenCalled();
    });

    it('should return empty array if requisition was not found', function() {
        var getRequisitionUrl = '/api/requisitions?retrieveAll&id=3';

        httpBackend.when('GET', requisitionUrlFactory(getRequisitionUrl)).respond(200, {
            requisitionDtos: []
        });

        var data = {};
        requisitionBatchApprovalService.get(['3']).then(function(response) {
            data = response;
        });

        httpBackend.flush();
        $rootScope.$apply();

        expect(data.length).toEqual(0);
        expect(batchRequisitionsStorage.put).not.toHaveBeenCalled();
    });

    it('should return only existing requisitions', function() {
        var getRequisitionUrl = '/api/requisitions?retrieveAll&id=3,' + requisitions[0].id;

        httpBackend.when('GET', requisitionUrlFactory(getRequisitionUrl)).respond(200, {
            requisitionDtos: [requisitions[0]]
        });

        var data = {};
        requisitionBatchApprovalService.get(['3', '1']).then(function(response) {
            data = response;
        });

        httpBackend.flush();
        $rootScope.$apply();

        expect(data.length).toEqual(1);
        expect(data[0].id).toBe(requisitions[0].id);
    });

    it('should get requisition by id from storage while offline', function() {
        spyOn(offlineService, 'isOffline').and.returnValue(true);
        batchRequisitionsStorage.getBy.and.returnValue(requisitions[0]);

        var data = {};
        requisitionBatchApprovalService.get(['1']).then(function(response) {
            data = response;
        });

        $rootScope.$apply();

        expect(data[0].id).toBe(requisitions[0].id);
    });

    it('should save all selected requisitions', function() {
        var getRequisitionUrl = '/api/requisitions?saveAll';

        httpBackend.when('PUT', requisitionUrlFactory(getRequisitionUrl)).respond(200, {
            requisitionDtos: requisitions
        });

        var data = {};
        requisitionBatchApprovalService.saveAll(requisitions).then(function(response) {
            data = response;
        });

        httpBackend.flush();
        $rootScope.$apply();

        expect(data.requisitionDtos[0].id).toBe(requisitions[0].id);
        expect(data.requisitionDtos.length).toEqual(requisitions.length);
    });

    it('should approve all selected requisitions', function() {
        var getRequisitionUrl = '/api/requisitions?approveAll&id=' + requisitions[0].id + ',' + requisitions[1].id;

        httpBackend.when('POST', requisitionUrlFactory(getRequisitionUrl)).respond(200, {
            requisitionDtos: requisitions
        });

        var data = {};
        requisitionBatchApprovalService.approveAll(['1', '2']).then(function(response) {
            data = response;
        });

        httpBackend.flush();
        $rootScope.$apply();

        expect(data.requisitionDtos[0].id).toBe(requisitions[0].id);
    });

    function checkConnection() {
        return $q.when(true);
    }
});
