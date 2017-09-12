using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using AtemMacroEditor.Results;
using LibAtem.Commands;
using LibAtem.Commands.Macro;
using LibAtem.MacroOperations;
using LibAtem.Net;
using LibAtem.Net.DataTransfer;
using LibAtem.XmlState;

namespace AtemMacroEditor
{
    public class AtemMacroStore
    {
        private readonly AtemClient _client;
        private readonly Dictionary<uint, MacroPropertiesGetCommand> _macros;
        private readonly object _dataTransferLock;

        public AtemMacroStore(string address)
        {
            _macros = new Dictionary<uint, MacroPropertiesGetCommand>();
            _client = new AtemClient(address);
            _dataTransferLock = new object();

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
            lock (_macros)
            {
                _macros[cmd.Index] = cmd;
            }

            // TODO emit change
        }

        public MacroPropertiesList GetMacros()
        {
            lock (_macros)
            {
                return new MacroPropertiesList()
                {
                    Macros = _macros.Select(kv => kv.Value).Select(cmd => new MacroProperties {Index = cmd.Index, IsUsed = cmd.IsUsed, Name = cmd.Name, Description = cmd.Description}).ToList()
                };
            }
        }

        public Macro GetMacro(uint id)
        {
            lock (_dataTransferLock)
            {
                IReadOnlyList<MacroOpBase> result = null;
                var evt = new AutoResetEvent(false);

                var job = new DownloadMacroJob(id, ops =>
                {
                    result = ops;
                    evt.Set();
                }, TimeSpan.FromMilliseconds(5000));

                _client.DataTransfer.QueueJob(job);

                bool res = evt.WaitOne(TimeSpan.FromMilliseconds(5000));
                if (!res)
                    throw new Exception("Timed out");

                if (result == null)
                    return null;

                IReadOnlyList<MacroOpBase> resOps = result;
                lock (_macros)
                {
                    var props = _macros.Select(m => m.Value).FirstOrDefault(m => m.Index == id);
                    if (props == null)
                        return null;

                    return new Macro(id)
                    {
                        Name = props.Name,
                        Description = props.Description,
                        Operations = resOps.Select(o => o.ToMacroOperation()).ToList()
                    };
                }
            }
        }
    }
}
