db = db.getSiblingDB('ai_evaluation');

db.createUser({
  user: 'admin',
  pwd: 'changeme',
  roles: [
    {
      role: 'readWrite',
      db: 'ai_evaluation',
    },
  ],
});

db.createCollection('documents');
db.createCollection('evaluations');
db.createCollection('users');

print('Database initialization completed.');
