using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Xml.Serialization;
using LibAtem.Commands;
using LibAtem.Commands.Macro;
using LibAtem.Net;
using LibAtem.XmlState;

namespace AtemMacroEditor
{
    public class AtemMacroStore
    {
        private readonly AtemClient _client;
        private readonly Dictionary<uint, MacroEntry> _macros;

        public AtemMacroStore(string address)
        {
            _macros = new Dictionary<uint, MacroEntry>();
            _client = new AtemClient(address);

            _client.OnReceive += OnCommand;
        }

        private void OnCommand(object sender, IReadOnlyList<ICommand> commands)
        {
            foreach (ICommand cmd in commands)
            {
                if (cmd is MacroPropertiesGetCommand)
                    UpdateMacroProps(cmd as MacroPropertiesGetCommand);


            }
        }

        private void UpdateMacroProps(MacroPropertiesGetCommand cmd)
        {
            MacroEntry entry;
            lock (_macros)
            {
                if (!_macros.TryGetValue(cmd.Index, out entry))
                    entry = _macros[cmd.Index] = new MacroEntry();

                entry.Properties = cmd;
                    ;
            }

            // TODO emit change
        }

        public MacroPropertiesList GetMacros()
        {
            lock (_macros)
            {
                return new MacroPropertiesList()
                {
                    Macros = _macros.Select(kv => kv.Value.Properties).Select(cmd => new MacroProperties {Index = cmd.Index, IsUsed = cmd.IsUsed, Name = cmd.Name, Description = cmd.Description}).ToList()
                };
            }
        }

        public Task<Macro> GetMacro(uint id)
        {
            // TODO - load off atem
            return null;
        }
    }


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

    internal class MacroEntry
    {
        public MacroPropertiesGetCommand Properties { get; set; }

        // TODO - commands
    }
}
