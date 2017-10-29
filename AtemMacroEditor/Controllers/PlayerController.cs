using System;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AtemMacroEditor.Controllers
{
    [Route("api/[controller]")]
    [Produces("application/xml")]
    public class PlayerController : Controller
    {
        private readonly AtemMacroStore _store;

        public PlayerController(AtemMacroStore store)
        {
            _store = store;
        }

        //        // GET api/macros
        //        [HttpGet]
        //        public MacroPropertiesList Get() => _store.GetMacros();
        //
        //        // GET api/macros/5
        //        [HttpGet("{id}")]
        //        public IActionResult Get(uint id)
        //        {
        //            try
        //            {
        //                Macro macro = _store.GetMacro(id);
        //                if (macro == null)
        //                    return NotFound();
        //
        //                return Ok(macro);
        //            }
        //            catch (Exception)
        //            {
        //                return StatusCode(StatusCodes.Status500InternalServerError);
        //            }
        //        }
        //
        //        // POST api/macros/5
        //        [HttpPost("{id}")]
        //        public IActionResult Post(uint id, [FromBody]Macro macro)
        //        {
        //            try
        //            {
        //                if (_store.UpdateMacro(id, macro))
        //                    return Ok();
        //
        //                return StatusCode(StatusCodes.Status500InternalServerError);
        //            }
        //            catch (Exception)
        //            {
        //                return StatusCode(StatusCodes.Status500InternalServerError);
        //            }
        //        }

        // POST api/player/run/{id}
        [HttpPost("run/{id}")]
        public IActionResult Run(uint id)
        {
            try
            {
                _store.RunMacro(id);
                return Ok();
            }
            catch (Exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        // POST api/player/stop
        [HttpPost("stop")]
        public IActionResult Stop()
        {
            try
            {
                _store.StopMacro();
                return Ok();
            }
            catch (Exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        // POST api/player/loop/(1|0)
        [HttpPost("loop/{loop}")]
        public IActionResult Loop(uint loop)
        {
            try
            {
                _store.SetLooping(loop != 0);
                return Ok();
            }
            catch (Exception)
            {
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

    }
}