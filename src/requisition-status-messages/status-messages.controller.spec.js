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

describe('StatusMessagesController', function() {

    var vm;

    var rootScope, scope;

    var requisition, statusMessagesHistoryModalServiceSpy, rejectionReasonModalServiceSpy;

    beforeEach(function() {

        module('requisition-status-messages');

        requisition = jasmine.createSpyObj('requisition', ['$statusMessages', '$isEditable']);

        inject(function($rootScope, statusMessagesHistoryModalService, rejectionReasonModalService) {
            rootScope = $rootScope;
            statusMessagesHistoryModalServiceSpy = statusMessagesHistoryModalService;
            rejectionReasonModalServiceSpy = rejectionReasonModalService;
        });

        scope = rootScope.$new();
        scope.requisition = requisition;
    });

    describe('initialization', function() {

        beforeEach(inject(function($controller) {
            vm = $controller('StatusMessagesController', {
                $scope: scope
            });

            rootScope.$apply();
        }));

        it('should expose requisition', function() {
            expect(vm.requisition).toBe(requisition);
        });
    });

    describe('displayAddComment', function() {

        it('should show button if requisition has no draft for status message, text area is visible, and requisition' +
            ' is editable', function() {
            vm.requisition.draftStatusMessage = null;
            vm.isTextAreaVisible = false;
            vm.requisition.$isEditable = true;

            var result = vm.displayAddComment();

            expect(result).toBe(true);
        });

        it('should not show button if requisition is not editable', function() {
            vm.requisition.draftStatusMessage = null;
            vm.isTextAreaVisible = false;
            vm.requisition.$isEditable = false;

            var result = vm.displayAddComment();

            expect(result).toBe(false);
        });

        it('should not show button if requisition has released status', function() {
            vm.requisition.draftStatusMessage = null;
            vm.isTextAreaVisible = true;
            vm.requisition.$isEditable = true;

            var result = vm.displayAddComment();

            expect(result).toBe(false);
        });

        it('should not show button if requisition has draft for status message', function() {
            vm.requisition.draftStatusMessage = 'Draft';
            vm.isTextAreaVisible = false;
            vm.requisition.$isEditable = true;

            var result = vm.displayAddComment();

            expect(result).toBe(false);
        });

    });

    describe('displayEditComment', function() {

        it('should show text area and remove button of comment if add comment is not displayed and requisition is' +
            ' editable', function() {
            spyOn(vm, 'displayAddComment').andReturn(false);
            vm.requisition.$isEditable = true;

            var result = vm.displayEditComment();

            expect(result).toBe(true);
        });

        it('should not show text area and remove button of comment if add comment is displayed', function() {
            spyOn(vm, 'displayAddComment').andReturn(true);
            vm.requisition.$isEditable = true;

            var result = vm.displayEditComment();

            expect(result).toBe(false);
        });

        it('should not show text area and remove button of comment if requisition is not editable', function() {
            spyOn(vm, 'displayAddComment').andReturn(true);
            vm.requisition.$isEditable = false;

            var result = vm.displayEditComment();

            expect(result).toBe(false);
        });

    });

    describe('draftStatusMessage', function() {

        it('should set draft to null when remove button was clicked', function() {
            vm.removeComment();

            expect(vm.requisition.draftStatusMessage).toBe(null);
        });
    });

    describe('isTextAreaVisible', function() {

        it('should set isTextAreaVisible as true when add button was clicked', function() {
            vm.addComment();

            expect(vm.isTextAreaVisible).toBe(true);
        });

        it('should set set isTextAreaVisible as false when remove button was clicked', function() {
            vm.removeComment();

            expect(vm.isTextAreaVisible).toBe(false);
        });
    });

    describe('displayRequisitionHistory', function() {

        beforeEach(inject(function($controller) {
            vm = $controller('StatusMessagesController', {
                $scope: scope
            });

            rootScope.$apply();
        }));

        it('should call statusMessageService', function() {
            spyOn(statusMessagesHistoryModalServiceSpy, 'show');
            vm.displayRequisitionHistory();

            expect(statusMessagesHistoryModalServiceSpy.show).toHaveBeenCalled();
        });

        it('should call rejectionReasonService', function() {
            spyOn(rejectionReasonModalServiceSpy, 'show');
            vm.viewRejectionReason();

            expect(rejectionReasonModalServiceSpy.show).toHaveBeenCalled();
        });
    });

    describe('displayReasonForRejection', function() {

        beforeEach(inject(function($controller) {
            vm = $controller('StatusMessagesController', {
                $scope: scope
            });

            vm.requisition.statusHistory = [{
                status: 'REJECTED',
                statusMessageDto: null,
                previousStatusChangeId: null,
                createdDate: '2018-02-21T10:59:02.758Z',
                rejectionDtos: [{
                    code: 'RR1',
                    name: 'Rejection Reason One'
                }]
            }];
            rootScope.$apply();
        }));

        it('should show a link to view rejection reasons', function() {
            vm.requisition.status = 'REJECTED';
            var result = vm.displayReasonForRejection();

            expect(result).toBe(true);

        });

        it('should not show a link to view rejection reasons if requisition status is not Rejected', function() {
            vm.requisition.status = 'INITIATED';
            var result = vm.displayReasonForRejection();

            expect(result).toBe(false);

        });

        it('should not show a link to view rejection reasons if there are no rejection reasons', function() {
            vm.requisition.status = 'REJECTED';
            spyOn(vm, 'displayAddComment').andReturn(false);
            vm.requisition.statusHistory = [{
                status: 'REJECTED',
                rejectionDtos: []
            }];
            var result = vm.displayReasonForRejection();

            expect(result).toBe(false);

        });

    });
});
