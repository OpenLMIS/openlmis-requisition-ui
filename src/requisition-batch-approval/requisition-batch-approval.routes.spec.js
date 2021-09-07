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

describe('openlmis.requisitions.batchApproval state', function() {

    var $q, $state, $rootScope, requisitionBatchApprovalService, state, $stateParams,
        requisitions, REQUISITION_RIGHTS;

    beforeEach(function() {
        loadModules();
        injectServices();
        prepareTestData();
        prepareSpies();
    });

    it('should accept ids through query params', function() {
        expect(state.url.split('?')[1].indexOf('ids')).toBeGreaterThan(-1);
    });

    it('should fetch a list of requisitions', function() {
        $stateParams.ids = '1,2';

        var result;

        state.resolve.requisitions($stateParams, requisitionBatchApprovalService).then(function(requisitions) {
            result = requisitions;
        });
        $rootScope.$apply();

        expect(result).toEqual(requisitions);
        expect(requisitionBatchApprovalService.get).toHaveBeenCalledWith(['1', '2']);
    });

    it('should require REQUISITION_RIGHTS right to enter', function() {
        expect(state.accessRights).toEqual([REQUISITION_RIGHTS.REQUISITION_APPROVE]);
    });

    function loadModules() {
        module('openlmis-main-state');
        module('requisition');
        module('requisition-batch-approval');
    }

    function injectServices() {
        inject(function($injector) {
            $q = $injector.get('$q');
            $state = $injector.get('$state');
            $rootScope = $injector.get('$rootScope');
            requisitionBatchApprovalService = $injector.get('requisitionBatchApprovalService');
            REQUISITION_RIGHTS = $injector.get('REQUISITION_RIGHTS');
        });
    }

    function prepareTestData() {
        state = $state.get('openlmis.requisitions.batchApproval');
        $stateParams = {};
        requisitions = [{
            id: 1
        }, {
            id: 2
        }];
    }

    function prepareSpies() {
        spyOn(requisitionBatchApprovalService, 'get').and.returnValue($q.when(requisitions));
    }
});
