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

describe('RequisitionBatchSaveFactory', function() {

    //variables
    var requisitions, dateUtils, requisitionBatchApprovalService, deferred,
        requisitionsStorage, batchRequisitionsStorage;

    //injects
    var requisitionBatchSaveFactory, $rootScope, $q;

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

        var requisitionFactoryMock = jasmine.createSpy('Requisition').andCallFake(function(requisition) {
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
            offlineFlag.getAll.andReturn([false]);
            var localStorageFactorySpy = jasmine.createSpy('localStorageFactory').andCallFake(function(resourceName) {
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
            requisitionBatchSaveFactory = $injector.get('requisitionBatchSaveFactory');
            requisitionBatchApprovalService = $injector.get('requisitionBatchApprovalService');
            $rootScope = $injector.get('$rootScope');
            $q = $injector.get('$q');
            dateUtils = $injector.get('dateUtils');
        });

        deferred = $q.defer();
        spyOn(requisitionBatchApprovalService, 'saveAll').andReturn(deferred.promise);

        spyOn(dateUtils, 'toStringDate').andCallFake(function(parameter) {
            return parameter;
        });
    });

    it('returns an empty array if input is invalid', function() {
        var data;

        requisitionBatchSaveFactory.saveRequisitions('invalid input').catch(function(response) {
            data = response;
        });

        $rootScope.$apply();

        expect(data).toEqual([]);
    });

    it('returns an empty array if input is an empty array', function() {
        var data;

        requisitionBatchSaveFactory.saveRequisitions([]).catch(function(response) {
            data = response;
        });

        $rootScope.$apply();

        expect(data).toEqual([]);
    });

    it('when successful, it returns an array of all requisitions', function() {
        var data;

        requisitionBatchSaveFactory.saveRequisitions(requisitions).then(function(response) {
            data = response;
        });

        deferred.resolve({
            requisitionDtos: requisitions
        });
        $rootScope.$apply();

        expect(data).toEqual(requisitions);
    });

    it('when successful, it mark all requisitions as available offline and then saves them to the batch requisition' +
        ' storage', function() {
        requisitionBatchSaveFactory.saveRequisitions(requisitions);

        deferred.resolve({
            requisitionDtos: requisitions
        });
        $rootScope.$apply();

        requisitions[0].$availableOffline = true;
        requisitions[1].$availableOffline = true;

        expect(batchRequisitionsStorage.put).toHaveBeenCalledWith(requisitions[0]);
        expect(batchRequisitionsStorage.put).toHaveBeenCalledWith(requisitions[1]);
    });

    it('when errors, it returns only requisitions that were successfully saved', function() {
        var data;

        requisitionBatchSaveFactory.saveRequisitions(requisitions).then(function() {
        }, function(response) {
            data = response;
        });

        deferred.reject({
            requisitionDtos: [requisitions[0]],
            requisitionErrors: [{
                requisitionId: requisitions[1].id,
                errorMessage: {
                    message: 'This requisition is invalid!'
                }
            }]
        });
        $rootScope.$apply();

        expect(data).toEqual([requisitions[0]]);

    });

    it('adds errors to requisitions that cannot be saved', function() {
        requisitionBatchSaveFactory.saveRequisitions(requisitions);

        deferred.reject({
            requisitionDtos: [requisitions[0]],
            requisitionErrors: [{
                requisitionId: requisitions[1].id,
                errorMessage: {
                    message: 'This requisition is invalid!'
                }
            }]
        });
        $rootScope.$apply();

        expect(requisitions[0].$error).toBe(undefined);
        expect(requisitions[1].$error).toBe('This requisition is invalid!');
    });

    it('removed requisitions from storage if date modified do not match', function() {
        requisitionBatchSaveFactory.saveRequisitions(requisitions);

        deferred.reject({
            requisitionDtos: [requisitions[0]],
            requisitionErrors: [{
                requisitionId: requisitions[1].id,
                errorMessage: {
                    messageKey: 'requisition.error.validation.dateModifiedMismatch'
                }
            }]
        });
        $rootScope.$apply();

        expect(batchRequisitionsStorage.removeBy.calls.length).toEqual(1);
        expect(batchRequisitionsStorage.removeBy).toHaveBeenCalledWith('id', requisitions[1].id);
    });

    it('mark only successful requisitions as available offline and then saves them to the batch requisitions storage',
        function() {
            requisitionBatchSaveFactory.saveRequisitions(requisitions);

            deferred.reject({
                requisitionDtos: [requisitions[0]],
                requisitionErrors: [{
                    requisitionId: requisitions[1].id,
                    errorMessage: {
                        message: 'This requisition is invalid!'
                    }
                }]
            });
            $rootScope.$apply();

            requisitions[0].$availableOffline = true;

            expect(batchRequisitionsStorage.put.calls.length).toEqual(1);
            expect(batchRequisitionsStorage.put).toHaveBeenCalledWith(requisitions[0]);
        });
});
