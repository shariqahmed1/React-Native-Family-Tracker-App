import React from 'react';
import { StyleSheet, Image, ImageBackground, Text, View } from 'react-native';
import { createAppContainer, createDrawerNavigator, DrawerItems } from 'react-navigation';
import HomeScreen from '../screens/home/Home';
import CirclesScreen from '../screens/circles/Circles';
import JoinCircle from '../screens/joinCircle/JoinCircle';
import Logout from '../screens/logout/Logout';
import { Container, Content } from 'native-base';
import { connect } from 'react-redux';

const CustomComponent = (props) => (
  <Container>
    <ImageBackground style={{ height: 250, width: '100%' }} source={require('../images/drawerBg.jpg')}>
      <View style={styles.profileWrapper}>
        <Image style={{ height: 50, width: 50, borderRadius: 100 }} source={{ uri: props.user.photo }} />
        <Text style={styles.profileText}>{props.user.name}</Text>
      </View>
    </ImageBackground>
    <Content>
      <DrawerItems {...props} />
    </Content>
  </Container>
);

const CustomDrawerComponent = connect(state => ({ user: state.AuthReducer.user }), {})(CustomComponent);

const MyDrawerNavigator = createDrawerNavigator({
  Home: {
    screen: HomeScreen,
  },
  Circles: {
    screen: CirclesScreen
  },
  JoinCircle: {
    screen: JoinCircle
  },
  Logout: {
    screen: Logout
  },
}, {
    initialRouteName: 'Home',
    contentComponent: CustomDrawerComponent,
    drawerOpenRoute: "DrawerOpen",
    drawerCloseRoute: "DrawerClose",
    drawerToggleRoute: "DrawerToggle",
  });

const DrawerApp = createAppContainer(MyDrawerNavigator);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileWrapper: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileText: {
    marginTop: 10,
    color: '#fff'
  }
});

export default DrawerApp;