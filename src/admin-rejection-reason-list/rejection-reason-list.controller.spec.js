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

describe('RejectionReasonListController', function() {

    var $state, $controller,  vm, rejectionReasons, RejectionReasonDataBuilder;

    beforeEach(function() {
        module('admin-rejection-reason');
        module('admin-rejection-reason-list');

        inject(function($injector) {
            $controller = $injector.get('$controller');
            $state = $injector.get('$state');
            $controller = $injector.get('$controller');
            RejectionReasonDataBuilder = $injector.get('RejectionReasonDataBuilder');
        });

        rejectionReasons = [
            new RejectionReasonDataBuilder().build(),
            new RejectionReasonDataBuilder().build(),
            new RejectionReasonDataBuilder().build()
        ];

        vm = $controller('RejectionReasonListController', {
            rejectionReasons: rejectionReasons
        });

        spyOn($state, 'go').andReturn();
    });

    describe('goToAddRejectionReasonPage', function() {

        it('should redirect user to add add rejection reason page', function() {
            vm.goToAddRejectionReasonPage();

            expect($state.go).toHaveBeenCalledWith('openlmis.administration.rejectionReasons.add');
        });
    });
});
