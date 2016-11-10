import { uuid } from './uuid';

const classRegistry:{[key:string]:ClassRegistration} = {};

export class SerializerRegistry {
  public static registerClass(clazz:Function, name?:string, ignoreFields?:string[]){
    return registerClass(clazz, name, ignoreFields);
  }

  public static registerTransiantField(clazz:Function, fieldName:string) {
    return registerTransiantField(clazz, fieldName);
  }

  public static getClassRegistration(clazz:Function|string){
    return getClassRegistration(clazz);
  }
}

class ClassRegistration{
  anonymous = false;
  constructor(public name:string, public clazz:Function, public ignoredFields:string[] = []){
  }
}


function registerClass(clazz:Function, name?:string, ignoredFields?:string[]):ClassRegistration{
  let reg = getClassRegistration(clazz);
  if (!reg){
    let anonymous = false;
    if (!name) {
      name = generateAnonymousClassRegName(clazz);
      anonymous = true;
    }
    reg = new ClassRegistration(name, clazz, ignoredFields);
    reg.anonymous = anonymous;
    classRegistry[name] = reg;
  } else if (reg.anonymous){
    if (name){
      let tempName = reg.name;
      reg.name = name;
      classRegistry[name] = reg;
      delete classRegistry[tempName];
    } 
  }
  mergeArrayField(reg, 'ignoreFields', ignoredFields);
  return reg;
}

function registerTransiantField(clazz:Function, fieldName:string) {
  let reg = getClassRegistration(clazz);
  if (!reg){
    reg = registerClass(clazz);
  }
  if (reg.ignoredFields.indexOf(fieldName) == -1){
    reg.ignoredFields.push(fieldName);
  }
}

function getClassRegistration(clazz:Function|string):ClassRegistration{
  if (typeof clazz == 'string'){
    let className:string = <string>clazz;
    return classRegistry[className];
  } else {
    let retVal:ClassRegistration = null;
    Object.keys(classRegistry).some(name=>{
      let reg = classRegistry[name];
      if (reg.clazz === clazz){
        retVal = reg;
        return true;
      }
    });
    return retVal;
  }
}

function generateAnonymousClassRegName(clazz:Function):string{
  let funcName = clazz['name'];
  if (!funcName) {
    let funcName = clazz.toString();
    funcName = funcName.substr(9);
    funcName = funcName.substr(0, funcName.indexOf('('));
  }
  return [funcName, Date.now(), uuid()].join('-');
}

function mergeArrayField(obj:Object, field:string, arr:any[]){
  if (!arr) {
    return;
  }
  let tgtArr:any[] = obj[field];
  if (!tgtArr) {
    tgtArr = [];
    obj[field] = tgtArr;
  }
  arr.forEach((item:any) => {
    if (tgtArr.indexOf(item) == -1){
      tgtArr.push(item);
    }
  });
}


export const defaultClassRegistration = new ClassRegistration('Object', Object);
classRegistry[defaultClassRegistration.name] = defaultClassRegistration;
classRegistry['Object'] = new ClassRegistration('Object', Object);
classRegistry['Array'] = new ClassRegistration('Array', Array);


