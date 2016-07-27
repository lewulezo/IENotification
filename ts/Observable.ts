
export default class Observable{
  private listeners;
  constructor(){
    let self = this;
    self.listeners = {};
    self.addEventListener.bind(self);
    self.removeEventListener.bind(self);
    self.dispatchEvent.bind(self);
    self.fire.bind(self);
    self.on.bind(self);
    self.un.bind(self);
  }

  addEventListener(eventName:string, func:Function){
    let handlers:Function[] = this.listeners[eventName];
    if (handlers){
      handlers.push(func);
    } else {
      handlers = [func];
      this.listeners[eventName] = handlers;
    }
  }

  removeEventListener(eventName, func: Function){
    let handlers:Function[] = this.listeners[eventName];
    if (handlers){
      let index = handlers.indexOf(func);
      if (index > -1){
        handlers.splice(index, 1);
      }
    }
  }

  dispatchEvent(eventName:string){
    let self = this;
    let handlers: Function[] = self.listeners[eventName];
    let evt = new ObjectEvent(eventName);
    if (handlers){
      handlers.some(func=>{
        try {
          func.call(self, evt);
          if (evt.stop){
            return true;
          }
        } catch (error){
          console.log(`Error in dispatchEvent ${eventName}...${error.message}`)
          if (evt.stopWhenError){
            return true;
          }
        }
      })
    }
  }

  fire(eventName:string){
    this.dispatchEvent(eventName);
  }

  on(eventName:string, func:Function){
    this.addEventListener(eventName, func);
  }

  un(eventName:string, func:Function){
    this.removeEventListener(eventName, func);
  }
}

class ObjectEvent{
  name:string;
  stop:boolean;
  stopWhenError:boolean;

  constructor(name){
    this.name = name;
    this.stop = false;
    this.stopWhenError = true;
  }
}
