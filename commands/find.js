const { SlashCommandBuilder, codeBlock, CommandInteractionOptionResolver } = require('@discordjs/builders');
const { MessageEmbed, User, MessageActionRow, MessageButton } = require('discord.js')
const fetch = require("node-fetch");

async function findID(username) {
    console.log("FINDID =======================")
    var search_url = `https://barracks.d.nexon.com/api/Search/GetSearchRead/` + username
    try {
        const postResponse = await fetch(search_url, {
            method: "POST",
            headers : {"Content-Type" : "application/json"},
        })
        const post = await postResponse.json();
    
        const data = post.nickname_list
        const usercode = data[0].usn

        return usercode
    } catch (error) {
        return 0
    }
}

async function GetUserData(usercode) {

    console.log("GETUSERDATA =======================")
    if (usercode != 0) {
        var search_url = `https://barracks.d.nexon.com/api/Profile/GetGameProfile/` + usercode

        const postResponse = await fetch(search_url, {
            method: "POST",
            headers : {"Content-Type" : "application/json"},
        })

        const post = await postResponse.json();
        
        var userdatatotal = [usercode, post]
        console.log(userdatatotal)
        return userdatatotal
    } else {
        return 0
    }

    

    // console.log(usercode)
}

async function GetUserSeasonRecord(userdata, season) {

    console.log("GETUSERSEASONRECORD =======================")
    if (userdata != 0) {

        var usercode = userdata[0]
        var userprofile = userdata[1]
        var seasoncode = 202202

        if (season != null) {
            switch (season) {
                case "ALPHA":
                    seasoncode = 1
                    break;
                case "202202":
                    seasoncode = 202202
                    break;
            }
        }

        var search_url = `https://barracks.d.nexon.com/api/Record/GetSeasonRecord/` + seasoncode + `/` + usercode

        const postResponse = await fetch(search_url, {
            method: "POST",
            headers : {"Content-Type" : "application/json"},
        })

        const post = await postResponse.json();
        console.log(post)

        var userdatatotal = [usercode, userprofile, post]

        return userdatatotal
    } else {
        return 0
    }

    

    // console.log(usercode)
}

async function ResultReport(username, SEASON) {
    console.log("RESULTREPORT =======================")
    var result = await findID(username)
    .then((usercode) => GetUserData(usercode)
        .then(data => GetUserSeasonRecord(data, SEASON).then(
            TotalData => {return TotalData}
        )))
    return result
}

module.exports = {
    
	data: new SlashCommandBuilder()
		.setName('find')
		.setDescription('???????????? D ?????? ???????????? ???????????????.')
        .addStringOption(option =>
            option.setName('?????????')
                .setDescription('??????????????? ?????? ????????? ???????????? ???????????????. ????????? ???????????? ?????????.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('??????')
                .setDescription('??????????????? ????????? ????????? ???????????????. ???????????? ???????????? ?????? ????????? ???????????????.')
                .addChoice('2021??? ??????', 'ALPHA')
                .addChoice('2022??? 2??? ~ 4???', '202202')),
	async execute(interaction) {
        const SearchName = interaction.options.getString('?????????');
        const SeasonName = interaction.options.getString('??????');
        console.log("?????? ??????========================")
        console.log(SearchName)
        console.log(SeasonName)
        console.log("?????? ??????========================")

        
        
        var user_code = null

        // console.log(search_url)

        var result_array = []
        var Total_Text = `?????? ????????? ?????????????????? ??????????????????.`

        try {

            // var UserCode = await findID(SearchName)
            ResultReport(SearchName, SeasonName).then(value => {
                console.log("RESULT ==========================")
                console.log(value)

                if (value != 0) {

                    // value[0] = user serial number
                    // value[1] = from GetUserData()
                    // value[2] = from GetUserSeasonRecord()

                    var USERINFO = value[1].userInfo
                    var RANKING = value[1].ranking
                    var PROFILE_IMAGE = value[1].profile_image
                    var SEASON_RECORD = value[1].seasonRecord
                    var CHANNEL_LIST = value[1].channel_list
                    
                    var COMBAT_RECORD = value[2]

                    var PLAYTIME = COMBAT_RECORD.play_time.day + `??? ` + COMBAT_RECORD.play_time.hour + `?????? ` + COMBAT_RECORD.play_time.minute + `???`
                    console.log(USERINFO)

                    

                    const row = new MessageActionRow()
                            .addComponents(
                                new MessageButton()
                                    .setCustomId('button1')
                                    .setLabel('Primary')
                                    .setStyle('PRIMARY'),
                                new MessageButton()
                                    .setCustomId('button2')
                                    .setLabel('Secondary')
                                    .setStyle('SECONDARY'),
                                new MessageButton()
                                    .setCustomId('button3')
                                    .setLabel('Success')
                                    .setStyle('SUCCESS'),
                                new MessageButton()
                                    .setCustomId('button4')
                                    .setLabel('Danger')
                                    .setStyle('DANGER')
                            )

                    const Embed_Report_1 = new MessageEmbed()
                        .setColor('#ED4313')
                        .setTitle(USERINFO.nickname + `?????? ?????? ?????????`)
                        .setThumbnail(PROFILE_IMAGE)
                        .setURL(`https://barracks.d.nexon.com/` + USERINFO.usn)
                        .setDescription(`????????? ????????? ?????? ????????? ????????? ???????????????. \n ????????? ????????? ??? ?????? ???????????????.`)
                        .addFields(
                            // { name: 'Regular field title', value: 'Some value here' },
                            // { name: '\u200B', value: '\u200B' },
                            { name: '?????????', value: USERINFO.nickname, inline: true },
                            { name: '??????', value: (USERINFO.clan_name == '' ? `?????? ??????` : USERINFO.clan_name), inline: true },
                            // { name: '\u200B', value: '\u200B' },
                            { name: '??????', value: RANKING, inline: true },
                            // { name: '????????????', value: SEASON_RECORD.damage_rate, inline: true 
                        )
                        .addFields(
                            { name: '??????', value: SEASON_RECORD.win_rate, inline: true },
                            { name: 'K/D', value: SEASON_RECORD.kd, inline: true },
                        )
                        .addFields(
                            { name: '\u200B', value: '\u200B', inline: true },
                            { name: '?????? ?????????', value: SEASON_RECORD.exp, inline: true },
                            { name: '????????? ??????', value: PLAYTIME, inline: true },
                        )

                    var SeasonFullName = `2022??? 2??? ~ 4??? ??????`
                    if (SeasonName != null) {
                        switch (SeasonName) {
                            case "ALPHA":
                                SeasonFullName = `2021??? ?????? ??????`
                                break;
                            case "202202":
                                SeasonFullName = `2022??? 2??? ~ 4??? ??????`
                                break;
                        }
                    }

                    const Embed_Report_2 = new MessageEmbed()
                        .setColor('#ED4313')
                        .setTitle(USERINFO.nickname + `?????? ` + SeasonFullName + ` ?????? ??????`)
                        .setURL(`https://barracks.d.nexon.com/` + USERINFO.usn + `/combat`)
                        .setThumbnail(PROFILE_IMAGE)
                        .addFields(
                            // { name: 'Regular field title', value: 'Some value here' },
                            // { name: '\u200B', value: '\u200B' },
                            { name: '?????? ??????', value: COMBAT_RECORD.match_cnt, inline: true },
                            { name: '??????', value: COMBAT_RECORD.win, inline: true },
                            { name: '??????', value: COMBAT_RECORD.lose, inline: true },
                            { name: '?????? ??????', value: COMBAT_RECORD.damage_enemy, inline: true },
                            { name: '?????? ??????', value: COMBAT_RECORD.damage, inline: true },
                            { name: '????????????', value: SEASON_RECORD.damage_rate, inline: true },
                        )
                        .addFields(
                            // { name: 'Regular field title', value: 'Some value here' },
                            // { name: '\u200B', value: '\u200B' },
                            { name: 'K/R', value: COMBAT_RECORD.r_kill, inline: true },
                            { name: 'D/R', value: COMBAT_RECORD.r_death, inline: true },
                            { name: 'A/R', value: COMBAT_RECORD.r_assist, inline: true },
                            
                        )
                        .addFields(
                            { name: '?????? ??????', value: COMBAT_RECORD.r_coin_get, inline: true },
                            { name: '?????? ??????', value: COMBAT_RECORD.r_coin_use, inline: true },
                            { name: '??????', value: COMBAT_RECORD.r_funding, inline: true },
                        )
                        // .addField('Inline field title', 'Some value here', true)
                        // .setImage('https://i.imgur.com/AfFp7pu.png')
                        // .setTimestamp()
                        // .setFooter({ text: 'Some footer text here', iconURL: 'https://i.imgur.com/AfFp7pu.png' });

                    interaction.reply({ embeds: [ Embed_Report_1 ] }).then(() => interaction.followUp({ embeds: [ Embed_Report_2 ] }))
                    
                    // interaction.reply({ embeds: [ exampleEmbed ] })

                    
                } else {

                    const Embed_Error = new MessageEmbed()
                        .setColor('#ED4313')
                        .setTitle(SearchName + ` ?????? ?????? ???????????? ?????? ??? ???????????????.`)
                        // .setURL(`https://barracks.d.nexon.com/` + USERINFO.usn)
                        .setDescription(`????????? ????????? ???????????? ???????????? ??????????????????.`)

                    interaction.reply({embeds: [ Embed_Error]})
                }

                
                console.log("RESULT ==========================")  
            })
            
            
            

            


            

            // console.log(result_array)

            
            // const embed = new MessageEmbed()
            //                     .setTitle('???????????? ????????????...')
            //                     .setColor(0x6FA8DC)
            //                     .setDescription(`????????? ???????????????.`)
            //                     .addFields(result_array)
            //                     .setTimestamp()
            //                     // .setFooter('');
            // await interaction.reply({ embeds: [ embed ] });

            // await interaction.reply(roll_result('a', 'a', `?????????`, result_array))
        }
        
        catch(err) {
            console.log(err)

            const Embed_Error = new MessageEmbed()
                .setColor('#ED4313')
                .setTitle(SearchName + ` ?????? ?????? ???????????? ?????? ??????????????????.`)
                // .setURL(`https://barracks.d.nexon.com/` + USERINFO.usn)
                .setDescription(`???????????? ???????????? ?????? ????????????, ????????? ??? ?????? ???????????? ???????????????????`)
                    
            await interaction.reply({embeds: [ Embed_Error]})
            // await interaction.reply(`????????? ??????????????????. ???????????? ???????????????, ???????????? ??????????????????. / ?????????: ${SearchName}`)
        }
        
		// await interaction.reply(`?????????: ${dice}, ${chance} / ?????????: ${result_array}`)
	},
};