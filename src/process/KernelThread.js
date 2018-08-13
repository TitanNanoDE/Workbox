export const KernelThreadMeta = {
    get object() { return KernelThread; },

    inject(value) {
        KernelThread = value;
    }
};

export let KernelThread = null;
