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

// TODO this Hardcode User
const GRAPHQL_LOGIN = (username, password) => `
{
    login (username: "${username}", password:"${password}") {
        _id
        username
    }
}
`;
const GRAPHQL_LOGIN_FIX = `
{
    login (username: "test1", password:"test1") {
        _id
        username
    }
}
`;

const GRAPHQL_CREATE_FULLPOLL = (pollData) => `
mutation CreatFullPoll {
    createFullPoll (pollWithChoices: 
      {question:"Go Home", choices:[
        {
          text:"No, Stay Here"
        },
        {
          text:"Go by Bus"
        }
        ]}) {
      _id
          question
      choices {
        _id
        text
      }
    }
}
`;

// Used GraphQL
export function login(loginRequest) {
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

    return request({
        url: API_BASE_URL,
        method: 'POST',
        body: JSON.stringify({query: GRAPHQL_CREATE_FULLPOLL})         
    });
}





export function castVote(voteData) {
    return request({
        url: API_BASE_URL + "/polls/" + voteData.pollId + "/votes",
        method: 'POST',
        body: JSON.stringify(voteData)
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