const express = require('express');
const algoliasearch = require('algoliasearch');

const ALGOLIA_APP_ID = '7HPIAN0AQ9';
const ALGOLIA_SEARCH_KEY = '95b4fecd30315ee5f86cd22cc0fadfa0';
const ALGOLIA_INDEX_NAME = 'posts';

const app = express();
const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY);
const index = client.initIndex(ALGOLIA_INDEX_NAME);

app.use(express.json());

app.post('/api/search', async (req, res) => {
  const { query } = req.body;
  try {
    const searchResults = await index.search(query, {
      attributesToRetrieve: ["title", "caption"],
      relevancyStrictness: 50,
      hitsPerPage: 100
    });

    res.status(200).json(searchResults.hits.map(hit => hit.objectID));
  } catch (error) {
    console.error('Error searching Algolia:', error);
    res.status(500).send('Error searching Algolia');
  }
});

module.exports = app;
