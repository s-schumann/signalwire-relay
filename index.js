// Import required modules
const { config } = require('dotenv');
const { Voice } = require('@signalwire/realtime-api');
const axios = require('axios');

// Load environment variables
config();

// Define constants
const PORT = process.env.PORT || 3000;

// Create a new Voice Client
const client = new Voice.Client({
  project: process.env.SIGNALWIRE_PROJECT,
  token: process.env.SIGNALWIRE_TOKEN,
  contexts: ['default'],
  host: process.env.SIGNALWIRE_HOST,
});

// Start the client and wait for call
client.on('call.received', async (call) => {
  console.log('Got call', call.from, call.to);

  // Answer the call
  try {
    await call.answer();
    console.log("Call answered successfully");
  } catch (error) {
    console.error("Error answering call:", error);
  }
  
  try {
    // Prompt user to enter postcode
    const prompt = await call.promptTTS({
      text: 'Welcome to our demo. Please enter the postcode for a weather query.',
      digits: {
        max: 5,
        digitTimeout: 10,
      },
    });
    const { type, digits, terminator } = await prompt.ended();

    // Call OpenWeather API to get weather data
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?zip=${digits},DE&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`
    );
  
    // Extract relevant weather data
    const {
      name,
      main: { temp },
    } = response.data;
  
    // Log weather data
    console.log(`In ${name} it is ${temp} degrees.`);

    // Say weather data to user
    const playback = await call.playTTS({
      text: `In ${name} it is ${temp} degrees.`
    });
    await playback.ended();

    await call.hangup();
    console.log("Call ended successfully");
  } catch (error) {
    console.log("Error handling call:", error);
  }  
});

client.on("error", (error) => {
  console.error(error);
});

// Health endpoint for Docker
const http = require('http');
const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK - healthy');
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});
server.listen(PORT, () => {
  console.log(`Health check server listening on port ${PORT}`);
});

console.log("Relay client started.");
