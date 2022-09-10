const express = require("express");
const axios = require("axios");
const cors = require("cors");
const Redis = require("redis");

const app = express();
app.use(cors());

const DEFAULT_EXPIRATION = 3600;

const client = Redis.createClient();
(async () => {
  await client.connect();
})();

app.get("/photos", async (req, res) => {
  const albumId = req.query.albumId;

  const cacheResults = await client.get(`photos?albumId=${albumId}`);
  if (cacheResults) {
    console.log("present sir");
    isCached = true;
    results = JSON.parse(cacheResults);
    res.json(results);
  } else {
    const { data } = await axios.get(
      "https://jsonplaceholder.typicode.com/photos",
      { params: { albumId } }
    );
    client.setEx(
      `photos?albumId=${albumId}`,
      DEFAULT_EXPIRATION,
      JSON.stringify(data)
    );
    res.json(data);
  }
});

app.get("/photos/:id", async (req, res) => {
  const cacheResults = await client.get(`photos-${req.params.id}`);
  if (cacheResults) {
    console.log("present sir");
    isCached = true;
    results = JSON.parse(cacheResults);
    res.json(results);
  } else {
    const { data } = await axios.get(
      `https://jsonplaceholder.typicode.com/photos/${req.params.id}`
    );

    client.setEx(
      `photos-${req.params.id}`,
      DEFAULT_EXPIRATION,
      JSON.stringify(data)
    );

    res.json(data);
  }
});

// app.get("/photos/:id", async (req, res) => {
//   const photo = await getSetCache(`photo-${req.params.id}`, async () => {
//     const { data } = await axios.get(
//       `https://jsonplaceholder.typicode.com/photos/${req.params.id}`
//     );
//     return data;
//   });

//   res.json(photo);
// });

// function getSetCache(key, cb) {
//   return new Promise((resolve, reject) => {
//     client.get(key, async (error, data) => {
//       if (error) return reject(error);
//       if (data != null) return resolve(JSON.parse(data));
//       const freshData = await cb();
//       client.setEx(key, DEFAULT_EXPIRATION, JSON.stringify(freshData));
//       resolve(freshData);
//     });
//   });
// }

app.listen(3000);
