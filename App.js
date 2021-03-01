import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react'
import { firebase } from './src/firebase/config'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { LoginScreen, HomeScreen, RegistrationScreen } from './src/screens'
import {decode, encode} from 'base-64'
import { Provider as PaperProvider } from 'react-native-paper';
if (!global.btoa) {  global.btoa = encode }
if (!global.atob) { global.atob = decode }

const Stack = createStackNavigator();

export default function App() {

  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  const onAuthStateChanged = (user) => {
    if (user) {
      const usersRef = firebase.firestore().collection('users');
      usersRef
        .doc(user.uid)
        .get()
        .then((document) => {
          const userData = document.data()
          setLoading(false)
          setUser(userData)
        })
        .catch((error) => {
          setLoading(false)
        });
    } else {
      setUser(null)
      setLoading(false)
    }
  }

  useEffect(() => {
    firebase.auth().onAuthStateChanged(onAuthStateChanged);
  }, []);

  if (loading) {
    return (
      <></>
    )
  }

  return (
    <PaperProvider>  {/* Should be kept inside other providers, since this generates components that may need what they provide */}
      <NavigationContainer>
        <Stack.Navigator>
          { user ? (
            <Stack.Screen name="Home">
              {props => <HomeScreen {...props} extraData={user} />}
            </Stack.Screen>
          ) : (
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Registration" component={RegistrationScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
