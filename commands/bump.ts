import move from "array-move";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { bot } from "../index";
import { i18n } from "../utils/i18n";
import { canModifyQueue } from "../utils/queue";

export default {
  data: new SlashCommandBuilder()
    .setName("bump")
    .setDescription(i18n.__("bump.description"))
    .addIntegerOption((option) =>
      option.setName("bumpfrom").setDescription(i18n.__("bump.args.bumpfrom")).setRequired(true)
    ),
  execute(interaction: ChatInputCommandInteraction) {
    const bumpfromArg = interaction.options.getInteger("bumpfrom");

    const guildMemer = interaction.guild!.members.cache.get(interaction.user.id);
    const queue = bot.queues.get(interaction.guild!.id);

    if (!queue) return interaction.reply(i18n.__("bump.errorNotQueue")).catch(console.error);

    if (!canModifyQueue(guildMemer!)) return;

    if (!bumpfromArg)
      return interaction.reply({ content: i18n.__mf("bump.usagesReply", { prefix: bot.prefix }), ephemeral: true });

    if (isNaN(bumpfromArg) || bumpfromArg == 1)
      return interaction.reply({ content: i18n.__mf("bump.usagesReply", { prefix: bot.prefix }), ephemeral: true });

    let song = queue.songs[bumpfromArg - 1];

    queue.songs = move(queue.songs, bumpfromArg - 1, 1);

    interaction.reply({
      content: i18n.__mf("bump.result", {
        author: interaction.user.id,
        title: song.title,
        index: 1
      })
    });
  }
};
