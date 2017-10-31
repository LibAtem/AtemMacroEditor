using System;
using AtemMacroEditor.Results;
using LibAtem.Common;
using LibAtem.DeviceProfile;
using LibAtem.XmlState;
using Microsoft.AspNetCore.Mvc;

namespace AtemMacroEditor.Controllers
{
    [Route("api/[controller]")]
    [Produces("application/xml")]
    public class SpecController : Controller
    {
        private static readonly Lazy<MacroSpec> cachedSpec;

        static SpecController()
        {
            // Force the assembly to be loaded
            MacroInput.Camera1.ToVideoSource();
            VideoSource.Input1.ToMacroInput();

            // TODO - parse back from topology sent from the server
            var profile = DeviceProfileRepository.GetSystemProfile(null);

            // TODO - refactor CompileData into this package
            cachedSpec = new Lazy<MacroSpec>(() => SpecGenerator.CompileData(profile));
        }

        // GET api/values
        [HttpGet]
        public MacroSpec Get() => cachedSpec.Value;
    }
}