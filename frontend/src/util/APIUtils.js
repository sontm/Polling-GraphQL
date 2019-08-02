import { API_BASE_URL, POLL_LIST_SIZE, ACCESS_TOKEN } from '../constants';

const request = (options) => {
    const headers = new Headers({
        'Content-Type': 'application/json',
    })
    
    if(localStorage.getItem(ACCESS_TOKEN)) {
        headers.append('Authorization', 'Bearer ' + localStorage.getItem(ACCESS_TOKEN))
    }

    const defaults = {headers: headers};
    options = Object.assign({}, defaults, options);

    return fetch(options.url, options)
    .then(response => 
        response.json().then(json => {
            if(!response.ok) {
                return Promise.reject(json);
            }
            return json;
        })
    );
};

// Used GraphQL
export function login(loginRequest) {

    // TODO this Hardcode User
    const GRAPHQL_LOGIN = (username, password) => `
    {
        login (username: "${username}", password:"${password}") {
            _id
            username
        }
    }
    `;
    console.log(loginRequest)
    if (!loginRequest) {
        loginRequest = {
            usernameOrEmail: "",
            password: ""
        }
    }
    return request({
        url: API_BASE_URL,
        method: 'POST',
        body: JSON.stringify({ query: GRAPHQL_LOGIN(loginRequest.usernameOrEmail, loginRequest.password) })
    });
}
// Used GraphQL
export function getCurrentUser() {
    const GRAPHQL_LOGIN_FIX = `
    {
        login (username: "test1", password:"test1") {
            _id
            username
        }
    }
    `;
    if(!localStorage.getItem(ACCESS_TOKEN)) {
        return Promise.reject("No access token set.");
    }

    return request({
        url: API_BASE_URL,
        method: 'POST',
        body: JSON.stringify({ query: GRAPHQL_LOGIN_FIX })
    });
}

// Used GraphQL
export function getAllPolls(page, size) {
    const GRAPHQL_GET_ALLPOLLS = `
    {
        polls {
          _id
          question
          createdBy
          createdDate
          expireDate
          choices {
            _id
            text
            votes {
              username
            }
          }
        }
    }
    `;

    page = page || 0;
    size = size || POLL_LIST_SIZE;

    return request({
        url: API_BASE_URL,
        method: 'POST',
        body: JSON.stringify({ query: GRAPHQL_GET_ALLPOLLS })
    });
}


// Used GraphQL
export function createPoll(pollData) {
    console.log("PollData--->")
    console.log(pollData)

    let createChoices = `choices:[`;
    pollData.choices.forEach(function (item, index) {
        let delimiter = ``;
        if (index > 0) {
            delimiter = `,`;
        }
        createChoices += delimiter + `{text:"${item.text}"}`;
    });
    createChoices += `]`;
    const GRAPHQL_CREATE_FULLPOLL = (pollData, createChoices) => `
        mutation CreatFullPoll {
            createFullPoll (pollWithChoices: 
                {question:"${pollData.question}", createdBy:"${pollData.createdBy.username}",
                inDay: ${pollData.inDay}, inHour: ${pollData.inHour},inMinute: ${pollData.inMinute},
                ${createChoices}}) 
            {
                _id
                question
                createdDate
                expireDate
                createdBy
                choices {
                _id
                text
            }
            }
        }
    `;
        console.log("Query: " + GRAPHQL_CREATE_FULLPOLL(pollData, createChoices));
    return request({
        url: API_BASE_URL,
        method: 'POST',
        body: JSON.stringify({query: GRAPHQL_CREATE_FULLPOLL(pollData, createChoices)})         
    });
}


export function castVote(voteData) {
    console.log("Submit VOte")
    console.log(voteData)

    const GRAPHQL_CREATE_VOTE = (voteData) => `
    mutation CreatVote {
        createVote (
                vote: {username:"${voteData.username}", 
                poll:"${voteData.pollId}",
                choice:"${voteData.choiceId}"}) {
            _id
            question
            createdBy
            createdDate
            expireDate
            choices {
            _id
            text
            votes {
                username
            }
            }
        }
    }
    `;
    return request({
        url: API_BASE_URL,
        method: 'POST',
        body: JSON.stringify({query: GRAPHQL_CREATE_VOTE(voteData)})
    });
}


export function signup(signupRequest) {
    return request({
        url: API_BASE_URL + "/auth/signup",
        method: 'POST',
        body: JSON.stringify(signupRequest)
    });
}

export function checkUsernameAvailability(username) {
    return request({
        url: API_BASE_URL + "/user/checkUsernameAvailability?username=" + username,
        method: 'GET'
    });
}

export function checkEmailAvailability(email) {
    return request({
        url: API_BASE_URL + "/user/checkEmailAvailability?email=" + email,
        method: 'GET'
    });
}


export function getUserProfile(username) {
    return request({
        url: API_BASE_URL + "/users/" + username,
        method: 'GET'
    });
}

export function getUserCreatedPolls(username, page, size) {
    page = page || 0;
    size = size || POLL_LIST_SIZE;

    return request({
        url: API_BASE_URL + "/users/" + username + "/polls?page=" + page + "&size=" + size,
        method: 'GET'
    });
}

export function getUserVotedPolls(username, page, size) {
    page = page || 0;
    size = size || POLL_LIST_SIZE;

    return request({
        url: API_BASE_URL + "/users/" + username + "/votes?page=" + page + "&size=" + size,
        method: 'GET'
    });
}