// Import required modules
const { config } = require('dotenv');
const { Voice, Messaging } = require('@signalwire/realtime-api');

// Load environment variables
config();

// Create a new Voice Client
const voiceClient = new Voice.Client({
  project: process.env.SIGNALWIRE_PROJECT,
  token: process.env.SIGNALWIRE_TOKEN,
  contexts: [ process.env.RELAY_CONTEXT ],
  host: process.env.SIGNALWIRE_HOST,
});

// Create a new Messaging Client
const msgClient = new Messaging.Client({
  project: process.env.SIGNALWIRE_PROJECT,
  token: process.env.SIGNALWIRE_TOKEN,
  contexts: [ process.env.RELAY_CONTEXT ],
  host: process.env.SIGNALWIRE_HOST,
});

// Wait for voice call, respond
voiceClient.on('call.received', async (call) => {
  console.log('Got call', call.from, call.to);
  await call.answer();
  const msg = await call.playTTS({ text: "Sending a message via relay." });
  await msg.ended();
  console.log("Played announcement, sending message...")

  try {
    const result = await msgClient.send({
      context: process.env.RELAY_CONTEXT,
      from: process.env.PHONE_NUMBER,
      to: call.from,
      body: "in call message",
    });
    console.log("Message ID: ", result.messageId);
  } catch (e) {
    console.error(e.message);
  }

  const ok = await call.playTTS({ text: "SMS sent." });
  await ok.ended();
  console.log("Sent message, informed user...")

});
