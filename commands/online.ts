import { CommandInteraction, EmbedBuilder, SlashCommandBuilder, MessageReaction, User } from "discord.js";
import { i18n } from "../utils/i18n";
import axios from 'axios'
import * as fs from 'fs'
const staffFile = fs.readFileSync('./staff.json', 'utf8')
export default {
    data: new SlashCommandBuilder().setName("online").setDescription(i18n.__("online.description")),
    async execute(interaction: CommandInteraction) {
        async function getTime(now: number){
            const ms = now % 1000;
            now = (now - ms) / 1000;
            const sec = now % 60;
            now = (now - sec) / 60;
            const min = now % 60;
            now = (now - min) / 60;
            const hour = Math.floor(now)
            return `${hour}h ${min}m`;
        }
        let vhhk: string | any[] = []
        await axios.get('https://api.vatsim.net/api/facilities/')
        .then(function (response) {
            vhhk = response.data.filter((c: { callsign: string; }) => c.callsign.startsWith('VHHH') || c.callsign.startsWith('HKG') || c.callsign.startsWith('VHHX') || c.callsign.startsWith('VMMC') || c.callsign.startsWith('VHSK'))
        })
        .catch(function (error) {
            console.log(error);
        })
        if(vhhk.length == 0) return interaction.reply('There are no online HKvACC Controllers at the moment.')
        else{
            let iStart = 0
            let iCount = iStart + 1
            let fieldArray = []
            for(let i = (iStart * 10); i < vhhk.length && i < (iCount * 10); i++){
                let date = new Date(vhhk[i].start)
                let time = await getTime(Date.now() - (date.valueOf() - (date.getTimezoneOffset() * 60000)))
                let controller: any = interaction.guild!.members.cache.find(u => u.displayName.replace(/[^0-Z\s]/gmi, "").endsWith(vhhk[i].id))
                if(controller == undefined){
                    const staffs = JSON.parse(staffFile)
                    let staff = staffs.filter((s: { CID: any; }) => s.CID == vhhk[i].id)
                    controller = interaction.guild!.members.cache.find(u => u.displayName.replace(/[^0-Z\s]/gmi, "").endsWith(staff[0].position))
                }
                if(controller == undefined) controller = {id: vhhk[i].id}
                fieldArray.push({
                    name: vhhk[i].callsign,
                    value: `Controller: <@${controller.id}>\nTime Online: ${time}`
                })
            }
            let embed = new EmbedBuilder()
                .setColor("#e0610e")
                .setTitle(`Online HKvACC Controllers`)
                .setFields(fieldArray)
                .setTimestamp(Date.now())
            if(vhhk.length < (iCount * 10)) return interaction.reply({ embeds: [embed] });
            else{
                await interaction.reply({ embeds: [embed] });
                const embedMessage = await interaction.fetchReply()
                await embedMessage.react('⬅️')
                await embedMessage.react('➡️')
                const filter = (reaction: MessageReaction, user: User) =>
                    ["⬅️", "➡️"].includes(reaction.emoji.name!) && interaction.user.id === user.id;
                const collector = embedMessage.createReactionCollector({ filter, time: 60000 });
                collector.on('collect', async (reaction, user) => {
                    if(reaction.emoji.name === '⬅️' && iStart > 0){
                        iStart = iStart - 1
                        iCount = iCount - 1
                        fieldArray = []
                        for(let i = (iStart * 10); i < vhhk.length && i < (iCount * 10); i++){
                            let date = new Date(vhhk[i].start)
                            let time = await getTime(Date.now() - (date.valueOf() - (date.getTimezoneOffset() * 60000)))
                            let controller: any = interaction.guild!.members.cache.find(u => u.displayName.replace(/[^0-Z\s]/gmi, "").endsWith(vhhk[i].id))
                            if(controller == undefined){
                                const staffs = JSON.parse(staffFile)
                                let staff = staffs.filter((s: { CID: any; }) => s.CID == vhhk[i].id)
                                controller = interaction.guild!.members.cache.find(u => u.displayName.replace(/[^0-Z\s]/gmi, "").endsWith(staff[0].position))
                            }
                            if(controller == undefined) controller = {id: vhhk[i].id}
                            fieldArray.push({
                                name: vhhk[i].callsign,
                                value: `Controller: <@${controller.id}>\nTime Online: ${time}`
                            })
                        }
                        embed = new EmbedBuilder()
                            .setColor("#e0610e")
                            .setTitle(`Online HKvACC Controllers`)
                            .setFields(fieldArray)
                            .setTimestamp(Date.now())
                        await embedMessage.edit({ embeds: [embed]})
                    }
                    else if(reaction.emoji.name === '➡️' && (iStart + 1) * 10 < vhhk.length){
                        iStart = iStart + 1
                        iCount = iCount + 1
                        fieldArray = []
                        for(let i = (iStart * 10); i < vhhk.length && i < (iCount * 10); i++){
                            let date = new Date(vhhk[i].start)
                            let time = await getTime(Date.now() - (date.valueOf() - (date.getTimezoneOffset() * 60000)))
                            let controller: any = interaction.guild!.members.cache.find(u => u.displayName.replace(/[^0-Z\s]/gmi, "").endsWith(vhhk[i].id))
                            if(controller == undefined){
                                const staffs = JSON.parse(staffFile)
                                let staff = staffs.filter((s: { CID: any; }) => s.CID == vhhk[i].id)
                                controller = interaction.guild!.members.cache.find(u => u.displayName.replace(/[^0-Z\s]/gmi, "").endsWith(staff[0].position))
                            }
                            if(controller == undefined) controller = {id: vhhk[i].id}
                            fieldArray.push({
                                name: vhhk[i].callsign,
                                value: `Controller: <@${controller.id}>\nTime Online: ${time}`
                            })
                        }
                        embed = new EmbedBuilder()
                                .setColor("#e0610e")
                                .setTitle(`Online HKvACC Controllers`)
                                .setFields(fieldArray)
                                .setTimestamp(Date.now())
                        await embedMessage.edit({ embeds: [embed]})
                    }
                });
                return
            }
        }
    }
}