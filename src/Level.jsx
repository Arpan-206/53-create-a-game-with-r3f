import { CuboidCollider, RigidBody } from "@react-three/rapier";
import {
  BoxGeometry,
  ColorManagement,
  MeshStandardMaterial,
  Quaternion,
  Euler,
} from "three";
import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";

ColorManagement.legacyMode = false;

const boxGeometry = new BoxGeometry(1, 1, 1);
const floor1Material = new MeshStandardMaterial({ color: '#111111', metalness: 0, roughness: 0 })
const floor2Material = new MeshStandardMaterial({ color: '#222222', metalness: 0, roughness: 0 })
const obstacleMaterial = new MeshStandardMaterial({ color: '#ff0000', metalness: 0, roughness: 1 })
const wallMaterial = new MeshStandardMaterial({ color: '#887777', metalness: 0, roughness: 0 })

function StartBlock({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      {/* Floor */}
      <mesh
        receiveShadow
        position={[0, -0.1, 0]}
        geometry={boxGeometry}
        scale={[4, 0.2, 4]}
        material={floor1Material}
      />
    </group>
  );
}

function SpinnerBlock({ position = [0, 0, 0] }) {
  const obstacle = useRef();
  const [speed] = useState(
    () => (Math.random() + 0.2) * (Math.random() > 0.5 ? 1 : -1)
  );
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const rotation = new Quaternion();
    rotation.setFromEuler(new Euler(0, time * speed, 0));
    obstacle.current.setNextKinematicRotation(rotation);
  });
  return (
    <group position={position}>
      {/* Floor */}
      <RigidBody type="fixed">
        <mesh
          receiveShadow
          position={[0, -0.1, 0]}
          geometry={boxGeometry}
          scale={[4, 0.2, 4]}
          material={floor2Material}
        />
      </RigidBody>
      {/* Obstacle */}
      <RigidBody
        ref={obstacle}
        type="kinematicPosition"
        position={[0, 0.3, 0]}
        restitution={0.2}
        friction={0}
      >
        <mesh
          castShadow
          receiveShadow
          geometry={boxGeometry}
          scale={[3.5, 0.3, 0.3]}
          material={obstacleMaterial}
        />
      </RigidBody>
    </group>
  );
}

function LimboBlock({ position = [0, 0, 0] }) {
  const obstacle = useRef();
  const [timeOffset] = useState(() => Math.random() * 2 * Math.PI);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    obstacle.current.setNextKinematicTranslation({
      x: position[0],
      y: position[1] + Math.sin(time + timeOffset) + 1.15,
      z: position[2],
    });
  });
  return (
    <group position={position}>
      {/* Floor */}
      <RigidBody type="fixed">
        <mesh
          receiveShadow
          position={[0, -0.1, 0]}
          geometry={boxGeometry}
          scale={[4, 0.2, 4]}
          material={floor2Material}
        />
      </RigidBody>
      {/* Obstacle */}
      <RigidBody
        ref={obstacle}
        type="kinematicPosition"
        position={[0, 0.5, 0]}
        restitution={0.2}
        friction={0}
      >
        <mesh
          castShadow
          receiveShadow
          geometry={boxGeometry}
          scale={[3.5, 0.3, 0.3]}
          material={obstacleMaterial}
        />
      </RigidBody>
    </group>
  );
}

function AxeBlock({ position = [0, 0, 0] }) {
  const obstacle = useRef();
  const [timeOffset] = useState(() => Math.random() * 2 * Math.PI);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    obstacle.current.setNextKinematicTranslation({
      x: position[0] + Math.sin(time + timeOffset),
      y: position[1] + 0.75,
      z: position[2],
    });
  });
  return (
    <group position={position}>
      {/* Floor */}
      <RigidBody type="fixed">
        <mesh
          receiveShadow
          position={[0, -0.1, 0]}
          geometry={boxGeometry}
          scale={[4, 0.2, 4]}
          material={floor2Material}
        />
      </RigidBody>
      {/* Obstacle */}
      <RigidBody
        ref={obstacle}
        type="kinematicPosition"
        position={[0, 0.5, 0]}
        restitution={0.2}
        friction={0}
      >
        <mesh
          castShadow
          receiveShadow
          geometry={boxGeometry}
          scale={[1.5, 1.5, 0.3]}
          material={obstacleMaterial}
        />
      </RigidBody>
    </group>
  );
}

function EndBlock({ position = [0, 0, 0] }) {
  const burger = useGLTF("./hamburger.glb");

  burger.scene.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  return (
    <group position={position}>
      {/* Floor */}
      <mesh
        receiveShadow
        position={[0, 0, 0]}
        geometry={boxGeometry}
        scale={[4, 0.2, 4]}
        material={floor1Material}
      />
      <RigidBody
        colliders="hull"
        type="fixed"
        position={[0, 0.25, 0]}
        restitution={0.2}
      >
        <primitive object={burger.scene} scale={0.2} />
      </RigidBody>
    </group>
  );
}

function Bounds({ length = 1 }) {
  return (
    <>
      <RigidBody restitution={0.2} friction={0} type="fixed" >
        <mesh
          castShadow
          geometry={boxGeometry}
          scale={[0.3, 1.5, 4 * length]}
          material={wallMaterial}
          position={[2.15, 0.75, -(length*2) + 2]}
        />

        <mesh
          receiveShadow
          geometry={boxGeometry}
          scale={[0.3, 1.5, 4 * length]}
          material={wallMaterial}
          position={[-2.15, 0.75, -(length*2) + 2]}
        />

        <mesh
          receiveShadow
          castShadow
          geometry={boxGeometry}
          scale={[4, 1.5, 0.3]}
          material={wallMaterial}
          position={[0, 0.75, -(length*4) + 2]}
        />
        <CuboidCollider args={[2, 0.1, 2 * length]} position={[0, -0.1, -(length * 2) + 2]} friction={1} />
      </RigidBody>
    </>
  );
}

export default function Level({
  count = 5,
  types = [SpinnerBlock, LimboBlock, AxeBlock],
  seed = 0,
}) {
  const blocks = useMemo(() => {
    const blocks = [];

    for (let i = 0; i < count; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      blocks.push(type);
    }

    return blocks;
  }, [count, types, seed]);

  return (
    <>
      <StartBlock position={[0, 0, 0]} />

      {blocks.map((Block, index) => (
        <Block key={index} position={[0, 0, -(index + 1) * 4]} />
      ))}

      <EndBlock position={[0, 0, -(count + 1) * 4]} />

      <Bounds length={count + 2} />
    </>
  );
}

export { StartBlock, SpinnerBlock, LimboBlock, AxeBlock, EndBlock };
