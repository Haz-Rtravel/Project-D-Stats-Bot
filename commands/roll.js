const { SlashCommandBuilder, codeBlock, CommandInteractionOptionResolver } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js')

function roll_result(command, args, author, data) {

    console.log('===================')
    console.log(command)
    console.log(args)
    console.log(author)
    console.log(data)
    console.log('===================')
        
    const roll_result = new MessageEmbed()
        .setTitle('주사위를 굴립니다...')
        .setColor(0x6FA8DC)
        // .setAuthor(`${author.nickname}`)
        .setDescription(`주사위 결과입니다.`)
        .addField('Inline field title', 'Some value here', true)
        .setTimestamp()
        // .setFooter('')
    return roll_result;

}

module.exports = {
    
	data: new SlashCommandBuilder()
		.setName('roll')
		.setDescription('주사위를 굴립니다.')
        .addStringOption(option =>
            option.setName('주사위')
                .setDescription('주사위의 개수, 주사위의 최대값 (예시: 1d6은 1개의 주사위, 최대 눈금 6입니다.)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('확률')
                .setDescription('TRPG COC의 룰을 따르는 성공 판정을 실시할 값입니다. 주사위가 1d6 일 때에만 작동합니다. 필수 입력이 아닙니다. ')),
	async execute(interaction) {
        const dice = interaction.options.getString('주사위');
        const chance = interaction.options.getString('확률')
        console.log(dice)

        var result_array = []

        try {
            
            var total = 0
            var rollarray = dice.split("d");

            for (var i = 0; i < rollarray[0]; i++) {
                const randomNum = Math.random() * (parseInt(rollarray[1])+1)
                const roll = Math.floor(randomNum)
                const result = roll == 0 ? 1 : roll
                const number_of_roll = (i+1) + `번째 주사위`

                console.log(number_of_roll + " " + result)
                total = total + result
                result_array.push({name: number_of_roll, value: result.toString(), inline: true})

                if (i == (rollarray[0]-1)) {
                    result_array.push({name: `주사위 총합`, value: total.toString()})

                    if (rollarray[0] == 1 && rollarray[1] == 100 && chance != null) {
                        
                        if (total < parseInt(chance)) {

                            var great_success = parseInt(chance) / 5
                            var good_success = parseInt(chance) / 2

                            if (total == 1) {
                                result_array.push({name: `판정`, value: `대성공!`})
                            } else if (total < great_success) {
                                result_array.push({name: `판정`, value: `극단적 성공!`})
                            } else if (total < good_success) {
                                result_array.push({name: `판정`, value: `어려운 성공!`})
                            } else {
                                result_array.push({name: `판정`, value: `성공!`})
                            }

                        } else {

                            if (total == 100 && parseInt(chance) >= 50) {
                                result_array.push({name: `판정`, value: `대실패`})
                            } else if (total > 96) {
                                result_array.push({name: `판정`, value: `대실패`})
                            } else {
                                result_array.push({name: `판정`, value: `실패`})
                            }

                        }
                        
                    }
                }
            }

            console.log(result_array)
            const embed = new MessageEmbed()
                                .setTitle('주사위를 굴립니다...')
                                .setColor(0x6FA8DC)
                                .setDescription(`주사위 결과입니다.`)
                                .addFields(result_array)
                                .setTimestamp()
                                // .setFooter('');
            await interaction.reply({ embeds: [ embed ] });

            // await interaction.reply(roll_result('a', 'a', `누군가`, result_array))
        }
        
        catch(err) {
            console.log(err)
            await interaction.reply(`오류가 발생했습니다. 입력값을 검토하거나, 관리자를 호출해주세요. / 입력값: ${dice}, ${chance}`)
        }
        
		// await interaction.reply(`입력값: ${dice}, ${chance} / 결과값: ${result_array}`)
	},
};