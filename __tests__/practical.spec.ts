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

    it("should extract product URL from social pages and create a real affiliate URL (integration)", async () => {
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
    })
})
