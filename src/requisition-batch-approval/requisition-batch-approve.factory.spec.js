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

describe('RequisitionBatchApproveFactory', function() {

    var $rootScope, requisitionBatchApproveFactory, requisitions, requisitionBatchApprovalService,
        deferred, requisitionBatchSaveFactory, $q;

    beforeEach(function() {
        module('requisition-batch-approval');

        requisitions = [{
            id: 'requisition-1'
        }, {
            id: 'requisition-2'
        }];

        module(function($provide) {
            $provide.factory('requisitionUrlFactory', function() {
                return function(url) {
                    return url;
                };
            });
        });

        inject(function($injector) {
            $q = $injector.get('$q');
        });

        inject(function($injector) {
            $rootScope = $injector.get('$rootScope');
            requisitionBatchApproveFactory = $injector.get('requisitionBatchApproveFactory');
            requisitionBatchApprovalService = $injector.get('requisitionBatchApprovalService');
            requisitionBatchSaveFactory = $injector.get('requisitionBatchSaveFactory');
        });

        deferred = $q.defer();
        spyOn(requisitionBatchApprovalService, 'approveAll').and.returnValue(deferred.promise);
        spyOn(requisitionBatchSaveFactory, 'saveRequisitions').and.returnValue($q.when(requisitions));
    });

    it('returns an empty array if input is invalid', function() {
        var response;

        requisitionBatchApproveFactory.batchApprove([]).catch(function(requisitions) {
            response = requisitions;
        });
        $rootScope.$apply();

        expect(Array.isArray(response)).toBe(true);
        expect(response.length).toEqual(0);

        requisitionBatchApproveFactory.batchApprove(false).catch(function(requisitions) {
            response = requisitions;
        });
        $rootScope.$apply();

        expect(Array.isArray(response)).toBe(true);
        expect(response.length).toEqual(0);

    });

    it('always saves all requisitions', function() {
        requisitionBatchApproveFactory.batchApprove(requisitions);
        $rootScope.$apply();

        expect(requisitionBatchSaveFactory.saveRequisitions).toHaveBeenCalledWith(requisitions);
    });

    it('when successful, it returns an array of all requisitions', function() {
        var response;

        requisitionBatchApproveFactory.batchApprove(requisitions).then(function(returnedRequisitions) {
            response = returnedRequisitions;
        });

        deferred.resolve({
            requisitionDtos: requisitions
        });
        $rootScope.$apply();

        expect(response.length).toEqual(requisitions.length);
        expect(response[0].id).toEqual(requisitions[0].id);
    });

    it('unapproved requisitions are not returned', function() {
        var unapprovableRequisition = {
            id: 'requisition-dontapprove'
        };
        requisitions.push(unapprovableRequisition);

        var response;
        requisitionBatchApproveFactory.batchApprove(requisitions).then(function(returnedRequisitions) {
            response = returnedRequisitions;
        });

        deferred.resolve({
            requisitionDtos: [requisitions[0], requisitions[1]],
            requisitionErrors: [{
                requisitionId: requisitions[2].id,
                errorMessage: {
                    message: 'This requisition is invalid!'
                }
            }]
        });
        $rootScope.$apply();

        expect(response.length).toEqual(requisitions.length - 1);
    });
});
