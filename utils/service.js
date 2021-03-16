const { jwt_identifier } = require("./constants");

exports.cookieToken = (req) => {
    const rawCookies = req.headers.cookie && req.headers.cookie.split('; ');
    let token;
    if (rawCookies) {
        rawCookies.forEach(rawCookie => {
            const parsedCookie = rawCookie.split('=');
            if (parsedCookie[0] === jwt_identifier) {
                token = parsedCookie[1];
            };
        });
    }
    return token;
}