import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function LoginOverlay({ visible, position }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { signIn } = useAuth();
  const navigate = useNavigate();

  async function handleSignIn() {
    setLoading(true);
    setError(null);
    const { error: err } = await signIn(email, password);
    if (err) {
      setError(err.message);
      setLoading(false);
    } else {
      navigate("/dashboard");
    }
  }

  if (!position) position = { x: -1000, y: -1000 };

  return (
    <motion.div
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.4, delay: visible ? 0.3 : 0 }}
      style={{
        position: "absolute",
        left: position.x - 140,
        top: position.y - 180,
        width: 280,
        height: 360,
        zIndex: 20,
        pointerEvents: visible ? "all" : "none",
        background: "transparent",
      }}
    >
      <div style={{ padding: "60px 40px 0" }}>
        {/* Email input — transparent, sits over canvas texture */}
        <div style={{ marginBottom: 12 }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            style={{
              width: "100%",
              height: 42,
              background: "rgba(245, 237, 216, 0.01)",
              border: "1px solid rgba(92, 61, 42, 0.15)",
              borderRadius: 8,
              padding: "0 16px",
              fontSize: "15px",
              fontFamily: "var(--font-body)",
              color: "#5C3D2A",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Password input */}
        <div style={{ marginBottom: 16 }}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            style={{
              width: "100%",
              height: 42,
              background: "rgba(245, 237, 216, 0.01)",
              border: "1px solid rgba(92, 61, 42, 0.15)",
              borderRadius: 8,
              padding: "0 16px",
              fontSize: "15px",
              fontFamily: "var(--font-body)",
              color: "#5C3D2A",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Sign In button — transparent overlay on canvas button */}
        <button
          onClick={handleSignIn}
          disabled={loading}
          style={{
            width: "100%",
            height: 42,
            background: "transparent",
            border: "1px solid transparent",
            borderRadius: 10,
            cursor: loading ? "wait" : "pointer",
            color: "transparent",
            fontSize: "18px",
            fontFamily: "var(--font-display)",
            outline: "none",
          }}
        >
          Sign In
        </button>

        {/* Error message */}
        {error && (
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.8rem",
              color: "var(--accent-red)",
              marginTop: 8,
              textAlign: "center",
            }}
          >
            {error}
          </p>
        )}
      </div>
    </motion.div>
  );
}
