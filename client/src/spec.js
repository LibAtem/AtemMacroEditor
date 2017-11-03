import XMLParser from 'xml2js';

let Spec = null;

fetch('/api/spec').then(function(response) {
  if(response.ok) {
    return response.text();
  }
  throw new Error('Network response was not ok.');
}).then(xmlText => {
  // console.log(res)
  XMLParser.parseString(xmlText, (err, res) => {
    Spec = res;
    console.log("Loaded spec:", res);
  });
});

export function FindFieldSpec(id, key){
  const op = FindOpSpec(id);

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

  res.sort();

  return res;
}