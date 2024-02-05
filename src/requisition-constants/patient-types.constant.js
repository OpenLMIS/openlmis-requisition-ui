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
     * @ngdoc object
     * @name requisition-constants.PATIENT_TYPES
     *
     * @description
     * This is constant for all patient types.
     */
    angular
        .module('requisition-constants')
        .constant('PATIENT_TYPES', types());

    function types() {
        return {
            NUMBER_OF_ADULT_PATIENTS_NEW: 'numberOfAdultPatients',
            NUMBER_OF_CHILDREN_NEW: 'numberOfChildren',
            NUMBER_OF_RETREATMENT_PATIENTS: 'numberOfRetreatmentPatients',
            NUMBER_OF_ADULTS_ON_IPT: 'numberOfAdultsOnIPT',
            NUMBER_OF_CHILDREN_ON_IPT: 'numberOfChildrenOnIPT',
            NUMBER_OF_ADULT_ON_MB_REGIMEN: 'numberOfAdultOnMBRegimen',
            NUMBER_OF_ADULT_ON_PB_REGIMEN: 'numberOfAdultOnPBRegimen',
            NUMBER_OF_CHILDREN_ON_MB_REGIMEN: 'numberOfChildrenOnMBRegimen',
            NUMBER_OF_CHILDREN_ON_PB_REGIMEN: 'numberOfChildrenOnPBRegimen'
        };
    }
})();
