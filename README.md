<a href="https://afilimax.net"><img src="https://raw.githubusercontent.com/Afilimax/.github/main/assets/npm-banner.svg" alt="Afilimax — Encontre a oferta. Gere o link. Divulgue sozinho." width="100%" /></a>

[![npm version](https://img.shields.io/npm/v/%40afilimax%2Fmercado-livre-provider?logo=npm)](https://www.npmjs.com/package/@afilimax/mercado-livre-provider)
[![npm downloads](https://img.shields.io/npm/dm/%40afilimax%2Fmercado-livre-provider?logo=npm)](https://www.npmjs.com/package/@afilimax/mercado-livre-provider)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/Afilimax/mercado-livre-provider/blob/HEAD/LICENSE)
[![Website](https://img.shields.io/badge/website-afilimax.net-7857FF)](https://afilimax.net)

# @afilimax/mercado-livre-provider

Provedor de links de afiliado do Mercado Livre para o ecossistema Afilimax. O pacote usa a API do programa de afiliados com cookies de sessão e uma tag de rastreamento para gerar URLs encurtadas de divulgação.

## Recursos

- Geração de links pela API do Mercado Livre Afiliados.
- Autenticação por cookies da sessão e token CSRF.
- Busca do token CSRF na página do produto com fallback para o cookie `_csrf`.
- Expansão automática de links curtos `meli.la`.
- Extração da URL do produto em páginas sociais do Mercado Livre.
- Remoção da barra final antes do processamento.
- Retorno do campo `short_url` gerado pela API.
- Funcionamento por requisições HTTP, sem abrir um navegador.
- Compatibilidade com `AffiliateProvider` e `AffiliateManager`.

## Instalação

```bash
npm install @afilimax/mercado-livre-provider @afilimax/core
```

O `@afilimax/core` é uma dependência de par obrigatória, na versão `>=0.4.1`.

## Como usar

Carregue os cookies de um arquivo local e informe sua tag de afiliado:

```typescript
import { readFileSync } from "node:fs"
import { MercadoLivreProvider } from "@afilimax/mercado-livre-provider"

const provider = new MercadoLivreProvider({
    tag: process.env.MERCADO_LIVRE_AFFILIATE_TAG!,
    cookies: JSON.parse(readFileSync("cookies.json", "utf8")),
})

async function main() {
    const productUrl = "https://www.mercadolivre.com.br/p/MLB22649400"

    try {
        const affiliateUrl = await provider.createAffiliateUrl(productUrl)
        console.log("Affiliate URL:", affiliateUrl)
    } catch (error) {
        console.error("Failed to create affiliate URL:", error)
    }
}

main()
```

Links curtos e páginas sociais são resolvidos antes da chamada à API de afiliados.

### Uso com AffiliateManager

```typescript
import { AffiliateManager } from "@afilimax/core"
import { MercadoLivreProvider } from "@afilimax/mercado-livre-provider"

const manager = new AffiliateManager([
    new MercadoLivreProvider({
        tag: process.env.MERCADO_LIVRE_AFFILIATE_TAG!,
        cookies: JSON.parse(readFileSync("cookies.json", "utf8")),
    }),
])

const affiliateUrl = await manager.createAffiliateUrl("https://www.mercadolivre.com.br/p/MLB22649400")

console.log("Affiliate URL:", affiliateUrl)
```

O gerenciador retorna `null` quando nenhum provedor registrado aceita a URL.

## Configuração

A interface `MercadoLivreProviderOptions` possui dois campos obrigatórios:

| Opção | Tipo | Descrição |
| :--- | :--- | :--- |
| `cookies` | `any[]` | Cookies da sessão autenticada no Mercado Livre. |
| `tag` | `string` | Tag de identificação usada pelo programa de afiliados. |

Cada cookie precisa conter pelo menos `name` e `value`. O cookie `_csrf`, quando presente, serve como fallback caso o token não seja encontrado na página do produto.

### Como obter os cookies

1. Faça login na conta participante do Mercado Livre Afiliados.
2. Confirme que a área de geração de links está acessível.
3. Exporte os cookies da sessão em JSON com uma extensão de navegador.
4. Salve o conteúdo em `cookies.json` e mantenha o arquivo fora do controle de versão.

Os cookies dão acesso à sua sessão. Não os compartilhe nem os inclua no código.

### Uso sem navegador

O provedor não usa Puppeteer nem outro navegador automatizado. As expansões de URL, a leitura do token CSRF e a criação do link são feitas com requisições HTTP.

## Referência da API

### `new MercadoLivreProvider(options)`

Cria um provedor com os cookies e a tag informados.

### `createAffiliateUrl(url: string): Promise<string>`

Resolve a URL de origem e envia o endereço e a tag para a API de afiliados. Retorna a URL curta gerada ou lança um erro quando a resposta não é bem-sucedida ou não contém `short_url`.

| Parâmetro | Tipo | Descrição |
| :--- | :--- | :--- |
| `url` | `string` | URL do produto, link curto ou página social suportada. |

### `supportsUrl(url: string): boolean`

Método herdado de `AffiliateProvider` que verifica o hostname e seus subdomínios.

### Domínios suportados

- `mercadolivre.com.br`
- `meli.la`

### Erros comuns

| Erro | Causa provável |
| :--- | :--- |
| `Failed to create Mercado Livre affiliate URL` | A API recusou a sessão, a tag ou a URL; o status e o corpo da resposta são incluídos no erro. |
| `Mercado Livre API response missing affiliate link` | A resposta foi recebida sem o campo `short_url`. |
| `Failed to extract product URL from social link` | A página social não expôs uma URL de produto reconhecida. |

## Desenvolvimento

Instale as dependências com `npm install`. Os scripts disponíveis são:

| Comando | Finalidade |
| :--- | :--- |
| `npm run dev` | Executa `src/index.ts` com `ts-node`. |
| `npm run build` | Compila o TypeScript para `dist/`. |
| `npm test` | Executa os testes uma vez com Vitest. |
| `npm run test:watch` | Executa os testes em modo de observação. |
| `npm run test:cov` | Executa os testes com cobertura. |
| `npm run lint` | Executa o ESLint com correção automática. |
| `npm run format` | Formata os arquivos de `src/` com Prettier. |

Os testes práticos incluídos em `npm test` leem `__tests__/cookies.json` e são ignorados quando o arquivo está ausente ou vazio. A tag usada por esses testes está definida no próprio arquivo de teste e deve ser ajustada localmente para uma conta autorizada.

## Licença

Distribuído sob a licença [MIT](./LICENSE).

---

## Automatize sua operação de afiliados

> Use este pacote para automatizar sua operação de afiliados. Conheça a plataforma Afilimax e transforme ofertas em links e divulgação automática.

[Conheça a Afilimax](https://afilimax.net) · [Pacote no npm](https://www.npmjs.com/package/@afilimax/mercado-livre-provider) · [Repositório no GitHub](https://github.com/Afilimax/mercado-livre-provider)
