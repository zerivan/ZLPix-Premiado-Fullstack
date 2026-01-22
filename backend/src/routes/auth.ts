// ======================================
// 🛡 LOGIN ADMIN
// ======================================
router.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "E-mail e senha são obrigatórios." });
    }

    const admin = await prisma.admins.findUnique({
      where: { email: String(email).toLowerCase() },
    });

    if (!admin) {
      return res.status(401).json({ message: "Credenciais inválidas." });
    }

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: "Credenciais inválidas." });
    }

    const token = jwt.sign(
      {
        id: admin.id.toString(),
        email: admin.email,
        role: "admin",
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Login admin realizado com sucesso.",
      token,
      admin: {
        id: admin.id,
        email: admin.email,
      },
    });
  } catch (err) {
    console.error("Erro em /auth/admin/login:", err);
    return res.status(500).json({
      message: "Erro ao fazer login admin.",
      error: String(err),
    });
  }
});
// ======================================
// 👤 REGISTER USER
// ======================================
router.post("/register", async (req, res) => {
  try {
    let { name, email, phone, pixKey, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Nome, e-mail e senha são obrigatórios.",
      });
    }

    name = String(name).trim();
    email = String(email).trim().toLowerCase();
    phone = phone ? String(phone).trim() : null;
    pixKey = pixKey ? String(pixKey).trim() : null;

    const existing = await prisma.users.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({
        message: "E-mail já está cadastrado.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.users.create({
      data: {
        name,
        email,
        phone,
        pixKey,
        passwordHash,
      },
    });

    return res.status(201).json({
      message: "Usuário cadastrado com sucesso.",
      user: sanitize(user),
    });
  } catch (err) {
    console.error("Erro em /auth/register:", err);
    return res.status(500).json({
      message: "Erro ao cadastrar usuário.",
      error: String(err),
    });
  }
});

// ======================================
// 🔑 LOGIN USER
// ======================================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "E-mail e senha são obrigatórios." });
    }

    const user = await prisma.users.findUnique({
      where: { email: String(email).toLowerCase() },
    });

    if (!user) {
      return res.status(401).json({ message: "Credenciais inválidas." });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: "Credenciais inválidas." });
    }

    const token = jwt.sign(
      {
        id: user.id.toString(),
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Login realizado com sucesso.",
      token,
      user: sanitize(user),
    });
  } catch (err) {
    console.error("Erro em /auth/login:", err);
    return res.status(500).json({
      message: "Erro ao fazer login.",
      error: String(err),
    });
  }
});

// ======================================
// 🛡 LOGIN ADMIN
// ======================================
router.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "E-mail e senha são obrigatórios." });
    }

    const admin = await prisma.admins.findUnique({
      where: { email },
    });

    if (!admin) {
      return res.status(401).json({ message: "Admin não encontrado." });
    }

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: "Senha incorreta." });
    }

    const token = jwt.sign(
      { email: admin.email, role: "admin" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Login admin realizado com sucesso.",
      token,
      admin: sanitize(admin),
    });
  } catch (err) {
    console.error("Erro em /auth/admin/login:", err);
    return res.status(500).json({
      message: "Erro ao fazer login admin.",
      error: String(err),
    });
  }
});

export default router;
