import {getSecret} from 'wix-secrets-backend';
import {fetch} from 'wix-fetch';

export function restTest(){
    getSecret("UUSE_API_KEY")
    .then ((mySecret)=>{
        const fetchOptions = {
            method: 'get',
            headers:  {
                "content-type": "application/json",
                "Authorization": mySecret,
                'wix-site-id': 'cdf3c1b4-d8d7-45c0-9c7d-d29b1e7040a8'
                },
            body: JSON.stringify({})
            }
//
// fieldsets=CONTENT_TEXT&categoryIds=bfc3b900-ee7c-4ee0-9d48-76a5114f5a84",
//

//
// fetch news items, and check wehen they were last updated
//
        fetch("https://www.wixapis.com/blog/v3/posts?categoryIds=e20a280b-af3d-4c3e-a16a-7c207ade8a7f", fetchOptions)
        .then( (httpResponse) => {
            console.log(httpResponse.status);
             if (httpResponse.ok) {
                httpResponse.json()
                .then((response) => {
                    response.posts.forEach(post => {
                        var date = new Date(post.lastPublishedDate);
                        var expires = new Date()
                        date.setHours(0,0,0,0);
                        expires.setHours(0,0,0,0);
                        expires.setDate(expires.getDate() + 8);
                        if (date > expires){
                            console.log(post.title, date, expires, "Expired");
                        } else {
                            console.log(post.title, date, "Good", post);
                        }
                    })
                    return response;
                })

                return httpResponse.json();
            } else {
                return Promise.reject("Fetch did not succeed");
            }
        })
    })
}

