import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../config/firebase";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleReset = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset link sent to your email");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Forgot Password</h2>

      <input
        type="email"
        placeholder="Enter registered email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <br /><br />

      <button onClick={handleReset}>Send Reset Link</button>

      <p>
        <Link to="/login">Back to Login</Link>
      </p>
    </div>
  );
}
