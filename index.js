const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');
const ytdl = require('ytdl-core');
const { Client } = require('tdl');

const botToken = process.env.BOT_TOKEN;
const apiId = process.env.API_ID;
const apiHash = process.env.API_HASH;
const phoneNumber = process.env.PHONE_NUMBER;

const bot = new Telegraf(botToken);

const client = new Client({
    apiId: apiId,
    apiHash: apiHash,
});

client.on('error', console.error);

async function loginHelper() {
    await client.login(() => ({
        getPhoneNumber: () => phoneNumber,
        getAuthCode: () => {
            console.log('Please enter the code sent to your Telegram: ');
            return new Promise((resolve) => {
                const stdin = process.openStdin();
                stdin.once('data', (data) => resolve(data.toString().trim()));
            });
        },
    }));
    console.log('Logged in as helper bot');
}

loginHelper();

const queue = [];

bot.start((ctx) => {
    ctx.reply('مرحباً! أنا البوت الخاص بتشغيل الصوت والفيديو. استخدم الأوامر لتشغيل المحتوى.');
});

bot.command('المطور', (ctx) => {
    ctx.reply('مطور البوت: [اسم المطور]');
});

async function playAudio(ctx, query) {
    try {
        const info = await ytdl.getInfo(query);
        const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
        if (audioFormats.length > 0) {
            const audioUrl = audioFormats[0].url;
            // هنا يمكنك تشغيل الصوت عبر الحساب المساعد
            ctx.reply(`تشغيل الصوت: ${query}\nعنوان: ${info.videoDetails.title}`);
        } else {
            ctx.reply('لم يتم العثور على تنسيقات صوتية لهذا الفيديو.');
        }
    } catch (error) {
        ctx.reply('حدث خطأ أثناء جلب معلومات الصوت.');
    }
}

async function playVideo(ctx, query) {
    try {
        const info = await ytdl.getInfo(query);
        const videoFormats = ytdl.filterFormats(info.formats, 'videoandaudio');
        if (videoFormats.length > 0) {
            const videoUrl = videoFormats[0].url;
            // هنا يمكنك تشغيل الفيديو عبر الحساب المساعد
            ctx.reply(`تشغيل الفيديو: ${query}\nعنوان: ${info.videoDetails.title}`);
        } else {
            ctx.reply('لم يتم العثور على تنسيقات فيديو لهذا الفيديو.');
        }
    } catch (error) {
        ctx.reply('حدث خطأ أثناء جلب معلومات الفيديو.');
    }
}

bot.command('تشغيل', (ctx) => {
    const query = ctx.message.text.split(' ').slice(1).join(' ');
    if (query) {
        playAudio(ctx, query);
    } else {
        ctx.reply('يرجى إدخال اسم الصوت الذي تريد تشغيله.');
    }
});

bot.command('فيديو', (ctx) => {
    const query = ctx.message.text.split(' ').slice(1).join(' ');
    if (query) {
        playVideo(ctx, query);
    } else {
        ctx.reply('يرجى إدخال اسم الفيديو الذي تريد تشغيله.');
    }
});

bot.action('stop', (ctx) => {
    // منطق إيقاف التشغيل
    ctx.reply('تم إيقاف التشغيل.');
});

bot.action('resume', (ctx) => {
    // منطق استئناف التشغيل
    ctx.reply('تم استئناف التشغيل.');
});

bot.action('details', (ctx) => {
    // منطق عرض التفاصيل
    ctx.reply('تفاصيل الصوت أو الفيديو...');
});

bot.launch();

console.log('Bot is running...');
