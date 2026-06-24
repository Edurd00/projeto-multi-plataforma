## 2025-06-24 - Refatoração UI/UX Shopify-Style
**Aprendizado:** A manutenção da consistência visual em um projeto Vanilla JS requer componentes modulares e um sistema de injeção de temas robusto via variáveis CSS integradas ao Tailwind.
**Ação:** Implementado `ImageUpload` e `ProductDetailsModal` desacoplados, com injeção dinâmica de `--cor-primaria` e `--cor-secundaria` no `src/config/theme.js` e mapeamento no `tailwind.config.js`.
