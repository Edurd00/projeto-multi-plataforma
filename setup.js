const fs = require("fs");
const path = require("path");

const folders = [
  "src/assets",
  "src/config",
  "src/services",
  "src/components/common",
  "src/components/layout",
  "src/components/product",
  "src/components/cart",
  "src/pages/store",
  "src/pages/admin",
  "src/context",
  "src/styles",
];

const files = [
  "src/config/supabase.js",
  "src/config/theme.js",
  "src/services/productService.js",
  "src/services/categoryService.js",
  "src/services/bannerService.js",
  "src/services/promotionService.js",
  "src/services/orderService.js",
  "src/context/AppContext.js",
  "src/styles/index.css",
  "src/main.js",
];

folders.forEach(folder => {
  fs.mkdirSync(folder, { recursive: true });
});

files.forEach(file => {
  fs.writeFileSync(file, "");
});

console.log("Estrutura criada com sucesso!");