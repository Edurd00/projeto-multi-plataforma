# Diário do Bolt ⚡

Este diário registra apenas aprendizados críticos sobre performance e arquitetura deste projeto.

## 2025-05-14 - [Redundância de chamadas ao Supabase] **Aprendizado:** O projeto utiliza um `appContext` que já inicializa e armazena os dados do `tenant_settings`. Fazer chamadas diretas ao Supabase para buscar esses mesmos dados em componentes individuais (como Home e Dashboard) gera latência desnecessária e consumo de banda. **Ação:** Centralizar o acesso aos dados do tenant via `appContext.getState().tenant`.
