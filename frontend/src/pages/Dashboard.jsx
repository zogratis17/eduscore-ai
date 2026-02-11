import { auth } from "../config/firebase";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/login");
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Dashboard</h2>
      <p>Welcome: {auth.currentUser?.email}</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
