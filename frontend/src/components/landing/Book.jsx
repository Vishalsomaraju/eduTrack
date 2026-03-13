import { useRef, useEffect } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function Book({ openProgress }) {
  const ref = useRef();
  const { scene, animations } = useGLTF("/book_3d.glb");
  const { actions, clips } = useAnimations(animations, ref);

  // Center model
  useEffect(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    scene.position.sub(center);
  }, [scene]);

  // Apply materials
  useEffect(() => {
    scene.traverse((obj) => {
      if (!obj.isMesh) return;

      // Hide junk meshes
      if (
        obj.name === "numberofSpins_Spins1_0" ||
        obj.name === "Multipliers1_Multipliers2_0"
      ) {
        obj.visible = false;
        return;
      }

      // Cover — plain black leather
      if (obj.name === "Object_7") {
        obj.material = new THREE.MeshStandardMaterial({
          color: "#0A0A0A",
          roughness: 0.85,
          metalness: 0.05,
          envMapIntensity: 0.6,
        });
        return;
      }

      // Pages
      if (obj.name === "Object_8" || obj.name === "Object_9") {
        obj.material = new THREE.MeshStandardMaterial({
          color: "#EFE3C2",
          roughness: 0.92,
          metalness: 0,
        });
        return;
      }

      // Login page — canvas with form drawn on it
      if (obj.name === "Object_10") {
        const cvs = document.createElement("canvas");
        cvs.width = 512;
        cvs.height = 700;
        const ctx = cvs.getContext("2d");

        // Warm paper
        ctx.fillStyle = "#F5EDD8";
        ctx.fillRect(0, 0, 512, 700);

        // Ruled lines
        ctx.strokeStyle = "rgba(92,61,42,0.07)";
        ctx.lineWidth = 1;
        for (let y = 130; y < 680; y += 22) {
          ctx.beginPath();
          ctx.moveTo(40, y);
          ctx.lineTo(472, y);
          ctx.stroke();
        }

        // Logo
        ctx.fillStyle = "#5C3D2A";
        ctx.font = "bold 30px Georgia, serif";
        ctx.textAlign = "center";
        ctx.fillText("EduTrack", 256, 90);

        // Subtitle
        ctx.fillStyle = "rgba(92,61,42,0.45)";
        ctx.font = "15px sans-serif";
        ctx.fillText("Sign in to continue", 256, 118);

        // Email field
        ctx.strokeStyle = "rgba(92,61,42,0.2)";
        ctx.lineWidth = 1.5;
        ctx.fillStyle = "rgba(92,61,42,0.05)";
        ctx.beginPath();
        ctx.roundRect(60, 185, 392, 50, 8);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "rgba(92,61,42,0.3)";
        ctx.font = "14px sans-serif";
        ctx.textAlign = "left";
        ctx.fillText("Email address", 80, 216);

        // Password field
        ctx.strokeStyle = "rgba(92,61,42,0.2)";
        ctx.fillStyle = "rgba(92,61,42,0.05)";
        ctx.beginPath();
        ctx.roundRect(60, 255, 392, 50, 8);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "rgba(92,61,42,0.3)";
        ctx.fillText("Password", 80, 286);

        // Button
        const grad = ctx.createLinearGradient(60, 0, 452, 0);
        grad.addColorStop(0, "#E8845A");
        grad.addColorStop(1, "#D4663C");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(60, 330, 392, 50, 10);
        ctx.fill();
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 17px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Sign In", 256, 362);

        // Footer
        ctx.fillStyle = "rgba(92,61,42,0.25)";
        ctx.font = "11px sans-serif";
        ctx.fillText("KPRIT \u00B7 Dept. of CSE \u00B7 RTRP 2024\u201325", 256, 660);

        const tex = new THREE.CanvasTexture(cvs);
        tex.needsUpdate = true;
        obj.material = new THREE.MeshStandardMaterial({
          map: tex,
          roughness: 0.88,
          metalness: 0,
        });
        return;
      }
    });
  }, [scene]);

  // Animation scrub — clamped
  useFrame(() => {
    if (!clips.length || !actions) return;
    const clip = clips[0];
    const action = actions["Take 001"] || actions[clip.name];
    if (!action) return;
    const progress = Math.min(Math.max(openProgress.current, 0), 1);
    action.play();
    action.paused = true;
    action.time = clip.duration * progress;
  });

  return (
    <group ref={ref}>
      <primitive object={scene} />
    </group>
  );
}
