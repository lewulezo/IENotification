export default class Position{
  x:number;
  y:number;
  w:number;
  h:number;
  constructor({x=0, y=0, w=0, h=0}){
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }
  equals(pos:Position):boolean{
    return this.x == pos.x && this.y == pos.y && this.w == pos.w && this.h == pos.h;
  }
}
