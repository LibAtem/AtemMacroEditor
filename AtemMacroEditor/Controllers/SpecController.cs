using System;
using AtemMacroEditor.Results;
using LibAtem.Common;
using LibAtem.XmlState;
using Microsoft.AspNetCore.Mvc;

namespace AtemMacroEditor.Controllers
{
    [Route("api/[controller]")]
    [Produces("application/xml")]
    public class SpecController : Controller
    {
        private readonly Lazy<MacroSpec> _cachedSpec;

        public SpecController(AtemMacroStore store)
        {
            // Force the assembly to be loaded
            MacroInput.Camera1.ToVideoSource();
            VideoSource.Input1.ToMacroInput();

            // TODO - refactor CompileData into this package
            _cachedSpec = new Lazy<MacroSpec>(() => SpecGenerator.CompileData(store.Profile));
        }
        
        // GET api/values
        [HttpGet]
        public MacroSpec Get() => _cachedSpec.Value;
    }
}