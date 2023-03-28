// Import required modules
const { config } = require('dotenv');
const { Voice } = require('@signalwire/realtime-api');

// Load environment variables
config();

// Create a new Voice Client
const client = new Voice.Client({
  project: process.env.SIGNALWIRE_PROJECT,
  token: process.env.SIGNALWIRE_TOKEN,
  contexts: [ process.env.RELAY_CONTEXT ],
  host: process.env.SIGNALWIRE_HOST,
});

// Receive call, print states, establish peer connection
client.on('call.received', async (call) => {
  call.on("call.state", (call) => {
    console.log("call #" + call.id.substr(0,8) + " state changed:", call.state);
  });

  console.log('Got call', call.from, call.to);
  await call.answer();

  const playlist = new Voice.Playlist()
    .add(Voice.Playlist.Ringtone({
      name: "de",
      duration: 30,
  }));

  const peer = await call.connectPhone({
      from: process.env.PHONE_NUMBER,
      to: "+4916090960498",
      timeout: 30,
      ringback: playlist,
    });

  peer.on("call.state", (peer) => {
    console.log("peer call #" + peer.id.substr(0,8) + " state changed:", peer.state);
  });

  await call.playTTS({ text: "You are peer 1" });
  await peer.playTTS({ text: "You are peer 2" });

  await call.disconnected();
  await call.playTTS({ text: "The peer disconnected" });

});
