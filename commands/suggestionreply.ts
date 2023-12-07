import { ChatInputCommandInteraction, GuildMemberRoleManager, SlashCommandBuilder, TextChannel, EmbedBuilder, GuildMember} from "discord.js";
import { i18n } from "../utils/i18n";
import * as fs from 'fs'
import { bot } from "../index";
const suggestionsFile = fs.readFileSync('./suggestions.json', 'utf8')

export default {
  data: new SlashCommandBuilder().setName("suggestionreply")
    .setDescription(i18n.__("suggestionreply.description"))
    .addIntegerOption((option) => option.setName("id").setDescription("The ID of the suggestion").setRequired(true))
    .addStringOption((option) => option.setName("response").setDescription("What is the response (done[1], approved[2], considered[3], rejected[4])").setRequired(true))
    .addStringOption((option) => option.setName("comment").setDescription("What is the comment").setRequired(true)),
  cooldown: 10,
  async execute(interaction: ChatInputCommandInteraction) {
    if(!(interaction.member?.roles as GuildMemberRoleManager).cache.has("1179799997340975134")) return interaction.reply({ content: "This command can only be used by staff.", ephemeral: true });
    let suggestions = await JSON.parse(suggestionsFile)
    let suggestion = await suggestions.find((suggestion: any) => suggestion.id == interaction.options.getInteger("id"))
    if(!suggestion) return interaction.reply({ content: "That suggestion does not exist.", ephemeral: true });

    if(interaction.options.getString("response") == "done" || interaction.options.getString("response") == "1") suggestion.status = 1
    else if(interaction.options.getString("response") == "approved" || interaction.options.getString("response") == "2") suggestion.status = 2
    else if(interaction.options.getString("response") == "considered" || interaction.options.getString("response") == "3") suggestion.status = 3
    else if(interaction.options.getString("response") == "rejected" || interaction.options.getString("response") == "4") suggestion.status = 4
    else return interaction.reply({ content: "That is not a valid response.", ephemeral: true });

    fs.writeFile('suggestions.json', JSON.stringify(suggestions), 'utf8', () => {});

    let embedColor;
    let embedTitle;

    if(suggestion.status == 1){
        embedColor = 0x00ff00
        embedTitle = `Suggestion ${suggestion.id} completed.`
    }
    else if(suggestion.status == 2){
        embedColor = 0xffff00
        embedTitle = `Suggestion ${suggestion.id} approved.`
    }
    else if(suggestion.status == 3){
        embedColor = 0xff8800
        embedTitle = `Suggestion ${suggestion.id} considered.`
    }
    else if(suggestion.status == 4){
        embedColor = 0xff0000
        embedTitle = `Suggestion ${suggestion.id} denied.`
    }

    const replyEmbed = new EmbedBuilder()
	.setColor(embedColor? embedColor : 0x00ff00)
	.setTitle(embedTitle? embedTitle : `Suggestion ${suggestion.id}`)
	.setAuthor({ name: (interaction.guild?.members.cache.get(suggestion.user) as GuildMember).displayName as string, iconURL: (interaction.guild?.members.cache.get(suggestion.user) as GuildMember).user.avatarURL() as string })
	.setDescription(suggestion.suggestion)
	.addFields(
		{ name: `Response from ${(interaction.member as GuildMember).displayName}`, value: `${interaction.options.getString("comment")}`}
	)
	.setTimestamp()

    await (bot.client.channels.cache.get("1182343426780438588") as TextChannel)!.send({ embeds: [replyEmbed] });
    
    interaction
      .reply({ content: `Suggestion: ${suggestion.id} responded to.`, ephemeral: false })
      .catch(console.error);
    }
};
