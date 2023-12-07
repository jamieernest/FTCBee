import { i18n } from "../utils/i18n";
const { exec } = require('child_process');
import { CommandInteraction, SlashCommandBuilder, PermissionsBitField  } from "discord.js";
import * as fs from 'fs'
const restartFile = fs.readFileSync('./restarts.json', 'utf8')

export default {
    data: new SlashCommandBuilder().setName("restart").setDescription(i18n.__("restart.description")),
    async execute (interaction: CommandInteraction) {
        if(!interaction.memberPermissions?.has(PermissionsBitField.Flags.ManageMessages) && interaction.user.id != '276584774171230211') return
        let restarts = JSON.parse(restartFile)
        restarts.push({
            user: interaction.user.id,
            channel: interaction.channelId
        })
        fs.writeFile('myjsonfile.json', JSON.stringify(restarts), 'utf8', () => {});
        interaction.reply('Restarting...')
        exec('pm2 restart HKVACC', (err: any, stdout: any, stderr: any) => {
            if (err) {
              console.error(err)
              return interaction.editReply('<@276584774171230211> theres an error')
            }
        });
    }
}