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

describe('packSizeColumnFactory', function() {

    beforeEach(function() {
        module('requisition-order-create', function($provide) {
            $provide.value('featureFlagService', {
                set: function() {},
                get: function() {}
            });
        });

        inject(function($injector) {
            this.packSizeColumnFactory = $injector.get('packSizeColumnFactory');
        });

        this.formatMessage = jasmine.createSpy('formatMessage').andReturn('Pack Size');
    });

    describe('build', function() {

        it('should use the translated header', function() {
            var column = this.packSizeColumnFactory.build(this.formatMessage);

            expect(this.formatMessage).toHaveBeenCalledWith('requisition.orderCreate.table.packSize');
            expect(column.Header).toEqual('Pack Size');
        });

        it('should take the value from the net content of the orderable', function() {
            var column = this.packSizeColumnFactory.build(this.formatMessage);

            expect(column.accessor).toEqual('orderable.netContent');
        });

    });

});
