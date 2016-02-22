/*****************************************************************
 * Physical Touch v1.1  part of the ApplicationFrame             *
 * © copyright by Jovan Gerodetti (TitanNano.de)                 *
 * The following Source is licensed under the Appache 2.0        *
 * License. - http://www.apache.org/licenses/LICENSE-2.0         *
 *****************************************************************/

$('escape').wrapper(function(){
    
    'use strict';
    
    var isDown= false;
    
// get all dom elements
    var allElements= $$.document.body.querySelectorAll('*');
    
//  events
    $$.events= {
        SCROLL : 'phT_scroll',
        VERTICAL_SCROLL : 'phT_vScroll',
        STROCKE : 'phT_strocke',
        MOVE : 'phT_move',
        TAP : 'phT_tap',
        TOUCH : 'phT_touch',
        RELEASE : 'phT_release',
        TOUCHSTART : ($$.navigator.isTouch ? 'touchstart' : 'mousedown'),
        TOUCHMOVE : ($$.navigator.isTouch ? 'touchmove' : 'mousemove'),
        TOUCHEND : ($$.navigator.isTouch ? 'touchend' : 'mouseup')
    };
    
//  physical touch meta data
    var touchMeta= [];
    var overScrollMeta= [];

/*  ---     Classes     --- */
    
    var EventObjectExtension= function(index){
/*      new properties are:
            event.timeout
            event.speed
            event.movement          */            
        var now= new Date().getTime();
        this.timeout= (now - touchMeta[index].lastTime) / 1000;
        
        if(this.timeout === 0){
            this.timeout= touchMeta[index].lastTimeout;
        }else{
            touchMeta[index].lastTimeout= this.timeout;
            }
        this.position= { x: this.screenX, y: this.screenY };
        this.offset= {
            x : Math.abs(touchMeta[index].start.x - this.position.x),
            y : Math.abs(touchMeta[index].start.y - this.position.y)
            };
        this.duration= (now - touchMeta[index].start.time);
        
        if( (touchMeta[index].lastPos.y != this.position.y && touchMeta[index].lastMovement.x != this.position.x) || (this.timeout > 0.1) ){
            this.movement= touchMeta[index].lastMovement= {x: (this.position.x - touchMeta[index].lastPos.x),
                                                           y: (this.position.y - touchMeta[index].lastPos.y)};
        }else{
            this.movement= touchMeta[index].lastMovement;
            }
        
        this.speed= {x: (this.movement.x / this.timeout),
                     y: (this.movement.y / this.timeout)};
        
        touchMeta[index].lastPos= this.position;
        touchMeta[index].lastTime= now;
        
        if(this.offset.x > 3 || this.offset.y > 3){
            if(this.offset.x > this.offset.y){
                this.type= TouchTypes.VERTICAL_STROCKE;
            }else{
                this.type= TouchTypes.STROCKE;
                }
        }else if(!this.type ){
            this.type= TouchTypes.TAP;
            }
        };

    var OverScrollData= function(target, direction, y, speed){
        this.cursorY= y;
        this.cursorSpeed= speed;
        this.lastUpdate= 0;
        this.direction= direction;
        this.target= target;
        this.release= function(){
            const backSpeed= 1500;
            
            var now= new Date().getTime();
            var timeout= (now - this.lastUpdate) / 1000;
            this.lastUpdate= now;
            this.cursorY+= this.cursorSpeed * timeout;
            var newStretch= stretching(this.cursorY);
            var stretchDelta= null;
			var block= null;
			var margin= null;

            if(this.direction == OverScrollData.DOWN){
                stretchDelta= Math.abs(newStretch - parseInt($$.getComputedStyle(this.target.firstElementChild).marginTop.replace('px', '')));
                block= this.target.firstElementChild;
                margin= 'marginTop';
            }else if(this.direction == OverScrollData.UP){
                stretchDelta= Math.abs(newStretch - parseInt($$.getComputedStyle(this.target.lastElementChild).marginBottom.replace('px', '')));
                block= this.target.lastElementChild;
                margin= 'marginBottom';
                }
            
            if(this.cursorSpeed === 0 || stretchDelta <= 1){
                this.cursorY-= backSpeed * timeout;
                if(this.cursorY < 0) this.cursorY= 0;
                $$.console.log('cursorY: '+this.cursorY);
                block.style[margin]= stretching(this.cursorY)+'px';
                }else{
                    block.style[margin]= newStretch;
                    }
            if(newStretch > 0.5){
                var target= this; 
                $$.requestAnimationFrame(function(){ target.release(); });
            }else{
                block.style[margin]= '0';
                overScrollMeta.splice(overScrollMeta.indexOf(this), 1);
                }
            };
        };
    OverScrollData.UP= '1';
    OverScrollData.DOWN= '0';
    
    var TouchTypes= {
        STROCKE : 0,
        VERTICAL_STROCKE : 1,
        TAP : 2
    };
    
/*  ---     Hooks   --- */
    
//  global init hook
    var initHook= function(e, index){
        touchMeta[index]= {
            lastTime : (new Date().getTime()),
            lastPos : { x: e.screenX, y: e.screenY },
            lastMovement : {x: 0, y: 0},
            lastTimeout : 0,
            start : { x: e.screenX, y: e.screenY, time: new Date().getTime()},
            type : null
            };
        };
    
//  global movment hook
    var movmentHook= function(e, index){
        EventObjectExtension.apply(e, [index]);
        
        var isPhysicalTouch= !this.hasAttribute('physicalTouch') || this.getAttribute('physicalTouch') != 'false';
        var defaultScroll= $$.getComputedStyle(this).getPropertyValue('overflow') != 'hidden';
                
//      grabbed scroll
        if(e.type == TouchTypes.STROCKE && !defaultScroll && isPhysicalTouch){
            physicalScroll(this, e.movement.y, true);
        }else if(e.type == TouchTypes.VERTICAL_STROCKE && !defaultScroll && isPhysicalTouch){
            
            }
        };
    
//  global release hook
    var releaseHook= function(e, index){
        EventObjectExtension.apply(e, [index]);
        
        var isPhysicalTouch= !this.hasAttribute('physicalTouch') || this.getAttribute('physicalTouch') != 'false';
        var defaultScroll= $$.getComputedStyle(this).getPropertyValue('overflow') != 'hidden';
        
//      released remaining velocity scroll
        if(e.type == TouchTypes.STROCKE && !defaultScroll && isPhysicalTouch){
            physicalScroll(this, e.speed.y, false);
            }
        };
    
//  attaching all Hooks
    allElements.forEach(function(item){
        item._physicalID= -1;
        
        item.addEventListener($$.events.TOUCHSTART, function(e){
            if($$.navigator.isTouch){
                var emitter= this;
                e.touches.forEach(function(item, i){
                    initHook.apply(emitter, [item, i]);
                    });
            }else{
                isDown= true;
                initHook.apply(this, [e, 0]);
                }
            });
        
        item.addEventListener($$.events.TOUCHMOVE, function(e){
            if($$.navigator.isTouch){
                var emitter= this;
                e.touches.forEach(function(item, i){
                    movmentHook.apply(emitter, [item, i]);
                    });
            }else if(isDown){
                movmentHook.apply(this, [e, 0]);
                }
            });
            
        item.addEventListener($$.events.TOUCHEND, function(e){
            if($$.navigator.isTouch){
                var emitter= this;
                touchMeta.forEach(function(item, i){
                    if(!e.touches[i]){
                        releaseHook.apply(emitter, [e, i]);
                        }
                    });
            }else{
                isDown= false;
                releaseHook.apply(this, [e, 0]);
                }
            }); 
        });
    
/* ---      physical functions      --- */
    
    var physicalScroll= function(target, movement, isGrabbed){
        
//      invert movement direction to scroll direction
        var change= movement * -1;
		var sData= null;

//      if the scrolled element is still grabbed
        if(isGrabbed){
            target.scrollTop+= change;
            
//          on overscrolling at the top
            if(target.scrollTop === 0 && movement > 0){
                if(target._physicalID < 0 || !overScrollMeta[target._physicalID]){
                    overScrollMeta.push(new OverScrollData(target, OverScrollData.DOWN, 0, 0));
                    target._physicalID= overScrollMeta.length - 1;
                    }
                sData= overScrollMeta[target._physicalID];
                sData.cursorY+= Math.abs(change);
                target.firstElementChild.style.marginTop= stretching(sData.cursorY)+'px';
                target.scrollTop= 0;
                
//          on overscrolling at the bottom
            }else if(target.scrollTop == target.scrollTopMax && movement < 0){
                if(target._physicalID < 0 || !overScrollMeta[target._physicalID]){
                    overScrollMeta.push(new OverScrollData(target, OverScrollData.UP, 0, 0));
                    target._physicalID= overScrollMeta.length - 1;
                    }
                sData= overScrollMeta[target._physicalID];
                sData.cursorY+= Math.abs(change);
                target.lastElementChild.style.marginBottom= stretching(sData.cursorY)+'px';
                target.scrollTop= target.scrollTopMax;
                }
            
//      if the object was released
        }else{
            if(target._physicalID > -1 && overScrollMeta[target._physicalID]){
                sData= overScrollMeta[target._physicalID];
                sData.lastUpdate= new Date().getTime();
                sData.release();
                }
            }
        };
    
    var physicalVScroll= function(target, movement, isGrabbed){
        
//      invert movement direction to scroll direction
        var change= movement * -1;
		var sData= null;

//      if the scrolled element is still grabbed
        if(isGrabbed){
            target.scrollLeft+= change;
            
//          on overscrolling at the top
            if(target.scrollLeft === 0 && movement > 0){
                if(target._physicalID < 0 || !overScrollMeta[target._physicalID]){
                    overScrollMeta.push(new OverScrollData(target, OverScrollData.DOWN, 0, 0));
                    target._physicalID= overScrollMeta.length - 1;
                    }
                sData= overScrollMeta[target._physicalID];
                sData.cursorX+= Math.abs(change);
                target.firstElementChild.style.marginLeft= stretching(sData.cursorX)+'px';
                target.scrollLeft= 0;
                
//          on overscrolling at the bottom
            }else if(target.scrollLeft == target.scrollLeftMax && movement < 0){
                if(target._physicalID < 0 || !overScrollMeta[target._physicalID]){
                    overScrollMeta.push(new OverScrollData(target, OverScrollData.UP, 0, 0));
                    target._physicalID= overScrollMeta.length - 1;
                    }
                sData= overScrollMeta[target._physicalID];
                sData.cursorX+= Math.abs(change);
                target.lastElementChild.style.marginRight= stretching(sData.cursorX)+'px';
                target.scrollLeft= target.scrollLeftMax;
                }
            
//      if the object was released
        }else{
            if(target._physicalID > -1 && overScrollMeta[target._physicalID]){
                sData= overScrollMeta[target._physicalID];
                sData.lastUpdate= new Date().getTime();
                sData.release();
                }
            }
        };
    
    var stretching= function(F){
        const D= 3;
        
        return F / D;
        };
});
