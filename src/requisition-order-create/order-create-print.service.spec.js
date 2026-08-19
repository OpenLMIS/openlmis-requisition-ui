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

describe('orderCreatePrintService', function() {

    var ORDER_ID = 'order-id-1';

    beforeEach(function() {
        module('requisition-order-create', function($provide) {
            $provide.value('featureFlagService', {
                set: function() {},
                get: function() {}
            });
        });

        inject(function($injector) {
            this.$window = $injector.get('$window');
            this.localStorageService = $injector.get('localStorageService');
            this.accessTokenFactory = $injector.get('accessTokenFactory');
            this.openlmisUrlFactory = $injector.get('openlmisUrlFactory');
            this.orderCreatePrintService = $injector.get('orderCreatePrintService');
        });

        spyOn(this.$window, 'open');
        spyOn(this.accessTokenFactory, 'addAccessToken').andCallFake(function(url) {
            return url;
        });
    });

    describe('print', function() {

        it('should open the report for the given order in a new tab', function() {
            spyOn(this.localStorageService, 'get').andReturn(undefined);

            this.orderCreatePrintService.print(ORDER_ID);

            expect(this.$window.open).toHaveBeenCalledWith(
                this.openlmisUrlFactory('/api/reports/templates/angola/'
                    + this.orderCreatePrintService.reportId + '/pdf?order=' + ORDER_ID),
                '_blank'
            );
        });

        it('should add the access token to the url', function() {
            spyOn(this.localStorageService, 'get').andReturn(undefined);

            this.orderCreatePrintService.print(ORDER_ID);

            expect(this.accessTokenFactory.addAccessToken).toHaveBeenCalled();
        });

        it('should pass the current locale so the report is translated', function() {
            spyOn(this.localStorageService, 'get').andCallFake(function(key) {
                return key === 'current_locale' ? 'fr' : undefined;
            });

            this.orderCreatePrintService.print(ORDER_ID);

            expect(this.$window.open).toHaveBeenCalledWith(
                this.openlmisUrlFactory('/api/reports/templates/angola/'
                    + this.orderCreatePrintService.reportId + '/pdf?order=' + ORDER_ID
                    + '&lang=fr'),
                '_blank'
            );
        });

        it('should not pass a locale when none is set', function() {
            spyOn(this.localStorageService, 'get').andReturn(undefined);

            this.orderCreatePrintService.print(ORDER_ID);

            expect(this.$window.open).toHaveBeenCalledWith(
                this.openlmisUrlFactory('/api/reports/templates/angola/'
                    + this.orderCreatePrintService.reportId + '/pdf?order=' + ORDER_ID),
                '_blank'
            );
        });

        it('should not pass a locale that was stored as null', function() {
            spyOn(this.localStorageService, 'get').andCallFake(function(key) {
                return key === 'current_locale' ? 'null' : undefined;
            });

            this.orderCreatePrintService.print(ORDER_ID);

            expect(this.$window.open).toHaveBeenCalledWith(
                this.openlmisUrlFactory('/api/reports/templates/angola/'
                    + this.orderCreatePrintService.reportId + '/pdf?order=' + ORDER_ID),
                '_blank'
            );
        });

    });

});
