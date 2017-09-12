using System.Collections.Generic;
using System.Xml.Serialization;

namespace AtemMacroEditor.Results
{
    [XmlRoot("MacroOperations", IsNullable = false)]
    public class MacroSpec
    {
        public MacroSpec()
        {
            Operations = new List<MacroOperationSpec>();
        }

        [XmlArrayItem("Op")]
        public List<MacroOperationSpec> Operations { get; set; }
    }

    public class MacroOperationSpec
    {
        public MacroOperationSpec()
        {
            Fields = new List<MacroFieldSpec>();
        }

        [XmlAttribute("id")]
        public string Id { get; set; }

        [XmlElement("Field")]
        public List<MacroFieldSpec> Fields { get; set; }
    }

    public enum MacroFieldType
    {
        Enum,
        Flags,
        Int,
        Double,
        Bool,
    }

    public class MacroFieldSpec
    {
        public MacroFieldSpec()
        {
            Values = new List<MacroFieldValueSpec>();
        }

        [XmlAttribute("id")]
        public string Id { get; set; }

        [XmlAttribute("name")]
        public string Name { get; set; }

        [XmlAttribute("isId")]
        public bool IsId { get; set; }
        public bool ShouldSerializeIsId()
        {
            return IsId;
        }

        [XmlAttribute("type")]
        public MacroFieldType Type { get; set; }

        [XmlAttribute("min")]
        public int Min { get; set; }
        public bool ShouldSerializeMin()
        {
            return Type == MacroFieldType.Int || Type == MacroFieldType.Double;
        }

        [XmlAttribute("max")]
        public int Max { get; set; }
        public bool ShouldSerializeMax()
        {
            return Type == MacroFieldType.Int || Type == MacroFieldType.Double;
        }

        [XmlAttribute("scale")]
        public double Scale { get; set; }
        public bool ShouldSerializeScale()
        {
            return Type == MacroFieldType.Double;
        }

        [XmlElement("Value")]
        public List<MacroFieldValueSpec> Values { get; set; }
    }

    public class MacroFieldValueSpec
    {
        [XmlAttribute("id")]
        public string Id { get; set; }

        [XmlAttribute("name")]
        public string Name { get; set; }
    }
}
