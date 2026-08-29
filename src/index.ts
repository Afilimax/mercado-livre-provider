import { AffiliateProvider } from "@afilimax/core"
import { regexHelper } from "./helpers/regex.helper"

type MercadoLivreApiResponse = {
    id: string
    created: boolean
    tag: string
    text: string
    short_url: string
    long_url: string
    type_url: string
    generated_date: string
    origin_url: string
    regex: string
    list_url: string
    deeplink_list_url: string
}

export type MercadoLivreProviderOptions = {
    cookies: any[]
    tag: string
}

export class MercadoLivreProvider extends AffiliateProvider<MercadoLivreProviderOptions> {
    readonly name = "Mercado Livre"

    readonly domains = ["mercadolivre.com.br", "meli.la"]

    constructor(options: MercadoLivreProviderOptions) {
        super(options)
    }

    private getCookieString(): string {
        return this.options.cookies
            .map((cookie) => `${cookie.name}=${cookie.value}`)
            .join("; ")
    }

    private async fetchCsrfToken(url: string): Promise<string> {
        const cookieString = this.getCookieString()

        let csrfToken = this.options.cookies.find((cookie) => cookie.name === "_csrf")?.value || ""

        try {
            const pageResponse = await fetch(url, {
                headers: {
                    "cookie": cookieString,
                    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
                }
            })

            if (pageResponse.ok) {
                const html = await pageResponse.text()

                let token: string | undefined

                for (const regex of regexHelper.csrfToken) {
                    const match = html.match(regex)
                    if (match && match[1]) {
                        token = match[1]
                        break
                    }
                }

                if (token) {
                    csrfToken = token
                }
            }
        } catch (error) {
            console.warn("Failed to fetch product page for CSRF token, falling back to cookie value.", error)
        }

        return csrfToken
    }

    async createAffiliateUrl(url: string): Promise<string> {
        url = url.endsWith("/") ? url.slice(0, -1) : url

        if (url.includes("meli.la")) {
            try {
                const redirectResponse = await fetch(url, {
                    method: "GET",
                    headers: {
                        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
                    }
                })
                if (redirectResponse.url && redirectResponse.url !== url) {
                    url = redirectResponse.url
                    url = url.endsWith("/") ? url.slice(0, -1) : url
                }
            } catch (error) {
                console.warn(`Failed to expand meli.la shortlink: ${url}`, error)
            }
        }

        const cookieString = this.getCookieString()
        const csrfToken = await this.fetchCsrfToken(url)

        const response = await fetch(
            "https://www.mercadolivre.com.br/affiliate-program/api/v2/stripe/user/links",
            {
                method: "POST",
                headers: {
                    "accept": "application/json, text/plain, */*",
                    "content-type": "application/json",
                    "x-csrf-token": csrfToken,
                    "cookie": cookieString,
                    "referer": url,
                    "origin": "https://produto.mercadolivre.com.br",
                    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
                },
                body: JSON.stringify({
                    url: url,
                    tag: this.options.tag,
                }),
            }
        )

        if (!response.ok) {
            const errorText = await response.text()

            throw new Error(
                `Failed to create Mercado Livre affiliate URL: ${response.status} ${errorText}`
            )
        }

        const data = (await response.json()) as MercadoLivreApiResponse
        const affiliateUrl = data.short_url

        if (!affiliateUrl) {
            throw new Error(`Mercado Livre API response missing affiliate link: ${JSON.stringify(data)}`)
        }

        return affiliateUrl
    }
}