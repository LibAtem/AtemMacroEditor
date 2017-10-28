using System;
using AtemMacroEditor.Results;
using LibAtem.XmlState;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AtemMacroEditor.Controllers
{
    [Route("api/[controller]")]
    [Produces("application/xml")]
    public class MacrosController : Controller
    {
        private readonly AtemMacroStore _store;

        public MacrosController(AtemMacroStore store)
        {
            _store = store;
        }

        // GET api/macros
        [HttpGet]
        public MacroPropertiesList Get() => _store.GetMacros();

        // GET api/macros/5
        [HttpGet("{id}")]
        public IActionResult Get(uint id)
        {
            try
            {
                Macro macro = _store.GetMacro(id);
                if (macro == null)
                    return NotFound();

                return Ok(macro);
            }
            catch (Exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        // POST api/macros/5
        [HttpPost("{id}")]
        public IActionResult Post(uint id, [FromBody]Macro macro)
        {
            try
            {
                if (_store.UpdateMacro(id, macro))
                    return Ok();

                return StatusCode(StatusCodes.Status500InternalServerError);
            }
            catch (Exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        //        // DELETE api/macros/5
        //        [HttpDelete("{id}")]
        //        public void Delete(int id)
        //        {
        //        }
    }
}
