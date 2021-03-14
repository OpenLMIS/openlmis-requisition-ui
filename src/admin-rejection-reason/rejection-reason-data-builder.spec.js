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
        .module('admin-rejection-reason')
        .factory('RejectionReasonDataBuilder', RejectionReasonDataBuilder);

    RejectionReasonDataBuilder.$inject = ['RejectionReason'];

    function RejectionReasonDataBuilder(RejectionReason) {

        RejectionReasonDataBuilder.prototype.build = build;
        RejectionReasonDataBuilder.prototype.buildJson = buildJson;
        RejectionReasonDataBuilder.prototype.withId = withId;
        RejectionReasonDataBuilder.prototype.withName = withName;

        return RejectionReasonDataBuilder;

        function RejectionReasonDataBuilder() {
            RejectionReasonDataBuilder.instanceNumber =
            (RejectionReasonDataBuilder.instanceNumber || 0) + 1;

            this.id = 'rejection-reason-id-' + RejectionReasonDataBuilder.instanceNumber;
            this.code = 'RR' + RejectionReasonDataBuilder.instanceNumber;
            this.name = 'RRI' + RejectionReasonDataBuilder.instanceNumber;
            this.active = true;
        }

        function withName(newName) {
            this.name = newName;
            return this;
        }

        function withId(newId) {
            this.id = newId;
            return this;
        }

        function build() {
            return new RejectionReason(this.buildJson);
        }

        function buildJson() {
            return new RejectionReason(
                this.id,
                this.code,
                this.name,
                this.active
            );
        }
    }
})();