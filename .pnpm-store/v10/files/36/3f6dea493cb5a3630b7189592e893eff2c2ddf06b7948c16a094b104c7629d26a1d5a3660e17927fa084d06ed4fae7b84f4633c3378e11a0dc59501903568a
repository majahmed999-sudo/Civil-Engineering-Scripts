"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSessionUsingBrowserAuthFlowAsync = getSessionUsingBrowserAuthFlowAsync;
const tslib_1 = require("tslib");
const assert_1 = tslib_1.__importDefault(require("assert"));
const better_opn_1 = tslib_1.__importDefault(require("better-opn"));
const crypto_1 = tslib_1.__importDefault(require("crypto"));
const http_1 = tslib_1.__importDefault(require("http"));
const api_1 = require("../api");
const fetch_1 = tslib_1.__importDefault(require("../fetch"));
const log_1 = tslib_1.__importDefault(require("../log"));
const CLIENT_ID = 'eas-cli';
function generateCodeVerifier() {
    return crypto_1.default.randomBytes(32).toString('base64url');
}
function generateCodeChallenge(codeVerifier) {
    return crypto_1.default.createHash('sha256').update(codeVerifier).digest('base64url');
}
function generateState() {
    return crypto_1.default.randomBytes(32).toString('base64url');
}
async function exchangeCodeForSessionSecretAsync({ code, codeVerifier, redirectUri, }) {
    const tokenUrl = `${(0, api_1.getExpoApiBaseUrl)()}/v2/auth/token`;
    const response = await (0, fetch_1.default)(tokenUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri,
            code_verifier: codeVerifier,
            client_id: CLIENT_ID,
        }),
    });
    const result = await response.json();
    const sessionSecret = result?.data?.session_secret;
    if (!sessionSecret) {
        throw new Error('Failed to obtain session secret from token exchange.');
    }
    return sessionSecret;
}
async function getSessionUsingBrowserAuthFlowAsync({ sso = false }) {
    const scheme = 'http';
    const hostname = 'localhost';
    const callbackPath = '/auth/callback';
    const expoWebsiteUrl = (0, api_1.getExpoWebsiteBaseUrl)();
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);
    const state = generateState();
    const buildRedirectUri = (port) => `${scheme}://${hostname}:${port}${callbackPath}`;
    const buildExpoLoginUrl = (port, sso) => {
        // Note: we avoid URLSearchParams here because better-opn calls encodeURI()
        // on the URL before passing it to AppleScript, which would double-encode
        // the percent-encoded values from URLSearchParams.toString().
        const params = [
            `client_id=${CLIENT_ID}`,
            `redirect_uri=${buildRedirectUri(port)}`,
            `response_type=code`,
            `code_challenge=${codeChallenge}`,
            `code_challenge_method=S256`,
            `state=${state}`,
            `confirm_account=true`,
        ].join('&');
        return `${expoWebsiteUrl}${sso ? '/sso-login' : '/login'}?${params}`;
    };
    // Start server and begin auth flow
    const executeAuthFlow = () => {
        return new Promise(async (resolve, reject) => {
            const connections = new Set();
            const server = http_1.default.createServer((request, response) => {
                const redirectAndCleanup = (result) => {
                    const redirectUrl = `${expoWebsiteUrl}/oauth/expo-cli?result=${result}`;
                    response.writeHead(302, { Location: redirectUrl });
                    response.end();
                    server.close();
                    for (const connection of connections) {
                        connection.destroy();
                    }
                };
                const handleRequestAsync = async () => {
                    if (!(request.method === 'GET' && request.url?.includes('/auth/callback'))) {
                        throw new Error('Unexpected login response.');
                    }
                    const url = new URL(request.url, `http:${request.headers.host}`);
                    const code = url.searchParams.get('code');
                    const returnedState = url.searchParams.get('state');
                    if (!code) {
                        throw new Error('Request missing code search parameter.');
                    }
                    if (returnedState !== state) {
                        throw new Error('State mismatch. Possible CSRF attack.');
                    }
                    const address = server.address();
                    (0, assert_1.default)(address !== null && typeof address === 'object');
                    const redirectUri = buildRedirectUri(address.port);
                    const sessionSecret = await exchangeCodeForSessionSecretAsync({
                        code,
                        codeVerifier,
                        redirectUri,
                    });
                    resolve(sessionSecret);
                    redirectAndCleanup('success');
                };
                handleRequestAsync().catch(error => {
                    redirectAndCleanup('error');
                    reject(error);
                });
            });
            server.listen(0, hostname, () => {
                log_1.default.log('Waiting for browser login...');
                const address = server.address();
                (0, assert_1.default)(address !== null && typeof address === 'object', 'Server address and port should be set after listening has begun');
                const port = address.port;
                const authorizeUrl = buildExpoLoginUrl(port, sso);
                log_1.default.log(`If your browser doesn't automatically open, visit this link to log in: ${authorizeUrl}`);
                void (0, better_opn_1.default)(authorizeUrl);
            });
            server.on('connection', connection => {
                connections.add(connection);
                connection.on('close', () => {
                    connections.delete(connection);
                });
            });
        });
    };
    return await executeAuthFlow();
}
