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