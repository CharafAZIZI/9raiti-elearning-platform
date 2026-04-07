using Microsoft.AspNetCore.Mvc;
using Réclamation.DTOs;
using Réclamation.Services;
using System.Collections.Generic;

namespace Réclamation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReclamationController : ControllerBase
    {
        private readonly IReclamationService _service;

        public ReclamationController(IReclamationService service)
        {
            _service = service;
        }

        [HttpPost]
        public IActionResult Create([FromBody] ReclamationDto dto)
        {
            var result = _service.Create(dto);
            return CreatedAtAction(nameof(Create), new { id = result.Email }, result);
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            var results = _service.GetAll();
            return Ok(results);
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            _service.Delete(id);
            return NoContent();
        }
    }
}