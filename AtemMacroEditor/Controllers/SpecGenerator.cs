using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Xml.Serialization;
using AtemMacroEditor.Results;
using LibAtem.Commands;
using LibAtem.MacroOperations;
using LibAtem.Serialization;
using LibAtem.XmlState.MacroSpec;

namespace AtemMacroEditor.Controllers
{
    public class SpecGenerator
    {
        public static void SaveState(string path, MacroSpec profile)
        {
            var ns = new XmlSerializerNamespaces();
            ns.Add("", "");

            XmlSerializer serializer = new XmlSerializer(typeof(MacroSpec));
            FileStream fs = new FileStream(path, FileMode.Create);
            serializer.Serialize(fs, profile, ns);
            fs.Flush();
            fs.Dispose();
        }

        public static Type GetType(string typeName)
        {
            var type = Type.GetType(typeName);
            if (type != null) return type;
            foreach (var a in AppDomain.CurrentDomain.GetAssemblies())
            {
                type = a.GetType(typeName);
                if (type != null)
                    return type;
            }
            return null;
        }

        public static MacroSpec CompileData()
        {
            var res = new MacroSpec();

            foreach (var op in MacroOpManager.FindAll())
            {
                var xmlOp = new MacroOperationSpec() {Id = op.Key.ToString()};
                res.Operations.Add(xmlOp);
                
                IEnumerable<PropertyInfo> props = op.Value.GetProperties(BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic)
                    .Where(prop => prop.GetCustomAttribute<NoSerializeAttribute>() == null)
                    .OrderBy(prop => prop.GetCustomAttribute<SerializeAttribute>()?.StartByte ?? 999);

                foreach (PropertyInfo prop in props)
                {
                    var fieldAttr = prop.GetCustomAttribute<MacroFieldAttribute>();
                    if (fieldAttr == null)
                        continue;

                    var xmlField = new MacroFieldSpec()
                    {
                        Id = fieldAttr.Id,
                        Name = fieldAttr.Name,
                        IsId = prop.GetCustomAttribute<CommandIdAttribute>() != null
                    };
                    xmlOp.Fields.Add(xmlField);

                    if (prop.GetCustomAttribute<BoolAttribute>() != null)
                    {
                        xmlField.Type = MacroFieldType.Bool;
                    }
                    else if (prop.GetCustomAttribute<Enum8Attribute>() != null || prop.GetCustomAttribute<Enum16Attribute>() != null || prop.GetCustomAttribute<Enum32Attribute>() != null)
                    {
                        xmlField.Type = prop.PropertyType.GetCustomAttribute<FlagsAttribute>() != null ? MacroFieldType.Flags : MacroFieldType.Enum;

                        string mappedTypeName = TypeMappings.MapType(prop.PropertyType.FullName);
                        Type mappedType = prop.PropertyType;
                        if (mappedTypeName != mappedType.FullName && mappedTypeName.IndexOf("System.") != 0)
                            mappedType = GetType(mappedTypeName);


                        foreach (object val in Enum.GetValues(mappedType))
                        {
                            string id = val.ToString();
                            var xmlAttr = mappedType.GetMember(val.ToString())[0].GetCustomAttribute<XmlEnumAttribute>();
                            if (xmlAttr != null)
                                id = xmlAttr.Name;

                            // TODO check value is available for device profile/usage location
                            xmlField.Values.Add(new MacroFieldValueSpec()
                            {
                                Id = id,
                                Name = val.ToString(),
                            });
                        }
                    }
                    else
                    {
                        SetNumericProps(xmlField, prop);
                    }
                }
            }

            return res;
        }

        private static void SetNumericProps(MacroFieldSpec field, PropertyInfo prop)
        {
            var uint16range = prop.GetCustomAttribute<UInt16RangeAttribute>();
            if (uint16range != null)
            {
                field.Type = MacroFieldType.Int;
                field.Min = uint16range.Min;
                field.Max = uint16range.Max;
                return;
            }
            var uint8range = prop.GetCustomAttribute<UInt8RangeAttribute>();
            if (uint8range != null)
            {
                field.Type = MacroFieldType.Int;
                field.Min = uint8range.Min;
                field.Max = uint8range.Max;
                return;
            }

            var int16d = prop.GetCustomAttribute<Int16DAttribute>();
            if (int16d != null)
            {
                field.Type = MacroFieldType.Double;
                field.Min = int16d.ScaledMin;
                field.Max = int16d.ScaledMax;
                field.Scale = int16d.Scale;
                return;
            }
            var int32d = prop.GetCustomAttribute<Int32DAttribute>();
            if (int32d != null)
            {
                field.Type = MacroFieldType.Double;
                field.Min = int32d.ScaledMin;
                field.Max = int32d.ScaledMax;
                field.Scale = int32d.Scale;
                return;
            }

            var uint16 = prop.GetCustomAttribute<UInt16Attribute>();
            if (uint16 != null)
            {
                field.Type = MacroFieldType.Int;
                field.Min = 0;
                field.Max = (int)Math.Pow(2, 16) - 1;
                return;
            }
            var uint8 = prop.GetCustomAttribute<UInt8Attribute>();
            if (uint8 != null)
            {
                field.Type = MacroFieldType.Int;
                field.Min = 0;
                field.Max = (int)Math.Pow(2, 8) - 1;
                return;
            }

            throw new Exception(string.Format("Unknown field type: {0}.{1}", field.Name, prop.Name));
        }
    }
}
