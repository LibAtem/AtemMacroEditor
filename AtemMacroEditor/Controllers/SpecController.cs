using System;
using AtemMacroEditor.Generator;
using LibAtem.Common;
using LibAtem.XmlState;
using Microsoft.AspNetCore.Mvc;

namespace AtemMacroEditor.Controllers
{
    [Route("api/[controller]")]
    [Produces("application/xml")]
    public class SpecController : Controller
    {
        private static readonly Lazy<XmlSpec> cachedSpec;

        static SpecController()
        {
            // Force the assembly to be loaded
            MacroInput.Camera1.ToVideoSource();
            VideoSource.Input1.ToMacroInput();

            // TODO - refactor CompileData into this package
            cachedSpec = new Lazy<XmlSpec>(Generator.Program.CompileData);
        }

        // GET api/values
        [HttpGet]
        public XmlSpec Get() => cachedSpec.Value;
    }
}