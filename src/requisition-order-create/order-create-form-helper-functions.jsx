export const getMappedRequestingFacilities = (facilities, userId, selectedProgram, selectedSupplyingFacility) => {
    return facilities.map((facilityId) => ({
        emergency: true,
        createdBy: { id: userId },
        program: { id: selectedProgram },
        requestingFacility: { id: facilityId },
        receivingFacility: { id: facilityId },
        supplyingFacility: { id: selectedSupplyingFacility },
        facility: { id: facilityId }
    }));
};

export const goToOrderEdit = (orders, orderService, history) => {
    const orderCreationPromises = orders.map(order => orderService.create(order));
    Promise.all(orderCreationPromises).then((createdOrders) => {
        const ordersIds = createdOrders.map(order => order.id).join(',');
        history.push(`/requisitions/orderCreate/${ordersIds}`);
    });
};

const getSupervisoryNodes = (selectedRequestingFacilities, selectedProgram, supervisoryNodeResource) => {
    const supervisoryNodeResourcePromisses = selectedRequestingFacilities.map(facilityId => supervisoryNodeResource.query({
        programId: selectedProgram,
        facilityId: facilityId
    }));

    return Promise.all(supervisoryNodeResourcePromisses);
}

const assignNodeToArray = (acc, obj, mappedPages) => {
    if (!acc.some(existingObj => existingObj.id === obj.id)) {
        if (mappedPages.every(page => page.some(item => item.id === obj.id))) {
            acc.push(obj);
        }
    }
};

const getNodesValue = (pages) => {
    const mappedPages = pages.map(page => page.content);
    const nodes = mappedPages.reduce((acc, arr) => {
        arr.forEach(obj => {
            assignNodeToArray(acc, obj, mappedPages);
        });
        return acc;
    }, []);
    return nodes;
}

const getSupplyLines = (nodes, supplyLineResource, selectedProgram) => {
    return Promise.all(nodes.map((node) => (
        supplyLineResource.query({
            programId: selectedProgram,
            supervisoryNodeId: node.id
        })
    )))
}

const setSupplyingFacilities = (supplyLinesResources, facilityService, setSupplyingFacilityOptions) => {
    const supplyLines = _.flatten(supplyLinesResources.map((it) => (it.content)));
    const facilityIds = _.uniq(supplyLines.map((it) => (it.supplyingFacility.id)));

    if (facilityIds.length > 0) {
        facilityService.query({
            id: facilityIds
        })
            .then((resp) => {
                const facilities = resp.content;
                setSupplyingFacilityOptions(facilities.map(facility => ({ name: facility.name, value: facility.id })));
            });
    } else {
        setSupplyingFacilityOptions([]);
    }
}

export const updateSupplyingFacilitiesValue = (selectedProgram, selectedRequestingFacilities, supervisoryNodeResource, supplyLineResource, facilityService, setSupplyingFacilityOptions) => {
    if (selectedProgram && selectedRequestingFacilities) {
        getSupervisoryNodes(selectedRequestingFacilities, selectedProgram, supervisoryNodeResource)
            .then((pages) => {
                const nodes = getNodesValue(pages);

                if (nodes.length > 0) {
                    getSupplyLines(nodes, supplyLineResource, selectedProgram)
                        .then((supplyLinesResources) => {
                            setSupplyingFacilities(supplyLinesResources, facilityService, setSupplyingFacilityOptions);
                        });
                } else {
                    setSupplyingFacilityOptions([]);
                }
            });
    } else {
        setSupplyingFacilityOptions([]);
    }
}