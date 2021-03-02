
- [React Native Firebase](#react-native-firebase)
  - [Getting Started (with Expo)](#getting-started-with-expo)
- [Explaining the code](#explaining-the-code)
  - [Project structure](#project-structure)
  - [Explaining App.js](#explaining-appjs)
    - [The imports](#the-imports)
    - [The Stack Navigator](#the-stack-navigator)
    - [The App() Component](#the-app-component)
      - [**State**](#state)
      - [**Handling authentication**](#handling-authentication)
      - [**The return statement**](#the-return-statement)

# React Native Firebase

This is a React Native Firebase Starter Project forked from [here](https://github.com/instamobile/react-native-firebase) that I used as my first react and firebase project. 

<center><img src="https://www.instamobile.io/wp-content/uploads/2020/05/react-native-firebase.png" alt="react native firebase"/></center>

The original project contained the following features:

* Registration with E-mail & Password
* Login with E-mail and Password
* Handling persisted login credentials
* Navigation (react-native-navigation)
* Writing to Firestore Database
* Reading from Firestore Database
* Creating Firestore indices (for performance)

On top of this, I have:

* Extracted firebase credentials to a secret file.
* Added logging out from the home screen back to the login screen.
* Re-implemented the ui of the login screen using [React Native Paper](https://callstack.github.io/react-native-paper/)
* Added README files in the src directory, explaining all that should be known to understand the

## Getting Started (with Expo)

If you are using Expo Cli, clone the repo and run "expo start" in the root folder of the project:

```
git clone https://github.com/instamobile/react-native-firebase.git
cd react-native-firebase
expo start
```

This React Native Firebase starter is built with Firebase Web SDK, which makes it compatible with both Expo CLI and React Native CLI.

# Explaining the code

If you are unfamiliar with React and React Native I recommend you to read the [React Native documentation](https://reactnative.dev/docs/getting-started) before going further.

## Project structure

In the root of the project we have a few files:
 * .gitignore - used by git to avoid tracking unwanted files.
 * App.js - this file completely defines de look and behavior of our app. While it imports components and styles from other files, the only component that React Native knows about is the one that this file defines and exports.
 * app.json - contains some metadata about the app.
 * babel.config.js - configuration for babel (I don't even know what that is yet.)
 * package.json - contains info about the dependencies of the app.

 Also we find a few directories:
 * .expo-shared - that is created and used by expo
 * assets - there we have a couple icons that we use on our screens
 * src - there is all the code that App.js uses to implement our app. If you want to dive deeper take a look at the README.md files inside that directory.

 ## Explaining App.js

 Now I'll proceed to explain App.js line by line. Note that this explanation may become outdated if I change something there but forget to update this README file (feel free to create an issue to notify me). Even if that happens this explanation will remain valid.


### The imports
 ```JSX
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
```

Nothing fancy here, just importing from a few libraries:
* `react-native-gesture-handler` for gesture recognition (not sure if it is used in the project, but was included in the source)
* `React` so that React and JSX works.
* `useEffect` and `useState` from react, a couple functions I'll explain later.
* `firebase` (our database and login handler) already configured by other of our source files.
* `NavigationContainer` and `createStackNavigator` to implement navigation between screens.
* Our screens from `src/screens/`
* `decode` and `encode` from `base-64`. Don't blame me, but I don't know if these are used. Were already here when I arrived.
* `PaperProvider` from `Paper`. A component that wraps our app to provide the material design Paper components with theme and other things.


### The Stack Navigator

Then we create our stack navigator
```JSX
const Stack = createStackNavigator();
```
A navigator allows us to go between multiple screens. In this case we use a Stack Navigator, that keeps track of the screens traversed by the user and lets us "go back" to previous screens. The `createStackNavigator` function returns an object with two properties:
* `Screen` - a component that will allow us to define screens inside the navigator.
* `Navigator` - The navigator component itself.

If you need more info about navigation, I recommend you to check the [React Native Navigation docs](https://reactnavigation.org/docs/getting-started).
***


### The App() Component

Now we begin the definition of our app. It is a function component that is exported will be rendered by React Native.

```JSX
export default function App() {
```
#### **State**

The first thing that we encounter inside is the [state](https://reactnative.dev/docs/intro-react#state) of the App component:

```JSX
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
```

* We will make `loading` remain true until we have fetched all the info we need for the app to work, and prevent screen rendering until its done.
* user will store our user data while we are signed in.


#### **Handling authentication**

Then, we define the function that will be used by the component whenever the auth states changes (more on that later).

```JSX
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
```

It uses the [firestore api](https://firebase.google.com/docs/firestore?hl=en). Firestore is the firebase product we are using to persist our data. Lets explain what you need to understand it:
* The argument `user` will be an object if we are signed in, and `null` otherwise.
* If we are signed in, `firebase.firestore().collection('users')` will give us a reference to the `users` collection in the firestore, where all info about users is stored.
* with `.doc(user.uid)` we retrieve a reference to the document in that collection that has tha same identifier as our user.
* then, with `.get()` we make a request to get the documents data.
* since these requests are asynchronous we need to use the `then` function to specify what we want to happens when we ger that document.
* When we get the data, we set our App component `user` state to the retrieved data, and `loading` to `false`, with:
```JSX
        .then((document) => {
          const userData = document.data()
          setLoading(false)
          setUser(userData)
        })
```
* After that we catch possible errors that may arrise and set `loading` to false:
```JSX
        .catch((error) => {
          setLoading(false)
        });
```
* Finally, we define what will happen if `user` is null and thus we are not logged in. Simply we set the `user` component state to `null` (to signify a log out) and `loading` to `false`.
```JSX
    } else {
      setUser(null)
      setLoading(false)
    }
```

After defining that function, we write:
```JSX
  useEffect(() => {
    firebase.auth().onAuthStateChanged(onAuthStateChanged);
  }, []);
```

with useEffect we tell React Native to call a function after each render of the component. [See the useEffect docs for more info](https://reactjs.org/docs/hooks-reference.html#useeffect).

What we want React to do after the App is rendered is telling firebase that we want our `onAuthStateChanged` function to be called whenever there is a auth state change (including at the start of the app). We do that with the line:
```firebase.auth().onAuthStateChanged(onAuthStateChanged);```

More info about that [in the docs](https://firebase.google.com/docs/auth/web/manage-users#get_the_currently_signed-in_user)

After the useEffect hook we have this block of code:
```JSX
  if (loading) {
    return (
      <></>
    )
  }
```
It tells react to render nothing if the `loading` state is `true`. Is what makes the loading behavior work.


#### **The return statement**

Finally, we have the reurn statement that defines the structure of the app:
```JSX
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
```
Lets break it down a bit:
* first we wrap everything into a `<PaperProvider>`. That allows us to use the Paper library of material design components. [More info in their docs](https://callstack.github.io/react-native-paper/getting-started.html). Note: if we had other providers we'll need the `PaperProvider` to be nested inside them, since some components created by this container may need what they provide.
* second, we wrap everything again inside our `<NavigatorContainer>`. It is needed to keep all the navigation state among other things. [Its docs here](https://reactnavigation.org/docs/navigation-container/).
* now we introduce our `Stack.Navigator` that we created outside of the `App` component definition. [Its docs here](https://reactnavigation.org/docs/stack-navigator/).
* Inside we have a conditional statement:
```JSX
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
```
In plain english, it would read: "If we are logged in, show the HomeScreen. Otherwise, show the LoginScreen (the first in the Stack) and allow navigation to the RagistrationSceen". The fun thing is that whenever the `user` property changes the app will re-render with the right screens inside the navigator. [More info about his behavior here](https://reactnavigation.org/docs/auth-flow).

Note that you don't need (or can) normally navigate from Login to Home, since they wont coexist inside the Stack navigator.

This is also worth noting:
```JSX
<Stack.Screen name="Home">
  {props => <HomeScreen {...props} extraData={user} />}
</Stack.Screen>
```
Here, instead of telling the Home screen what component to load using the `component` prop, we give it a render function as children. `Stack.Screen` understand this and will use that render function as its `component`.

We use this in order add the `user` to the `props` that will be passed to the `HomeScreen` component.

********************************

And that's it! I hope with the explanation and all the docs all makes more sense now.

