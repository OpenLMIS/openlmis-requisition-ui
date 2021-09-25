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

describe('requisition-approval run', function() {

    var loginServiceSpy, requisitionApprovalServiceSpy, postLoginAction, postLogoutAction,  $q, $rootScope;

    beforeEach(function() {
        module('requisition-approval', function($provide) {
            loginServiceSpy = jasmine.createSpyObj('loginService', [
                'registerPostLoginAction', 'registerPostLogoutAction'
            ]);
            $provide.value('loginService', loginServiceSpy);

            requisitionApprovalServiceSpy = jasmine.createSpyObj('requisitionApprovalService', [
                'getPrograms', 'clearCache'
            ]);
            $provide.value('requisitionApprovalService', requisitionApprovalServiceSpy);
        });

        inject(function($injector) {
            $rootScope = $injector.get('$rootScope');
            $q = $injector.get('$q');
        });

        postLoginAction = getLastCall(loginServiceSpy.registerPostLoginAction).args[0];
        postLogoutAction = getLastCall(loginServiceSpy.registerPostLogoutAction).args[0];
    });

    describe('run block', function() {

        beforeEach(function() {
            inject();
        });

        it('should register post login action', function() {
            expect(loginServiceSpy.registerPostLoginAction).toHaveBeenCalled();
        });

        it('should register post logout action', function() {
            expect(loginServiceSpy.registerPostLogoutAction).toHaveBeenCalled();
        });

    });

    describe('post login action', function() {

        it('should cache facilities', function() {
            requisitionApprovalServiceSpy.getPrograms.andReturn($q.resolve());

            postLoginAction();

            expect(requisitionApprovalServiceSpy.getPrograms).toHaveBeenCalled();
        });

    });

    describe('post logout action', function() {

        it('should clear current user cache', function() {
            requisitionApprovalServiceSpy.clearCache.andReturn($q.resolve());

            var success;
            postLogoutAction()
                .then(function() {
                    success = true;
                });
            $rootScope.$apply();

            expect(success).toBe(true);
            expect(requisitionApprovalServiceSpy.clearCache).toHaveBeenCalled();
        });

    });

    function getLastCall(method) {
        return method.calls[method.calls.length - 1];
    }

});