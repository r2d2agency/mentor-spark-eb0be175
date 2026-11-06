# Planejamento — Landing de Vendas + Área de Membros (Netflix)

> Documento de referência: o que o projeto **já tem** e o que **falta** para cada necessidade.
> Stack: Frontend React (Vite) + Backend NestJS + PostgreSQL (multi-tenant). Deploy EasyPanel.

---

## 1. Landing page de vendas de cursos + Área de membros (Netflix)

### 1.1 Já existe
- Área de membros Netflix-style em `/me` (`MentoradoTrailsNetflix`): layout grid/neon/cinema, `CourseCard`, lock de acesso pago.
- Player de trilhas em `/me/trails/:id` (módulos, lições, progresso, certificado).
- Access modes: `OPEN` / `REQUEST` / `PAID` (`trail-access`).
- Checkout de vendas em `/p/:mentor/:page` (Asaas) + coupon.
- Entidade `SalesPage` com `priceCents`, `maxInstallments`, `paymentMode`, `productRefId`.
- Lead/purchase tracking via `LeadsService`.

### 1.2 Falta (gap real)
- **Vinculação automática SalesPage → Trail** (`productRefId` é manual). O grant automático no webhook Asaas já existe (`mentor-billing.service.ts` → `trailAccess.onChargePaid`), mas só dispara se `charge.metadata.trailAccessRequestId` existir. Falta estender para charges originadas de SalesPage, vinculando `productRefId` → `trailId` automaticamente.
- **Vitrine de cursos públicos** — não existe página pública `/cursos` ou `/catalogo` por mentor (só sales pages individuais `/p/...`).
- **Progresso cross-curso e "continuar assistindo"** Netflix-style — falta na home (`MentoradoHome`).

> ✅ Já feito (removido da lista de gaps): aplicar `BrandingContext` em `/me` (já consumido em `MentoradoTrailsNetflix` e `MentoradoHome`); player de vídeo por lição (YouTube/Vimeo embed já existe em `MentoradoTrails`).

---

## 2. Importar landing pages completas (HTML/ZIP) + código de checkout

### 2.1 Já existe
- `POST /sales-pages/import-reference` (URL/HTML) — AI extrai composição JSON (sections, theme, assets). Frontend: `SalesPageEditorPage` com import.
- Renderização via `ImportedCompositionLayout` em `SalesPagePublic`.
- Checkout transparente Asaas com coupon.

### 2.2 Falta (gap real)
- **Import de ZIP/arquivo** (hoje só URL/HTML colado). Precisa upload de ZIP + extração de assets (imagens, CSS) e servir.
- **Código de checkout injetável** — hoje o checkout é um botão do sistema. Precisa de um snippet/código (ex: `<script data-mentor-checkout="slug" ...>` ou `data-checkout-code`) que o criador da landing insere, e o sistema detecta/valida na importação.
- **Validação do código de checkout** — parser que procura o snippet no HTML importado e extrai: valor, forma de pagamento, curso vinculado. Sem ele a página não renderiza.
- **Geração do código de checkout** — endpoint `GET /checkout-code/:salesPageId` (ou similar) que retorna snippet personalizado (valor, método, produto).
- **Slug público** — já existe via `SalesPage.pageSlug`, mas precisa garantir unicidade e rota `/p/:mentor/:page`.
- **Renderização de HTML+CSS+assets próprios** (não só JSON composition) — hoje `ImportedCompositionLayout` renderiza JSON. Para landing completa, precisa servir o HTML importado (sanitizado) com o snippet substituído pelo checkout real.

---

## 3. Plano de implementação por fases

### Fase A — Área de membros personalizada (Netflix)
1. Aplicar `BrandingContext` em `/me` (logo, cor, banner por tenant).
2. Player de vídeo por lição (YouTube/Vimeo/upload) + progresso.
3. Home Netflix: "continuar assistindo", vitrine de trilhas do mentor, lock visual para `PAID`.
4. Auto-grant de trail-access no webhook Asaas (já existe grant manual; automatizar).

### Fase B — Código de checkout injetável
1. Novo endpoint `GET /sales-pages/:id/checkout-code` → retorna snippet (script + data-atributos: valor, método, produto, mentor).
2. Parser de validação no import: detecta snippet, extrai config, valida contra `SalesPage`.
3. Se snippet ausente/inválido → import bloqueado com erro claro.

### Fase C — Import de landing completa (ZIP/HTML)
1. Upload de ZIP → extração server-side → assets em `/uploads/sales-pages/:id/`.
2. Renderização do HTML importado (sanitizado) com substituição do snippet pelo checkout real.
3. Slug público `/p/:mentor/:page` já existente.

### Fase D — Vitrine pública de cursos por mentor
- Página pública `/cursos` ou `/catalogo` por mentor, listando as trilhas/cursos disponíveis (com lock visual para `PAID` e link para sales page/checkout).

---

## 4. Pontos em aberto (decisões de infra/produto)
- **Storage (Fase C):** assets do ZIP vão para `/uploads/sales-pages/:id/` no backend (EasyPanel) ou storage externo (S3/R2)? Hoje como os uploads são servidos?
- **Player de vídeo (Fase A):** YouTube/Vimeo + upload próprio, ou só embed (YouTube/Vimeo)? Upload próprio exige storage/transcoding.
- **Ordem de execução das fases** e nível de entrega (plano detalhado de arquivos vs. implementação direta).
- **Fase D:** escopo mínimo = listagem de trilhas do mentor com link para sales page; ou também filtros/categorias/busca?

---

## 5. Referências rápidas no código
- Frontend: `src/pages/app/` (MentoradoTrailsNetflix, SalesPageEditorPage, SalesPagePublic), `src/contexts/BrandingContext`, `src/components/...`.
- Backend: `backend/src/modules/` (sales-pages, trails, trail-access, leads), `backend/src/entities/` (sales-page.entity, trail*.entity).
- Rotas públicas: `/p/:mentor/:page`, `/me`, `/me/trails/:id`.
