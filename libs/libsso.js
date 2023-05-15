export const libSSO = {
    redirect: function (callbackUri) {
        let link = document.createElement('a');
        link.href = decodeURIComponent('https%3A%2F%2Fsso.opensourcedit.com%2Fauth%2Flogin%3FredirectUri%3D')
            + callbackUri;
        link.click();
    },
    verify: function (token, redirectUri) {
        if (token && token != '') {
            fetch(decodeURIComponent('https%3A%2F%2Fsso.opensourcedit.com%2Fauth') + redirectUri, {
                headers: { 'Authorization': 'Bearer ' + token }
            })
                .then(function (response) {
                    if (response.status === 401) { redirect(redirectUri); }
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
        if (token && token != '') { verify(token, redirectUri); }
        else {
            const queryParams = new URLSearchParams(window.location.search);
            const authToken = queryParams.get('token');
            if (authToken && authToken !== '') {
                localStorage.setItem('sf-token', authToken);
                verify(authToken, redirectUri);
            }
            else { redirect(redirectUri); }
        }
    }
}