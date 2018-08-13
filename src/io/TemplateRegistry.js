const registry = {};

export const TemplateRegistry = {
    register(id, template) {
        const inDom = !!document.querySelector(`template#${id}`);

        if ((id in registry) || inDom) {
            throw `Template "${id}" already exists! Duplicated template ids are not alowed!`;
        }

        template.id = id;
        registry[id] = template;
    },

    get(id) {
        if (id in registry) {
            return registry[id];
        }

        return document.querySelector(`template#${id}`);
    },
};

export default TemplateRegistry;
