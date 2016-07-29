export default class DelayTasks{
  private tasks;
  private logError = false;

  constructor(){
    this.tasks = {};
  }

  public addTask(taskName:string, func:Function, delay:number, repeat=false):void{
    let self = this;
    if (repeat){
      self.addRepeatTask(taskName, func, delay);
    } else {
      self.addSimpleTask(taskName, func, delay);
    }
  }

  public addSimpleTask(taskName:string, func:Function, delay:number):void{
    let self = this;
    self.tasks[taskName] = setTimeout(()=>{
      self.endTask(taskName);
      try {
        func();
      } catch(error){
        if (self.logError){
          console.log(`running simple task ${taskName} throws error:${error}`);
        }
      }
    }, delay);
  }

  public addRepeatTask(taskName:string, func:Function, delay:number):void{
    let self = this;
    self.tasks[taskName] = - setInterval(()=>{
      try {
        func();
      } catch(error){
        if (self.logError){
          console.log(`running repeat task ${taskName} throws error:${error}`);
        }
      }
    }, delay);
  }

  public addAwaitingTask(taskName:string, func:Function, waitingFunc:Function, delay:number):void{
    let self = this;
    self.addRepeatTask(taskName, ()=>{
      let waitingFinished = false;
      try {
        waitingFinished = waitingFunc();
      } catch (error){
          if (self.logError){
            console.log(`check awaiting task ${taskName} condition throws error:${error}`);
          }   
      }
      if (waitingFinished){
        self.endTask(taskName);
        try {
          func();
        } catch (error){
          if (self.logError){
            console.log(`running awaiting task ${taskName} throws error:${error}`);
          }          
        }
      }
    }, delay);
  }

  public getTaskNames():string[]{
    return Object.keys(this.tasks);
  }

  public endTask(taskName):void{
    let id = this.tasks[taskName];
    if (id > 0){
      clearTimeout(id);
    } else {
      clearInterval(-id);
    }
    delete this.tasks[taskName];
  }

  public endAllTasks(){
    this.getTaskNames().forEach(taskName=>this.endTask(taskName));
  }
}
