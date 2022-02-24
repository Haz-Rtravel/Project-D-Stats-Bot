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
        var seasoncode = 1

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
		.setDescription('프로젝트 D 유저 닉네임을 검색합니다.')
        .addStringOption(option =>
            option.setName('유저명')
                .setDescription('검색하고자 하는 유저의 닉네임을 입력합니다. 일부만 입력해도 됩니다.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('시즌')
                .setDescription('검색하려는 전적의 시즌을 입력합니다. 미입력시 자동으로 알파 시즌을 검색합니다.')
                .addChoice('2021년 알파', 'ALPHA')
                .addChoice('2022년 2월 ~ 4월', '202202')),
	async execute(interaction) {
        const SearchName = interaction.options.getString('유저명');
        const SeasonName = interaction.options.getString('시즌');
        console.log("검색 요청========================")
        console.log(SearchName)
        console.log(SeasonName)
        console.log("검색 요청========================")

        
        
        var user_code = null

        // console.log(search_url)

        var result_array = []
        var Total_Text = `해당 유저를 검색하는데에 성공했습니다.`

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

                    var PLAYTIME = COMBAT_RECORD.play_time.day + `일 ` + COMBAT_RECORD.play_time.hour + `시간 ` + COMBAT_RECORD.play_time.minute + `분`
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
                        .setTitle(USERINFO.nickname + `님의 요원 리포트`)
                        .setThumbnail(PROFILE_IMAGE)
                        .setURL(`https://barracks.d.nexon.com/` + USERINFO.usn)
                        .setDescription(`상단을 클릭시 요원 리포트 링크로 이동됩니다. \n 하단의 정보는 현 시즌 기준입니다.`)
                        .addFields(
                            // { name: 'Regular field title', value: 'Some value here' },
                            // { name: '\u200B', value: '\u200B' },
                            { name: '닉네임', value: USERINFO.nickname, inline: true },
                            { name: '클랜', value: (USERINFO.clan_name == '' ? `소속 없음` : USERINFO.clan_name), inline: true },
                            // { name: '\u200B', value: '\u200B' },
                            { name: '랭크', value: RANKING, inline: true },
                            // { name: '데미지율', value: SEASON_RECORD.damage_rate, inline: true 
                        )
                        .addFields(
                            { name: '승률', value: SEASON_RECORD.win_rate, inline: true },
                            { name: 'K/D', value: SEASON_RECORD.kd, inline: true },
                        )
                        .addFields(
                            { name: '\u200B', value: '\u200B', inline: true },
                            { name: '총합 경험치', value: SEASON_RECORD.exp, inline: true },
                            { name: '플레이 시간', value: PLAYTIME, inline: true },
                        )

                    var SeasonFullName = `2021년 알파 시즌`
                    if (SeasonName != null) {
                        switch (SeasonName) {
                            case "ALPHA":
                                SeasonFullName = `2021년 알파 시즌`
                                break;
                            case "202202":
                                SeasonFullName = `2022년 2월 ~ 4월 시즌`
                                break;
                        }
                    }

                    const Embed_Report_2 = new MessageEmbed()
                        .setColor('#ED4313')
                        .setTitle(USERINFO.nickname + `님의 ` + SeasonFullName + ` 전투 기록`)
                        .setURL(`https://barracks.d.nexon.com/` + USERINFO.usn + `/combat`)
                        .setThumbnail(PROFILE_IMAGE)
                        .addFields(
                            // { name: 'Regular field title', value: 'Some value here' },
                            // { name: '\u200B', value: '\u200B' },
                            { name: '매치 참여', value: COMBAT_RECORD.match_cnt, inline: true },
                            { name: '승리', value: COMBAT_RECORD.win, inline: true },
                            { name: '패배', value: COMBAT_RECORD.lose, inline: true },
                            { name: '평균 가해', value: COMBAT_RECORD.damage_enemy, inline: true },
                            { name: '평균 피해', value: COMBAT_RECORD.damage, inline: true },
                            { name: '데미지율', value: SEASON_RECORD.damage_rate, inline: true },
                        )
                        .addFields(
                            // { name: 'Regular field title', value: 'Some value here' },
                            // { name: '\u200B', value: '\u200B' },
                            { name: 'K/R', value: COMBAT_RECORD.r_kill, inline: true },
                            { name: 'D/R', value: COMBAT_RECORD.r_death, inline: true },
                            { name: 'A/R', value: COMBAT_RECORD.r_assist, inline: true },
                            
                        )
                        .addFields(
                            { name: '코인 획득', value: COMBAT_RECORD.r_coin_get, inline: true },
                            { name: '코인 사용', value: COMBAT_RECORD.r_coin_use, inline: true },
                            { name: '펀딩', value: COMBAT_RECORD.r_funding, inline: true },
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
                        .setTitle(SearchName + ` 님의 요원 리포트를 찾을 수 없었습니다.`)
                        // .setURL(`https://barracks.d.nexon.com/` + USERINFO.usn)
                        .setDescription(`검색을 요청한 닉네임을 찾는데에 실패했습니다.`)

                    interaction.reply({embeds: [ Embed_Error]})
                }

                
                console.log("RESULT ==========================")  
            })
            
            
            

            


            

            // console.log(result_array)

            
            // const embed = new MessageEmbed()
            //                     .setTitle('주사위를 굴립니다...')
            //                     .setColor(0x6FA8DC)
            //                     .setDescription(`주사위 결과입니다.`)
            //                     .addFields(result_array)
            //                     .setTimestamp()
            //                     // .setFooter('');
            // await interaction.reply({ embeds: [ embed ] });

            // await interaction.reply(roll_result('a', 'a', `누군가`, result_array))
        }
        
        catch(err) {
            console.log(err)

            const Embed_Error = new MessageEmbed()
                .setColor('#ED4313')
                .setTitle(SearchName + ` 님의 요원 리포트를 찾지 못하였습니다.`)
                // .setURL(`https://barracks.d.nexon.com/` + USERINFO.usn)
                .setDescription(`해당되는 닉네임을 찾지 못했거나, 사용할 수 없는 닉네임을 검색하셨나요?`)
                    
            await interaction.reply({embeds: [ Embed_Error]})
            // await interaction.reply(`오류가 발생했습니다. 입력값을 검토하거나, 관리자를 호출해주세요. / 입력값: ${SearchName}`)
        }
        
		// await interaction.reply(`입력값: ${dice}, ${chance} / 결과값: ${result_array}`)
	},
};