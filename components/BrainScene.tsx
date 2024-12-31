"use client";

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useRef, useMemo, useState, useEffect } from 'react';
import { IoLogoTwitter } from 'react-icons/io';
import { FaNewspaper } from 'react-icons/fa';

interface NeuronProps {
  position: [number, number, number];
  connections: Array<[number, number, number]>;
}

const Signal = ({ start, end }: { start: [number, number, number]; end: [number, number, number] }) => {
  const signalRef = useRef<THREE.Mesh>(null);
  const [active, setActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const speedRef = useRef(0.01 + Math.random() * 0.02);

  useEffect(() => {
    const delay = Math.random() * 5000; // Random delay up to 5 seconds
    const timeout = setTimeout(() => setActive(true), delay);
    return () => clearTimeout(timeout);
  }, []);

  useFrame(() => {
    if (signalRef.current && active) {
      setProgress((p) => {
        if (p >= 1) {
          setActive(false);
          setTimeout(() => {
            setProgress(0);
            setActive(true);
          }, Math.random() * 5000);
          return 1;
        }
        return p + speedRef.current;
      });

      const x = start[0] + (end[0] - start[0]) * progress;
      const y = start[1] + (end[1] - start[1]) * progress;
      const z = start[2] + (end[2] - start[2]) * progress;
      signalRef.current.position.set(x, y, z);
    }
  });

  if (!active) return null;

  return (
    <mesh ref={signalRef}>
      <sphereGeometry args={[0.02, 8, 8]} />
      <meshPhongMaterial
        color="#2596be"
        emissive="#2596be"
        emissiveIntensity={2}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
};

const Neuron: React.FC<NeuronProps> = ({ position, connections }) => {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.05, 12, 12]} />
        <meshPhongMaterial 
          color="#2596be"
          emissive="#2596be"
          emissiveIntensity={0.8}
        />
      </mesh>
      {connections.map((target, i) => (
        <group key={i}>
          <line>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([...position, ...target])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#2596be" opacity={0.2} transparent />
          </line>
          {Math.random() > 0.5 && <Signal start={position} end={target} />}
        </group>
      ))}
    </group>
  );
};

const BrainNetwork = ({ walletAddress = "" }) => {
    const groupRef = useRef<THREE.Group>(null);
    const neuronCount = 700;
    const connectionDistance = 1.2;
    const connectionProbability = 0.4;
  
    const [neurons, connections] = useMemo(() => {
      const positions: Array<[number, number, number]> = [];
      const conns: Array<Array<[number, number, number]>> = [];
      
      for (let i = 0; i < neuronCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        const hemisphereSide = Math.random() > 0.5 ? 1 : -1;
        const x = 3 * Math.sin(phi) * Math.cos(theta) * hemisphereSide;
        const y = 2.5 * Math.sin(phi) * Math.sin(theta);
        const z = 2.5 * Math.cos(phi);
        
        const jitter = 0.2;
        positions.push([
          x + (Math.random() - 0.5) * jitter,
          y + (Math.random() - 0.5) * jitter,
          z + (Math.random() - 0.5) * jitter
        ]);
        
        const nodeConnections: Array<[number, number, number]> = [];
        for (let j = 0; j < positions.length; j++) {
          if (j !== i && positions[j]) {
            const dist = Math.sqrt(
              Math.pow(positions[j][0] - x, 2) +
              Math.pow(positions[j][1] - y, 2) +
              Math.pow(positions[j][2] - z, 2)
            );
            const connectionChance = Math.max(0, 1 - (dist / connectionDistance));
            if (dist < connectionDistance && Math.random() < connectionChance * connectionProbability) {
              nodeConnections.push(positions[j]);
            }
          }
        }
        conns.push(nodeConnections);
      }
      
      return [positions, conns];
    }, [walletAddress]);
  
    useFrame((state) => {
      if (groupRef.current) {
        groupRef.current.rotation.y += 0.0005;
      }
    });
  
    return (
      <group ref={groupRef}>
        {neurons.map((pos, i) => (
          <Neuron key={i} position={pos} connections={connections[i]} />
        ))}
      </group>
    );
  };

  const BrainScene: React.FC = () => {
    const [walletAddress, setWalletAddress] = useState("");
  
    return (
      <div className="relative w-full h-screen overflow-hidden" style={{
        background: "radial-gradient(circle at center, #000B1A 0%, #000000 100%)"
      }}>
        {/* Nexus Title at Top */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-10">
          <h1 className="text-7xl font-bold text-white/80 tracking-widest">
            NEXUS
          </h1>
        </div>
  
        {/* Wallet Input Below Brain */}
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 z-10 w-96">
          <input
            type="text"
            placeholder="Enter Solana wallet address..."
            className="w-full px-4 py-2 rounded-lg bg-black/30 backdrop-blur-md text-white border border-white/20"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
          />
        </div>
        
        {/* Bottom Content Container */}
        <div className="absolute bottom-0 left-0 right-0 p-8 flex justify-between items-end z-10">
          {/* Whitepaper Link */}
          <a
            href="/whitepaper.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors backdrop-blur-md bg-black/20 p-4 rounded-lg border border-white/10 hover:bg-black/30"
          >
            <span className="text-lg flex flex-row gap-2 items-center">
                <FaNewspaper size={24} />
                Whitepaper
            </span>
          </a>
  
          {/* Twitter Link */}
          <a
            href="https://x.com/agentnexus_"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors backdrop-blur-md bg-black/20 p-4 rounded-lg border border-white/10 hover:bg-black/30"
          >
            <IoLogoTwitter size={24} />
            <span>Follow us on Twitter</span>
          </a>
        </div>
  
        {/* Three.js Canvas */}
        <Canvas camera={{ position: [0, 7, 8], fov: 75 }}>
          <ambientLight intensity={0.2} />
          <pointLight position={[10, 10, 10]} intensity={1.5} />
          
          <BrainNetwork walletAddress={walletAddress} />
  
          <OrbitControls 
            makeDefault
            minDistance={4}
            maxDistance={20}
            enablePan={false}
          />
        </Canvas>
      </div>
    );
  };

export default BrainScene;