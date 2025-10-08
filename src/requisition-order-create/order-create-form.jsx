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

import React, { useState, useEffect, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import getService from '../react-components/utils/angular-utils';
import { SearchSelect } from './search-select';
import EditableTable from '../react-components/table/editable-table';
import { getMappedRequestingFacilities, goToOrderEdit, updateSupplyingFacilitiesValue } from './order-create-form-helper-functions';
import { orderCreateFormTableColumns } from './order-create.constant';


const OrderCreateForm = () => {

    const history = useHistory();

    const [programOptions, setProgramOptions] = useState([]);
    const [requestingFacilityOptions, setRequestingFacilityOptions] = useState([]);
    const [supplyingFacilityOptions, setSupplyingFacilityOptions] = useState([]);
    const [selectedProgram, setSelectedProgram] = useState('');
    const [selectedRequestingFacilities, setSelectedRequestingFacilities] = useState([]);
    const [selectedSupplyingFacility, setSelectedSupplyingFacility] = useState('');
    const [filteredRequestingFacilities, setFilteredRequestingFacilities] = useState([]);

    const ADMINISTRATION_RIGHTS = useMemo(() => getService('ADMINISTRATION_RIGHTS'), []);
    const programService = useMemo(() => getService('programService'), []);
    const { formatMessage } = useMemo(() => getService('messageService'), []);
    const facilityService = useMemo(() => getService('facilityService'), []);
    const orderService = useMemo(() => getService('orderCreateService'), []);
    const columns = useMemo(() => orderCreateFormTableColumns(formatMessage), []);

    const userId = useMemo(
        () => {
            const authorizationService = getService('authorizationService');
            return authorizationService.getUser().user_id;
        }, []
    );

    const supervisoryNodeResource = useMemo(
        () => {
            const resource = getService('SupervisoryNodeResource');
            return new resource();
        }, []
    );

    const supplyLineResource = useMemo(
        () => {
            const resource = getService('SupplyLineResource');
            return new resource();
        }, []
    );

    const createOrders = () => {
        const orders = getMappedRequestingFacilities(selectedRequestingFacilities, userId, selectedProgram, selectedSupplyingFacility);
        goToOrderEdit(orders, orderService, history);
    };

    const updateFilteredFacilities = () => {
        const facilities = requestingFacilityOptions
            .filter(facility => selectedRequestingFacilities.includes(facility.value));

        setFilteredRequestingFacilities(facilities);
    }

    const updateTableData = (updatedData) => {
        setFilteredRequestingFacilities(updatedData);
        const updatedDataIds = updatedData.map(facility => facility.value)

        setSelectedRequestingFacilities(prevState => {
            return prevState.filter(id => updatedDataIds.includes(id));
        });
    }

    const updateSupplyingFacilities = () => {
        setSelectedSupplyingFacility('');
        updateSupplyingFacilitiesValue(selectedProgram, selectedRequestingFacilities, supervisoryNodeResource, supplyLineResource, facilityService, setSupplyingFacilityOptions);
    };

    useEffect(
        () => {
            programService.getUserPrograms(userId)
                .then((programs) => {
                    setProgramOptions(_.map(programs, program => ({ name: program.name, value: program.id })));
                });
        },
        [programService]
    );

    useEffect(
        () => {
            facilityService.getUserFacilitiesForRight(userId, ADMINISTRATION_RIGHTS.ORDER_CREATE, true)
                .then((facilities) => {
                    setRequestingFacilityOptions(_.map(facilities, facility => ({ name: facility.name, value: facility.id })));
                });
        },
        [facilityService]
    );

    useEffect(
        () => {
            updateSupplyingFacilities();
        },
        [selectedProgram, selectedRequestingFacilities]
    );

    useEffect(
        () => {
            if (programOptions && programOptions.length === 1) {
                setSelectedProgram(programOptions[0].value);
            }
        },
        [programOptions]
    );

    useEffect(
        () => {
            if (supplyingFacilityOptions && supplyingFacilityOptions.length === 1) {
                setSelectedSupplyingFacility(supplyingFacilityOptions[0].value);
            }
        },
        [supplyingFacilityOptions]
    );

    useEffect(() => {
        updateFilteredFacilities();
    }, [selectedRequestingFacilities]);

    return (
        <div className="page-container">
            <div className="page-header-responsive">
                <h2> {formatMessage('requisition.orderCreate.create')} </h2>
            </div>
            <div className="page-content order-create-form">
                <div className={'section'}>
                    <div>
                      <strong className='is-required'>
                        {formatMessage('requisition.orderCreate.program')}
                      </strong>
                    </div>
                    <SearchSelect
                        options={programOptions}
                        value={selectedProgram}
                        onChange={value => setSelectedProgram(value)}
                        placeholder={formatMessage('requisition.orderCreate.program.placeholder')}
                    />
                </div>
                <div className={'section'}>
                    <div>
                      <strong className='is-required'>
                        {formatMessage('requisition.orderCreate.reqFacility')}
                      </strong>
                    </div>
                    <SearchSelect
                        options={requestingFacilityOptions}
                        value={selectedRequestingFacilities.at(-1)}
                        onChange={(value) => {
                            setSelectedRequestingFacilities((prevState) => {
                                if (!prevState.includes(value) && value) {
                                    return [...prevState, value];
                                }
                                return prevState;
                            });
                        }}
                        placeholder={formatMessage('requisition.orderCreate.reqFacility.placeholder')}
                    />
                    <EditableTable
                        additionalTableClass='facilities-table'
                        updateData={updateTableData}
                        columns={columns}
                        data={filteredRequestingFacilities || []}
                    />
                </div>
                <div className={'section'}>
                    <div>
                      <strong className='is-required'>
                        {formatMessage('requisition.orderCreate.supFacility')}
                      </strong>
                    </div>
                    <SearchSelect
                        options={supplyingFacilityOptions}
                        value={selectedSupplyingFacility}
                        onChange={value => setSelectedSupplyingFacility(value)}
                        placeholder={formatMessage('requisition.orderCreate.supFacility.placeholder')}
                        disabled={!selectedProgram || !selectedRequestingFacilities}
                    />
                </div>
                <div>
                    <button
                        className="btn primary"
                        type="button"
                        style={{ marginTop: '0.5em' }}
                        disabled={!selectedProgram || !selectedRequestingFacilities || !selectedSupplyingFacility}
                        onClick={createOrders}
                    >
                        {formatMessage('requisition.orderCreate.create')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderCreateForm;
