import { useRef, useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import BookScene from "./BookScene";
import TitleOverlay from "./TitleOverlay";
import LoginOverlay from "./LoginOverlay";

export default function LandingScene() {
  const openProgress = useRef(0);
  const [titleVisible, setTitleVisible] = useState(false);
  const [loginVisible, setLoginVisible] = useState(false);
  const [overlayPos, setOverlayPos] = useState(null);

  return (
    <>
      {/* Scroll spacer — provides scroll distance for GSAP */}
      <div style={{ height: "300vh" }} />

      {/* Canvas fixed to viewport — never moves */}
      <Canvas
        camera={{ position: [0, 0, 7], fov: 45 }}
        style={{
          position: "fixed",
          inset: 0,
          background: "#24272D",
        }}
      >
        <Suspense fallback={null}>
          <BookScene
            openProgress={openProgress}
            onTitleVisible={setTitleVisible}
            onLoginVisible={setLoginVisible}
            onOverlayPos={setOverlayPos}
          />
        </Suspense>
      </Canvas>

      {/* HTML overlays — also fixed */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 10,
        }}
      >
        <TitleOverlay visible={titleVisible} />
      </div>

      <LoginOverlay visible={loginVisible} position={overlayPos} />
    </>
  );
}
