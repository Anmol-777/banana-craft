import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const adminSchema = new mongoose.Schema({
  email: String,
  username: String,
  name: String,
  passwordHash: String,
  role: String,
  isActive: Boolean,
});

const Admin = mongoose.model('Admin', adminSchema);

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/om_banana_crafts');
  
  // Delete existing admin
  await Admin.deleteMany({ email: 'admin@ombanana.com' });
  await Admin.deleteMany({ username: 'admin' });
  
  // Create new admin
  const passwordHash = await bcrypt.hash('admin123456', 12);
  const result = await Admin.create({
    email: 'admin@ombanana.com',
    username: 'admin',
    name: 'Site Admin',
    passwordHash,
    role: 'admin',
    isActive: true,
  });
  
  console.log('Admin created:', result.email);
  await mongoose.disconnect();
}

main().catch(console.error);