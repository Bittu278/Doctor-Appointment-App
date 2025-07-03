import React from "react";
import "../styles/LayoutStyles.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Badge, message } from "antd";
import { adminMenu, userMenu } from "../Data/data";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/features/userSlice";

const Layout = ({ children }) => {
  const { user } = useSelector(state => state.user);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  //logout function
  const handleLogout = () => {
    localStorage.clear();
    dispatch(setUser(null));
    message.success("Logout Successfully");
    navigate("/login");
  }
// *********** Dcotor Menu ************
  const doctorMenu = [
  {
    name: "Home",
    path: "/",
    icon: "fa-solid fa-house",
  },
  {
    name: "Appointments",
    path: "/doctor-appointments",
    icon: "fa-solid fa-list",
  },
  {
  name: "Profile",
  path: "/doctor/profile",
  icon: "fa-solid fa-user",
}
];
// *********** Dcotor Menu ************
  //rendering menu list
  const SidebarMenu = user?.isAdmin ? adminMenu : user?.isDoctor?doctorMenu:userMenu;
  return (
    <div className="main">
      <div className="layout">
        <div className="sidebar">
          <div className="logo">
            <h6>DOC APP</h6>
            <hr />
          </div>
          <div className="menu">
            {SidebarMenu.map((menu) => {
              const isActive = location.pathname === menu.path;
              return (
                <div key={menu.path} className={`menu-item ${isActive ? "active" : ""}`}>
                  <i className={menu.icon}></i>
                  <Link to={menu.path}>{menu.name}</Link>
                </div>
              );
            })}
            <div className="menu-item" onClick={handleLogout} style={{ cursor: 'pointer' }}>
              <i className="fa-solid fa-right-from-bracket"></i>
              <span>Logout</span>
            </div>
          </div>
        </div>
        <div className="content">
          <div className="header">
            <div className="header-content" style={{ cursor: 'pointer' }}>
              <Badge count={user?.notification?.length || 0}  onClick={()=>{navigate('/notification')}} >
                <i className="fa-solid fa-bell"></i>
              </Badge>
              {user?.isDoctor ? 
              (<Link to="/doctor/profile">{user?.name || "Profile"}</Link>) : 
                (<Link to="/profile">{user?.name || "Profile"}</Link>)
              }
            </div>
          </div>
          <div className="body">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
