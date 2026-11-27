<a href="https://afilimax.net"><img src="https://raw.githubusercontent.com/Afilimax/.github/main/assets/npm-banner.svg" alt="Afilimax — Encontre a oferta. Gere o link. Divulgue sozinho." width="100%" /></a>

[![npm version](https://img.shields.io/npm/v/%40afilimax%2Fmercado-livre-provider?logo=npm)](https://www.npmjs.com/package/@afilimax/mercado-livre-provider)
[![npm downloads](https://img.shields.io/npm/dm/%40afilimax%2Fmercado-livre-provider?logo=npm)](https://www.npmjs.com/package/@afilimax/mercado-livre-provider)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/Afilimax/mercado-livre-provider/blob/HEAD/LICENSE)
[![Website](https://img.shields.io/badge/website-afilimax.net-7857FF)](https://afilimax.net)

# @afilimax/mercado-livre-provider

Provedor de links de afiliados para o Mercado Livre, integrado ao ecossistema Afilimax. Este pacote permite converter URLs de produtos do Mercado Livre em links de afiliados encurtados utilizando a API oficial (via headers de autenticação/cookies).

## Instalação

```bash
npm install @afilimax/mercado-livre-provider
```

> [!IMPORTANT]
> Este pacote requer `@afilimax/core` como dependência de par (peer dependency).

## Como usar

O `MercadoLivreProvider` utiliza autenticação baseada em cookies para interagir com a API de afiliados do Mercado Livre.

```typescript
import { MercadoLivreProvider } from "@afilimax/mercado-livre-provider";

const provider = new MercadoLivreProvider({
    tag: "sua_tag_de_afiliado",
    cookies: [
        { name: "_csrf", value: "seu_token_csrf" },
        { name: "_d2id", value: "..." },
        // outros cookies necessários para a sessão
    ]
});

async function run() {
    const originalUrl = "https://produto.mercadolivre.com.br/MLB-12345678-produto-exemplo-_JM";
    
    try {
        const affiliateUrl = await provider.createAffiliateUrl(originalUrl);
        console.log("Link de Afiliado:", affiliateUrl); // Retorna a short_url gerada
    } catch (error) {
        console.error("Erro ao gerar link:", error.message);
    }
}

run();
```

## Configurações

A interface `MercadoLivreProviderOptions` aceita as seguintes propriedades:

| Propriedade | Tipo | Descrição |
| :--- | :--- | :--- |
| `tag` | `string` | Sua tag de identificação de afiliado (nickname/ID). |
| `cookies` | `any[]` | Array de cookies de sessão para autenticação na API. |

## Domínios Suportados

O provedor identifica automaticamente URLs dos seguintes domínios:
- `mercadolivre.com.br`
- `meli.la`

## Desenvolvimento

### Scripts Disponíveis

- `npm run build`: Compila o projeto para o diretório `dist`.
- `npm run dev`: Executa o projeto em ambiente de desenvolvimento usando `ts-node`.
- `npm run lint`: Verifica e corrige problemas de estilo de código.
- `npm run format`: Formata o código fonte usando Prettier.

---

Produzido com ❤️ pela equipe **Afilimax**.
---

## Automatize sua operação de afiliados

> Use este pacote para automatizar sua operação de afiliados. Conheça a plataforma Afilimax e transforme ofertas em links e divulgação automática.

[Conheça a Afilimax](https://afilimax.net) · [Pacote no npm](https://www.npmjs.com/package/@afilimax/mercado-livre-provider) · [Repositório no GitHub](https://github.com/Afilimax/mercado-livre-provider)
