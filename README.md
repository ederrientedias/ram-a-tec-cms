# 📦 CMS RIZA

Um projeto **React + TypeScript** usando **Vite**, **TailwindCSS**, **shadcn/ui**, **Radix UI** e integrado ao **Firebase Hosting**.  
Inclui ferramentas modernas para autenticação (MSAL), gerenciamento de formulários, queries, animações e deploy simplificado.

---

## 🚀 Tecnologias principais

- [Vite](https://vitejs.dev/) – Build rápido e leve
- [React 18](https://react.dev/) + [React Router](https://reactrouter.com/) – SPA moderna
- [TypeScript](https://www.typescriptlang.org/) – Tipagem estática
- [TailwindCSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) – Estilização e componentes acessíveis
- [Firebase Hosting](https://firebase.google.com/docs/hosting) – Deploy e hospedagem
- [React Query](https://tanstack.com/query) – Data fetching e cache
- [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) – Forms e validação
- [Axios](https://axios-http.com/) – Requisições HTTP
- [Lucide Icons](https://lucide.dev/) – Ícones otimizados

---

## 📂 Estrutura esperada

```bash
cms-riza/
├── src/              # Código fonte
│   ├── components/   # Componentes reutilizáveis
│   ├── pages/        # Páginas da aplicação
│   ├── hooks/        # Custom hooks
│   ├── lib/
│   ├── models/
│   ├── repositories/
│   ├── schemas/
│   ├── services/
│   ├── styles/
│   ├── utils/        # Funções utilitárias
│   └── ...
├── public/           # Arquivos estáticos
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🔧 Scripts disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Build em modo desenvolvimento
npm run build:dev

# Deploy no Firebase
npm run deploy:production      # Produção
npm run deploy:development     # Desenvolvimento
npm run deploy:web-staff-portal # Portal específico

# Lint do código
npm run lint

# Preview do build
npm run preview
```

---

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Rodar localmente
npm run dev
```

---

## 🌐 Deploy

O deploy é feito diretamente no **Firebase Hosting**:

```bash
# Produção
npm run deploy:production

# Desenvolvimento
npm run deploy:development
```

---

## 🛠️ Padrões e Qualidade

- **ESLint** configurado para boas práticas (`eslint . --ext .ts,.tsx,.js,.jsx`)
- Uso de **TypeScript** para evitar erros em tempo de execução
- **TailwindCSS** + **tailwind-merge** para consistência nos estilos

---
