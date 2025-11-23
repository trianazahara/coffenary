const { randomInt } = require('crypto');

class AuthController {
  constructor({ Pengguna, bcrypt, jwt, transporter, jwtSecret, now = () => new Date() }) {
    this.Pengguna = Pengguna;
    this.bcrypt = bcrypt;
    this.jwt = jwt;
    this.transporter = transporter;
    this.jwtSecret = jwtSecret;
    this.now = now;

    
    this.login = this.login.bind(this);
    this.register = this.register.bind(this);
    this.forgotPassword = this.forgotPassword.bind(this);
    this.resetPassword = this.resetPassword.bind(this);
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const pengguna = await this.Pengguna.findByEmail(email);
      if (!pengguna) return res.status(401).json({ message: 'Email atau password salah' });

      const isMatch = await this.bcrypt.compare(password, pengguna.kata_sandi_hash);
      if (!isMatch) return res.status(401).json({ message: 'Email atau password salah' });

      const token = this.jwt.sign(
        { id: pengguna.id_pengguna, peran: pengguna.peran },
        this.jwtSecret,
        { expiresIn: '8h' }
      );

      const { kata_sandi_hash: _drop, ...dataPengguna } = pengguna;
      return res.json({ token, pengguna: dataPengguna });
    } catch (err) { return next(err); }
  }

  async register(req, res, next) {
    try {
      const { username, email, password, nama_lengkap, telepon } = req.body;

      const existing = await this.Pengguna.findByEmail(email);
      if (existing) return res.status(400).json({ message: 'Email sudah terdaftar.' });

      const kata_sandi_hash = await this.bcrypt.hash(password, 10);
      const newUser = await this.Pengguna.create({
        username, email, kata_sandi_hash, nama_lengkap, telepon, peran: 'pelanggan'
      });

      return res.status(201).json({ message: 'Registrasi berhasil!', userId: newUser.id });
    } catch (err) { return next(err); }
  }

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;

      const pengguna = await this.Pengguna.findByEmail(email);
      if (!pengguna) return res.status(404).json({ message: 'Pengguna dengan email ini tidak ditemukan.' });

      // OTP 6 digit pakai crypto (lebih aman daripada Math.random)
      const otp = String(randomInt(100000, 1000000));
      const otp_hash = await this.bcrypt.hash(otp, 10);
      const otp_expiry = new Date(this.now().getTime() + 10 * 60 * 1000);

      await this.Pengguna.setOtp(email, otp_hash, otp_expiry);

      await this.transporter.sendMail({
        from: `"Coffenary Support" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Kode OTP Reset Password Anda',
        text: `Kode OTP Anda adalah: ${otp}. Kode ini akan kedaluwarsa dalam 10 menit.`,
        html: `<p>Kode OTP Anda adalah: <b>${otp}</b>. Kode ini akan kedaluwarsa dalam 10 menit.</p>`
      });

      return res.json({ message: 'OTP telah dikirim ke email Anda.' });
    } catch (err) { return next(err); }
  }

  async resetPassword(req, res, next) {
    try {
      const { email, otp, password } = req.body;

      const pengguna = await this.Pengguna.findByEmail(email);
      if (!pengguna || !pengguna.otp_hash || !pengguna.otp_expiry) {
        return res.status(400).json({ message: 'Permintaan reset tidak valid.' });
      }

      if (this.now() > new Date(pengguna.otp_expiry)) {
        return res.status(400).json({ message: 'Kode OTP sudah kedaluwarsa.' });
      }

      const valid = await this.bcrypt.compare(otp, pengguna.otp_hash);
      if (!valid) return res.status(400).json({ message: 'Kode OTP salah.' });

      const kata_sandi_hash = await this.bcrypt.hash(password, 10);
      await this.Pengguna.resetPassword(email, kata_sandi_hash);

      return res.json({ message: 'Password berhasil direset. Silakan login.' });
    } catch (err) { return next(err); }
  }
}

module.exports = { AuthController };
