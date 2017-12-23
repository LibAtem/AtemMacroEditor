using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using AtemMacroEditor.Results;
using log4net;
using LibAtem.Commands;
using LibAtem.Commands.Macro;
using LibAtem.MacroOperations;
using LibAtem.Net;
using LibAtem.Net.DataTransfer;
using LibAtem.XmlState;
using Newtonsoft.Json;

namespace AtemMacroEditor
{
    public class AtemMacroStore
    {
        private static readonly ILog Log = LogManager.GetLogger(typeof(AtemClient));

        private readonly AtemClient _client;
        private readonly Dictionary<uint, MacroPropertiesGetCommand> _macros;
        private readonly object _dataTransferLock;
        private MacroRunStatusGetCommand _lastStatus;

        public AtemMacroStore(string address)
        {
            _macros = new Dictionary<uint, MacroPropertiesGetCommand>();
            _client = new AtemClient(address, false);
            _dataTransferLock = new object();

            _client.OnReceive += OnCommand;
            _client.Connect();
        }

        public MacroRunStatusGetCommand LastStatus => _lastStatus;

        private void OnCommand(object sender, IReadOnlyList<ICommand> commands)
        {
            foreach (ICommand cmd in commands)
            {
                Log.DebugFormat("Got command: {0}", cmd.GetType().FullName);

                if (cmd is MacroPropertiesGetCommand)
                    UpdateMacroProps(cmd as MacroPropertiesGetCommand);
                if (cmd is MacroRunStatusGetCommand)
                    TransmitStatus(cmd as MacroRunStatusGetCommand);
                if (cmd is LastStateChangeTimeCodeCommand)
                    LogTime(cmd as LastStateChangeTimeCodeCommand);
            }
        }

        private static void LogTime(LastStateChangeTimeCodeCommand cmd)
        {
            Log.InfoFormat("Time: {0:00}:{1:00}:{2:00}:{3:00}", cmd.Hour, cmd.Minute, cmd.Second, cmd.Frame);
        }

        private void TransmitStatus(MacroRunStatusGetCommand cmd)
        {
            _lastStatus = cmd;

            WebsocketMiddleware.SendToAllAsync(JsonConvert.SerializeObject(cmd));
        }

        private void UpdateMacroProps(MacroPropertiesGetCommand cmd)
        {
            lock (_macros)
            {
                _macros[cmd.Index] = cmd;
            }

            WebsocketMiddleware.SendToAllAsync(string.Format("{{\"Change\":{0}}}", cmd.Index));
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

        public bool UpdateMacro(uint id, Macro macro)
        {
            macro.Index = id;

            // If there are no operations, then the ATEM rejects it
            if (macro.Operations.Count == 0)
                return false;

            lock (_dataTransferLock)
            {
                bool? result = null;
                var evt = new AutoResetEvent(false);

                IEnumerable<MacroOpBase> ops = macro.Operations.Select(o => o.ToMacroOp());
                var job = new UploadMacroJob(id, macro.Name, macro.Description, ops, ok =>
                {
                    result = ok;
                    evt.Set();
                }, TimeSpan.FromMilliseconds(5000));

                _client.DataTransfer.QueueJob(job);

                bool res = evt.WaitOne(TimeSpan.FromMilliseconds(5000));
                if (!res)
                    throw new Exception("Timed out");
                
                return result.GetValueOrDefault(false);
            }
        }

        public void DeleteMacro(uint id)
        {
            _client.SendCommand(new MacroActionCommand
            {
                Action = MacroActionCommand.MacroAction.Delete,
                Index = id,
            });
        }

        public void SetLooping(bool looping)
        {
            _client.SendCommand(new MacroRunStatusSetCommand
            {
                Mask = MacroRunStatusSetCommand.MaskFlags.Looping,
                Looping = looping,
            });
        }

        public void RunMacro(uint id)
        {
            _client.SendCommand(new MacroActionCommand
            {
                Action = MacroActionCommand.MacroAction.Run,
                Index = id,
            });
        }

        public void StopMacro()
        {
            _client.SendCommand(new MacroActionCommand
            {
                Action = MacroActionCommand.MacroAction.Stop,
            });
        }
    }
}
