# 🛒 E-Commerce Multi-Nicho - Vitrine & Painel Lojista

> Plataforma completa de E-Commerce responsiva, intuitiva e otimizada para vendas via WhatsApp, acompanhada de um Painel Administrativo em estilo Kanban para gestão de pedidos e catálogo de produtos.

![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

---

## 📝 Sobre o Projeto

O **E-Commerce Multi-Nicho** é uma solução de vitrine virtual de alta performance criada para pequenos e médios empreendedores. Permite a exposição fluida de produtos por categorias, busca preditiva em tempo real, seleção de variações (tamanhos/cores), gaveta de carrinho animada e checkout rápido direcionado para o WhatsApp com mensagens pré-formatadas.

Além da vitrine pública do cliente, a aplicação possui um **Painel de Controle do Lojista (Admin)** com autenticação, Kanban interativo para gerenciamento dos status dos pedidos (Novos 📥 -> Em Preparo 🍳 -> Entregues 🚚), cadastro/edição de produtos com alerta de estoque crítico, e personalização das configurações do tenant (nome da loja, WhatsApp e status Aberto/Fechado).

---

## 🎨 Demonstração & Interface

* **Vitrine Virtual (`/`)**: Grid de produtos responsivo (2 colunas em mobile, 4 em desktop), filtros por categoria com barra *sticky*, busca em tempo real e carrinho deslizante.
* **Painel Administrativo (`/?page=admin`)**: Kanban de pedidos com 3 colunas, formulário dinâmico de cadastro/edição de produtos e controle de estoque.
* **Login de Demonstração (`/?page=login`)**: Acesso instantâneo sem necessidade de credenciais de banco.

*(Substitua por screenshot/GIF da sua demonstração)*
```
┌────────────────────────────────────────────────────────┐
│             [ DEMO PREVIEW / SCREENSHOT ]              │
└────────────────────────────────────────────────────────┘
```

---

## ⚡ Tecnologias Utilizadas

- **[Vite](https://vitejs.dev/)**: Bundler ultrarrápido para desenvolvimento frontend.
- **[JavaScript (ES6+)](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript)**: Arquitetura modular e manipuladores de estado customizados em Vanilla JS.
- **[Tailwind CSS](https://tailwindcss.com/)**: Estilização utilitária moderna com responsividade total e suporte a glassmorphism.

---

## 💡 Camada de Dados Fictícios (Mock Data Architecture)

Para facilitar a integração no seu portfólio e permitir demonstrações públicas interativas e seguras (sem necessidade de configurar chaves de banco de dados ou backend), esta versão utiliza uma camada de serviço simulada (`src/services/api.js` e `src/data/mockData.js`).

- Operações assíncronas são simuladas com `Promise` e pequenos delays (`setTimeout`) para reproduzir o comportamento de APIs de produção.
- Os dados de produtos, categorias, pedidos e configurações persistem localmente via `localStorage`, permitindo testar criação, alteração e exclusão em tempo real.

---

## 🚀 Como Executar Localmente

Siga o passo a passo abaixo para rodar o projeto na sua máquina:

### 1. Clonar o repositório
```bash
git clone https://github.com/seu-usuario/ecommerce-multi-nicho.git
cd ecommerce-multi-nicho
```

### 2. Instalar as dependências
```bash
npm install
```

### 3. Configurar Variáveis de Ambiente (Opcional)
Copie o arquivo de exemplo caso deseje manter a estrutura de ambiente pronta:
```bash
cp .env.example .env
```

### 4. Executar em modo de desenvolvimento
```bash
npm run dev
```
Abra o navegador no endereço exibido no terminal (geralmente `http://localhost:5173`).

### 5. Executar o Build de Produção
```bash
npm run build
```

---

## 📜 Licença

Este projeto está sob a licença MIT. Sinta-se à vontade para utilizar para fins de estudo e portfólio.
