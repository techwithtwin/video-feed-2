import { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  ListRenderItemInfo,
  Pressable,
  StyleSheet,
  View,
  ViewToken,
} from "react-native";

import { useVideoPlayer, VideoView } from "expo-video";
import { videos, videos2, videos3 } from "../../assets/data";
import { Image } from "expo-image";

const { height, width } = Dimensions.get("window");

interface VideoWrapper {
  data: ListRenderItemInfo<string>;
  currentIndex: number;
}
const VideoWrapper = ({ data, currentIndex }: VideoWrapper) => {
  const [paused, setPaused] = useState(true);
  const { index, item } = data;

  const player = useVideoPlayer(item, (player) => {
    player.loop = true;
  });

  useEffect(() => {
    //if video is not in view pause it
    if (index !== currentIndex) {
      if (player.playing) player.pause();
    }
    // video is in view
    else {
      //player has been paused and should stop playing
      if (paused) {
        if (player.playing) player.pause();
      }
      //player is playing and should be resumed
      else {
        if (!player.playing) player.play();
      }
    }
  }, [currentIndex, paused]);

  const pauseToggle = () => {
    setPaused(!paused);
  };
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <VideoView
        style={{
          width,
          height: height,
        }}
        player={player}
        contentFit="cover"
        nativeControls={false}
      />

      <Pressable onPress={pauseToggle} style={styles.videoOverlay} />
      {paused && (
        <View style={styles.pauseOverlay}>
          <Image
            source={require("../../assets/custom-assets/pause.png")}
            contentFit="contain"
            style={styles.pause}
          />
        </View>
      )}
    </View>
  );
};

export default function HomeScreen() {
  const [allVideos, setAllVideos] = useState(videos);
  const [currentIndex, setCurrentIndex] = useState(0);

  const numOfRefreshes = useRef(0);

  const fetchMoreData = () => {
    if (numOfRefreshes.current === 0) {
      setAllVideos([...allVideos, ...videos2]);
    } else if (numOfRefreshes.current === 1) {
      setAllVideos([...allVideos, ...videos3]);
    }
    numOfRefreshes.current += 1;
  };

  const onViewableItemsChanged = ({
    viewableItems,
  }: {
    viewableItems: ViewToken<string>[];
    changed: ViewToken<string>[];
  }) => {
    const lastItem = viewableItems.at(-1);

    if (!lastItem || !lastItem.key) return;
    if (Number(lastItem.key) == currentIndex) return;
    const newIndex = Number(lastItem.key);

    setCurrentIndex(newIndex);
  };
  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={allVideos}
        initialNumToRender={1}
        snapToInterval={height}
        snapToAlignment="center"
        decelerationRate="fast"
        pagingEnabled
        onEndReachedThreshold={0.3}
        onEndReached={fetchMoreData}
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        renderItem={(data) => (
          <VideoWrapper data={data} currentIndex={currentIndex} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "black",
    opacity: 0.3,
    justifyContent: "center",
    alignItems: "center",
  },
  pause: {
    height: 50,
    width: 50,
  },
  pauseOverlay: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
  },
});
