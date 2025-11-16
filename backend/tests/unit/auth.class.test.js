process.env.JWT_SECRET = 'testsecret';

const { Auth } = require('../../controllers/Auth');

function mkRes() {
  return {
    statusCode: 200,
    body: null,
    status(c) { this.statusCode = c; return this; },
    json(p) { this.body = p; return this; }
  };
}

describe('Auth (class, OOP)', () => {
  describe('login', () => {
    test('401 jika user tidak ada', async () => {
      const Pengguna = { findByEmail: jest.fn().mockResolvedValue(null) };
      const auth = new Auth({ Pengguna, bcrypt: {}, jwt: {}, transporter: {}, jwtSecret: 'x' });

      const req = { body: { email: 'a@a.com', password: 'x' } };
      const res = mkRes();
      await auth.login(req, res, () => {});
      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ message: 'Email atau password salah' });
    });

    test('401 jika password salah', async () => {
      const Pengguna = { findByEmail: jest.fn().mockResolvedValue({ kata_sandi_hash: 'hash' }) };
      const bcrypt = { compare: jest.fn().mockResolvedValue(false) };
      const auth = new Auth({ Pengguna, bcrypt, jwt: {}, transporter: {}, jwtSecret: 'x' });

      const req = { body: { email: 'a@a.com', password: 'salah' } };
      const res = mkRes();
      await auth.login(req, res, () => {});
      expect(bcrypt.compare).toHaveBeenCalledWith('salah', 'hash');
      expect(res.statusCode).toBe(401);
    });

    test('200 + token jika sukses', async () => {
      const Pengguna = {
        findByEmail: jest.fn().mockResolvedValue({
          id_pengguna: 7, peran: 'admin', kata_sandi_hash: 'hash',
          username: 'fadli', email: 'a@a.com'
        })
      };
      const bcrypt = { compare: jest.fn().mockResolvedValue(true) };
      const jwt = { sign: jest.fn().mockReturnValue('mock.jwt') };

      const auth = new Auth({ Pengguna, bcrypt, jwt, transporter: {}, jwtSecret: 'testsecret' });

      const req = { body: { email: 'a@a.com', password: 'benar' } };
      const res = mkRes();
      await auth.login(req, res, () => {});
      expect(jwt.sign).toHaveBeenCalledWith({ id: 7, peran: 'admin' }, 'testsecret', { expiresIn: '8h' });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token', 'mock.jwt');
      expect(res.body.pengguna).not.toHaveProperty('kata_sandi_hash');
    });

    test('login → next(err) saat jwt.sign throw', async () => {
      const Pengguna = { findByEmail: jest.fn().mockResolvedValue({ id_pengguna:1, peran:'admin', kata_sandi_hash:'h' }) };
      const bcrypt = { compare: jest.fn().mockResolvedValue(true) };
      const jwt = { sign: jest.fn(() => { throw new Error('jwt fail'); }) };

      const auth = new Auth({ Pengguna, bcrypt, jwt, transporter:{}, jwtSecret:'x' });

      const req = { body:{ email:'e@e.com', password:'p' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await auth.login(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('register', () => {
    test('400 jika email sudah terdaftar', async () => {
      const Pengguna = { findByEmail: jest.fn().mockResolvedValue({ id_pengguna: 1 }) };
      const auth = new Auth({ Pengguna, bcrypt: {}, jwt: {}, transporter: {}, jwtSecret: 'x' });

      const req = { body: { username: 'u', email: 'e@e.com', password: 'p', nama_lengkap: 'N', telepon: '08' } };
      const res = mkRes();
      await auth.register(req, res, () => {});
      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ message: 'Email sudah terdaftar.' });
    });

    test('201 jika registrasi berhasil', async () => {
      const Pengguna = {
        findByEmail: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 42 })
      };
      const bcrypt = { hash: jest.fn().mockResolvedValue('hashed') };
      const auth = new Auth({ Pengguna, bcrypt, jwt: {}, transporter: {}, jwtSecret: 'x' });

      const req = { body: { username: 'u', email: 'e@e.com', password: 'p', nama_lengkap: 'N', telepon: '08' } };
      const res = mkRes();
      await auth.register(req, res, () => {});
      expect(bcrypt.hash).toHaveBeenCalledWith('p', 10);
      expect(Pengguna.create).toHaveBeenCalledWith({
        username: 'u', email: 'e@e.com', kata_sandi_hash: 'hashed',
        nama_lengkap: 'N', telepon: '08', peran: 'pelanggan'
      });
      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual({ message: 'Registrasi berhasil!', userId: 42 });
    });

    test('register → next(err) ketika Pengguna.create throw', async () => {
      const Pengguna = {
        findByEmail: jest.fn().mockResolvedValue(null),
        create: jest.fn(() => { throw new Error('db'); })
      };
      const bcrypt = { hash: jest.fn().mockResolvedValue('h') };
      const auth = new Auth({ Pengguna, bcrypt, jwt:{}, transporter:{}, jwtSecret:'x' });

      const next = jest.fn();
      await auth.register(
        { body:{ username:'u', email:'e@e', password:'p', nama_lengkap:'N', telepon:'08' } },
        { status: jest.fn().mockReturnThis(), json: jest.fn() },
        next
      );
      expect(next).toHaveBeenCalled();
    });
  });

  describe('forgotPassword', () => {
    test('404 jika email tidak ditemukan', async () => {
      const Pengguna = { findByEmail: jest.fn().mockResolvedValue(null) };
      const bcrypt = { hash: jest.fn() };
      const transporter = { sendMail: jest.fn() };
      const auth = new Auth({ Pengguna, bcrypt, jwt: {}, transporter, jwtSecret: 'x' });

      const req = { body: { email: 'x@x.com' } };
      const res = mkRes();
      await auth.forgotPassword(req, res, () => {});
      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({ message: 'Pengguna dengan email ini tidak ditemukan.' });
      expect(transporter.sendMail).not.toHaveBeenCalled();
    });

    test('200 dan mengirim email OTP jika sukses', async () => {
      const fixedNow = new Date('2025-01-01T00:00:00.000Z');
      const now = () => new Date(fixedNow);

      const Pengguna = {
        findByEmail: jest.fn().mockResolvedValue({ id_pengguna: 1, email: 'x@x.com' }),
        setOtp: jest.fn().mockResolvedValue()
      };
      const bcrypt = { hash: jest.fn().mockResolvedValue('otp_hash') };
      const transporter = { sendMail: jest.fn().mockResolvedValue({ messageId: 'abc' }) };

      const auth = new Auth({ Pengguna, bcrypt, jwt: {}, transporter, jwtSecret: 'x', now });

      const req = { body: { email: 'x@x.com' } };
      const res = mkRes();
      await auth.forgotPassword(req, res, () => {});

      expect(Pengguna.setOtp).toHaveBeenCalled();
      expect(transporter.sendMail).toHaveBeenCalled();
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ message: 'OTP telah dikirim ke email Anda.' });
    });

    test('forgotPassword → next(err) saat sendMail throw', async () => {
      const Pengguna = {
        findByEmail: jest.fn().mockResolvedValue({ id_pengguna:1, email:'e@e.com' }),
        setOtp: jest.fn().mockResolvedValue()
      };
      const bcrypt = { hash: jest.fn().mockResolvedValue('otp_hash') };
      const transporter = { sendMail: jest.fn(() => { throw new Error('smtp'); }) };

      const auth = new Auth({ Pengguna, bcrypt, jwt:{}, transporter, jwtSecret:'x' });

      const req = { body:{ email:'e@e.com' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      await auth.forgotPassword(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    test('400 jika permintaan reset tidak valid (tanpa otp_hash/expiry)', async () => {
      const Pengguna = { findByEmail: jest.fn().mockResolvedValue({ id_pengguna: 1 }) };
      const auth = new Auth({ Pengguna, bcrypt: {}, jwt: {}, transporter: {}, jwtSecret: 'x' });

      const req = { body: { email: 'x@x.com', otp: '123456', password: 'baru' } };
      const res = mkRes();
      await auth.resetPassword(req, res, () => {});
      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ message: 'Permintaan reset tidak valid.' });
    });

    test('400 jika OTP kedaluwarsa', async () => {
      const Pengguna = {
        findByEmail: jest.fn().mockResolvedValue({
          id_pengguna: 1,
          otp_hash: 'hash',
          otp_expiry: new Date(Date.now() - 1000).toISOString()
        })
      };
      const auth = new Auth({ Pengguna, bcrypt: {}, jwt: {}, transporter: {}, jwtSecret: 'x' });

      const req = { body: { email: 'x@x.com', otp: '123456', password: 'baru' } };
      const res = mkRes();
      await auth.resetPassword(req, res, () => {});
      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ message: 'Kode OTP sudah kedaluwarsa.' });
    });

    test('400 jika OTP salah', async () => {
      const future = new Date(Date.now() + 60_000).toISOString();
      const Pengguna = {
        findByEmail: jest.fn().mockResolvedValue({
          id_pengguna: 1, otp_hash: 'hash', otp_expiry: future
        })
      };
      const bcrypt = { compare: jest.fn().mockResolvedValue(false) };

      const auth = new Auth({ Pengguna, bcrypt, jwt: {}, transporter: {}, jwtSecret: 'x' });

      const req = { body: { email: 'x@x.com', otp: '999999', password: 'baru' } };
      const res = mkRes();
      await auth.resetPassword(req, res, () => {});
      expect(bcrypt.compare).toHaveBeenCalledWith('999999', 'hash');
      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ message: 'Kode OTP salah.' });
    });

    test('200 jika reset password berhasil', async () => {
      const future = new Date(Date.now() + 60_000).toISOString();
      const Pengguna = {
        findByEmail: jest.fn().mockResolvedValue({
          id_pengguna: 1, otp_hash: 'hash', otp_expiry: future
        }),
        resetPassword: jest.fn().mockResolvedValue()
      };
      const bcrypt = {
        compare: jest.fn().mockResolvedValue(true),
        hash: jest.fn().mockResolvedValue('new_hash')
      };

      const auth = new Auth({ Pengguna, bcrypt, jwt: {}, transporter: {}, jwtSecret: 'x' });

      const req = { body: { email: 'x@x.com', otp: '123456', password: 'baru' } };
      const res = mkRes();
      await auth.resetPassword(req, res, () => {});
      expect(bcrypt.hash).toHaveBeenCalledWith('baru', 10);
      expect(Pengguna.resetPassword).toHaveBeenCalledWith('x@x.com', 'new_hash');
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ message: 'Password berhasil direset. Silakan login.' });
    });

    // tambahan untuk cover catch di akhir file (baris ~103)
    test('resetPassword → next(err) ketika findByEmail throw', async () => {
      const Pengguna = { findByEmail: jest.fn(() => { throw new Error('db'); }) };
      const auth = new Auth({ Pengguna, bcrypt: {}, jwt: {}, transporter: {}, jwtSecret: 'x' });

      const next = jest.fn();
      await auth.resetPassword(
        { body: { email: 'x@x.com', otp: '123456', password: 'baru' } },
        { status: jest.fn().mockReturnThis(), json: jest.fn() },
        next
      );
      expect(next).toHaveBeenCalled();
    });
  });
});
