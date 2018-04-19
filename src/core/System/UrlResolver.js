const packages = [];

const UrlResolver = {

    packageResource(packageName, path, target) {
        if (!packages[packageName]) {
            packages[packageName] = {};
        }

        packages[packageName][path] = target;
    },

    resolve(url) {
        if (url[0] === '/') {
            // file system access.
            return '';
        }

        if (url.search(/[^:/]*:\/\//) < 0) {
            return url;
        }

        const parsedUrl = new URL(url);

        if (parsedUrl.protocol === 'package:') {
            const [name, ...path] = parsedUrl.pathname.substr(2).split('/');

            return this.resolve(packages[name][path.join('/')]);
        }

        if (parsedUrl.protocol === 'theme:') {
            const path = parsedUrl.pathname.substr(2);

            return `./userSpace/theme/${path}`;
        }
    }
};

export default UrlResolver;
