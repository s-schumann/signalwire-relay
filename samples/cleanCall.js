// Import required modules
const { config } = require('dotenv');
const { Voice } = require('@signalwire/realtime-api');
const axios = require('axios');

// Load environment variables
config();

// Create a new Voice Client
const client = new Voice.Client({
  project: process.env.SIGNALWIRE_PROJECT,
  token: process.env.SIGNALWIRE_TOKEN,
  contexts: [ process.env.RELAY_CONTEXT ],
  host: process.env.SIGNALWIRE_HOST,
});

// Helper function to get weather data
async function getWeatherData(zipCode) {
  console.log(`Getting weather data for ${zipCode}...`);

  // Check if zip code is valid
  if (typeof zipCode !== 'undefined' && zipCode.length === 5) {
    // Get weather data from OpenWeather API
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?zip=${zipCode},DE&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`
      );

      const {
        name,
        main: { temp },
      } = response.data;

      return { name, temp, error: null };
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code outside the range of 2xx
        console.error('Server responded with an error:', error.response.data);
        return { error: 'Server responded with an error.' };
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        return { error: 'No response received from the server.' };
      } else {
        // Something happened in setting up the request that triggered an error
        console.error('Error setting up the request:', error.message);
        return { error: 'Error setting up the request.' };
      }
    }
  } else {
    // Invalid zip code
    console.error('No correct zip code provided.');
    return { error: 'No correct zip code provided.' };
  }
}

// Listen for incoming calls and handle them
client.on('call.received', async (call) => {
  console.log('Got call', call.from, call.to);

  // Handle call state changes
  call.on("call.state", (call) => {
    if(call.state === "ending") {
      console.log("User hung up");
    }
  });

  // Answer the call
  try {
    await call.answer();
    console.log("Call answered successfully");
  } catch (error) {
    console.error("Error answering call:", error);
    return;
  }
  
  try {
    // Prompt user to enter postcode
    const prompt = await call.promptTTS({
      text: 'Welcome to our demo. Please enter the postcode for a weather query.',
      digits: {
        max: 5,
        digitTimeout: 10,
      },
      //language: "de-DE", // works
      //voice: "gcloud.en-US-Wavenet-A", // doesn't work
      //voice: "polly.Justin" // doesn't work
    });
    const { type, digits, terminator } = await prompt.ended();

    // Get weather data using the entered postcode
    let name, temp, error;
    ({ name, temp, error } = await getWeatherData(digits));
    if(!error) {
      // Log weather data
      console.log(`In ${name} it is ${temp} degrees.`);

      // Say weather data to user
      const playback = await call.playTTS({
        text: `In ${name} it is ${temp} degrees.`
      });
      await playback.ended();
    } else {
      console.log("getWeatherData error: ", error);

      // Say error to user
      const playback = await call.playTTS({
        text: `Your input was not valid. ${error}`
      });
      await playback.ended();
    }

    // Hang up the call
    await call.hangup();
    console.log("Call ended successfully");
  } catch (error) {
    console.log("Error handling call:", error);
  }  
});

// Handle client error
client.on("error", (error) => {
  console.error("Client error: ", error);
});

console.log("Relay client started.");
