# Como publicar o GlucoApp na App Store

## Pré-requisitos

- [ ] Conta Apple Developer ativa (developer.apple.com — US$99/ano)
- [ ] Node.js instalado no seu computador
- [ ] EAS CLI instalado: `npm install -g eas-cli`

---

## Passo 1 — Login no EAS

```bash
eas login
```

Entre com o seu Apple ID cadastrado na conta de desenvolvedor.

---

## Passo 2 — Criar o projeto no EAS

Dentro da pasta `artifacts/glucoapp`, rode:

```bash
eas init
```

Isso vai gerar um `projectId` real. **Substitua** o valor `SEU_PROJECT_ID_AQUI` no `app.json` pelo ID gerado.

---

## Passo 3 — Personalizar o Bundle Identifier (opcional)

No `app.json`, o campo `ios.bundleIdentifier` está como `com.glucoapp.app`.

Se quiser um identificador personalizado, mude para algo como `com.seunome.glucoapp`. Esse ID precisa ser **único** no mundo inteiro.

---

## Passo 4 — Configurar o eas.json

Abra o `eas.json` e preencha os campos na seção `submit.production`:

| Campo | Onde encontrar |
|---|---|
| `appleId` | Seu e-mail da conta Apple Developer |
| `ascAppId` | App Store Connect → Meu App → Informações gerais |
| `appleTeamId` | developer.apple.com → Conta → Team ID |

---

## Passo 5 — Criar o app na App Store Connect

1. Acesse [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. Clique em **+** → **Novo App**
3. Plataforma: **iOS**
4. Nome: **GlucoApp**
5. Idioma principal: **Português (Brasil)**
6. Bundle ID: `com.glucoapp.app`
7. SKU: `glucoapp-001` (qualquer código único seu)

---

## Passo 6 — Gerar o build de produção

```bash
cd artifacts/glucoapp
eas build --platform ios --profile production
```

O EAS vai fazer o build na nuvem. Você receberá um e-mail quando terminar (~15 minutos).

---

## Passo 7 — Enviar para a App Store

```bash
eas submit --platform ios --profile production
```

Ou faça upload manual do `.ipa` usando o **Transporter** (app gratuito no Mac App Store).

---

## Passo 8 — Preencher informações na App Store Connect

Antes de submeter para revisão, preencha:

- **Capturas de tela** (iPhone 6.7" e iPhone 6.5" obrigatórias)
- **Descrição** do app em português
- **Palavras-chave**: diabetes, glicose, glicemia, saúde, monitoramento
- **Categoria**: Saúde e Fitness
- **URL da Política de Privacidade** (obrigatório — pode criar uma gratuita em [privacypolicygenerator.info](https://privacypolicygenerator.info))
- **Classificação etária**: 4+
- **Informações de contato**

---

## Passo 9 — Submeter para revisão

Clique em **"Adicionar à Revisão"** na App Store Connect.

A Apple geralmente aprova em **1 a 3 dias úteis**.

---

## Dica para apps de saúde

Durante a revisão, a Apple pode perguntar se o app oferece diagnóstico médico. A resposta certa é:

> "O GlucoApp é apenas um diário pessoal de registros de glicose. Não oferece diagnóstico, tratamento ou aconselhamento médico."

---

## Comandos úteis

```bash
# Ver status dos builds
eas build:list

# Publicar atualização OTA (sem novo build)
eas update --channel production --message "Correção de bugs"

# Incrementar versão
# Edite "version" no app.json antes de um novo build
```
