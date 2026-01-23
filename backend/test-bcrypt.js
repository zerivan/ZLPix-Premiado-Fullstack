const bcrypt = require("bcryptjs");

(async () => {
  const hash = "$2b$10$wK3lJZJ3WlXK8g0s3qQ5eOeF9m1kYk8N8XbZ2Qv1LwXy9zQeYp2bS";
  const senha = "Admin@2026#Segura";

  const result = await bcrypt.compare(senha, hash);
  console.log("Senha confere?", result);
})();