import {
  View,
  Heading,
  Text,
  Row,
  XIcon,
  Spacer,
  Button,
  StatusIndicator,
  ChevronRightIcon,
  Divider,
} from 'expo-dev-client-components';
import * as React from 'react';
import { StyleSheet, useWindowDimensions, Animated } from 'react-native';

import { Packager } from '../../functions/getLocalPackagersAsync';
import { useLocalPackagers } from '../../hooks/useLocalPackagers';
import {
  addDeepLinkListener,
  getPendingDeepLink,
  loadApp,
} from '../../native-modules/DevLauncherInternal';

type PendingDeepLinkPromptProps = {};

export function PendingDeepLinkPrompt({}: PendingDeepLinkPromptProps) {
  const { height: screenHeight } = useWindowDimensions();
  const { data: packagers } = useLocalPackagers();
  const [pendingDeepLink, setPendingDeepLink] = React.useState('123');
  const animatedValue = React.useRef(new Animated.Value(0));

  const toggleModal = (isVisible: boolean) => {
    Animated.timing(animatedValue.current, {
      toValue: isVisible ? 1 : 0,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  React.useEffect(() => {
    getPendingDeepLink().then((url) => {
      setPendingDeepLink(url);
    });
  }, []);

  React.useEffect(() => {
    const listener = addDeepLinkListener((url) => {
      setPendingDeepLink(url);
    });

    return () => {
      listener.remove();
    };
  }, []);

  React.useEffect(() => {
    pendingDeepLink ? toggleModal(true) : toggleModal(false);
  }, [pendingDeepLink]);

  const onClosePress = () => {
    setPendingDeepLink('');
  };

  const onPackagerPress = async (packager: Packager) => {
    await loadApp(packager.url);
  };

  const translateY = animatedValue.current.interpolate({
    inputRange: [0, 1],
    outputRange: [screenHeight, 0],
  });

  const transform = [
    {
      translateY,
    },
  ];

  const opacity = animatedValue.current.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  return (
    <Animated.View style={[StyleSheet.absoluteFillObject, { transform, opacity }]}>
      <Button
        padding="medium"
        style={[StyleSheet.absoluteFill, { justifyContent: 'center' }]}
        onPress={onClosePress}>
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0, 0.8)' }]} />

        <View py="medium" rounded="large" bg="default" shadow="small">
          <Row px="medium">
            <Heading size="small">Deep link received:</Heading>
            <Spacer.Horizontal size="flex" />
            <Button onPress={onClosePress}>
              <XIcon />
            </Button>
          </Row>

          <Spacer.Vertical size="small" />
          <View py="small" bg="secondary" rounded="medium" px="medium" mx="small">
            <Text type="mono">{pendingDeepLink}</Text>
          </View>

          <Spacer.Vertical size="large" />

          <View px="medium">
            <Text size="large">Select an app to open it:</Text>

            <Spacer.Vertical size="medium" />
            <View>
              {packagers.map((packager, index, arr) => {
                const isLastItem = index === arr.length - 1;

                return (
                  <View key={packager.description} rounded="medium">
                    <Button onPress={() => onPackagerPress(packager)}>
                      <Row align="center" py="medium" px="small">
                        <StatusIndicator size="small" status="success" />
                        <Spacer.Horizontal size="small" />
                        <Text>{packager.description}</Text>
                        <Spacer.Horizontal size="flex" />
                        <ChevronRightIcon />
                      </Row>
                    </Button>
                    {!isLastItem && <Divider />}
                  </View>
                );
              })}
            </View>

            <Spacer.Vertical size="large" />

            <Button bg="tertiary" rounded="medium" py="small" px="medium" onPress={onClosePress}>
              <Text size="large" align="center" weight="semibold" button="tertiary">
                Open somewhere else
              </Text>
            </Button>
          </View>
        </View>
      </Button>
    </Animated.View>
  );
}
