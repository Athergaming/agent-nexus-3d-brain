"use client";

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useRef, useMemo, useState, useEffect } from 'react';
import { IoLogoTwitter } from 'react-icons/io';
import { FaNewspaper } from 'react-icons/fa';
import { MessageChat } from './Messages';

interface NeuronProps {
  position: [number, number, number];
  connections: Array<[number, number, number]>;
  isSelected?: boolean;
  onSelect?: (wallet: string) => void;
}

const Signal = ({ start, end }: { start: [number, number, number]; end: [number, number, number] }) => {
  const signalRef = useRef<THREE.Mesh>(null);
  const [active, setActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const speedRef = useRef(0.01 + Math.random() * 0.02);

  useEffect(() => {
    const delay = Math.random() * 5000;
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

interface NeuronProps {
  position: [number, number, number];
  connections: Array<[number, number, number]>;
  isSelected?: boolean;
  onSelect?: (wallet: string, position?: [number, number, number]) => void;
  setIsInitialLoad: (value: boolean) => void;  // Add this line
}

// Update the Neuron component to use the new prop
const Neuron: React.FC<NeuronProps> = ({ 
  position, 
  connections, 
  isSelected, 
  onSelect,
  setIsInitialLoad 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const { camera } = useThree();

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto';
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [hovered]);

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
        }}
        onClick={(e) => {
          e.stopPropagation();
          const randomWallet = generateRandomWallet();
          setIsInitialLoad(false);
          onSelect && onSelect(randomWallet, position);
        }}>
        <sphereGeometry args={[0.05, 12, 12]} />
        <meshPhongMaterial 
          color={isSelected ? "#ff4444" : hovered ? "#44ff44" : "#2596be"}
          emissive={isSelected ? "#ff4444" : "#2596be"}
          emissiveIntensity={isSelected ? 2 : 0.8}
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

interface WalletStats {
  connections: number;
  activity: string;
  lastSeen: string;
  riskScore: number;
}

const generateRandomStats = (): WalletStats => ({
  connections: Math.floor(Math.random() * 1000),
  activity: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)],
  lastSeen: `${Math.floor(Math.random() * 24)}h ago`,
  riskScore: Number((Math.random() * 100).toFixed(2))
});

const generateRandomWallet = () => {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < 44; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const BrainNetwork = ({ walletAddress = "", onWalletSelect = (wallet: string, position?: [number, number, number]) => {} }) => {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const neuronCount = 700;
  const connectionDistance = 1.2;
  const connectionProbability = 0.4;
  const [selectedNeuron, setSelectedNeuron] = useState<number | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [lastInputWallet, setLastInputWallet] = useState("");
  
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
  }, []);

  const moveCameraToNeuron = (neuronIndex: number) => {
    const targetPosition = neurons[neuronIndex];
    const distance = 2;
    
    const startPos = camera.position.clone();
    const targetPos = new THREE.Vector3(
      targetPosition[0] * distance,
      targetPosition[1] * distance + 1,
      targetPosition[2] * distance
    );
    
    const duration = 2000;
    const startTime = Date.now();
    
    const animateCamera = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const eased = 1 - Math.pow(1 - progress, 3);
      
      camera.position.lerpVectors(startPos, targetPos, eased);
      camera.lookAt(targetPosition[0], targetPosition[1], targetPosition[2]);
      
      if (progress < 1) {
        requestAnimationFrame(animateCamera);
      }
    };
    
    animateCamera();
  };

  // Effect for handling manual wallet input
  useEffect(() => {
    if (walletAddress.length >= 15 && walletAddress !== lastInputWallet) {
      setLastInputWallet(walletAddress);
      const neuronIndex = Math.floor(Math.random() * neurons.length);
      setSelectedNeuron(neuronIndex);
      moveCameraToNeuron(neuronIndex);
    }
  }, [walletAddress]);

  // Initial setup
  useEffect(() => {
    // Select a random neuron on first load
    const defaultNeuronIndex = Math.floor(Math.random() * neurons.length);
    setSelectedNeuron(defaultNeuronIndex);
    
    // Generate and set a default wallet
    const defaultWallet = generateRandomWallet();
    setLastInputWallet(defaultWallet);
    onWalletSelect(defaultWallet);
    
    // Set initial camera position
    camera.position.set(0, 7, 8);
    camera.lookAt(0, 0, 0);
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.0005;
    }
  });

  const handleNeuronSelect = (wallet: string, position: [number, number, number]) => {
    const neuronIndex = neurons.findIndex(pos => 
      pos[0] === position[0] && 
      pos[1] === position[1] && 
      pos[2] === position[2]
    );
    
    setSelectedNeuron(neuronIndex);
    setLastInputWallet(wallet);
    onWalletSelect(wallet);
    moveCameraToNeuron(neuronIndex);
  };

  return (
    <group ref={groupRef}>
      {neurons.map((pos, i) => (
        <Neuron 
          key={i} 
          position={pos} 
          connections={connections[i]}
          isSelected={i === selectedNeuron}
          onSelect={handleNeuronSelect}
          setIsInitialLoad={setIsInitialLoad}
        />
      ))}
    </group>
  );
};

const BrainScene: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState("");
  
  const handleWalletSelect = (newWallet: string) => {
    setWalletAddress(newWallet);
    if (newWallet.length >= 15) {
      setWalletStats(generateRandomStats());
    }
  };
  const [walletStats, setWalletStats] = useState<WalletStats | null>(null);

  const handleWalletInput = (value: string) => {
    setWalletAddress(value);
    if (value.length >= 15) {
      setWalletStats(generateRandomStats());
    } else {
      setWalletStats(null);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden" style={{
      background: "radial-gradient(circle at center, #000B1A 0%, #000000 100%)"
    }}>
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-10">
        <h1 className="text-7xl font-bold text-white/80 tracking-widest">
          NEXUS
        </h1>
      </div>

      <div className="absolute top-8 left-8 w-[30vw] h-fit z-10 text-white">
        <MessageChat pfp="/nexus.png" name="Nexus" route="/api/nexus-message" initialText='Connections are all around us, what connection do you have?' />
      </div>

      {walletStats && (
        <div className="absolute top-1/2 right-8 transform -translate-y-1/2 z-10 bg-black/30 backdrop-blur-md p-6 rounded-lg border border-white/20 text-white w-72">
          <h3 className="text-lg font-bold mb-4">Wallet Analysis</h3>
          <div className="space-y-3">
            <p className="text-sm">
              <span className="text-gray-400">Address:</span><br />
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </p>
            <p className="text-sm">
              <span className="text-gray-400">Network Connections:</span><br />
              {walletStats.connections}
            </p>
            <p className="text-sm">
              <span className="text-gray-400">Activity Level:</span><br />
              {walletStats.activity}
            </p>
            <p className="text-sm">
              <span className="text-gray-400">Last Active:</span><br />
              {walletStats.lastSeen}
            </p>
            <p className="text-sm">
              <span className="text-gray-400">Risk Score:</span><br />
              {walletStats.riskScore}
            </p>
          </div>
        </div>
      )}

      <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 z-10 w-96">
        <input
          type="text"
          placeholder="Enter Solana wallet address..."
          className="w-full px-4 py-2 rounded-lg bg-black/30 backdrop-blur-md text-white border border-white/20"
          value={walletAddress}
          onChange={(e) => handleWalletInput(e.target.value)}
        />
      </div>

      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10 w-fit">
        <h1 className="text-lg font-bold text-white/80 tracking-widest">
          CA: ~initializing~
        </h1>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-8 flex justify-between items-end z-10">
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

      <Canvas camera={{ position: [0, 7, 8], fov: 75 }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        
        <BrainNetwork walletAddress={walletAddress} onWalletSelect={handleWalletSelect} />

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