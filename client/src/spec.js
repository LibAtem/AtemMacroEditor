import Spec from './assets/spec.xml';

export function FindFieldSpec(id, key){
  const op = FindOpSpec(id)

  for (let field of op.Field){
    if (field.$.id == key)
      return field;
  }

  return null;
}

export function FindOpSpec(id){
  const ops = Spec.MacroOperations.Operations[0].Op;

  for (let op of ops){
    if (op.$.id == id)
      return op;
  }

  return null;
}

export function GetAllTypes(){
  const ops = Spec.MacroOperations.Operations[0].Op;

  const res = [];
  for (let op of ops){
    res.push(op.$.id);
  }

  return res;
}