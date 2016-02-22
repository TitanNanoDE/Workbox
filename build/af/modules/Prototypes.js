/*****************************************************************
 * Classes.js v1.1  part of the ApplicationFrame                 *
 * © copyright by Jovan Gerodetti (TitanNano.de)                 *
 * The following Source is licensed under the Appache 2.0        *
 * License. - http://www.apache.org/licenses/LICENSE-2.0         *
 *****************************************************************/

"use strict";

import Accessor from './prototypes/Accessor.js';
import AsyncLoop from './prototypes/AsyncLoop.js';
import AsyncQueue from './prototypes/AsyncQueue.js';
import EventManager from './prototypes/EventManager.js';
import Prototype from './prototypes/Prototype.js';
import Mixin from './prototypes/Mixin.js';
import { Make } from '../../util/make.js';


export var classes = {
    AsyncLoop : AsyncLoop,
    AsyncQueue : AsyncQueue,
    EventManager : EventManager,
    Prototype : Prototype,
    Accessor : Accessor,
    Make : Make,
    Mixin : Mixin
};

export var config = {
    main : 'classes',
    author : 'Jovan Gerodetti',
    version : 'v1.1'
};
