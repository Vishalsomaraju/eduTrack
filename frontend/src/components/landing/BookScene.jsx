import { useRef, useEffect, Suspense } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import Book from "./Book";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
gsap.ticker.lagSmoothing(1000, 16);

export default function BookScene({
  openProgress,
  onTitleVisible,
  onLoginVisible,
  onOverlayPos,
}) {
  const group = useRef();
  const isScrolling = useRef(false);
  const basePosition = useRef([-0.1, 0.3, 0]);

  // Parallax — disabled the moment scroll starts
  useFrame((state) => {
    if (!group.current) return;
    if (isScrolling.current) return;

    const { mouse } = state;
    const rotY = mouse.x * 0.25;
    const rotX = -mouse.y * 0.2;

    group.current.rotation.y += (rotY - group.current.rotation.y) * 0.12;
    group.current.rotation.x += (rotX - group.current.rotation.x) * 0.12;
    group.current.position.y +=
      (basePosition.current[1] + mouse.y * 0.15 - group.current.position.y) *
      0.08;

    const targetZ = Math.max(-0.3 * Math.abs(mouse.x), -0.15);
    group.current.position.z += (targetZ - group.current.position.z) * 0.1;
  });

  useEffect(() => {
    if (!group.current) return;

    // Set explicit start state BEFORE timeline builds
    group.current.rotation.set(0.3, -0.4, 0);
    group.current.position.set(-0.1, 0.3, 0);
    group.current.scale.set(1.45, 1.45, 1.45);
    openProgress.current = 0;

    const ctx = gsap.context(() => {
      gsap
        .timeline({
          scrollTrigger: {
            trigger: document.documentElement,
            start: "top top",
            end: "+=2600",
            scrub: 0.8,
            onUpdate: (self) => {
              // Kill parallax the INSTANT scroll begins
              if (self.progress > 0) {
                isScrolling.current = true;

                // Snap rotation and position to neutral
                // so book doesn't jitter from last parallax state
                group.current.rotation.x +=
                  (0 - group.current.rotation.x) * 0.15;
                group.current.rotation.y +=
                  (0 - group.current.rotation.y) * 0.15;
                group.current.position.y +=
                  (0 - group.current.position.y) * 0.15;
                group.current.position.z +=
                  (0 - group.current.position.z) * 0.15;
              }

              onLoginVisible(self.progress > 0.65);
            },
            onLeaveBack: (self) => {
              // Only re-enable parallax when fully back at top
              if (self.progress === 0) {
                isScrolling.current = false;
              }
            },
          },
        })
        .fromTo(
          group.current.rotation,
          { x: 0.3, y: -0.4, z: 0 },
          { x: 0, y: 0, z: 0, ease: "power2.out" },
          0,
        )
        .fromTo(
          group.current.position,
          {
            x: group.current.position.x,
            y: group.current.position.y,
            z: group.current.position.z,
          },
          { x: -0.1, y: 0.3, z: -0.6, ease: "power2.out" },
          0,
        )
        .fromTo(
          openProgress,
          { current: 0 },
          { current: 1, ease: "power1.inOut", duration: 0.8 },
          0.2,
        );
    });

    return () => {
      ctx.revert();
      ScrollTrigger.killAll();
    };
  }, []);

  return (
    <group ref={group} position={basePosition.current} scale={[1.45, 1.45, 1.45]}>
      <ambientLight intensity={1.2} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} />
      <directionalLight position={[-5, 2, 3]} intensity={0.5} />
      <pointLight position={[0, 3, 2]} intensity={0.6} color="#FFE4C4" />
      <Environment preset="apartment" />
      <Suspense fallback={null}>
        <Book openProgress={openProgress} />
      </Suspense>
    </group>
  );
}
