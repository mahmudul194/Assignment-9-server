const mongoose = require('mongoose');
require('dotenv').config();
const Pet = require('./models/Pet');

const MOCK_PETS = [
  {
    name: 'Buddy',
    species: 'dog',
    breed: 'Golden Retriever',
    age: '2 Years',
    gender: 'Male',
    image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=400',
    adoptionFee: 150,
    status: 'available',
    location: 'New York, NY',
    description: 'Friendly, active, and loves kids. Fully house trained.',
    ownerEmail: 'shelter@fureverhome.org'
  },
  {
    name: 'Luna',
    species: 'cat',
    breed: 'Siamese Cat',
    age: '1 Year',
    gender: 'Female',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=400',
    adoptionFee: 75,
    status: 'available',
    location: 'Boston, MA',
    description: 'Playful, vocal, and loves to cuddle. Great companion.',
    ownerEmail: 'shelter@fureverhome.org'
  },
  {
    name: 'Bella',
    species: 'rabbit',
    breed: 'Holland Lop',
    age: '6 Months',
    gender: 'Female',
    image: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&q=80&w=400',
    adoptionFee: 50,
    status: 'available',
    location: 'Seattle, WA',
    description: 'Very gentle rabbit, loves chewing on fresh carrots and clover.',
    ownerEmail: 'shelter@fureverhome.org'
  },
  {
    name: 'Rocky',
    species: 'bird',
    breed: 'Blue & Gold Macaw',
    age: '3 Years',
    gender: 'Male',
    image: 'https://imgs.search.brave.com/OB2WLHgwo3PyCvbmm_Ak2QYngisxU_vjBW32N-N8GRw/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMjAw/Mzk2Nzk2LTAwMS9w/aG90by9ibHVlLWFu/ZC1nb2xkLW1hY2F3/LW9uLXBlcmNoLmpw/Zz9zPTYxMng2MTIm/dz0wJms9MjAmYz0z/MGNQQWZzRW1YODJD/dTVVV3NFTE9yYzZX/T3BNZXAwNnFUOUtk/c0xUU0I4PQ',
    adoptionFee: 200,
    status: 'available',
    location: 'Miami, FL',
    description: 'Very smart, speaks a few words. Enjoys interacting with people.',
    ownerEmail: 'shelter@fureverhome.org'
  },
  {
    name: 'Daisy',
    species: 'cat',
    breed: 'Ragdoll Cat',
    age: '3 Years',
    gender: 'Female',
    image: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&q=80&w=400',
    adoptionFee: 90,
    status: 'available',
    location: 'Chicago, IL',
    description: 'Fluffy, calm, and sweet. Loves sleeping on warm laps.',
    ownerEmail: 'shelter@fureverhome.org'
  },
  {
    name: 'Max',
    species: 'dog',
    breed: 'German Shepherd',
    age: '4 Years',
    gender: 'Male',
    image: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&q=80&w=400',
    adoptionFee: 180,
    status: 'available',
    location: 'Austin, TX',
    description: 'Loyal protector, very intelligent and responds well to training.',
    ownerEmail: 'shelter@fureverhome.org'
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://rifatswe00_db_user:tNejYwqftytkDgUm@ac-cxcfaok-shard-00-00.c1hgswr.mongodb.net:27017,ac-cxcfaok-shard-00-01.c1hgswr.mongodb.net:27017,ac-cxcfaok-shard-00-02.c1hgswr.mongodb.net:27017/pet-adoption?ssl=true&replicaSet=atlas-cpg5c3-shard-0&authSource=admin&appName=Cluster0');
    console.log('MongoDB connected for seeding');

    // Mongoose schema requires healthStatus and vaccinationStatus
    const petsToInsert = MOCK_PETS.map(pet => ({
      ...pet,
      healthStatus: 'Healthy',
      vaccinationStatus: 'Fully Vaccinated'
    }));

    await Pet.insertMany(petsToInsert);
    console.log('Mock pets seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedDB();
