import { Serializer, Serializable, transiant } from '../utils';

function test(){
  @Serializable()
  class A {
    b:B;
    @transiant
    a2:string;
    a6:B[];
    constructor(public a1:number, a2: string, public a3:Object, public a4:number[], public a5:boolean, a6:B[], public a7:any[]){
      this.a2 = a2;
      this.a6 = a6;
    }
    // serialize():string{
    //   return JSON.stringify({a1: this.a1});
    // }
    // deserialize(str:string):void{
    //   this.a1 = JSON.parse(str).a1;
    // }
  }
  // Serializer.register('A', A, ['a2']);

  @Serializable('B')
  class B {
    b2:B;
    constructor(public b1:A){
    }
    test(){
      console.log('test passed...');
    }
  }
  // Serializer.register('B', B);


  let a = new A(3, 'aa', {t:5, u:{cc:1}}, [1,4], false, [], []);
  let b = new B(a);
  b.b2 = b;
  a.b = b;

  a.a6 = [b,b];
  a.a7 = [1,'a',a];
  a.a3['u']['dd'] = a.a6;
  let strA = Serializer.serialize(a);
  let strB = Serializer.serialize(b);
  console.log('---------a----------\n' + strA);
  console.log('---------b----------\n' + strB);
  let a1:A = Serializer.deserialize<A>(strA);
  let b1:B = Serializer.deserialize<B>(strB);
  console.log(a1 instanceof A);
  console.log(b1 instanceof B);
  // a1.a6[1].test();
  console.log(a1);
  console.log(b1);
  console.log(a1.a3['u']['dd'] == a1.a6)
  
}
test();
