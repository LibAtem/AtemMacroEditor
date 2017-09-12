using System.Collections.Generic;
using System.Xml.Serialization;

namespace AtemMacroEditor.Results
{
    [XmlRoot("Macros")]
    public class MacroPropertiesList
    {
        public MacroPropertiesList()
        {
            Macros = new List<MacroProperties>();
        }

        public List<MacroProperties> Macros { get; set; }
    }

    public class MacroProperties
    {
        [XmlAttribute("id")]
        public uint Index { get; set; }
        [XmlAttribute("used")]
        public bool IsUsed { get; set; }

        [XmlAttribute("name")]
        public string Name { get; set; }
        public bool ShouldSerializeName()
        {
            return IsUsed;
        }

        [XmlAttribute("description")]
        public string Description { get; set; }
        public bool ShouldSerializeDescription()
        {
            return IsUsed;
        }
    }
}
