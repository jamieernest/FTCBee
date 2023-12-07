import { ChatInputCommandInteraction, SlashCommandBuilder, TextChannel } from "discord.js";
import { i18n } from "../utils/i18n";
import * as fs from 'fs'
import { bot } from "../index";
const suggestionsFile = fs.readFileSync('./suggestions.json', 'utf8')

export default {
  data: new SlashCommandBuilder().setName("suggest")
    .setDescription(i18n.__("suggest.description"))
    .addStringOption((option) => option.setName("suggestion").setDescription("What you would like to suggest").setRequired(true)),
  cooldown: 10,
  async execute(interaction: ChatInputCommandInteraction) {
    if(interaction.channelId != "1182343426780438588") return interaction.reply({ content: "This command can only be used in the suggestions channel.", ephemeral: true });
    let suggestions = await JSON.parse(suggestionsFile)
    await suggestions.push({
        id: suggestions.length + 1,
        user: interaction.user.id,
        suggestion: interaction.options.getString("suggestion"),
        status: 0 // 0 = pending, 1 = done, 2 = approved, 3 = considered, 4 = denied
    });
    fs.writeFile('suggestions.json', JSON.stringify(suggestions), 'utf8', () => {});
    await (bot.client.channels.cache.get("1182372749402980393") as TextChannel)!.send({ content: `**${interaction.user.tag}** suggested: ${interaction.options.getString("suggestion")}\nID: ${suggestions.length}` });
    interaction
      .reply({ content: `Suggestion: ${interaction.options.getString("suggestion")}\nThe staff have recieved your suggestion, please be patient as they discuss and they will respond ASAP. Your ID is \`${suggestions.length}\``, ephemeral: false })
      .catch(console.error);
  }
};
