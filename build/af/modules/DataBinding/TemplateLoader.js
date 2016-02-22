import NetworkRequest from '../../core/prototypes/NetworkRequest.js';
import { Make, Mixin } from '../../util/make.js';


let FakeTemplate = {
    _markup : '',

    _make : function(markup) {
        this._markup = markup;
    },

    get content() {
        let fragment = new DocumentFragment();
        let container = document.createElement('div');

        container.innerHTML = this._markup;

        [].forEach.apply(container.childNodes, [element => {
            fragment.appendChild(element);
        }]);

        return fragment;
    }
};

export let importTemplate = function(source, template) {
    let request = Make(NetworkRequest)(source, {});

    return request.send().then(markup => {
        let tplContainer = Make(FakeTemplate)(markup);

        return Mixin(tplContainer, template);
    });
}
