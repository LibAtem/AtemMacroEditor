using System;
using System.IO;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;

namespace AtemMacroEditor
{
    public class Startup
    {
        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            Config.Config config = JsonConvert.DeserializeObject<Config.Config>(File.ReadAllText("config.json"));

            services.AddSingleton(new AtemMacroStore(config.AtemAddress));

            services.AddMvc()
                // TODO dont include namespace in serialize
                .AddXmlSerializerFormatters();
            services.AddCors(options =>
            {
                options.AddPolicy("AllowAllOrigins",
                    builder =>
                    {
                        builder.AllowAnyMethod().AllowAnyHeader().AllowAnyOrigin();
                    });
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            var webSocketOptions = new WebSocketOptions()
            {
                KeepAliveInterval = TimeSpan.FromSeconds(10),
                ReceiveBufferSize = 4 * 1024
            };
            app.UseWebSockets(webSocketOptions);
            app.UseMiddleware<WebsocketMiddleware>();

            app.UseMvc();
            app.UseCors("AllowAllOrigins");
            app.UseDefaultFiles();
            app.UseStaticFiles();
        }
    }
}
