export const deepCopy = function(value) {
    if (typeof value === 'function') {
        return;
    }

    if (!value || typeof value !== 'object') {
        return value;
    }

    if (Array.isArray(value)) {
        return value.map((item) => deepCopy(item));
    }

    const newValue = {};

    for (let key in value) {
        newValue[key] = deepCopy(value[key]);
    }

    return newValue;
};

export default deepCopy;
