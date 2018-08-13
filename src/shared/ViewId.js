import uuid from 'uuid';

/**
 * [knownIDs description]
 * @type {WeakMap.<object, string>}
 */
const knownIDs = new WeakMap();

export const ViewId = {
    create(object) {
        if (!object) {
            return `ViewId<${uuid()}>`;
        }

        if (!knownIDs.has(object)) {
            knownIDs.set(object, `ViewId<${uuid()}>`);
        }

        return knownIDs.get(object);
    }
};

export default ViewId;
