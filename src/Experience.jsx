import Lights from "./Lights.jsx";
import Level from "./Level.jsx";
import { Physics } from "@react-three/rapier";
import Player from "./Player.jsx";
import useGame from "./stores/useGame.jsx";

export default function Experience() {
  const blocksCount = useGame((state) => state.blocksCount);
  const blocksSeed = useGame(state => state.blocksSeed)

  return (
    <>
      <Physics>
      <color args={ [ '#252731' ] } attach="background" />
        <Lights />

        <Level count={blocksCount} seed={ blocksSeed } />
        <Player />
      </Physics>
    </>
  );
}
