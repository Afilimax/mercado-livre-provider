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