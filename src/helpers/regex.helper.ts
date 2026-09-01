export const regexHelper = {
    csrfToken: [/csrfToken[^\"]*\"([^\"]+)\"/, /name=\"csrf-token\"\s+content=\"([^\"]+)\"/],
    productUrl: /https:\/\/produto\.mercadolivre\.com\.br\/[^\s\"?]+/,
    socialUrl: /https?:\/\/(?:www\.)?mercadolivre\.com\.br\/social\/[a-zA-Z0-9_-]+(?:\?[^\s"'\<\>]+)?/i,
    shortLink: /https?:\/\/(?:www\.)?meli\.la\/[^\s]+/i,
}
