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

    angular
        .module('admin-rejection-reason-category')
        .factory('RejectionReasonCategoryDataBuilder', RejectionReasonCategoryDataBuilder);

    RejectionReasonCategoryDataBuilder.$inject = ['RejectionReasonCategory'];

    function RejectionReasonCategoryDataBuilder(RejectionReasonCategory) {

        RejectionReasonCategoryDataBuilder.prototype.build = build;
        RejectionReasonCategoryDataBuilder.prototype.buildJson = buildJson;
        RejectionReasonCategoryDataBuilder.prototype.withId = withId;
        RejectionReasonCategoryDataBuilder.prototype.withName = withName;
        RejectionReasonCategoryDataBuilder.prototype.withCode = withCode;

        return RejectionReasonCategoryDataBuilder;

        function RejectionReasonCategoryDataBuilder() {
            RejectionReasonCategoryDataBuilder.instanceNumber =
            (RejectionReasonCategoryDataBuilder.instanceNumber || 0) + 1;

            this.id = 'rejection-reason-category-id-' + RejectionReasonCategoryDataBuilder.instanceNumber;
            this.code = 'RRC' + RejectionReasonCategoryDataBuilder.instanceNumber;
            this.name = 'RRC1' + RejectionReasonCategoryDataBuilder.instanceNumber;
        }

        function withName(newName) {
            this.name = newName;
            return this;
        }

        function withId(newId) {
            this.id = newId;
            return this;
        }

        function withCode(newCode) {
            this.code = newCode;
            return this;
        }

        function build() {
            return new RejectionReasonCategory(this.buildJson);
        }

        function buildJson() {
            return new RejectionReasonCategory(
                this.id,
                this.code,
                this.name
            );
        }

    }

})();