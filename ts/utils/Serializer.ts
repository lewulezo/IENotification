import { SerializerRegistry , defaultClassRegistration} from './SerializerRegistry';
import { uuid } from './uuid';

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

export class Serializer{
  public static serialize(object:Object):string{
    let context = new SerializeContext();
    let mainId = serializeSingleObject(object, context);
    let outputObj = {main:mainId};
    context.forEach((id, srcObj, tgtObj)=>{
      outputObj[id] = tgtObj;
    });
    return JSON.stringify(outputObj);
  }

  public static deserialize<T>(str:string):T{
    let context = new SerializeContext(); 
    let inputObj = JSON.parse(str);
    let refArray = [];
    let mainObjId = inputObj.main;
    delete inputObj.main;
    Object.keys(inputObj).forEach((key:string)=>{
      let serialObj = inputObj[key];
      context.putConvObj(key, serialObj);
      let obj = deserializeSingleObj(serialObj,  refArray);
      context.putOrigObj(key, obj);
    });
    refArray.forEach((ref)=>{
      ref.self[ref.field] = context.getById(ref.refId).origObj;
    });
    return <T>(context.getById(mainObjId).origObj);
  }
}


//functions for serialize -----------------------------------------------------------
function serializeSingleObject(object:Object, context:SerializeContext):string{
  if (!isSerializable(object)){
    return '';
  }
  let objId = genId(context);
  context.putOrigObj(objId, object);
  let dataObj;
  if (object['serialize'] instanceof Function){
    let serialStr:string = object['serialize']();
    dataObj = JSON.parse(serialStr); 
  } else {
    dataObj = {};
    Object.keys(object).forEach(field=>{
      if (!isFieldSerializable(object, field)){
        return;
      }
      dataObj[field] = convertValueForSerialize(object[field], context);
    })
  }
  let reg = SerializerRegistry.getClassRegistration(object.constructor);
  let tgtObj:SerialObj = {"class":reg.name, "data":dataObj};
  context.putConvObj(objId, tgtObj);
  return objId;
}

function genId(context) {
  let id:string;
  while(!id || context.getById(id) != null){
    id = uuid();
  }
  return id;
}

function convertValueForSerialize(value:any, context:SerializeContext):any{
  if (typeof value == 'object'){
    let contextItem = context.getByOrigObj(value);
    if (contextItem){
      return {refId: contextItem.id};
    } else {
      return {refId: serializeSingleObject(value, context)};
    }
  } else {
    return value;
  }
}

function isFieldSerializable(object:Object, field:string):boolean{
  let value = object[field];
  let reg = SerializerRegistry.getClassRegistration(object.constructor);
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
    if (!isSerializable(value)){
      return false;
    }
  } 
  return true;
}

function isSerializable(object:Object):boolean{
  return SerializerRegistry.getClassRegistration(object.constructor) != null;
}

//functions for deserilaizer ----------------------------------------------------------------------

interface ObjectRef {
  self: Object;
  field: string;
  refId: string;
}

function deserializeSingleObj(serialObj: SerialObj, refArray:ObjectRef[]):Object{
  let reg = SerializerRegistry.getClassRegistration(serialObj['class']) || defaultClassRegistration;
  let obj;
  if (serialObj.class == 'Object'){
    obj = {};
  } else if (serialObj.class == 'Array'){
    obj = [];
  } else {
    obj = createObject(reg.clazz);
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

function createObject(clazz:Function):Object{
  let obj = Object.create(clazz.prototype);
  Object.defineProperty(obj, 'constructor', {
    value: clazz,
    enumerable: false
  });
  return obj;
}

//functions for decorators ---------------------------------------------------------
export function Serializable(name?: string, ignoreFields?: string[]) {
  return (constructor:Function) => {
     SerializerRegistry.registerClass(constructor, name, ignoreFields);
  }
}

export function transiant(target:any, fieldName:string) {
  SerializerRegistry.registerTransiantField(target.constructor, fieldName);
}

export default Serializer;



