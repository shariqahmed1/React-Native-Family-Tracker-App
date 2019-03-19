import { createAppContainer, createStackNavigator } from 'react-navigation';
import LoginScreen from '../screens/login/Login';
import MembersListScreen from '../screens/membersList/MembersList';
import CreateCircleScreen from '../screens/createCircle/CreateCircle';
import ShareCode from '../screens/shareCode/ShareCode';
import DrawerApp from './DrawerNavigation';

const MyDrawerNavigator = createStackNavigator({
  Login: {
    screen: LoginScreen,
  },
  CreateCircle: {
    screen: CreateCircleScreen
  },
  MembersList: {
    screen: MembersListScreen
  },
  Home: {
    screen: DrawerApp
  },
  ShareCode: {
    screen: ShareCode
  }
}, {
    headerMode: 'none',
    initialRouteName: 'Login'
  });

const StackApp = createAppContainer(MyDrawerNavigator);

export default StackApp;