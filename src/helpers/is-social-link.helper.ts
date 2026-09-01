import { regexHelper } from "./regex.helper"

export function isSocialLink(url: string) {
    return regexHelper.socialUrl.test(url)
}
