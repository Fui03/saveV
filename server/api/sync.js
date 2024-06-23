const express = require('express');
const admin = require('firebase-admin');
const algoliasearch = require('algoliasearch');

const serviceAccount = require('../../serviceAccountKey.json');
const ALGOLIA_APP_ID = '7HPIAN0AQ9';
const ALGOLIA_ADMIN_KEY = '95b4fecd30315ee5f86cd22cc0fadfa0';
const ALGOLIA_INDEX_NAME = 'posts';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY);
const index = client.initIndex(ALGOLIA_INDEX_NAME);

app.use(express.json());

app.post('/api/sync', async (req, res) => {
    const { postId, post } = req.body;
  try {
    post.objectID = postId;
    await index.saveObject(post);
    console.log('Post added to Algolia:', postId);
    res.status(200).send({ id: docRef.id, message: 'Post added and synced to Algolia' });
  } catch (error) {
    console.error('Error adding post:', error);
    res.status(500).send('Error adding post');
  }
});

module.exports = app;
