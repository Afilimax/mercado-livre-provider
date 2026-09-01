import { regexHelper } from "./regex.helper"

export function isProductUrl(url: string) {
    return regexHelper.productUrl.test(url)
}
