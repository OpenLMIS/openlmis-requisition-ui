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
describe('RejectionReasonCategoryRepository', function() {
    var RejectionReasonCategoryRepository, OpenlmisRepositoryMock,
        rejectionReasonCategoryResourceMock, RejectionReasonCategory;

    beforeEach(function() {
        module('admin-rejection-reason-category', function($provide) {

            OpenlmisRepositoryMock = jasmine.createSpy('OpenlmisRepository');
            $provide.factory('OpenlmisRepository', function() {
                return OpenlmisRepositoryMock;
            });

            rejectionReasonCategoryResourceMock = jasmine.createSpy('RejectionReasonCategoryResource');
            $provide.factory('RejectionReasonCategoryResource', function() {
                return function() {
                    return rejectionReasonCategoryResourceMock;
                };
            });

            $provide.value('featureFlagService', {
                set: function() {},
                get: function() {}
            });
        });

        inject(function($injector) {
            RejectionReasonCategoryRepository = $injector.get('RejectionReasonCategoryRepository');
            RejectionReasonCategory = $injector.get('RejectionReasonCategory');
        });
    });

    describe('construct', function() {
        it('should extend OpenlmisRepository', function() {
            new RejectionReasonCategoryRepository();

            expect(OpenlmisRepositoryMock).toHaveBeenCalledWith(RejectionReasonCategory,
                rejectionReasonCategoryResourceMock);
        });

        it('should pass the given implementation', function() {
            var implMock = jasmine.createSpyObj('impl', ['create']);

            new RejectionReasonCategoryRepository(implMock);

            expect(OpenlmisRepositoryMock).toHaveBeenCalledWith(RejectionReasonCategory,
                implMock);
        });
    });

});