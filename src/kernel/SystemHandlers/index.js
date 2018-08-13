import ErrorHandler from './ErrorHandler';
import ApplicationHandler from './ApplicationHandler';

const types = {
    error: ErrorHandler,
    application: ApplicationHandler,
};


const SystemHandlers = {

    ErrorHandler,
    ApplicationHandler,

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
