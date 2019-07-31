
const transformPoll = event => {
    return {
        ...event._doc,
        _id: event.id
    }
}

exports.transformPoll = transformPoll;