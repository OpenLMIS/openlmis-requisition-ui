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
     * @name requisition-constants.ORDERABLE_CODES
     *
     * @description
     * This is constant for all orderable codes.
     */
    angular
        .module('requisition-constants')
        .constant('ORDERABLE_CODES', codes());

    function codes() {
        return {
            RIFAMPICIN_INH_RHZE_TABLET_150_75_400_275_MG: '10010510AE',
            RIFAMPICIN_INH_RH_TABLET_150_75_MG_MG: '10010508AE',
            MB_BLISTER_ADULT_TABLET: '10010110AE',
            RIFAMPICIN_INH_PYRAZ_RHZ_TABLET_75_50_150_MG: '10010515AE',
            ETHAMBUTOL_TABLET_100_MG: '10010233AE',
            RIFAMPICIN_INH_RH_TABLET_75_50_MG: '10010514AE',
            MB_BLISTER_CHILD_TABLET: '10010113AE',
            ISONIAZID_BP_100MG_TABLETS_TABLET_100_MG: '10010114AE',
            ISONIAZID_TABLET_300_MG: '10010315AE'
        };
    }
})();
