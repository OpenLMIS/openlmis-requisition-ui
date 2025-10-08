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

describe('RejectionReasonRepository', function() {
    var OpenlmisRepositoryMock, rejectionReasonResourceMock, RejectionReason, RejectionReasonRepository;

    beforeEach(function() {
        module('admin-rejection-reason', function($provide) {
            rejectionReasonResourceMock = jasmine.createSpy('RejectionReasonResource');

            $provide.factory('RejectionReasonResource', function() {
                return function() {
                    return rejectionReasonResourceMock;
                };
            });

            OpenlmisRepositoryMock = jasmine.createSpy('OpenlmisRepository');
            $provide.factory('OpenlmisRepository', function() {
                return OpenlmisRepositoryMock;
            });

            $provide.value('featureFlagService', {
                set: function() {},
                get: function() {}
            });
        });

        inject(function($injector) {
            RejectionReason = $injector.get('RejectionReason');
            RejectionReasonRepository = $injector.get('RejectionReasonRepository');
        });
    });

    describe('construct', function() {
        it('should pass the given implementation', function() {
            var implMock = jasmine.createSpyObj('impl', ['create']);
            new RejectionReasonRepository(implMock);

            expect(OpenlmisRepositoryMock).toHaveBeenCalledWith(RejectionReason,
                implMock);
        });

        it('should extend OpenlmisRepository', function() {
            new RejectionReasonRepository();

            expect(OpenlmisRepositoryMock).toHaveBeenCalledWith(RejectionReason,
                rejectionReasonResourceMock);
        });
    });
});