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

describe('REQUISITION_STATUS', function() {

    beforeEach(function() {

        module('requisition-constants');

        inject(function($injector) {
            this.RequisitionStatus = $injector.get('REQUISITION_STATUS');
        });
    });

    describe('getDisplayName', function() {

        it('should get display name for INITIATED status', function() {
            var displayName = this.RequisitionStatus.$getDisplayName('INITIATED');

            expect(displayName).toBe('requisitionConstants.initiated');
        });

        it('should get display name for SUBMITTED status', function() {
            var displayName = this.RequisitionStatus.$getDisplayName('SUBMITTED');

            expect(displayName).toBe('requisitionConstants.submitted');
        });

        it('should get display name for AUTHORIZED status', function() {
            var displayName = this.RequisitionStatus.$getDisplayName('AUTHORIZED');

            expect(displayName).toBe('requisitionConstants.authorized');
        });

        it('should get display name for IN_APPROVAL status', function() {
            var displayName = this.RequisitionStatus.$getDisplayName('IN_APPROVAL');

            expect(displayName).toBe('requisitionConstants.inApproval');
        });

        it('should get display name for APPROVED status', function() {
            var displayName = this.RequisitionStatus.$getDisplayName('APPROVED');

            expect(displayName).toBe('requisitionConstants.approved');
        });

        it('should get display name for RELEASED status', function() {
            var displayName = this.RequisitionStatus.$getDisplayName('RELEASED');

            expect(displayName).toBe('requisitionConstants.released');
        });

        it('should get display name for SKIPPED status', function() {
            var displayName = this.RequisitionStatus.$getDisplayName('SKIPPED');

            expect(displayName).toBe('requisitionConstants.skipped');
        });

        it('should get display name for REJECTED status', function() {
            var displayName = this.RequisitionStatus.$getDisplayName('REJECTED');

            expect(displayName).toBe('requisitionConstants.rejected');
        });

        it('should get display name for REJECTED_WITHOUT_ORDER status', function() {
            var displayName = this.RequisitionStatus.$getDisplayName('RELEASED_WITHOUT_ORDER');

            expect(displayName).toBe('requisitionConstants.releasedWithoutOrder');
        });
    });

    describe('toList', function() {

        it('should return list of all requisition statuses', function() {
            var returnedList = this.RequisitionStatus.$toList();

            expect(returnedList[0].label).toBe('INITIATED');
            expect(returnedList[1].label).toBe('REJECTED');
            expect(returnedList[2].label).toBe('SUBMITTED');
            expect(returnedList[3].label).toBe('AUTHORIZED');
            expect(returnedList[4].label).toBe('IN_APPROVAL');
            expect(returnedList[5].label).toBe('APPROVED');
            expect(returnedList[6].label).toBe('RELEASED');
            expect(returnedList[7].label).toBe('RELEASED_WITHOUT_ORDER');
            expect(returnedList[8].label).toBe('SKIPPED');
        });
    });
});
