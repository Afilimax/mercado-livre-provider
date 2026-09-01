import { regexHelper } from "./regex.helper"

export function isShortLink(url: string) {
    return regexHelper.shortLink.test(url)
}
