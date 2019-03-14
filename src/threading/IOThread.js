import Thread from './Thread';

const IS_WORKER = (!!self.importScripts && !self.document);

if (!IS_WORKER) {
    throw new Error('IOThread can\'t be used inside the io thread itself! Use CurrentThread instead!');
}

export const IOThread = Thread.from('threads/io');

export default IOThread;
