import React, { Component } from 'react';
import { getAllPolls, getUserCreatedPolls, getUserVotedPolls } from '../util/APIUtils';
import Poll from './Poll';
import { castVote } from '../util/APIUtils';
import LoadingIndicator  from '../common/LoadingIndicator';
import { Button, Icon, notification } from 'antd';
import { POLL_LIST_SIZE } from '../constants';
import { withRouter } from 'react-router-dom';
import './PollList.css';

class PollList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            polls: [],
            page: 0,
            size: 10,
            totalElements: 0,
            totalPages: 0,
            last: true,
            currentVotes: [],
            isLoading: false
        };
        this.loadPollList = this.loadPollList.bind(this);
        this.handleLoadMore = this.handleLoadMore.bind(this);
    }

    isPollExpired(poll) {
        const expirationTime = new Date(poll.expireDate).getTime();
        const currentTime = new Date().getTime();
    
        var difference_ms = expirationTime - currentTime;
        var seconds = Math.floor( (difference_ms/1000) % 60 );

        if (seconds < 0) {
            return true;
        } else {
            return false;
        }
    }

    loadPollList(page = 0, size = POLL_LIST_SIZE) {
        let promise;
        if(this.props.username) {
            if(this.props.type === 'USER_CREATED_POLLS') {
                promise = getUserCreatedPolls(this.props.username, page, size);
            } else if (this.props.type === 'USER_VOTED_POLLS') {
                promise = getUserVotedPolls(this.props.username, page, size);                               
            }
        } else {
            promise = getAllPolls(page, size);
        }

        if(!promise) {
            return;
        }

        this.setState({
            isLoading: true
        });

        promise            
        .then(response => {
            console.log("GEt Polls OK:")
            console.log(response)
            const polls = this.state.polls.slice();
            const currentVotes = this.state.currentVotes.slice();
            // Check if this User Voted any
            response.data.polls.forEach((poll, pollIndex) => {
                if (poll.choices) {
                    poll.choices.forEach((choice, choiceIndex) => {
                        if (choice.votes) {
                            choice.votes.forEach((vote, voteIndex) => {
                                // if current user is in this votes, VOTED
                                if (this.props.currentUser && 
                                        vote.username == this.props.currentUser.username) {
                                    currentVotes[pollIndex] = choice.id
                                    poll.selectedChoice = choice.id
                                }
                            })  
                        }
                    })  
                }
                poll.expired = this.isPollExpired(poll)         
            });

            this.setState({
                polls: polls.concat(response.data.polls),
                page: 1,
                size: 1,
                //page: response.page,
                //size: response.size,
                totalElements: response.totalElements,
                //totalPages: response.totalPages,
                //last: response.last,
                totalPages: 1,
                last: 1,
                currentVotes: currentVotes.concat(Array(response.data.polls.length).fill(null)),
                isLoading: false
            })
        }).catch(error => {
            this.setState({
                isLoading: false
            })
        });  
        
    }

    componentDidMount() {
        this.loadPollList();
    }

    componentDidUpdate(nextProps) {
        if(this.props.isAuthenticated !== nextProps.isAuthenticated) {
            // Reset State
            this.setState({
                polls: [],
                page: 0,
                size: 10,
                totalElements: 0,
                totalPages: 0,
                last: true,
                currentVotes: [],
                isLoading: false
            });    
            this.loadPollList();
        }
    }

    handleLoadMore() {
        this.loadPollList(this.state.page + 1);
    }

    handleVoteChange(event, pollIndex) {
        console.log("handleVoteChange");
        const currentVotes = this.state.currentVotes.slice();
        currentVotes[pollIndex] = event.target.value;
        console.log(currentVotes);
        this.setState({
            currentVotes: currentVotes
        });
    }


    handleVoteSubmit(event, pollIndex) {
        event.preventDefault();
        if(!this.props.isAuthenticated) {
            this.props.history.push("/login");
            notification.info({
                message: 'Polling App',
                description: "Please login to vote.",          
            });
            return;
        }

        const poll = this.state.polls[pollIndex];
        const selectedChoice = this.state.currentVotes[pollIndex];

        const voteData = {
            pollId: poll.id,
            choiceId: selectedChoice,
            username: this.props.currentUser.username
        };

        castVote(voteData)
        .then(response => {
            const polls = this.state.polls.slice();
            console.log("Voted Result")
            console.log(response)

            polls[pollIndex] = response.data.createVote;
            this.setState({
                polls: polls
            });        
        }).catch(error => {
            if(error.status === 401) {
                this.props.handleLogout('/login', 'error', 'You have been logged out. Please login to vote');    
            } else {
                notification.error({
                    message: 'Polling App',
                    description: error.message || 'Sorry! Something went wrong. Please try again!'
                });                
            }
        });
    }

    render() {
        const pollViews = [];
        this.state.polls.forEach((poll, pollIndex) => {
            pollViews.push(<Poll 
                key={poll.id} 
                poll={poll}
                currentVote={this.state.currentVotes[pollIndex]} 
                handleVoteChange={(event) => this.handleVoteChange(event, pollIndex)}
                handleVoteSubmit={(event) => this.handleVoteSubmit(event, pollIndex)} />)            
        });

        return (
            <div className="polls-container">
                {pollViews}
                {
                    !this.state.isLoading && this.state.polls.length === 0 ? (
                        <div className="no-polls-found">
                            <span>No Polls Found.</span>
                        </div>    
                    ): null
                }  
                {
                    !this.state.isLoading && !this.state.last ? (
                        <div className="load-more-polls"> 
                            <Button type="dashed" onClick={this.handleLoadMore} disabled={this.state.isLoading}>
                                <Icon type="plus" /> Load more
                            </Button>
                        </div>): null
                }              
                {
                    this.state.isLoading ? 
                    <LoadingIndicator />: null                     
                }
            </div>
        );
    }
}

export default withRouter(PollList);