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
     * @name requisition-view.RequisitionViewService
     *
     * @description
     * This service send the information between requisition-view controllers 
     * to know when the data submitting process is happening.
     */
    angular
        .module('requisition-view')
        .service('RequisitionViewService', function() {

            // Shared function to check if TB or Leprosy Array is fully filled
            this.isArrayFullyFilled = function(array) {
                if (array.length > 0) {
                    return array[0].every(function(item) {
                        return item.data.every(function(obj) {
                            var value = obj.value;
                            var disabled = obj.disabled;

                            if (item.isSkipped) {
                                return true;
                            }
                            return (value !== undefined && value !== '' && value !== null && !disabled) || disabled;
                        });
                    });
                }
                return false;
            };
        });

})();
