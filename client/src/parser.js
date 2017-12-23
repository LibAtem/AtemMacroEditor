import XMLParser from 'xml2js';

export function ParseMacroList(xmlText){
  return new Promise((resolve, reject) => {
    XMLParser.parseString(xmlText, (err, res) => {
      if (err != null)
        return reject(err);

console.log(res)
      // const macros = [];
      if (!res.Macros || !res.Macros.Macros || !res.Macros.Macros[0] || !res.Macros.Macros[0].MacroProperties)
        return resolve([]);

      const props = res.Macros.Macros[0].MacroProperties;
      return resolve(props.map(m => {
        return {
          id: parseInt(m.$.id),
          user: m.$.used && m.$.used != "false",
          name: m.$.name,
          description: m.$.description,
        };
      }));      
    });
  });
}