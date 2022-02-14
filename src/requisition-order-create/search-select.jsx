import React from 'react';
import SelectSearch from 'react-select-search';
import Fuse from 'fuse.js';

const fuzzySearch = (options) => {
    const fuse = new Fuse(options, {
        keys: ['name', 'groupName', 'items.name'],
        threshold: 0.3,
    });

    return (value) => {
        if (!value.length) {
            return options;
        }

        return fuse.search(value);
    };
}

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
}

export const SearchSelect = ({
                                 options,
                                 onChange,
                                 value,
                                 placeholder = 'Select an option',
                                 emptyMsg = 'Not found',
                                 disabled = false,
                             }) => {

    const renderOption = (props, {name}, snapshot, className) => {
        return (
            <button {...props} className={className} type="button">
                <span>{name}</span>
            </button>
        )
    }


    const renderValue = (valueProps, snapshot, className) => {
        const inputVal = (snapshot.focus) ? snapshot.search : snapshot.displayValue;

        return (
            <div className={'input-wrapper'}>
                <input {...valueProps} className={className} value={inputVal}/>
                <i
                    className="fa fa-times clear-icon"
                    aria-hidden="true"
                    onClick={() => onChange(null)}
                ></i>
            </div>
        );
    };

    return (
        <SelectSearch
            className={mapClassName}
            disabled={disabled}
            emptyMessage={emptyMsg}
            filterOptions={fuzzySearch}
            onChange={onChange}
            options={options}
            placeholder={placeholder}
            renderOption={renderOption}
            renderValue={renderValue}
            search
            value={value}
        />
    )
}