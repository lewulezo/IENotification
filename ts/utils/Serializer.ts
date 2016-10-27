const classRegistry = {};

class ClassRegistration{
  constructor(public name:string, public clazz:Function, public ignoredFields:string[] = []){
  }
}
const defaultClassRegistration = new ClassRegistration('Object', Object);
classRegistry[defaultClassRegistration.name] = defaultClassRegistration;
classRegistry['Object'] = new ClassRegistration('Object', Object);
classRegistry['Array'] = new ClassRegistration('Array', Array);

interface SerialObj{
  "class":string;
  data:any;
} 

class SerializeContext{
  private _items:SerialContextItem[] = [];

  putOrigObj(id:string, origObj:Object){
    let item = this.getById(id);
    if (item){
      item.origObj = origObj;
    } else {
      this._items.push({id:id, origObj:origObj});
    }
  }
  
  putConvObj(id:string, convObj:SerialObj){
    let item = this.getById(id);
    if (item){
      item.convObj = convObj;
    } else {
      this._items.push({id:id, convObj:convObj});
    }
  }


  forEach(callback:(string, Object, SerialObj)=>void):void{
    this._items.forEach(item=>callback(item.id, item.origObj, item.convObj));
  }

  getById(id:string):SerialContextItem{
    let result:SerialContextItem = null;
    this._items.some((item)=>{
      if (item.id == id){
        result = item;
        return true;
      }
    });
    return result;
  }

  getByOrigObj(obj:Object):SerialContextItem{
    let result:SerialContextItem = null;
    this._items.some((item)=>{
      if (item.origObj === obj){
        result = item;
        return true;
      }
    });
    return result;
  }
}

interface SerialContextItem{
  id:string;
  origObj?:Object;
  convObj?:SerialObj;
}

export function Serializable(name: string, ignoreFields?: string[]) {
  return (constructor:Function) => {
     Serializer.register(name, constructor, ignoreFields);
  }
}

export class Serializer{
//class registration-------------------------------------------------------
  public static register(name:string, clazz:Function, ignoredFields?:string[]):ClassRegistration{
    let reg = new ClassRegistration(name, clazz, ignoredFields);
    classRegistry[name] = reg;
    return reg;
  }

  private static getClassRegistration(clazz:Function):ClassRegistration{
    let retVal:ClassRegistration = null;
    Object.keys(classRegistry).some(name=>{
      let reg = classRegistry[name];
      if (reg.clazz === clazz){
        retVal = reg;
        return true;
      }
    });
    // if (!retVal) {
    //   let name = Serializer.generateClassRegName(clazz);
    //   retVal = Serializer.register(name, clazz);
    // }
    return retVal;
  }

//serial -----------------------------------------------------------------
  public serialize(object:Object):string{
    let context = new SerializeContext();
    let mainId = this.serializeSingleObject(object, context);
    let outputObj = {main:mainId};
    context.forEach((id, srcObj, tgtObj)=>{
      outputObj[id] = tgtObj;
    });
    return JSON.stringify(outputObj);
  }

  private serializeSingleObject(object:Object, context:SerializeContext):string{
    if (!Serializer.isSerializable(object)){
      return '';
    }
    let objId = Serializer.genId(context);
    context.putOrigObj(objId, object);
    let dataObj;
    if (object['serialize'] instanceof Function){
      let serialStr:string = object['serialize']();
      dataObj = JSON.parse(serialStr); 
    } else {
      dataObj = {};
      Object.keys(object).forEach(field=>{
        if (!Serializer.isFieldSerializable(object, field)){
          return;
        }
        dataObj[field] = this.convertValueForSerialize(object[field], context);
      })
    }
    let reg = Serializer.getClassRegistration(object.constructor);
    let tgtObj:SerialObj = {"class":reg.name, "data":dataObj};
    context.putConvObj(objId, tgtObj);
    return objId;
  }

  private static genId(context) {
    let id:string;
    while(!id || context.getById(id) != null){
      id = Serializer.uuid();
    }
    return id;
  }

  private convertValueForSerialize(value:any, context:SerializeContext):any{
    if (typeof value == 'object'){
      let contextItem = context.getByOrigObj(value);
      if (contextItem){
        return {refId: contextItem.id};
      } else {
        return {refId: this.serializeSingleObject(value, context)};
      }
    } else {
      return value;
    }
  }

  private static isFieldSerializable(object:Object, field:string):boolean{
    let value = object[field];
    let reg = Serializer.getClassRegistration(object.constructor);
    if (value === null || value === undefined){
      return false;
    }
    if (reg.ignoredFields.indexOf(field) != -1){
      return false;
    }
    if (typeof value === 'function' ){
      return false;
    }
    if (typeof value === 'object'){
      if (value instanceof Array){
        return true;
      } 
      if (value.constructor === Object){
        return true;
      }
      if (!Serializer.isSerializable(value)){
        return false;
      }
    } 
    return true;
  }
  
  private static isSerializable(object:Object):boolean{
    return Serializer.getClassRegistration(object.constructor) != null;
  }

//deserialize ----------------------------------------------------------
  public deserialize(str:string):Object{
    let context = new SerializeContext(); 
    let inputObj = JSON.parse(str);
    let refArray = [];
    let mainObjId = inputObj.main;
    delete inputObj.main;
    Object.keys(inputObj).forEach((key:string)=>{
      let serialObj = inputObj[key];
      context.putConvObj(key, serialObj);
      let obj = this.deserializeSingleObj(serialObj,  refArray);
      context.putOrigObj(key, obj);
    });
    refArray.forEach((ref)=>{
      ref.self[ref.field] = context.getById(ref.refId).origObj;
    });
    return context.getById(mainObjId).origObj;
  }

  private deserializeSingleObj(serialObj: SerialObj, refArray:any[]):Object{
    let reg = classRegistry[serialObj['class']] || defaultClassRegistration;
    let obj;
    if (serialObj.class == 'Object'){
      obj = {};
    } else if (serialObj.class == 'Array'){
      obj = [];
    } else {
      obj = Serializer.createObject<Object>(reg.clazz);
    }
    if (obj['deserialize'] instanceof Function){
      obj.deserialize(JSON.stringify(serialObj.data));
    } else {
      Object.keys(serialObj.data).forEach((field)=>{
        let value = serialObj.data[field];
        if (typeof value == 'object'){
          refArray.push({self:obj, field:field, refId:value.refId});
        } else {
          obj[field] = value; 
        }
      });
    }
    return obj;
  }

  private static createObject<T>(clazz:Function):T{
    let obj = <T>(Object.create(clazz.prototype));
    Object.defineProperty(obj, 'constructor', {
      value: clazz,
      enumerable: false
    });
    return obj;
  }

  private static uuid():string{
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 5; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    return s.join("");
  }
}


export default Serializer;



