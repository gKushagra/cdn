export const libSSO = {
    redirect: function (callbackUri) {
        let link = document.createElement('a');
        link.href = decodeURIComponent('https%3A%2F%2Fsso.opensourcedit.com%2Fauth%2Flogin%3FredirectUri%3D')
            + callbackUri;
        link.click();
    },
    verify: function (token, redirectUri) {
        if (token && token != '') {
            fetch(
                decodeURIComponent('https%3A%2F%2Fsso.opensourcedit.com%2Fauth%2Fverify%3FredirectUri%3D')
                + redirectUri,
                {
                    headers: { 'Authorization': 'Bearer ' + token }
                })
                .then(function (response) {
                    if (response.status === 401) { this.redirect(redirectUri); }
                    else { return response.text(); }
                })
                .then(function (data) {
                    let redirectSuccess = document.createElement('a');
                    redirectSuccess.href = redirectUri;
                    redirectSuccess.click();
                })
                .catch(function (error) {
                    console.error(error);
                    localStorage.removeItem('sf-token');
                });
        }
    },
    login: function (redirectUri) {
        const token = localStorage.getItem('sf-token');
        if (token && token != '') { this.verify(token, redirectUri); }
        else {
            const queryParams = new URLSearchParams(window.location.search);
            const authToken = queryParams.get('token');
            if (authToken && authToken !== '') {
                localStorage.setItem('sf-token', authToken);
                this.verify(authToken, redirectUri);
            }
            else { this.redirect(redirectUri); }
        }
    }
}

export const sso = {
    errors: {
        unauthorized: function () {
            return new Promise((resolve, reject) => reject(new Error('Unauthorized')));
        }
    },
    tokens: {
        save: (key, value) => localStorage.setItem(key, value),
        get: (key) => localStorage.getItem(key),
        remove: (key) => localStorage.removeItem(key)
    },
    api: {
        get: function (key, uri) {
            if (!sso.tokens.get(key)) { return sso.errors.unauthorized() }
            return fetch(uri, { headers: { 'Authorization': `Bearer ${sso.tokens.get(key)}` } })
                .then((res) => {
                    if (res.status === 401) { throw new Error('Unauthorized'); }
                    else { return res; }
                });
        }
    },
    logout: function (keys, redirectUri) {
        keys.forEach(key => this.tokens.remove(key));
        window.location.href = redirectUri;
    }
};
