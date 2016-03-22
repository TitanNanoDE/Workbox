import Application from '../../af/core/prototypes/Application.js';
import Af from '../../af/af.js';
import { DataBinding } from '../../af/modules/DataBinding.js';

let { Make } = Af.Util;

let ViewPortHost = Make(Application)();
let ViewPort = Make(DataBinding.ViewPort)(ViewPortHost);

export default ViewPort;
