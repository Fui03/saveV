const admin = require('firebase-admin');
const {faker} = require('@faker-js/faker'); // To generate random data
const { getFirestore, FieldValue  } = require('firebase-admin/firestore');

const serviceAccount = require('./serviceAccountKey.json'); // Path to your Firebase service account key

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = getFirestore();

const seedPosts = async () => {
    const batch = db.batch();
    const postRef = db.collection('posts');

    for (let i = 0; i < 10; i++) {
        const docRef = postRef.doc(); // Create a new document reference
        const randomImages = [
            'https://via.placeholder.com/150', 
            'https://via.placeholder.com/200',
            'https://via.placeholder.com/250'
        ];
        batch.set(docRef, {
            userId: `user${faker.string.uuid()}`,
            title: faker.lorem.sentence(),
            caption: faker.lorem.paragraph(),
            spendingRange: faker.number.int({ min: 10, max: 1000 }),
            imageURLs: randomImages,
            timestamp: FieldValue.serverTimestamp(),
            likes: faker.number.int({ min: 0, max: 1000 }),
            commentsCount: faker.number.int({ min: 0, max: 100 }),
            comments: []
        });
    }

    await batch.commit();
    console.log('Seeded 100 posts successfully.');
};

seedPosts().catch(console.error);
