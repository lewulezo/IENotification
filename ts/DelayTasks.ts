export default class DelayTasks{
  private tasks;

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
      func();
    }, delay);
  }

  public addRepeatTask(taskName:string, func:Function, delay:number):void{
    let self = this;
    self.tasks[taskName] = - setInterval(func, delay);
  }

  public addAwaitingTask(taskName:string, func:Function, waitingFunc:Function, delay:number):void{
    let self = this;
    self.addRepeatTask(taskName, ()=>{
      try {
        if (waitingFunc()){
          self.endTask(taskName);
          func();
        }
      } catch (error){
        //treat error as false in this case
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
