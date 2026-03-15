export const regexHelper = {
    csrfToken: [
        /csrfToken[^\"]*\"([^\"]+)\"/,
        /name=\"csrf-token\"\s+content=\"([^\"]+)\"/,
    ] 
}