import { describe, it, expect } from "vitest"
import { MercadoLivreProvider } from "../src/index"
import fs from "node:fs"
import path from "node:path"

// O arquivo cookies.json deve estar na raiz do pacote ou ser passado o caminho absoluto.
const COOKIES_PATH = path.join(__dirname, "cookies.json")
const REAL_TAG = "marcuthdev" // Substitua pela sua tag se necessário

let REAL_COOKIES: any[] = []

if (fs.existsSync(COOKIES_PATH)) {
    try {
        REAL_COOKIES = JSON.parse(fs.readFileSync(COOKIES_PATH, "utf-8"))
    } catch (error: any) {
        console.error("❌ Erro ao ler cookies.json:", error.message)
    }
}

describe("MercadoLivreProvider Practical Test", () => {
    it("should create a real affiliate URL (integration)", async () => {
        if (REAL_COOKIES.length === 0) {
            console.warn(`⚠️ Pulando teste prático: Arquivo cookies.json não encontrado ou vazio em: ${COOKIES_PATH}`)
            return
        }

        const provider = new MercadoLivreProvider({
            tag: REAL_TAG,
            cookies: REAL_COOKIES
        })

        const testUrl = "https://produto.mercadolivre.com.br/MLB-885238747-calca-social-masculina-oxford-tradicional-tecido-_JM"

        try {
            console.log(`Gerando link para: ${testUrl}`)
            const affiliateUrl = await provider.createAffiliateUrl(testUrl)

            expect(affiliateUrl).toMatch(/https:\/\/meli\.la\/.*/)

            console.log("✅ Sucesso!")
            console.log(`🔗 Link gerado: ${affiliateUrl}`)
        } catch (error: any) {
            console.error("❌ Falha no teste prático:")
            console.error(error.message)
            throw error
        }
    })

    it(
        "should extract product URL from short links (meli.la) and create a real affiliate URL (integration)",
        async () => {
            if (REAL_COOKIES.length === 0) {
                console.warn(`⚠️ Pulando teste prático: Arquivo cookies.json não encontrado ou vazio em: ${COOKIES_PATH}`)
                return
            }

            const provider = new MercadoLivreProvider({
                tag: REAL_TAG,
                cookies: REAL_COOKIES
            })

            const testUrl = "https://meli.la/2pzPQEr/"

            try {
                console.log(`Gerando link para: ${testUrl}`)
                const affiliateUrl = await provider.createAffiliateUrl(testUrl)

                expect(affiliateUrl).toMatch(/https:\/\/meli\.la\/.*/)

                console.log("✅ Sucesso!")
                console.log(`🔗 Link gerado: ${affiliateUrl}`)
            } catch (error: any) {
                console.error("❌ Falha no teste prático:")
                console.error(error.message)
                throw error
            }
        },
        20000
    )

    it(
        "should extract product URL from social pages and create a real affiliate URL (integration)",
        async () => {
            if (REAL_COOKIES.length === 0) {
                console.warn(`⚠️ Pulando teste prático: Arquivo cookies.json não encontrado ou vazio em: ${COOKIES_PATH}`)
                return
            }

            const provider = new MercadoLivreProvider({
                tag: REAL_TAG,
                cookies: REAL_COOKIES
            })

            const testUrl =
                "https://www.mercadolivre.com.br/social/tj20260304085025?matt_word=tj20260304085025&matt_tool=98606443&forceInApp=true&ref=BJQXJBXbI3SSL2K3o6Nyz09M0aB%2FUTjAL6Yp9CVoar%2FtEBh3IxRpM7NZ2EKdXFU%2BuDrurC8I4ofHuLLW9sQ7Hb88jMT3Fz17mF9OY0MjxWwpytPaL%2Fy9MakyRqK%2FRP2rB7Wgw7eCkafRwesF4nXTfykK6pa4Jw0gBOiljt1AhdSA54iXG39yzvoNdejMnuaPBteNVU8%3D"

            try {
                console.log(`Gerando link para: ${testUrl}`)
                const affiliateUrl = await provider.createAffiliateUrl(testUrl)

                expect(affiliateUrl).toMatch(/https:\/\/meli\.la\/.*/)

                console.log("✅ Sucesso!")
                console.log(`🔗 Link gerado: ${affiliateUrl}`)
            } catch (error: any) {
                console.error("❌ Falha no teste prático:")
                console.error(error.message)
                throw error
            }
        },
        20000
    )
})
