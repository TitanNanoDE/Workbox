export const deepAssign = function(target, ...args) {
    args.forEach(source => {
        Object.entries(source).forEach(([key, value]) => {

            if (Array.isArray(value) && Array.isArray(target[key])) {
                value.forEach((item, index) => {
                    if (item === null || typeof item !== 'object') {
                        target[key].splice(index, 0, item);
                        return;
                    }

                    let targetItem = null;

                    if (item.__tracker) {
                        const targetIndex = target[key].findIndex(targetItem => item.__tracker === targetItem.__tracker);

                        [targetItem] = target[key].splice(targetIndex, 1);
                    } else {
                        [targetItem] = target[key].splice(index, 1);
                    }

                    if (targetItem) {
                        const mergedItem = (typeof targetItem === 'object' || targetItem === null) ?
                            deepAssign(targetItem, item) : item;

                        target[key].splice(index, 0, mergedItem);

                        return;
                    }

                    return target[key][index] = item;
                });

                target[key].length = value.length;

                return;
            }

            if (typeof target[key] === 'object' && typeof value === 'object' && value !== null) {
                return deepAssign(target[key], value);
            }

            target[key] = value;
        });
    });

    return target;
};

export default deepAssign;
