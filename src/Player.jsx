import { useFrame } from "@react-three/fiber";
import { RigidBody, useRapier } from "@react-three/rapier";
import { useKeyboardControls } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import useGame from "./stores/useGame.jsx";

import { Vector3 } from "three";

export default function Player() {
  const body = useRef();
  const [subscribeKeys, getKeys] = useKeyboardControls();
  const [smoothedCameraPosition] = useState(() => new Vector3(10, 10, 10));
  const [smoothedCameraTarget] = useState(() => new Vector3());
  const start = useGame((state) => state.start);
  const end = useGame((state) => state.end);
  const blocksCount = useGame((state) => state.blocksCount);
  const restart = useGame((state) => state.restart);
  const { rapier, world } = useRapier();
  const rapierWorld = world;

  const reset = () =>
  {
      body.current.setTranslation({ x: 0, y: 1, z: 0 })
      body.current.setLinvel({ x: 0, y: 0, z: 0 })
      body.current.setAngvel({ x: 0, y: 0, z: 0 })
  }

  const jump = () => {
    const origin = body.current.translation();
    origin.y -= 0.31;
    const direction = { x: 0, y: -1, z: 0 };
    const ray = new rapier.Ray(origin, direction);
    const hit = rapierWorld.castRay(ray);

    if (hit.toi < 0.15) body.current.applyImpulse({ x: 0, y: 1, z: 0 });
  };

  useEffect(() => {
    const unsubJump = subscribeKeys(
      (state) => state.jump,
      (value) => {
        if (value) {
          jump();
        }
      }
    );

    const unsubscribeAny = subscribeKeys(() => {
      start();
    });

    const unsubReset = useGame.subscribe(
      (state) => state.phase,
      (value) => {
        if (value === "ready") reset();
      }
    );

    return () => {
      unsubJump();
      unsubscribeAny();
      unsubReset();
    };
  }, []);

  useFrame((state, delta) => {
    const { forward, backward, leftward, rightward } = getKeys();

    const impulse = { x: 0, y: 0, z: 0 };
    const torque = { x: 0, y: 0, z: 0 };

    const impulseStrength = 0.6 * delta;
    const torqueStrength = 0.2 * delta;

    if (forward) {
      impulse.z -= impulseStrength;
      torque.x -= torqueStrength;
    }
    if (backward) {
      impulse.z += impulseStrength;
      torque.x += torqueStrength;
    }

    if (leftward) {
      impulse.x -= impulseStrength;
      torque.z += torqueStrength;
    }

    if (rightward) {
      impulse.x += impulseStrength;
      torque.z -= torqueStrength;
    }

    body.current.applyImpulse(impulse);
    body.current.applyTorqueImpulse(torque);

    const bodyPosition = body.current.translation();
    const cameraPosition = new Vector3();
    cameraPosition.copy(bodyPosition);
    cameraPosition.y += 2.25;
    cameraPosition.z += 2.65;

    const cameraTarget = new Vector3();
    cameraTarget.copy(bodyPosition);
    cameraTarget.y += 0.25;

    smoothedCameraPosition.lerp(cameraPosition, 0.1);
    smoothedCameraTarget.lerp(cameraTarget, 0.1);

    state.camera.position.copy(smoothedCameraPosition);
    state.camera.lookAt(smoothedCameraTarget);

    if (bodyPosition.z < -(blocksCount * 4 + 2)) end();

    if (bodyPosition.y < -4) restart();
  });

  return (
    <>
      <RigidBody
        ref={body}
        colliders="ball"
        position={[0, 1, 0]}
        restitution={0.2}
      >
        <mesh castShadow>
          <icosahedronGeometry args={[0.4, 1]} />
          <meshStandardMaterial flatShading color="mediumpurple" />
        </mesh>
      </RigidBody>
    </>
  );
}
