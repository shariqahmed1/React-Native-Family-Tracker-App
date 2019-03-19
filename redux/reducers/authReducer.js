const reducer = (state = {}, action) => {
    switch(action.type) {
        case "GET_USER_DETAILS": {
            return {...state, user: action.user}
        }
        case "IS_LOGIN" :{
            return {...state, isLogin : action.isLogin}
        }
        case "MY_CIRCLES":{
            return {...state, myCircles : action.myCircles}
        }
        default: {
            return state;
        }
    }
}

export default reducer