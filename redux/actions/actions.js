import { FIREBASE_DATABASE }  from '../../constants/Firebase';

const getUserDetails = (user) => {
    return{
        type: "GET_USER_DETAILS",
        user,
    }
}

const updateUser =  (id) => async dispatch => {
    FIREBASE_DATABASE.ref('users').child(id).once('value', snap => {
        dispatch(getUserDetails(snap.val()))
    })
}

const myCircles = (myCircles) => {
    return{
        type: "MY_CIRCLES",
        myCircles,
    }
}

const isLogin = (flag) => {
    return{
        type: "IS_LOGIN",
        isLogin:flag,
    }
}


export {
    getUserDetails,
    myCircles,
    isLogin,
    updateUser
}