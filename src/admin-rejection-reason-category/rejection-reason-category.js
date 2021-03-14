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
     * @name admin-rejection-reason-category.RejectionReasonCategory
     *
     * @description
     * Represents a single RejectionReasonCategory.
     */
    angular
        .module('admin-rejection-reason-category')
        .factory('RejectionReasonCategory', RejectionReasonCategory);

    function RejectionReasonCategory() {

        return RejectionReasonCategory;

        /**
         * @ngdoc method
         * @methodOf admin-rejection-reason-category.RejectionReasonCategory
         * @name RejectionReasonCategory
         *
         * @description
         * Creates a new instance of the RejectionReasonCategory class.
         *
         * @param  {Object}  json the json representation of the RejectionReasonCategory
         */
        function RejectionReasonCategory(json) {
            this.id = json.id;
            this.name = json.name;
            this.code = json.code;
            this.active = json.active;
        }
    }

})();