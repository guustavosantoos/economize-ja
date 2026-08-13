# Economize Já — Rules & Development Workflow Standards

## 🚨 Git Branching & Code Review Policy (MANDATORY)

1. **NUNCA Enviar Alterações Direto para a Branch `main`:**
   - Todas as correções, novas funcionalidades e refatorações devem ser desenvolvidas obrigatoriamente em uma nova branch isolada (ex: `feature/nome-da-feature` ou `fix/nome-do-bug`).

2. **Auditoria de Código via Skills (Code Review Obligatório):**
   - **Alterações de Frontend (`apps/web`):** Passar obrigatoriamente pela auditoria da skill `@frontend-code-review` (`.claude/skills/frontend-code-review/SKILL.md`) para verificar regressões visuais, acessibilidade, performance de re-renderização e contratos de componentes.
   - **Alterações de Backend (`apps/api`):** Passar obrigatoriamente pela auditoria da skill `@backend-developer` (`.claude/skills/backend-developer/SKILL.md`) para verificar a arquitetura NestJS, validações de DTO, guards de autenticação JWT, Prisma ORM e documentação Swagger.

3. **Análise de Impacto (Impact Assessment):**
   - Verificar atentamente se a alteração afeta algum outro ponto da aplicação, contrato de API ou testes automatizados do Playwright antes de qualquer merge ou envio.
