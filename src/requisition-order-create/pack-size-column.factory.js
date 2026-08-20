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

(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name requisition-order-create.packSizeColumnFactory
     *
     * @description
     * Builds the read-only Pack Size column of the order create product tables.
     */
    angular
        .module('requisition-order-create')
        .factory('packSizeColumnFactory', factory);

    function factory() {
        return {
            build: build
        };

        /**
         * @ngdoc method
         * @methodOf requisition-order-create.packSizeColumnFactory
         * @name build
         *
         * @description
         * Builds the Pack Size column definition, which displays the net content of the orderable.
         *
         * @param  {Function} formatMessage  the function translating message keys
         * @return {Object}                  the Pack Size column definition
         */
        function build(formatMessage) {
            return {
                Header: formatMessage('requisition.orderCreate.table.packSize'),
                accessor: 'orderable.netContent'
            };
        }
    }

})();
