using System.Threading.Tasks;
using LibAtem.XmlState;
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
        public Task<Macro> Get(uint id) => _store.GetMacro(id);

        //
        //        // POST api/values
        //        [HttpPost]
        //        public void Post([FromBody]string value)
        //        {
        //        }
        //
        //        // PUT api/values/5
        //        [HttpPut("{id}")]
        //        public void Put(int id, [FromBody]string value)
        //        {
        //        }
        //
        //        // DELETE api/values/5
        //        [HttpDelete("{id}")]
        //        public void Delete(int id)
        //        {
        //        }
    }
}
