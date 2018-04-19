import templateContent from './template.html';

const template = document.createElement('template');

template.innerHTML = templateContent;
template.id = 'system-js-about-main-template';

export default template;
