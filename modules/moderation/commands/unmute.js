const {embedType} = require('../../../src/functions/helpers');
const {confDir} = require('./../../../main');
const {moderationAction} = require('../moderationActions');

module.exports.run = async function (client, msg, args) {
    const moduleConfig = require(`${confDir}/moderation/config.json`);
    const moduleStrings = require(`${confDir}/moderation/strings.json`);
    const message = await msg.channel.send('One sec...');
    if (!msg.member.roles.cache.find(r => moduleConfig['moderator-roles_level2'].includes(r.id) || moduleConfig['moderator-roles_level3'].includes(r.id) || moduleConfig['moderator-roles_level4'].includes(r.id))) return message.edit(message.edit(...embedType(moduleStrings['no_permissions'], {
        '%required_level%': 2
    })));
    let user;
    if (msg.mentions.members.first()) user = msg.mentions.members.first();
    else user = await msg.guild.members.fetch(args[0]).catch(() => {
        return message.edit(...embedType(moduleStrings['user_not_found']));
    });
    if (!user) return message.edit(...embedType(moduleStrings['user_not_found']));
    let reason = '';
    await args.shift(); // Removing tag/userid from arguments
    args.forEach(a => {
        reason = reason + ' ' + a;
    });
    if (reason.length === 0 && moduleConfig['require_reason']) return message.edit(...embedType(moduleStrings['missing_reason']));
    moderationAction(client, 'unmute', msg.member, user, reason).then(m => {
        if (m) {
            message.edit(`Done. Case-ID: #${m.actionID}`);
        } else message.edit('An error occurred');
    });
};

module.exports.help = {
    'name': 'unmute',
    'description': 'Unmutes an member',
    'module': 'moderation',
    'aliases': ['unmute']
};
module.exports.config = {
    'restricted': false,
    'args': true
};