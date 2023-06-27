const { Telegraf, Markup } = require('telegraf');
const fs = require('fs');

const bot = new Telegraf('bot_token');
const ADMIN_USER_ID = 'id';

let services = JSON.parse(fs.readFileSync('services.json')).services;
let logs = fs.readFileSync('log.txt').toString().split('\n').slice(-10).join('\n');

bot.start((ctx) => {
  if (ctx.from.id.toString() === ADMIN_USER_ID) {
    ctx.reply("Hello admin!", Markup.inlineKeyboard([
      Markup.button.callback('🌐 Services', 'services')
    ]));
  } else {
    ctx.reply("u're not admin");
  }
});

bot.action('services', (ctx) => {
  ctx.editMessageText("**📍 Services**\n\n Use the buttons below to see the available and active services.", Markup.inlineKeyboard([
    Markup.button.callback('📍 All Services', 'all'),
    Markup.button.callback('📍 Active Services', 'active')
  ]));
});

bot.action('all', (ctx) => {
  let buttons = services.map((service, index) => {
    return [Markup.button.callback(service.serviceName, `service_${index}`)];
  });
  buttons.push([Markup.button.callback('🔙 Back', 'services')]);

  ctx.editMessageText("Services:", Markup.inlineKeyboard(buttons));
});

bot.action(/service_(.+)/, (ctx) => {
  let index = parseInt(ctx.match[1]);
  let service = services[index];
  let status = service.serviceStatus ? "open ✅" : "close ❌";

  ctx.editMessageText(`${service.serviceName}\n**Status:** ${status}\n\n**📃 Log:**\n\`\`\`${logs}\`\`\``, Markup.inlineKeyboard([
    Markup.button.callback('🔄 Change', `toggle_${index}`),
    Markup.button.callback('🔙 Back', 'all')
  ]));
});

bot.action(/toggle_(.+)/, (ctx) => {
  let index = parseInt(ctx.match[1]);
  services[index].serviceStatus = !services[index].serviceStatus;
  fs.writeFileSync('services.json', JSON.stringify({services: services}));
  logs = fs.readFileSync('log.txt').toString().split('\n').slice(-10).join('\n');
  
  let service = services[index];
  let status = service.serviceStatus ? "open ✅" : "close ❌";

  ctx.editMessageText(`${service.serviceName}\n**Status:** ${status}\n\n**📃 Log:**\n\`\`\`${logs}\`\`\``, Markup.inlineKeyboard([
    Markup.button.callback('🔄 Change', `toggle_${index}`),
    Markup.button.callback('🔙 Back', 'all`all')
  ]));
});

bot.action('active', (ctx) => {
  let activeServices = services.filter(service => service.serviceStatus);
  let messageText = activeServices.map(service => `• ${service.serviceName}`).join('\n');

  ctx.editMessageText(messageText, Markup.inlineKeyboard([
    Markup.button.callback('🔙 Back', 'services')
  ]));
});

bot.launch();
          
