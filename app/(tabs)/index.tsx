import { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  ListRenderItemInfo,
  View,
  ViewToken,
} from "react-native";

import { useVideoPlayer, VideoView } from "expo-video";
import { videos, videos2, videos3 } from "../../assets/data";

const { height, width } = Dimensions.get("window");

interface VideoWrapper {
  data: ListRenderItemInfo<string>;
  currentIndex: number;
}
const VideoWrapper = ({ data, currentIndex }: VideoWrapper) => {
  const shouldPlay = false;
  const { index, item } = data;

  const player = useVideoPlayer(item, (player) => {
    player.loop = true;
    shouldPlay && player.play();
  });

  useEffect(() => {
    if (!shouldPlay) return;
    if (index !== currentIndex) {
      player.pause();
    } else {
      if (!player.playing) player.play();
    }
  }, [currentIndex]);
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
