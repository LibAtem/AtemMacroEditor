using System;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Serialization;
using AtemMacroEditor.Results;
using LibAtem.DeviceProfile;
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
        // Note using FromBody does not work here. An exception is thrown for an enum parsing that should not be being referenced
        [HttpPost("{id}")]
        public async Task<IActionResult> Post(uint id)//, [FromBody]Macro macro)
        {
            try
            {
                using (StreamReader reader = new StreamReader(Request.Body, Encoding.UTF8))
                {
                string str = await reader.ReadToEndAsync();
                    Macro macro;
                    XmlSerializer serializer = new XmlSerializer(typeof(Macro));
                    using (var tx = new StringReader(str))
                        macro = (Macro)serializer.Deserialize(tx);

                    if (_store.UpdateMacro(id, macro))
                        return Ok();

                    return StatusCode(StatusCodes.Status500InternalServerError);
                }
            }
            catch (Exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        // DELETE api/macros/5
        [HttpDelete("{id}")]
        public void Delete(uint id)
        {
            _store.DeleteMacro(id);
        }
    }
}
