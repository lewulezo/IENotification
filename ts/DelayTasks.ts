export default class DelayTasks{
  tasks;

  constructor(){
    this.tasks = {};
  }

  addTask(taskName:string, func:Function, delay:number, repeat=false):void{
    if (repeat){
      this.tasks[taskName] = - setInterval(func, delay);
    } else {
      this.tasks[taskName] = setTimeout(func, delay);
    }
  }

  addRepeatTask(taskName:string, func:Function, delay:number):void{
    this.addTask(taskName, func, delay, true);
  }

  endTask(taskName):void{
    let id = this.tasks[taskName];
    if (id > 0){
      clearTimeout(id);
    } else {
      clearInterval(-id);
    }
    delete this.tasks[taskName];
  }

  endAllTasks(){
    Object.keys(this.tasks).forEach(taskName=>this.endTask(taskName));
  }
}
