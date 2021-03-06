/*
 * Demo app showing how react-navigation works with Apple TV.
 *
 * @flow
 */

import * as React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  View,
  Text,
  TVMenuControl,
  Platform,
} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

/**
 * We use this Button component instead of the one from react-native,
 * because we need to pass in `isTVSelectable` and have more control
 * over styling.  We also use magnification instead of opacity to highlight
 * which button is focused.
 */
function Button({title, onPress, onFocus, isTVSelectable}) {
  return (
    <TouchableOpacity
      tvParallaxProperties={{magnification: 1.2}}
      activeOpacity={Platform.isTVOS ? 1.0 : 0.5}
      onPress={() => onPress()}
      onFocus={() => onFocus()}
      isTVSelectable={isTVSelectable}>
      <Text style={styles.button}>{title}</Text>
    </TouchableOpacity>
  );
}

Button.defaultProps = {
  isTVSelectable: true,
};

/**
 * Demo button for the upper right that doesn't do anything.
 * It is styled to invisibly extend close to the center of the screen,
 * so that it will be reachable by the tvOS focus engine without having
 * to implement a TVFocusGuideView.  We use tint instead of magnification
 * or opacity to highlight this button when focused.
 */
function InfoButton() {
  const [infoButtonFocused, setInfoButtonFocused] = React.useState(false);
  return (
    <TouchableOpacity
      activeOpacity={1.0}
      style={styles.infoButtonContainer}
      onPress={() => alert('Info')} /* eslint-disable-line no-alert */
      onFocus={() => {
        console.log('Focus: Info button');
        setInfoButtonFocused(true);
      }}
      onBlur={() => setInfoButtonFocused(false)}>
      <View style={styles.spacer} />
      <Text
        style={
          infoButtonFocused
            ? styles.headerBackTitleFocused
            : styles.headerBackTitle
        }>
        Info
      </Text>
    </TouchableOpacity>
  );
}

/**
 * The home screen.
 */
function HomeScreen({navigation}) {
  // Set up focus and blur listeners to set our state properly;
  // isFocused === true when this screen is shown.
  const [isFocused, setIsFocused] = React.useState(false);
  React.useEffect(
    () =>
      navigation.addListener('focus', () => {
        setIsFocused(true);
      }),
    [navigation],
  );
  React.useEffect(
    () =>
      navigation.addListener('blur', () => {
        setIsFocused(false);
      }),
    [navigation],
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home Screen</Text>
      <Button
        isTVSelectable={
          isFocused
        } /* button is removed from focus engine
                                      when screen is not visible */
        onPress={() => navigation.navigate('Screen1')}
        onFocus={() => console.log('Focus: Home')}
        title="Go to Screen 1"
      />
    </View>
  );
}

/**
 * Component for other screens in the stack navigator.
 */
function Screen({route, navigation}) {
  // Same code as above for detecting when screens are visible
  const [isFocused, setIsFocused] = React.useState(false);
  React.useEffect(
    () =>
      navigation.addListener('focus', () => {
        setIsFocused(true);
      }),
    [navigation],
  );
  React.useEffect(
    () =>
      navigation.addListener('blur', () => {
        setIsFocused(false);
      }),
    [navigation],
  );

  // Hacky code to get which screen this is
  const index = parseInt(route.name.substring(6, 7), 10);

  // Enable the menu key when this screen appears.
  // In the cleanup method, disable the menu key again if we are
  // navigating back to the home screen; this way the menu key
  // will exit the app properly if pressed in the home screen.
  React.useEffect(() => {
    TVMenuControl.enableTVMenuKey();
    return () => {
      if (index === 1) {
        TVMenuControl.disableTVMenuKey();
      }
    };
  });

  const nextIndex = index + 1;
  const buttonTitle = `Go to Screen ${nextIndex}`;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{`Screen ${index}`}</Text>
      <View style={styles.buttonContainer}>
        {/* Put some buttons on the screen just for fun */}
        <Button
          isTVSelectable={isFocused}
          onPress={() => {}}
          onFocus={() => console.log(`Focus: ${route.name}, Button 1`)}
          title="Button 1"
        />
        <Button
          isTVSelectable={isFocused}
          onPress={() => {}}
          onFocus={() => console.log(`Focus: ${route.name}, Button 2`)}
          title="Button 2"
        />
        <Button
          isTVSelectable={isFocused}
          onPress={() => {}}
          onFocus={() => console.log(`Focus: ${route.name}, Button 3`)}
          title="Button 3"
        />
      </View>
      {index < 3 /* Don't push more than 3 screens on the stack */ ? (
        <Button
          isTVSelectable={isFocused}
          onPress={() => navigation.navigate(`Screen${nextIndex}`)}
          onFocus={() =>
            console.log(`Focus: ${route.name}, ${index}, nav button`)
          }
          title={buttonTitle}
        />
      ) : null}
    </View>
  );
}

/**
 * Construct the options for the navigation header.
 */

let infoButtonFocused = false;

const headerOptions = (title) => {
  return {
    title,
    headerBackTitleStyle: styles.headerBackTitle,
    headerStyle: styles.header,
    headerTitleContainerStyle: styles.headerTitleContainer,
    headerTitleStyle: styles.headerTitle,
    headerRight: () => <InfoButton />,
  };
};

const Stack = createStackNavigator();

/**
 * Standard construction of a stack navigator.
 */
function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={headerOptions('Home')}
        />
        <Stack.Screen
          name="Screen1"
          component={Screen}
          options={headerOptions('Screen 1')}
        />
        <Stack.Screen
          name="Screen2"
          component={Screen}
          options={headerOptions('Screen 2')}
        />
        <Stack.Screen
          name="Screen3"
          component={Screen}
          options={headerOptions('Screen 3')}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;

const colors = {
  blue: '#0070d2',
  white: '#ffffff',
  yellow: '#ffdd00',
};

const scale = Platform.isTVOS ? 1.0 : 0.5;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 50*scale,
  },
  header: {
    height: 150*scale,
    backgroundColor: colors.blue,
  },
  headerTitle: {
    fontSize: 50*scale,
    color: colors.white,
  },
  headerBackTitle: {
    fontSize: 40*scale,
    color: colors.white,
  },
  headerBackTitleFocused: {
    fontSize: 40*scale,
    color: colors.yellow,
  },
  headerTitleContainer: {
    marginTop: 0,
  },
  button: {
    fontSize: 50*scale,
    color: colors.blue,
    margin: 50*scale,
  },
  buttonContainer: {
    flexDirection: 'row',
    margin: 100*scale,
  },
  infoButtonContainer: {
    backgroundColor: 'transparent',
    width: 700*scale,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spacer: {
    flex: 1,
  },
});
