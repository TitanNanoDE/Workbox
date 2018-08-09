import ErrorHandler from './ErrorHandler';

const ApplicationHandler = {
    remoteLaunch() {
        return Promise.resolve(ErrorHandler.unclaimedSystemHandler('application', 'remoteLaunch'));
    }
};

export default ApplicationHandler;
