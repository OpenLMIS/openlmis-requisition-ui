export const validateOrderItem = (item) => {
    const errors = [];

    if (item.orderedQuantity === null || item.orderedQuantity === undefined
        || item.orderedQuantity === '') {
        errors.push('Order quantity is required');
    } else if (item.orderedQuantity < 0) {
        errors.push('Order quantity cannot be negative');
    }

    return errors;
};

const validateOrder = (orderToValidate) => {
    const lineItems = orderToValidate.orderLineItems;
    let errors = [];

    if (!lineItems) {
        return errors;
    }

    lineItems.forEach(item => {
        errors = errors.concat(validateOrderItem(item));
    });

    return _.uniq(errors);
};

export const isOrderInvalid = (orders, setShowValidationErrors, toast) => {
    let validationErrors = [];

    orders.forEach(order => {
        validationErrors = validationErrors.concat(validateOrder(order));
    });

    if (validationErrors.length) {
        validationErrors.forEach(error => {
            toast.error(error);
        });
        setShowValidationErrors(true);
        return true;
    }

    return false;
}
