const bcrypt = require('bcryptjs');

const createHash = async () => {
  // Ganti 'password_rahasia_anda' dengan password yang Anda inginkan
  const password = 'admin123'; 
  const saltRounds = 10;

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('Password Anda:', password);
    console.log('Hash Bcrypt:', hashedPassword);
  } catch (error) {
    console.error('Error saat membuat hash:', error);
  }
};

createHash();