
let value = null;

export const CurrentThreadStore = {
    get() {
        if (!value) {
            throw new Error('CurrentThread.bootstrap() has to be called before any thread can be created!');
        }

        return value;
    },

    set(ct) {
        if (value) {
            throw new Error('A Thread has already been bootstraped!');
        }

        value = ct;
    }
};

export default CurrentThreadStore;
