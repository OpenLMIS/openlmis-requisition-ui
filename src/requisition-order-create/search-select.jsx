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

import React from 'react';
import SelectSearch from 'react-select-search';

const filterOptions = options => {
    return searchValue => {
        if (searchValue.length === 0) {
            return options;
        }

        const lowercaseSearchValue = searchValue.toLowerCase();

        return options.filter(option => option.name && option.name.toLowerCase().includes(lowercaseSearchValue));
    };
};

const mapClassName = key => {
    const classMap = {
        'container': 'select-search',
        'value': 'search',
        'input': 'input',
        'select': 'select',
        'options': 'options',
        'option': 'option',
        'is-selected': 'is-selected',
        'is-highlighted': 'is-highlighted'
    };

    return classMap[key] === undefined ? key : classMap[key];
};

export const SearchSelect = ({
    options,
    onChange,
    value,
    placeholder = 'Select an option',
    emptyMsg = 'Not found',
    disabled = false,
    objectKey = null,
}) => {
    const renderOption = (props, { name }, snapshot, className) => {
        return (
            <button {...props} className={className} type="button">
                <span>{name}</span>
            </button>
        );
    };

    const renderValue = (valueProps, snapshot, className) => {
        const inputVal = (snapshot.focus) ? snapshot.search : snapshot.displayValue;

        return (
            <div className={'input-wrapper'}>
                <input {...valueProps} className={className} value={inputVal} />
                <i
                    className="fa fa-times clear-icon"
                    aria-hidden="true"
                    onClick={() => onChange(null)}
                />
            </div>
        );
    };

    const findOption = (value) => _.find(options, (option) => (_.get(option.value, objectKey) === value));

    const handleOnChange = value => {
        if (objectKey !== null) {
            const option = findOption(value);
            const parsedValue = option ? option.value : null;

            onChange(parsedValue);
        } else {
            onChange(value);
        }
    };

    const selectedValue = objectKey
        ? _.get(value, objectKey, null)
        : value;

    return (
        <SelectSearch
            className={mapClassName}
            disabled={disabled}
            emptyMessage={emptyMsg}
            filterOptions={filterOptions}
            onChange={handleOnChange}
            options={
                options.map(
                    ({ value, name }) => {
                        return {
                            name: name,
                            value: objectKey ? _.get(value, objectKey) : value
                        };
                    }
                )
            }
            placeholder={placeholder}
            renderOption={renderOption}
            renderValue={renderValue}
            search
            value={selectedValue}
        />
    );
};
