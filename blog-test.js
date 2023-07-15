import {getSecret} from 'wix-secrets-backend';
import {fetch} from 'wix-fetch';


export function restTest(){
    var payload = {
                action:'UPDATE_REVERT_TO_DRAFT',
                draftPost: {}
            }
    getSecret("UUSE_API_KEY")
    .then ((mySecret)=>{
        const fetchOptions = {
            method: 'get',
            headers:  {
                "content-type": "application/json",
                "Authorization": mySecret,
                'wix-site-id': 'cdf3c1b4-d8d7-45c0-9c7d-d29b1e7040a8'
                },
            body: JSON.stringify(payload)
            }
        fetch("https://www.wixapis.com/blog/v3/draft-posts/a7f08ad8-68d4-492f-a10b-4af09bbf9627", fetchOptions)
        .then( (httpResponse) => {
            console.log(httpResponse.status);
             if (httpResponse.ok) {
                httpResponse.json()
                .then((response) => {
                    payload.draftPost = response.draftPost;
                    fetchOptions.body = JSON.stringify(payload);
                    fetchOptions.method = 'patch';
                    console.log("fectch option",fetchOptions);
                    fetch("https://www.wixapis.com/blog/v3/draft-posts/a7f08ad8-68d4-492f-a10b-4af09bbf9627", fetchOptions)
                    .then((httpResponse)=>{
                        httpResponse.json()
                        .then ((httpResponse) =>{
                        console.log("patch",httpResponse);
                        })
                    })
                    .catch((error) => {console.log("error",error)})

                })
             }
        })
    })
}

