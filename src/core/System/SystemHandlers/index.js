import ErrorHandler from './ErrorHandler';

const types = {
    error: ErrorHandler,
};


const SystemHandlers = {

    ErrorHandler,

    registerHandler(type, name, handler) {
        if (!(type in types)) {
            return ErrorHandler.unknownSystemHandlerType(type);
        }

        if (!(name in types[type])) {
            return ErrorHandler.unknownSystemHandler(name);
        }

        types[type][name] = handler;

        return true;
    }
};

export default SystemHandlers;
