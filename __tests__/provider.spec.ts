import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { isSocialLink } from "../src/helpers/is-social-link.helper"
import { isProductUrl } from "../src/helpers/is-product-url.helper"
import { isShortLink } from "../src/helpers/is-short-link.helper"
import { MercadoLivreProvider } from "../src/index"

const mocks = vi.hoisted(() => ({ clientFetch: vi.fn(), extractValue: vi.fn() }))

vi.mock("@xcrap/got-scraping-client", () => ({
    GotScrapingClient: class {
        fetch = mocks.clientFetch
    },
}))

const API_URL = "https://www.mercadolivre.com.br/affiliate-program/api/v2/stripe/user/links"
const PRODUCT = "https://produto.mercadolivre.com.br/MLB-123-produto"
const SOCIAL = "https://www.mercadolivre.com.br/social/loja"
const SHORT = "https://meli.la/abc"

type FakeResponse = {
    ok?: boolean
    status?: number
    url?: string
    text?: string
    json?: unknown
}

const respond = ({ ok = true, status = 200, url = "", text = "", json = {} }: FakeResponse = {}) => ({
    ok,
    status,
    url,
    text: async () => text,
    json: async () => json,
})

type Router = (url: string, init?: RequestInit) => ReturnType<typeof respond> | Promise<ReturnType<typeof respond>>

function stubFetch(router: Router) {
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => router(url, init))
    vi.stubGlobal("fetch", fetchMock)
    return fetchMock
}

const okApi = respond({ json: { short_url: "https://meli.la/affiliate" } })

const makeProvider = (
    cookies: any[] = [
        { name: "_csrf", value: "cookie-token" },
        { name: "sid", value: "1" },
    ],
) => new MercadoLivreProvider({ cookies, tag: "minha-tag" })

const apiCall = (fetchMock: ReturnType<typeof stubFetch>) => fetchMock.mock.calls.find(([url]) => url === API_URL)!

beforeEach(() => {
    vi.spyOn(console, "warn").mockImplementation(() => {})
    mocks.clientFetch.mockReset()
    mocks.extractValue.mockReset()
    mocks.clientFetch.mockResolvedValue({ asHtmlParser: () => ({ extractValue: mocks.extractValue }) })
})

afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
})

describe("helpers", () => {
    it("detect product, social and short links", () => {
        expect(isProductUrl(PRODUCT)).toBe(true)
        expect(isProductUrl("https://example.com")).toBe(false)
        expect(isSocialLink(SOCIAL)).toBe(true)
        expect(isSocialLink(PRODUCT)).toBe(false)
        expect(isShortLink(SHORT)).toBe(true)
        expect(isShortLink(PRODUCT)).toBe(false)
    })
})

describe("createAffiliateUrl: api call", () => {
    it("sends the cookies, csrf token and tag, and returns the short url", async () => {
        const fetchMock = stubFetch((url) => (url === API_URL ? okApi : respond({ text: 'csrfToken: "page-token"' })))

        await expect(makeProvider().createAffiliateUrl(`${PRODUCT}/`)).resolves.toBe("https://meli.la/affiliate")

        const [, init] = apiCall(fetchMock)
        expect(init!.method).toBe("POST")
        expect(init!.headers).toMatchObject({
            "x-csrf-token": "page-token",
            cookie: "_csrf=cookie-token; sid=1",
            referer: PRODUCT,
        })
        expect(JSON.parse(init!.body as string)).toEqual({ url: PRODUCT, tag: "minha-tag" })
    })

    it("does not touch urls without a trailing slash", async () => {
        const fetchMock = stubFetch((url) => (url === API_URL ? okApi : respond()))

        await makeProvider().createAffiliateUrl(PRODUCT)

        expect(JSON.parse(apiCall(fetchMock)[1]!.body as string).url).toBe(PRODUCT)
    })

    it("throws with the status and body when the api fails", async () => {
        stubFetch((url) => (url === API_URL ? respond({ ok: false, status: 403, text: "forbidden" }) : respond()))

        await expect(makeProvider().createAffiliateUrl(PRODUCT)).rejects.toThrow(
            "Failed to create Mercado Livre affiliate URL: 403 forbidden",
        )
    })

    it("throws when the response has no short url", async () => {
        stubFetch((url) => (url === API_URL ? respond({ json: { id: "1" } }) : respond()))

        await expect(makeProvider().createAffiliateUrl(PRODUCT)).rejects.toThrow(
            'Mercado Livre API response missing affiliate link: {"id":"1"}',
        )
    })
})

describe("fetchCsrfToken", () => {
    const csrf = (provider: MercadoLivreProvider) => (provider as any).fetchCsrfToken(PRODUCT) as Promise<string>

    it.each([
        ["the csrfToken pattern", 'foo csrfToken: "abc" bar', "abc"],
        ["the csrf meta tag", '<meta name="csrf-token" content="meta-token">', "meta-token"],
    ])("reads the token from %s", async (_name, html, expected) => {
        stubFetch(() => respond({ text: html }))

        await expect(csrf(makeProvider())).resolves.toBe(expected)
    })

    it("keeps the cookie value when the page has no token", async () => {
        stubFetch(() => respond({ text: "<html></html>" }))

        await expect(csrf(makeProvider())).resolves.toBe("cookie-token")
    })

    it("keeps the cookie value when the page request is not ok", async () => {
        stubFetch(() => respond({ ok: false, status: 500 }))

        await expect(csrf(makeProvider())).resolves.toBe("cookie-token")
    })

    it("returns an empty token when there is no cookie and no page token", async () => {
        stubFetch(() => respond({ text: "" }))

        await expect(csrf(makeProvider([]))).resolves.toBe("")
    })

    it("warns and keeps the cookie value when the request throws", async () => {
        stubFetch(() => {
            throw new Error("network")
        })

        await expect(csrf(makeProvider())).resolves.toBe("cookie-token")
        expect(console.warn).toHaveBeenCalledWith(
            expect.stringContaining("Failed to fetch product page"),
            expect.any(Error),
        )
    })
})

describe("short links", () => {
    const route = (redirect: FakeResponse | (() => never)) =>
        stubFetch((url) => {
            if (url === SHORT) {
                return typeof redirect === "function" ? redirect() : respond(redirect)
            }
            return url === API_URL ? okApi : respond()
        })

    const sentUrl = (fetchMock: ReturnType<typeof stubFetch>) => JSON.parse(apiCall(fetchMock)[1]!.body as string).url

    it("uses the expanded url", async () => {
        const fetchMock = route({ url: `${PRODUCT}/` })

        await makeProvider().createAffiliateUrl(SHORT)

        expect(sentUrl(fetchMock)).toBe(PRODUCT)
    })

    it("extracts the product url from an expanded social page", async () => {
        const fetchMock = route({ url: SOCIAL, text: `<a href="${PRODUCT}?x=1">` })
        // the social url is replaced by the product found on the page, so no social lookup happens
        await makeProvider().createAffiliateUrl(SHORT)

        expect(sentUrl(fetchMock)).toBe(PRODUCT)
        expect(mocks.clientFetch).not.toHaveBeenCalled()
    })

    it("keeps the social url when the expanded page has no product", async () => {
        mocks.extractValue.mockResolvedValue(PRODUCT)
        route({ url: SOCIAL, text: "<html></html>" })

        await makeProvider().createAffiliateUrl(SHORT)

        expect(mocks.clientFetch).toHaveBeenCalledWith({ url: SOCIAL })
    })

    it.each([
        ["has no url", { url: "" }],
        ["redirects to itself", { url: SHORT }],
    ])("keeps the original url when the redirect %s", async (_name, redirect) => {
        const fetchMock = route(redirect)

        await makeProvider().createAffiliateUrl(SHORT)

        expect(sentUrl(fetchMock)).toBe(SHORT)
    })

    it("warns and keeps the original url when the expansion fails", async () => {
        const fetchMock = route(() => {
            throw new Error("network")
        })

        await makeProvider().createAffiliateUrl(SHORT)

        expect(sentUrl(fetchMock)).toBe(SHORT)
        expect(console.warn).toHaveBeenCalledWith(
            expect.stringContaining("Failed to expand meli.la shortlink"),
            expect.any(Error),
        )
    })
})

describe("social links", () => {
    const sentUrl = (fetchMock: ReturnType<typeof stubFetch>) => JSON.parse(apiCall(fetchMock)[1]!.body as string).url

    function run(href: string | null) {
        mocks.extractValue.mockResolvedValue(href)
        const fetchMock = stubFetch((url) => (url === API_URL ? okApi : respond()))
        return { fetchMock, promise: makeProvider().createAffiliateUrl(SOCIAL) }
    }

    it("uses the featured product link", async () => {
        const { fetchMock, promise } = run(PRODUCT)
        await promise

        expect(mocks.clientFetch).toHaveBeenCalledWith({ url: SOCIAL })
        expect(sentUrl(fetchMock)).toBe(PRODUCT)
    })

    it("throws when no product link is found", async () => {
        await expect(run(null).promise).rejects.toThrow("Failed to extract product URL from social link")
    })

    it("unwraps the target of tracking links", async () => {
        const { fetchMock, promise } = run(`https://click.mercadolivre.com.br/x?url=${encodeURIComponent(PRODUCT)}`)
        await promise

        expect(sentUrl(fetchMock)).toBe(PRODUCT)
    })

    it("keeps the link when the url parameter is empty", async () => {
        const href = "https://click.mercadolivre.com.br/x?url="
        const { fetchMock, promise } = run(href)
        await promise

        expect(sentUrl(fetchMock)).toBe(href)
    })

    it("warns and keeps the link when it cannot be parsed", async () => {
        const { fetchMock, promise } = run("/relative?url=abc")
        await promise

        expect(sentUrl(fetchMock)).toBe("/relative?url=abc")
        expect(console.warn).toHaveBeenCalledWith(
            expect.stringContaining("Failed to parse inner target URL"),
            expect.any(Error),
        )
    })
})
