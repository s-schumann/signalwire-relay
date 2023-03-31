// Import required modules
const { config } = require('dotenv');
const { Voice } = require('@signalwire/realtime-api');
const axios = require('axios');

// Load environment variables
//const path = require('path');
//config({ path: path.resolve(process.cwd(), '.env_US') });
config();

// Create a new Voice Client
const client = new Voice.Client({
  project: process.env.SIGNALWIRE_PROJECT,
  token: process.env.SIGNALWIRE_TOKEN,
  contexts: [ process.env.RELAY_CONTEXT ],
  host: process.env.SIGNALWIRE_HOST,
});

// Listen for incoming calls and handle them
client.on('call.received', async (call) => {
  console.log('Got call', call.from, call.to);
  
  // Play early media
  try {
    const earlyMedia = await call.playTTS({ text: "This is early media. I repeat: This is early media." });
    console.log("Early media playing...");
    await earlyMedia.ended();
    console.log("Early media played successfully");
  } catch (error) {
    console.error("Error playing early media:", error);
    return;
  }

  // Answer the call
  try {
    await call.answer();
    console.log("Call answered successfully");
  } catch (error) {
    console.error("Error answering call:", error);
    return;
  }
  
  // Play in-call media
  try {
    const playback = await call.playTTS({ text: "This is in-call media. I repeat: This is in-call media." });
    console.log("In-call media playing...");
    await playback.ended();
    console.log("In-call media played successfully");
    /*
    const music = await call.playAudio({
      url: "https://cdn.signalwire.com/default-music/welcome.mp3",
    });
    await music.ended();
    */
  } catch (error) {
    console.log("Error handling call:", error);
  }  
  
  // Hang up the call
//setTimeout(async () => {
  try {
    await call.hangup();
    console.log("Call ended successfully");
  } catch (error) {
    console.log("Error handling call:", error);
  }  
//}, 5000); // wait for 5 seconds before hanging up the call

});

// Handle client error
client.on("error", (error) => {
  console.error(error);
});

console.log("Relay client started.");
