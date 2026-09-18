import { useEffect, useState } from "react";

import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import CreatePoll from "./components/CreatePoll";
import PollView from "./components/PollView";

import {
    getStoredUser,
    logoutUser
} from "./services/api";


function App() {

    // =========================
    // USER
    // =========================

    const [user, setUser] = useState(getStoredUser());


    // =========================
    // LOGIN / REGISTER
    // =========================

    const [showRegister, setShowRegister] = useState(false);


    // =========================
    // CURRENT PAGE
    // =========================

    const [activePage, setActivePage] = useState("dashboard");


    // =========================
    // SELECTED POLL
    // =========================

    const [selectedPoll, setSelectedPoll] = useState(null);


    // =========================
    // AUDIENCE MODE
    // =========================

    const [audienceMode, setAudienceMode] = useState(false);


    // =========================
    // CHECK SHARED POLL LINK
    // =========================

    useEffect(() => {

        const params = new URLSearchParams(
            window.location.search
        );

        const pollId = params.get("poll");

        if (pollId) {

            setSelectedPoll(pollId);
            setActivePage("poll");
            setAudienceMode(true);
        }

    }, []);


    // =========================
    // LOGIN
    // =========================

    function handleLogin(loggedInUser) {

        setUser(loggedInUser);

        setActivePage("dashboard");

        setSelectedPoll(null);

        setAudienceMode(false);
    }


    // =========================
    // LOGOUT
    // =========================

    function handleLogout() {

        logoutUser();

        setUser(null);

        setSelectedPoll(null);

        setActivePage("dashboard");

        setAudienceMode(false);

        setShowRegister(false);

        window.history.replaceState(
            {},
            "",
            "/"
        );
    }


    // =========================
    // OPEN CREATE POLL
    // =========================

    function handleCreatePoll() {

        setActivePage("create");

        setSelectedPoll(null);

        setAudienceMode(false);

        window.history.replaceState(
            {},
            "",
            "/"
        );
    }


    // =========================
    // OPEN DASHBOARD
    // =========================

    function handleDashboard() {

        setActivePage("dashboard");

        setSelectedPoll(null);

        setAudienceMode(false);

        window.history.replaceState(
            {},
            "",
            "/"
        );
    }


    // =========================
    // OPEN CREATOR POLL
    // =========================

    function handleOpenPoll(pollId) {

        setSelectedPoll(pollId);

        setActivePage("poll");

        setAudienceMode(false);

        window.history.replaceState(
            {},
            "",
            "/"
        );
    }


    // =========================
    // OPEN PROFILE
    // =========================

    function handleProfile() {

        setActivePage("profile");

        setSelectedPoll(null);

        setAudienceMode(false);

        window.history.replaceState(
            {},
            "",
            "/"
        );
    }


    // =========================
    // POLL CREATED
    // =========================

    function handlePollCreated(poll) {

        setSelectedPoll(poll.id);

        setActivePage("poll");

        setAudienceMode(false);

        window.history.replaceState(
            {},
            "",
            "/"
        );
    }


    // =========================
    // PUBLIC POLL
    // =========================

    if (!user && audienceMode && selectedPoll) {

        return (
            <PollView
                pollId={selectedPoll}
                user={null}
                audienceMode={true}
                onBack={() => {
                    window.location.href = "/";
                }}
            />
        );
    }


    // =========================
    // LOGIN / REGISTER
    // =========================

    if (!user) {

        if (showRegister) {

            return (
                <Register
                    onLogin={() => {
                        setShowRegister(false);
                    }}
                />
            );
        }

        return (
            <Login
                onLogin={handleLogin}
                onRegister={() => {
                    setShowRegister(true);
                }}
            />
        );
    }


    // =========================
    // USER INITIAL
    // =========================

    const userInitial =
        user?.name
            ?.charAt(0)
            ?.toUpperCase() || "U";


    // =========================
    // LOGGED-IN APPLICATION
    // =========================

    return (

        <div className="app-layout">


            {/* =================================================
                LEFT SIDEBAR
            ================================================= */}

            <aside className="sidebar">


                {/* =========================
                    VOTERA LOGO
                ========================= */}

                <div className="logo">

                    <div className="logo-icon">
                        ◈
                    </div>

                    <div className="logo-text">
                        <span>VOTERA</span>

                        <small>
                            Live Polling Platform
                        </small>
                    </div>

                </div>


                {/* =========================
                    NAVIGATION
                ========================= */}

                <nav className="nav">


                    {/* DASHBOARD */}

                    <button
                        type="button"
                        className={
                            activePage === "dashboard"
                                ? "nav-item active"
                                : "nav-item"
                        }
                        onClick={handleDashboard}
                    >

                        <span className="nav-icon">
                            ⌂
                        </span>

                        <span>
                            Dashboard
                        </span>

                    </button>


                    {/* CREATE POLL */}

                    <button
                        type="button"
                        className={
                            activePage === "create"
                                ? "nav-item active"
                                : "nav-item"
                        }
                        onClick={handleCreatePoll}
                    >

                        <span className="nav-icon">
                            ⊕
                        </span>

                        <span>
                            Create Poll
                        </span>

                    </button>

                </nav>


                {/* =================================================
                    BOTTOM USER SECTION
                ================================================= */}

                <div className="sidebar-bottom">


                    {/* USER PROFILE */}

                    <button
                        type="button"
                        className="profile-card"
                        onClick={handleProfile}
                    >

                        {/* AVATAR */}

                        <div className="profile-button">
                            {userInitial}
                        </div>


                        {/* USER INFORMATION */}

                        <div className="profile-info">

                            <strong>
                                {user?.name || "User"}
                            </strong>

                            <small>
                                {user?.email || ""}
                            </small>

                        </div>


                        {/* DROPDOWN ICON */}

                        <span className="profile-arrow">
                            ⌄
                        </span>

                    </button>


                    {/* LOGOUT */}

                    <button
                        type="button"
                        className="logout-button"
                        onClick={handleLogout}
                    >

                        <span className="logout-icon">
                            ⇥
                        </span>

                        <span>
                            Logout
                        </span>

                    </button>

                </div>

            </aside>


            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <main className="main-content">


                {/* =========================
                    DASHBOARD
                ========================= */}

                {activePage === "dashboard" && (

                    <Dashboard
                        onCreatePoll={handleCreatePoll}
                        onOpenPoll={handleOpenPoll}
                    />

                )}


                {/* =========================
                    CREATE POLL
                ========================= */}

                {activePage === "create" && (

                    <CreatePoll
                        onBack={handleDashboard}
                        onPollCreated={handlePollCreated}
                    />

                )}


                {/* =========================
                    POLL VIEW
                ========================= */}

                {activePage === "poll" &&
                    selectedPoll && (

                        <PollView
                            pollId={selectedPoll}
                            user={user}
                            audienceMode={audienceMode}
                            onBack={handleDashboard}
                        />

                    )}


                {/* =========================
                    PROFILE
                ========================= */}

                {activePage === "profile" && (

                    <div className="profile-page">

                        <header className="top-header">

                            <div>

                                <p className="eyebrow">
                                    ACCOUNT
                                </p>

                                <h1>
                                    My Profile
                                </h1>

                                <p className="subtitle">
                                    Manage your VOTERA account.
                                </p>

                            </div>

                        </header>


                        <div className="profile-card-page">

                            <div className="profile-large">
                                {userInitial}
                            </div>


                            <h2>
                                {user?.name}
                            </h2>


                            <p>
                                {user?.email}
                            </p>


                            <div className="profile-role">
                                Poll Creator
                            </div>


                            <button
                                type="button"
                                className="profile-logout"
                                onClick={handleLogout}
                            >
                                Logout
                            </button>

                        </div>

                    </div>

                )}

            </main>

        </div>
    );
}


export default App;