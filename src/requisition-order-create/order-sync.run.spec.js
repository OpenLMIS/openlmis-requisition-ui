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

describe('synchronizeEvents', function() {

    var $rootScope,
        offlineService,
        ordersLocalStorageKey = 'reduxPersist.requisition';

    beforeEach(function() {
        module('requisition-order-create', function($provide) {
            offlineService = jasmine.createSpyObj('offlineService', ['isOffline']);
            $provide.service('offlineService', function() {
                return offlineService;
            });
            $provide.value('featureFlagService', {
                set: function() {},
                get: function() {}
            });
        });

        inject(function($injector) {
            this.$q = $injector.get('$q');
            $rootScope = $injector.get('$rootScope');
            this.localStorageService = $injector.get('localStorageService');
            this.orderCreateService = $injector.get('orderCreateService');
            this.notificationService = $injector.get('notificationService');
        });

        spyOn($rootScope, '$watch').andCallThrough();
        spyOn($rootScope, '$emit');
    });

    describe('synchronizeOrders', function() {
        it('should not try update orders when offline', function() {
            offlineService.isOffline.andReturn(true);
            spyOn(this.localStorageService, 'get').andReturn('{}');
            $rootScope.$apply();

            expect(this.localStorageService.get).not.toHaveBeenCalled();
        });

        it('should try update orders after switching from offline to online', function() {
            spyOn(this.localStorageService, 'get').andReturn(
                JSON.stringify(
                    {
                        drafts: '{}',
                        createdOffline: '{}'
                    }
                )
            );

            changeModeFromOnlineToOffline();

            expect(this.localStorageService.get).toHaveBeenCalledWith(ordersLocalStorageKey);
        });

        it('should read redux data from local storage', function() {
            spyOn(this.localStorageService, 'get').andReturn(
                JSON.stringify(
                    {
                        drafts: '{}',
                        createdOffline: '{}'
                    }
                )
            );

            changeModeFromOnlineToOffline();

            expect(this.localStorageService.get).toHaveBeenCalledWith(ordersLocalStorageKey);
        });

        it('should save redux data to local storage in proper format', function() {
            spyOn(this.localStorageService, 'get').andReturn(
                JSON.stringify({
                    drafts: '{}',
                    createdOffline: '{}'
                })
            );

            changeModeFromOnlineToOffline();

            expect(this.localStorageService.get(ordersLocalStorageKey))
                .toEqual('{"drafts":"{}","createdOffline":"{}"}');
        });
    });

    describe('syncDraftOrders', function() {

        beforeEach(function() {
            spyOn(this.localStorageService, 'get').andReturn(JSON.stringify({
                drafts: JSON.stringify({
                    1: {
                        id: '1'
                    }
                }),
                createdOffline: '{}'
            }));
        });

        it('should sync drafts and show success notification', function() {
            spyOn(this.orderCreateService, 'update').andReturn(
                this.$q.resolve({
                    id: '1'
                })
            );

            spyOn(this.notificationService, 'success').andReturn();

            $rootScope.$apply();
            changeModeFromOnlineToOffline();

            expect(this.notificationService.success).toHaveBeenCalled();
        });

        it('should not sync drafts and show error notification ', function() {
            spyOn(this.orderCreateService, 'update').andReturn(this.$q.reject());
            spyOn(this.notificationService, 'error').andReturn();

            $rootScope.$apply();
            changeModeFromOnlineToOffline();

            expect(this.notificationService.error).toHaveBeenCalled();
        });
    });

    describe('sendOfflineCreatedOrders', function() {

        beforeEach(function() {
            spyOn(this.localStorageService, 'get').andReturn(JSON.stringify({
                createdOffline: JSON.stringify(
                    {
                        1: {
                            id: '1'
                        }
                    }
                ),
                drafts: '{}'
            }));
        });

        it('should send orders show success notification', function() {
            spyOn(this.orderCreateService, 'send').andReturn(this.$q.resolve());
            spyOn(this.notificationService, 'success').andReturn();

            $rootScope.$apply();
            changeModeFromOnlineToOffline();

            expect(this.notificationService.success).toHaveBeenCalled();
        });

        it('should not send orders show error notification', function() {
            spyOn(this.orderCreateService, 'send').andReturn(this.$q.reject());
            spyOn(this.notificationService, 'error').andReturn();

            $rootScope.$apply();
            changeModeFromOnlineToOffline();

            expect(this.notificationService.error).toHaveBeenCalled();
        });
    });

    function changeModeFromOnlineToOffline() {
        offlineService.isOffline.andReturn(true);
        $rootScope.$apply();

        offlineService.isOffline.andReturn(false);
        $rootScope.$apply();
    }
});
