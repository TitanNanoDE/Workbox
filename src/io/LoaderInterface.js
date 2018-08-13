import ScriptLoader from 'systemjs/dist/system-production.src';
import TemplateRegistry from './TemplateRegistry';

export const LoaderInteface = {
    loadViews(packageName) {
        return ScriptLoader.import(`./packages/${packageName}.views.js`)
            .then(({ default: views }) => {
                views.forEach(item => TemplateRegistry.register(`${packageName}.${item.id}`, item.template));
            })
            .catch(e => console.error('unable to load pacakge views!', e));
    }
};

export default LoaderInteface;
