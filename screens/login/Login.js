import React from 'react';
import { StyleSheet } from 'react-native';
import { View, Image } from "react-native";
import { Button as NativeBaseButton, Text as NativeBaseText, Icon as NativeBaseIcon } from 'native-base';
import { FIREBASE_DATABASE, FIREBASE, FIREBASE_AUTH } from '../../constants/Firebase';
import { RESET_ROUTE } from '../../constants/Functions';
import { connect } from 'react-redux';
import { updateUser, isLogin } from '../../redux/actions/actions';

class Login extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isLogin : this.props.isLogin,
      user:undefined,
    }
  }

  static getDerivedStateFromProps(nextProps){
    return { 
      isLogin:nextProps.isLogin, 
      user:nextProps.user,
    };
  }

  static navigationOptions = {
    header: null,
  };

  componentDidMount(){
    const { isLogin, user } = this.state;
    if(isLogin && user){
       this.props.navigation.dispatch(RESET_ROUTE('Home'))
    }
  }

  _facebookSignIn = async () => {
    try {
      const {
        type,
        token,
      } = await Expo.Facebook.logInWithReadPermissionsAsync('2275771042704097', {
        permissions: ['public_profile'],
      });
      if (type === 'success') {
          await this._firebaseAuthenticate(token);
      } else {
        console.log(type);
      }
    } catch ({ message }) {
      console.log(message);
    }
  };

  _firebaseAuthenticate = (token) => {
    var credential = FIREBASE.auth.FacebookAuthProvider.credential(token);
    FIREBASE_AUTH.signInAndRetrieveDataWithCredential(credential)
      .then((res) => {
        var data = res.user.providerData[0];
        var id = res.user.providerData[0].uid;
        this._saveDetails(id, data);
      })
      .catch(err => console.log(err.message))
  }; 

 
  _saveDetails = (id, data) => {
    FIREBASE_DATABASE.ref('users').child(id).update({
      name:data.displayName,
      id,
      photo:data.photoURL
    }).then(() => {
      this.props.onDispatchIsLogin(true)
      this.props.onDispatchUpdateUser(id);
      this.props.navigation.dispatch(RESET_ROUTE('Home'))

    }).then(() => {
      this.props.navigation.dispatch(RESET_ROUTE('Home')) 
    }).catch(err => console.log(err.message))
  };


  _Button = () => {
    return(
      <View style={styles.subInnerWrapper}>
        <View style={styles.btnWrapper}>
          <NativeBaseButton style={{ width:250 }} iconLeft block bordered light onPress={this._facebookSignIn}>
            <NativeBaseIcon name="logo-facebook"/>
            <NativeBaseText>Login with facebook</NativeBaseText>
          </NativeBaseButton>
        </View>
      </View>
    );
  }

  _Wrapper = () => {
    return(
      <View style={styles.wrapper}>
        <View style={[styles.innerWrapper, { backgroundColor:'#262726' }]}>
          <View style={styles.subInnerWrapper}>
            <Image style={styles.logo} source={require('../../images/logo.png')}/>
            <NativeBaseText style={styles.title}>FAMILY TRACKER</NativeBaseText>
          </View>
        </View>

        <View style={[styles.innerWrapper, { backgroundColor:'#262726' }]}>
            {
              this._Button()
            }
        </View>
      </View>
    );
  }

  render() {
    return (
      <View style={styles.container}>
        { 
          this._Wrapper()
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  wrapper:{
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerWrapper:{
    width:'100%',
    height:'50%',
  },
  subInnerWrapper:{
    flex: 1,
    marginTop:10,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnWrapper:{
    paddingTop:10,
    paddingBottom:10,
  },
  logo:{
    width:150,
    height:150,
  },
  title:{
    color:'#fff',
    fontSize:19,
    marginTop:20
  }
})


const mapStateToProps = (state) => {
  return {
      isLogin: state.AuthReducer.isLogin,
      user: state.AuthReducer.user,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
      onDispatchIsLogin: (flag) => dispatch(isLogin(flag)),
      onDispatchUpdateUser: (id) => dispatch(updateUser(id)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);
