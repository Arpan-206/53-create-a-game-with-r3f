import useGame from "./stores/useGame.jsx";
import { addEffect } from "@react-three/fiber";
import { useEffect, useRef } from "react";
export default function Interface() {
  const restart = useGame((state) => state.restart);
  const phase = useGame((state) => state.phase);
  const time = useRef();

  useEffect(() => {
    const unsubscribeEffect = addEffect(() => {
      const state = useGame.getState();
      let elapsedTime = 0;

      if (state.phase === "playing") elapsedTime = Date.now() - state.startTime;
      else if (state.phase === "ended")
        elapsedTime = state.endTime - state.startTime;
      elapsedTime /= 1000;
      elapsedTime = elapsedTime.toFixed(2);

      if (time.current) time.current.textContent = elapsedTime;
    });

    return () => {
      unsubscribeEffect();
    };
  }, []);

  return (
    <div className="interface">
      <div ref={time} className="time">
        0.00
      </div>
      {phase === "ended" && (
        <div className="restart" onClick={restart}>
          Restart
        </div>
      )}
    </div>
  );
}
