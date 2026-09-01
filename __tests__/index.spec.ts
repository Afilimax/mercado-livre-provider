import { describe, it, expect, vi, beforeEach } from "vitest"
import { MercadoLivreProvider } from "../src/index"
import { isSocialLink } from "../src/helpers/is-social-link.helper"
import { isShortLink } from "../src/helpers/is-short-link.helper"

describe("MercadoLivreProvider", () => {
    const mockOptions = {
        tag: "test-tag",
        cookies: [
            { name: "_csrf", value: "test-csrf-token" },
            { name: "session", value: "test-session" }
        ]
    }

    let provider: MercadoLivreProvider

    beforeEach(() => {
        provider = new MercadoLivreProvider(mockOptions)
        vi.restoreAllMocks()
    })

    it("should correctly identify social links", () => {
        const socialUrl =
            "https://www.mercadolivre.com.br/social/tj20260304085025?matt_word=tj20260304085025&matt_tool=98606443&forceInApp=true&ref=BJQXJBXbI3SSL2K3o6Nyz09M0aB%2FUTjAL6Yp9CVoar%2FtEBh3IxRpM7NZ2EKdXFU%2BuDrurC8I4ofHuLLW9sQ7Hb88jMT3Fz17mF9OY0MjxWwpytPaL%2Fy9MakyRqK%2FRP2rB7Wgw7eCkafRwesF4nXTfykK6pa4Jw0gBOiljt1AhdSA54iXG39yzvoNdejMnuaPBteNVU8%3D"
        expect(isSocialLink(socialUrl)).toBe(true)
        expect(isSocialLink("https://produto.mercadolivre.com.br/MLB-123")).toBe(false)
    })

    it("should correctly identify short links", () => {
        expect(isShortLink("https://meli.la/2pzPQEr/")).toBe(true)
        expect(isShortLink("https://produto.mercadolivre.com.br/MLB-123")).toBe(false)
    })

    it("should have the correct name", () => {
        expect(provider.name).toBe("Mercado Livre")
    })

    it("should support correct domains", () => {
        expect(provider.supportsUrl("https://produto.mercadolivre.com.br/MLB-123")).toBe(true)
        expect(provider.supportsUrl("https://meli.la/test")).toBe(true)
        expect(provider.supportsUrl("https://amazon.com.br/test")).toBe(false)
    })

    it("should create an affiliate URL successfully", async () => {
        const mockResponse = {
            short_url: "https://meli.la/short"
        }

        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => mockResponse
        })

        const url = "https://produto.mercadolivre.com.br/MLB-123"
        const result = await provider.createAffiliateUrl(url)

        expect(result).toBe("https://meli.la/short")
        expect(global.fetch).toHaveBeenCalledWith(
            "https://www.mercadolivre.com.br/affiliate-program/api/v2/stripe/user/links",
            expect.objectContaining({
                method: "POST",
                headers: expect.objectContaining({
                    "x-csrf-token": "test-csrf-token",
                    "cookie": "_csrf=test-csrf-token; session=test-session"
                }),
                body: JSON.stringify({
                    url: url,
                    tag: "test-tag"
                })
            })
        )
    })

    it("should throw error when API returns not ok", async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: false,
            status: 403,
            text: async () => "Forbidden"
        })

        await expect(provider.createAffiliateUrl("https://any-url.com"))
            .rejects.toThrow("Failed to create Mercado Livre affiliate URL: 403 Forbidden")
    })

    it("should throw error when short_url is missing in response", async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({})
        })

        await expect(provider.createAffiliateUrl("https://any-url.com"))
            .rejects.toThrow("Mercado Livre API response missing affiliate link")
    })
})
