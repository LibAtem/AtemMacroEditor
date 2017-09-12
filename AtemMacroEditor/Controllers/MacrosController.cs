﻿using System;
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