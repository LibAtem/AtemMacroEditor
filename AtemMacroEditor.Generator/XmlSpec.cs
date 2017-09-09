using System.Collections.Generic;
using System.Xml.Serialization;

namespace AtemMacroEditor.Generator
{
    [XmlRoot("MacroOperations", IsNullable = false)]
    public class XmlSpec
    {
        public XmlSpec()
        {
            Operations = new List<XmlOperation>();
        }

        [XmlArrayItem("Op")]
        public List<XmlOperation> Operations { get; set; }
    }

    public class XmlOperation
    {
        public XmlOperation()
        {
            Fields = new List<XmlField>();
        }

        [XmlAttribute("id")]
        public string Id { get; set; }

        [XmlElement("Field")]
        public List<XmlField> Fields { get; set; }
    }

    public enum FieldType
    {
        Enum,
        Flags,
        Int,
        Double,
        Bool,
    }

    public class XmlField
    {
        public XmlField()
        {
            Values = new List<XmlFieldValue>();
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
        public FieldType Type { get; set; }

        [XmlAttribute("min")]
        public int Min { get; set; }
        public bool ShouldSerializeMin()
        {
            return Type == FieldType.Int || Type == FieldType.Double;
        }

        [XmlAttribute("max")]
        public int Max { get; set; }
        public bool ShouldSerializeMax()
        {
            return Type == FieldType.Int || Type == FieldType.Double;
        }

        [XmlAttribute("scale")]
        public double Scale { get; set; }
        public bool ShouldSerializeScale()
        {
            return Type == FieldType.Double;
        }

        [XmlElement("Value")]
        public List<XmlFieldValue> Values { get; set; }
    }

    public class XmlFieldValue
    {
        [XmlAttribute("id")]
        public string Id { get; set; }

        [XmlAttribute("name")]
        public string Name { get; set; }
    }
}
