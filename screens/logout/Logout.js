import React from 'react';
import { View } from "react-native";
import { RESET_ROUTE } from '../../constants/Functions';
import { connect } from 'react-redux';
import { getUserDetails, isLogin } from '../../redux/actions/actions';
import { Icon } from 'native-base';

class Logout extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      user:undefined,
      isLoader:false,
    }
  }

  static navigationOptions = {
    drawerLabel: "Logout",
    drawerIcon: (
      <Icon name='logout' style={{ color: '#757575', fontSize: 25 }} type="MaterialCommunityIcons" />
    ),
  }

  componentDidMount(){
    this._logout();
  }

  _logout = () => {
    this.props.onDispatchIsLogin(false)
    this.props.onDispatchGetUserDetails(undefined);
    this.props.navigation.dispatch(RESET_ROUTE('Login'))
  };


  render() {
    const { isLoader } = this.state;
    return (
      isLoader && <View />
    );
  }
}

const mapStateToProps = (state) => {
  return {
      user: state.AuthReducer.user,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
      onDispatchIsLogin: (flag) => dispatch(isLogin(flag)),
      onDispatchGetUserDetails: (data) => dispatch(getUserDetails(data)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Logout);
