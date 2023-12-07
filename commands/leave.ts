import { i18n } from "../utils/i18n";
import { canModifyQueue } from "../utils/queue";
import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { bot } from "../index";
const voice = require('@discordjs/voice');

export default {
    data: new SlashCommandBuilder().setName("leave").setDescription(i18n.__("leave.description")),
  async execute(interaction: CommandInteraction) {
    const queue = bot.queues.get(interaction.guild!.id);
    const guildMemer = interaction.guild!.members.cache.get(interaction.user.id);

    if (!guildMemer || !canModifyQueue(guildMemer)) return i18n.__("common.errorNotChannel");

    if(queue){
      queue.stop()
    }
    interaction.reply({ content: i18n.__mf("stop.result", { author: interaction.user.id }) }).catch(console.error);
    return voice.getVoiceConnection(interaction.guild!.id).disconnect();
  }
};