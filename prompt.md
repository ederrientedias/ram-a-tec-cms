# prompt.md — A4Canvas.tsx | Editor de Lâmina A4 (React + TS + Tailwind + shadcn/ui) + Export HTML/CSS para PDF (Puppeteer)

> **Contexto do repositório**: projeto React existente (TypeScript, Tailwind CSS, shadcn/ui).
> **Arquivo alvo**: `A4Canvas.tsx` (já existe).
> **Backend**:
>
> - Persistência: Firestore (JSON da lâmina).
> - Imagens: upload via API existente → retorna **URL pública** (armazenar URL no JSON).
> - PDF: API que recebe **HTML e CSS puros** e gera PDF via Puppeteer.

## Linguagem e postura obrigatórias (atuar como Senior)

- Tom **direto e técnico**, sem filler.
- Fazer **mudanças mínimas e coesas** no projeto: priorizar implementação **dentro** de `A4Canvas.tsx`.
- Só criar arquivos auxiliares se: (a) reduzir complexidade, (b) melhorar reutilização do renderer, (c) justificar objetivamente.
- Não inventar libs ou arquiteturas paralelas.
- Implementar por etapas com **checkpoints verificáveis**.
- Evitar heurísticas frágeis para coordenadas; usar cálculo robusto de drop e clamp.
- Garantir paridade visual entre **Editor** e **Print** (HTML/CSS exportado).

---

## Objetivo do componente

Implementar um **editor de lâminas A4** com:

1. Canvas A4 (210mm × 297mm) com background do template.
2. Cabeçalho **fixo** no topo (sempre presente), com dois textos editáveis por clique.
3. Sidebar com componentes arrastáveis; usuário arrasta e solta na folha para adicionar blocos.
4. Blocos editáveis:
   - **InfoTable** (HTML, não é imagem): layout fixo, usuário edita apenas textos.
   - **TextBlock**: título + parágrafo.
   - **Highlights**: começa com 3 itens; usuário adiciona/remove itens.
   - **ImageGroup**: 1 a 3 imagens no mesmo bloco; usuário adiciona/remove (mín 1, máx 3); layout muda conforme quantidade.
5. Interações: seleção, mover e redimensionar (com outline tracejado e handles).
6. Dois botões: **Salvar** (Firestore JSON) e **Gerar PDF** (exportar HTML+CSS e enviar para API de PDF).
7. Exportação: gerar **HTML e CSS puros** consistentes com o layout, sem dependência do Tailwind runtime.

---

## Bibliotecas (usar exatamente estas)

- Drag & Drop (paleta → A4): dnd-kit
- Move/Resize dentro do A4: react-rnd
- State: zustand
- UI: shadcn/ui (já existe)
- Estilos no editor: Tailwind (já existe)
- Estilos no print: CSS string gerado/manual (não depender do Tailwind build na API)

Documentações oficiais (links):

```txt
dnd-kit: https://docs.dndkit.com/
react-rnd: https://github.com/bokuweb/react-rnd
Zustand: https://docs.pmnd.rs/zustand/getting-started/introduction
shadcn/ui: https://ui.shadcn.com/
Tailwind: https://tailwindcss.com/docs
Firestore: https://firebase.google.com/docs/firestore
```
