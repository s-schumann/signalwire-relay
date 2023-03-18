const axios = require('axios');
const PORT = process.env.PORT || 3000;
const options = {
  url: `http://127.0.0.1:${PORT}/health`,
  timeout: 1500
};

axios(options)
  .then(response => {
    const status = response?.status;
    console.log(`STATUS: ${status}`);
    process.exit(status === 200 ? 0 : 1);
  })
  .catch(error => {
    console.log(`ERROR: ${error.message}`);
    process.exit(1);
  });
