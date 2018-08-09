import { Make } from 'application-frame/util/make';
import Log from '../Log';

let CallStack = {

    rawStack : null,

    _make : function(){
        try {
            throw new Error();
        } catch (e) {
            this.rawStack = e.stack.split('\n');
        }

        this.rawStack.shift();
        this.rawStack.shift();

        this.rawStack = this.rawStack.map(item => {
            return {
                call : item.split('@')[0],
                source : item.split('@')[1]
            };
        });
    },

    drop : function(amount = 1) {
        for (let i = 0; i < amount; i+= 1) {
            this.rawStack.shift();
        }
    },

    item : function(index) {
        return this.rawStack[index];
    }
};

let ErrorHandler = {
    methodNotImplemented(prototypeName='Object') {
        let stack = Make(CallStack)();

        stack.drop();

        console.error(`A child prototype of ${prototypeName} does not implement the required method ${stack.item(0).call}`);
    },

    applicationNotAvailable(application) {
        Log.use('ErrorHandler').error(`Application ${application} is not available on this system!`);
    },

    unknownSystemHandlerType(type) {
        Log.use('ErrorHandler').error(`Unknown system handler type: ${type}`);
    },

    unknownSystemHandler(name) {
        Log.use('ErrorHandler').error(`Unknown system handler: ${name}`);
    },

    unclaimedSystemHandler(type, name) {
        const message = `System handler ${name} of type ${name} has not been claimed!`;

        Log.use('ErrorHandler').error(message);

        return Promise.reject(message);
    }
};

export default ErrorHandler;
