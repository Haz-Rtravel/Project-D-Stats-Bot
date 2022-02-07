// const firebase = require("firebase/app");
// require('firebase/auth');
// require('firebase/database');

const fs = require('fs');
const { Client, MessageEmbed, MessageAttachment, displayAvatarURL, Collection, Intents, MessageActionRow, MessageSelectMenu } = require(`discord.js`); // discord.js를 불러옴
const Discord = require('discord.js')
const client = new Client({ intents: [Intents.FLAGS.GUILDS] }); // 새로운 디스코드 클라이언트를 만듬
const { prefix, token } = require('./config.json');

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command);
}

// var firebaseConfig = {
//     apiKey: "AIzaSyA6EdT7xUeL_74DQQYG3NnECUwN0nqftvk",
//     authDomain: "haz-project.firebaseapp.com",
//     databaseURL: "https://haz-project-default-rtdb.asia-southeast1.firebasedatabase.app",
//     projectId: "haz-project",
//     storageBucket: "haz-project.appspot.com",
//     messagingSenderId: "58675962737",
//     appId: "1:58675962737:web:ff512c561e7b218515ccd0"
//   };

// 만약에 클라이언트가 준비되었다면, 아래의 코드를 실행
// 이 이벤트는 봇이 로그인 되고 한번만 실행

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setActivity('기능 테스트', { type: 'PLAYING' })

    // firebase.initializeApp(firebaseConfig);

    // admin.initializeApp({
    //     credential: admin.credential.cert(serviceAccount),
    //     databaseURL: 'https://discord-tlb-project.firebaseio.com'
    //   });
    // db = admin.database();
    // ref = db.ref("/");
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

// 디스코드 토큰으로 디스코드에 로그인
client.login(process.env.TOKEN);